package blockchain

import (
	"bondly-api/config"
	"context"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type EthereumClient struct {
	client *ethclient.Client
	config config.EthereumConfig
}

// ERC20TransferData 定义ERC20 transfer函数的ABI
const ERC20TransferABI = `[
	{
		"constant": false,
		"inputs": [
			{
				"name": "_to",
				"type": "address"
			},
			{
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]`

func NewEthereumClient(cfg config.EthereumConfig) (*EthereumClient, error) {
	client, err := ethclient.Dial(cfg.RPCURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ethereum client: %v", err)
	}

	return &EthereumClient{
		client: client,
		config: cfg,
	}, nil
}

// GetBalance 获取账户余额
func (e *EthereumClient) GetBalance(address string) (*big.Int, error) {
	account := common.HexToAddress(address)
	balance, err := e.client.BalanceAt(context.Background(), account, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get balance: %v", err)
	}
	return balance, nil
}

// GetTokenBalance 获取ERC20代币余额
func (e *EthereumClient) GetTokenBalance(tokenAddress, walletAddress string) (*big.Int, error) {
	// 构建balanceOf函数调用
	data := []byte{0x70, 0xa0, 0x82, 0x31} // balanceOf(address) 的函数选择器
	addr := common.HexToAddress(walletAddress)

	// 正确填充地址到32字节（左填充零）
	addressData := make([]byte, 32)
	copy(addressData[12:], addr.Bytes()) // 地址占后20字节，前12字节为零
	data = append(data, addressData...)

	// 调用合约
	tokenAddr := common.HexToAddress(tokenAddress)
	result, err := e.client.CallContract(context.Background(), ethereum.CallMsg{
		To:   &tokenAddr,
		Data: data,
	}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to call balanceOf: %v", err)
	}

	// 解析结果
	if len(result) == 0 {
		return big.NewInt(0), nil
	}
	return new(big.Int).SetBytes(result), nil
}

// TransferTokens 使用中转钱包转账ERC20代币
func (e *EthereumClient) TransferTokens(tokenAddress, toAddress string, amount *big.Int) (string, error) {
	// 检查中转钱包私钥配置
	if e.config.RelayWalletKey == "" {
		return "", fmt.Errorf("relay wallet private key not configured")
	}

	// 解析中转钱包私钥
	privateKey, err := crypto.HexToECDSA(e.config.RelayWalletKey)
	if err != nil {
		return "", fmt.Errorf("invalid private key: %v", err)
	}

	// 获取中转钱包地址
	relayAddress := crypto.PubkeyToAddress(privateKey.PublicKey)

	// 获取nonce
	nonce, err := e.client.PendingNonceAt(context.Background(), relayAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %v", err)
	}

	// 获取gas价格
	gasPrice, err := e.client.SuggestGasPrice(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get gas price: %v", err)
	}

	// 构建transfer函数调用数据
	parsedABI, err := abi.JSON(strings.NewReader(ERC20TransferABI))
	if err != nil {
		return "", fmt.Errorf("failed to parse ABI: %v", err)
	}

	data, err := parsedABI.Pack("transfer", common.HexToAddress(toAddress), amount)
	if err != nil {
		return "", fmt.Errorf("failed to pack transfer data: %v", err)
	}

	// 创建交易
	tx := types.NewTransaction(
		nonce,
		common.HexToAddress(tokenAddress),
		big.NewInt(0),  // 转账ERC20时，ETH转账金额为0
		uint64(100000), // gas limit，可以根据实际情况调整
		gasPrice,
		data,
	)

	// 签名交易
	chainID, err := e.client.NetworkID(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to get chain ID: %v", err)
	}

	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(chainID), privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %v", err)
	}

	// 发送交易
	err = e.client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %v", err)
	}

	return signedTx.Hash().Hex(), nil
}

// GetTransactionReceipt 获取交易回执
func (e *EthereumClient) GetTransactionReceipt(txHash string) (*types.Receipt, error) {
	hash := common.HexToHash(txHash)
	receipt, err := e.client.TransactionReceipt(context.Background(), hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction receipt: %v", err)
	}
	return receipt, nil
}

// WaitForTransaction 等待交易确认
func (e *EthereumClient) WaitForTransaction(txHash string, confirmations uint64) (*types.Receipt, error) {
	hash := common.HexToHash(txHash)

	// 轮询等待交易被包含在区块中
	var receipt *types.Receipt
	var err error
	for {
		receipt, err = e.client.TransactionReceipt(context.Background(), hash)
		if err == nil && receipt != nil {
			break
		}
		time.Sleep(3 * time.Second) // 每3秒检查一次
	}

	// 如果需要等待更多确认
	if confirmations > 0 {
		currentBlock, err := e.client.BlockNumber(context.Background())
		if err != nil {
			return nil, fmt.Errorf("failed to get current block: %v", err)
		}

		targetBlock := receipt.BlockNumber.Uint64() + confirmations
		for currentBlock < targetBlock {
			// 等待新区块
			time.Sleep(12 * time.Second) // 假设12秒一个区块
			currentBlock, err = e.client.BlockNumber(context.Background())
			if err != nil {
				return nil, fmt.Errorf("failed to get current block: %v", err)
			}
		}
	}

	return receipt, nil
}

// GetBlockNumber 获取最新区块号
func (e *EthereumClient) GetBlockNumber() (uint64, error) {
	blockNumber, err := e.client.BlockNumber(context.Background())
	if err != nil {
		return 0, fmt.Errorf("failed to get block number: %v", err)
	}
	return blockNumber, nil
}

// GetNetworkID 获取网络ID
func (e *EthereumClient) GetNetworkID() (*big.Int, error) {
	networkID, err := e.client.NetworkID(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get network ID: %v", err)
	}
	return networkID, nil
}

// Close 关闭连接
func (e *EthereumClient) Close() {
	if e.client != nil {
		e.client.Close()
	}
}
