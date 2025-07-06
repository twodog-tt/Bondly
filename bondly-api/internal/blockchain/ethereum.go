package blockchain

import (
	"bondly-api/config"
	"context"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

type EthereumClient struct {
	client *ethclient.Client
	config config.EthereumConfig
}

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
