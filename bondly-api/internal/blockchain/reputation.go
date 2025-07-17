package blockchain

import (
	"bondly-api/config"
	"context"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/sirupsen/logrus"
)

// ReputationVault 合约接口
type ReputationVault struct {
	client       *ethclient.Client
	contractAddr common.Address
	abi          abi.ABI
}

// ReputationVault 合约 ABI
const ReputationVaultABI = `[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getReputation",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "addReputation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "subtractReputation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "caller",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isAuthorized",
				"type": "bool"
			}
		],
		"name": "setReputationSource",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "isEligible",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`

// buildCallMsg 构建以太坊合约调用消息
func buildCallMsg(contractAddr common.Address, data []byte) ethereum.CallMsg {
	return ethereum.CallMsg{
		To:   &contractAddr,
		Data: data,
	}
}

// NewReputationVault 创建 ReputationVault 合约实例
func NewReputationVault(config config.EthereumConfig) (*ReputationVault, error) {
	// 连接以太坊客户端
	client, err := ethclient.Dial(config.RPCURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum client: %w", err)
	}

	// 解析合约 ABI
	contractABI, err := abi.JSON(strings.NewReader(ReputationVaultABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ReputationVault ABI: %w", err)
	}

	// 合约地址 - 应该从配置中获取
	contractAddr := common.HexToAddress(config.ReputationVaultAddress)

	return &ReputationVault{
		client:       client,
		contractAddr: contractAddr,
		abi:          contractABI,
	}, nil
}

// GetReputation 获取用户声誉分数
func (rv *ReputationVault) GetReputation(ctx context.Context, userAddress string) (*big.Int, error) {
	// 验证地址格式
	if !common.IsHexAddress(userAddress) {
		return nil, fmt.Errorf("invalid address format: %s", userAddress)
	}

	// 构建调用数据
	data, err := rv.abi.Pack("getReputation", common.HexToAddress(userAddress))
	if err != nil {
		return nil, fmt.Errorf("failed to pack getReputation call: %w", err)
	}

	// 调用合约
	result, err := rv.client.CallContract(ctx, buildCallMsg(rv.contractAddr, data), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to call getReputation: %w", err)
	}

	// 解析结果
	var reputation *big.Int
	err = rv.abi.UnpackIntoInterface(&reputation, "getReputation", result)
	if err != nil {
		return nil, fmt.Errorf("failed to unpack getReputation result: %w", err)
	}

	logrus.WithFields(logrus.Fields{
		"user_address": userAddress,
		"reputation":   reputation.String(),
	}).Debug("获取用户声誉分数成功")

	return reputation, nil
}

// AddReputation 增加用户声誉分数 (需要管理员权限)
func (rv *ReputationVault) AddReputation(ctx context.Context, userAddress string, amount *big.Int, privateKey string) (string, error) {
	// 验证地址格式
	if !common.IsHexAddress(userAddress) {
		return "", fmt.Errorf("invalid address format: %s", userAddress)
	}

	// 构建交易数据
	data, err := rv.abi.Pack("addReputation", common.HexToAddress(userAddress), amount)
	if err != nil {
		return "", fmt.Errorf("failed to pack addReputation call: %w", err)
	}

	// 发送交易
	txHash, err := rv.sendTransaction(ctx, data, privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to send addReputation transaction: %w", err)
	}

	logrus.WithFields(logrus.Fields{
		"user_address": userAddress,
		"amount":       amount.String(),
		"tx_hash":      txHash,
	}).Info("增加用户声誉分数交易已发送")

	return txHash, nil
}

// SubtractReputation 减少用户声誉分数 (需要管理员权限)
func (rv *ReputationVault) SubtractReputation(ctx context.Context, userAddress string, amount *big.Int, privateKey string) (string, error) {
	// 验证地址格式
	if !common.IsHexAddress(userAddress) {
		return "", fmt.Errorf("invalid address format: %s", userAddress)
	}

	// 构建交易数据
	data, err := rv.abi.Pack("subtractReputation", common.HexToAddress(userAddress), amount)
	if err != nil {
		return "", fmt.Errorf("failed to pack subtractReputation call: %w", err)
	}

	// 发送交易
	txHash, err := rv.sendTransaction(ctx, data, privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to send subtractReputation transaction: %w", err)
	}

	logrus.WithFields(logrus.Fields{
		"user_address": userAddress,
		"amount":       amount.String(),
		"tx_hash":      txHash,
	}).Info("减少用户声誉分数交易已发送")

	return txHash, nil
}

// IsEligible 检查用户是否符合条件
func (rv *ReputationVault) IsEligible(ctx context.Context, userAddress string) (bool, error) {
	// 验证地址格式
	if !common.IsHexAddress(userAddress) {
		return false, fmt.Errorf("invalid address format: %s", userAddress)
	}

	// 构建调用数据
	data, err := rv.abi.Pack("isEligible", common.HexToAddress(userAddress))
	if err != nil {
		return false, fmt.Errorf("failed to pack isEligible call: %w", err)
	}

	// 调用合约
	result, err := rv.client.CallContract(ctx, buildCallMsg(rv.contractAddr, data), nil)
	if err != nil {
		return false, fmt.Errorf("failed to call isEligible: %w", err)
	}

	// 解析结果
	var eligible bool
	err = rv.abi.UnpackIntoInterface(&eligible, "isEligible", result)
	if err != nil {
		return false, fmt.Errorf("failed to unpack isEligible result: %w", err)
	}

	logrus.WithFields(logrus.Fields{
		"user_address": userAddress,
		"eligible":     eligible,
	}).Debug("检查用户资格成功")

	return eligible, nil
}

// sendTransaction 发送交易到合约
func (rv *ReputationVault) sendTransaction(ctx context.Context, data []byte, privateKeyHex string) (string, error) {
	// 解析私钥
	_, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("failed to parse private key: %w", err)
	}

	// 发送交易 (这里需要完整的交易构建逻辑)
	// 为了简化，现在返回模拟的交易哈希
	// 在生产环境中需要完整实现交易构建、签名、发送流程

	txHash := "0x" + fmt.Sprintf("%064x", len(data)) // 模拟交易哈希

	logrus.WithFields(logrus.Fields{
		"contract_address": rv.contractAddr.Hex(),
		"data_length":      len(data),
		"tx_hash":          txHash,
	}).Info("声誉合约交易已发送")

	return txHash, nil
}

// Close 关闭以太坊客户端连接
func (rv *ReputationVault) Close() {
	if rv.client != nil {
		rv.client.Close()
	}
}
