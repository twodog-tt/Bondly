package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

// WalletInfo 钱包信息
type WalletInfo struct {
	Address      string `json:"address"`
	PrivateKey   string `json:"private_key"`
	EncryptedKey string `json:"encrypted_private_key"`
}

// GenerateWallet 生成新的以太坊钱包
func GenerateWallet() (*WalletInfo, error) {
	// 生成私钥
	privateKey, err := crypto.GenerateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate private key: %w", err)
	}

	// 从私钥获取公钥并生成地址
	address := crypto.PubkeyToAddress(privateKey.PublicKey)

	// 将私钥转换为十六进制字符串
	privateKeyBytes := crypto.FromECDSA(privateKey)
	privateKeyHex := hex.EncodeToString(privateKeyBytes)

	return &WalletInfo{
		Address:    address.Hex(),
		PrivateKey: privateKeyHex,
	}, nil
}

// EncryptPrivateKey 使用AES加密私钥
func EncryptPrivateKey(privateKeyHex, secretKey string) (string, error) {
	// 解码私钥
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("failed to decode private key: %w", err)
	}

	// 确保密钥长度为32字节（AES-256）
	key := []byte(secretKey)
	if len(key) < 32 {
		// 如果密钥长度不足，用0填充
		paddedKey := make([]byte, 32)
		copy(paddedKey, key)
		key = paddedKey
	} else if len(key) > 32 {
		// 如果密钥长度超过，截取前32字节
		key = key[:32]
	}

	// 创建AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create AES cipher: %w", err)
	}

	// 创建GCM模式
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// 生成随机nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	// 加密
	ciphertext := gcm.Seal(nonce, nonce, privateKeyBytes, nil)

	// 返回十六进制编码的加密数据
	return hex.EncodeToString(ciphertext), nil
}

// DecryptPrivateKey 使用AES解密私钥
func DecryptPrivateKey(encryptedHex, secretKey string) (string, error) {
	// 解码加密数据
	encryptedBytes, err := hex.DecodeString(encryptedHex)
	if err != nil {
		return "", fmt.Errorf("failed to decode encrypted data: %w", err)
	}

	// 确保密钥长度为32字节（AES-256）
	key := []byte(secretKey)
	if len(key) < 32 {
		// 如果密钥长度不足，用0填充
		paddedKey := make([]byte, 32)
		copy(paddedKey, key)
		key = paddedKey
	} else if len(key) > 32 {
		// 如果密钥长度超过，截取前32字节
		key = key[:32]
	}

	// 创建AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create AES cipher: %w", err)
	}

	// 创建GCM模式
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	// 检查数据长度
	nonceSize := gcm.NonceSize()
	if len(encryptedBytes) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	// 分离nonce和密文
	nonce, ciphertext := encryptedBytes[:nonceSize], encryptedBytes[nonceSize:]

	// 解密
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	// 返回十六进制编码的私钥
	return hex.EncodeToString(plaintext), nil
}

// ValidateAddress 验证以太坊地址格式
func ValidateAddress(address string) bool {
	return common.IsHexAddress(address)
}

// ValidatePrivateKey 验证私钥格式
func ValidatePrivateKey(privateKeyHex string) bool {
	// 检查长度（64个十六进制字符 = 32字节）
	if len(privateKeyHex) != 64 {
		return false
	}

	// 尝试解码
	_, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return false
	}

	// 尝试解析为私钥
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return false
	}

	_, err = crypto.ToECDSA(privateKeyBytes)
	return err == nil
}
