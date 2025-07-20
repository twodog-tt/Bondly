import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS } from '../config/contracts';
import { uploadToPinataIPFS, uploadMetadataToPinataIPFS, generateNFTMetadata } from '../utils/ipfs';
import { createContent, updateContent } from '../api/content';

export interface ContentNFTData {
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  isPublished: boolean;
}

export interface NFTMintResult {
  tokenId: number | string; // 允许为数字或字符串（如'timeout', 'Loading...'）
  ipfsHash: string;
  metadataHash: string;
  transactionHash: string;
}

export const useContentNFT = () => {
  const { address } = useAccount();
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // 添加防重复提交状态
  const [error, setError] = useState<string | null>(null);

  // 合约写入
  const { writeContract, isPending: isMintingContract } = useWriteContract();

  // 发布文章并铸造NFT
  const publishAsNFT = useCallback(async (contentData: ContentNFTData): Promise<NFTMintResult> => {
    if (isSubmitting) {
      console.log('NFT发布正在进行中，忽略重复请求');
      throw new Error('NFT发布正在进行中，请稍后再试');
    }

    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    setIsUploading(true);
    setIsSubmitting(true); // 设置提交状态
    setError(null);

    try {
      console.log('Starting to publish article as NFT...');

      // 1. 上传内容到IPFS
      console.log('Uploading content to IPFS...');
      const ipfsHash = await uploadToPinataIPFS(contentData.content, `${contentData.title}.md`);
      console.log('Content uploaded to IPFS:', ipfsHash);

      // 2. 生成并上传元数据到IPFS
      console.log('Generating NFT metadata...');
      const metadata = generateNFTMetadata(contentData, ipfsHash);
      const metadataHash = await uploadMetadataToPinataIPFS(metadata);
      console.log('Metadata uploaded to IPFS:', metadataHash);

      // 3. 保存到后端数据库
      console.log('Saving to backend database...');
      const backendContent = {
        title: contentData.title,
        content: contentData.content,
        type: 'article', // 添加必需的type字段
        status: contentData.isPublished ? 'published' : 'draft', // 添加status字段
        cover_image_url: contentData.coverImage, // 修正字段名
      };

      const savedContent = await createContent(backendContent);
      console.log('Content saved to backend:', savedContent);

      // 4. 真正的NFT铸造
      setIsMinting(true);
      console.log('Starting actual NFT minting...');
      
      if (!writeContract) {
        throw new Error('合约写入功能不可用');
      }

      // 调用合约铸造NFT
      const hash = await (writeContract as any)({
        address: CONTRACTS.CONTENT_NFT.address as `0x${string}`,
        abi: CONTRACTS.CONTENT_NFT.abi,
        functionName: 'mintWithFee', // 使用付费铸造函数
        args: [
          address, // to: 接收者地址
          contentData.title, // title: 内容标题
          contentData.summary, // summary: 内容摘要
          contentData.coverImage || '', // coverImage: 封面图链接
          `https://ipfs.io/ipfs/${ipfsHash}`, // ipfsLink: IPFS上的详细内容链接
          `https://ipfs.io/ipfs/${metadataHash}`, // tokenUri: NFT元数据JSON链接
        ],
        value: parseEther("0.01"), // 支付0.01 ETH铸造费用
      });

      console.log('NFT铸造交易已提交:', hash);

      // 等待交易确认并获取真实的Token ID
      let tokenId: number;
      try {
        // 使用wagmi的useWaitForTransactionReceipt来等待交易确认
        // 由于我们在hook内部，需要手动等待
        const waitForTransaction = async (txHash: string) => {
          return new Promise((resolve, reject) => {
            const checkTransaction = async () => {
              try {
                // 使用fetch查询区块链状态
                const response = await fetch(`https://sepolia.infura.io/v3/${import.meta.env.VITE_WAGMI_PROJECT_ID}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getTransactionReceipt',
                    params: [txHash],
                    id: 1
                  })
                });
                
                const data = await response.json();
                if (data.result) {
                  if (data.result.status === '0x1') {
                    resolve(data.result);
                  } else {
                    reject(new Error('Transaction failed'));
                  }
                } else {
                  // 交易还在pending，继续等待
                  setTimeout(checkTransaction, 3000);
                }
              } catch (error) {
                reject(error);
              }
            };
            checkTransaction();
          });
        };

        // 等待交易确认
        await waitForTransaction(hash);
        
        // 获取真实的Token ID - 通过查询交易日志中的ContentMinted事件
        const getTokenIdFromEvent = async (txHash: string, maxRetries = 10, interval = 1000) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              const response = await fetch(`https://sepolia.infura.io/v3/${import.meta.env.VITE_WAGMI_PROJECT_ID}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getTransactionReceipt',
                  params: [txHash],
                  id: 1
                })
              });
              
              const data = await response.json();
              if (data.result && data.result.logs) {
                // 查找ContentMinted事件
                // ContentMinted事件签名: ContentMinted(address,uint256,string,uint256)
                // 事件选择器: keccak256("ContentMinted(address,uint256,string,uint256)") = 0xcef4f611
                const eventSignature = '0xcef4f611';
                
                for (const log of data.result.logs) {
                  if (log.topics[0] === eventSignature && log.address.toLowerCase() === CONTRACTS.CONTENT_NFT.address.toLowerCase()) {
                    // 解析事件数据
                    // topics[1] = to address (indexed)
                    // topics[2] = tokenId (indexed)
                    // data = tokenURI + fee (non-indexed)
                    const tokenIdHex = log.topics[2];
                    const tokenId = parseInt(tokenIdHex, 16);
                    console.log('从事件中获取到Token ID:', tokenId);
                    return tokenId;
                  }
                }
              }
              
              // 等待一段时间后重试
              if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, interval));
              }
            } catch (error) {
              console.log(`Token ID获取重试 ${i + 1}/${maxRetries}:`, error);
            }
          }
          throw new Error('Token ID获取超时');
        };

        tokenId = await getTokenIdFromEvent(hash);
        console.log('获取到真实的Token ID:', tokenId);
        
      } catch (error) {
        console.error('获取Token ID失败:', error);
        // 如果获取失败，使用超时标记值
        tokenId = -1; // 表示获取失败
      }

      // 更新后端数据库，添加NFT信息
      await updateContent(savedContent.id, {
        nft_token_id: tokenId > 0 ? tokenId : null,
        nft_contract_address: CONTRACTS.CONTENT_NFT.address,
        ip_fs_hash: ipfsHash,
        metadata_hash: metadataHash
      });

      return {
        tokenId: tokenId > 0 ? tokenId : (tokenId === -1 ? 'timeout' : 'Loading...'),
        ipfsHash,
        metadataHash,
        transactionHash: hash,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发布失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
      setIsMinting(false);
      setIsSubmitting(false); // 重置提交状态
    }
  }, [address, writeContract, isSubmitting]);

  // 获取NFT信息
  const getNFTInfo = useCallback(async (tokenId: number) => {
    try {
      // 这里需要实现从合约获取NFT信息的逻辑
      // 暂时返回模拟数据
      return {
        tokenId,
        owner: address,
        title: '示例文章',
        summary: '这是一个示例文章',
        ipfsHash: 'QmExampleHash',
      };
    } catch (err) {
      console.error('获取NFT信息失败:', err);
      throw err;
    }
  }, [address]);

  // 检查用户是否拥有NFT
  const checkNFTOwnership = useCallback(async (tokenId: number): Promise<boolean> => {
    if (!address) return false;
    
    try {
      // 这里需要实现检查NFT所有权的逻辑
      // 暂时返回true
      return true;
    } catch (err) {
      console.error('检查NFT所有权失败:', err);
      return false;
    }
  }, [address]);

  // 实际的NFT铸造函数（需要集成合约调用）
  const mintNFTFunction = useCallback(async (contentData: ContentNFTData) => {
    // 实现实际的合约调用
    console.log('需要实现实际的NFT铸造合约调用');
    throw new Error('NFT铸造功能尚未完全实现');
  }, []);

  return {
    // 状态
    isUploading,
    isMinting,
    isSubmitting, // 添加防重复提交状态
    error,
    
    // 方法
    publishAsNFT,
    getNFTInfo,
    checkNFTOwnership,
    mintNFT: mintNFTFunction,
    
    // 合约信息
    contractAddress: CONTRACTS.CONTENT_NFT.address,
  };
}; 