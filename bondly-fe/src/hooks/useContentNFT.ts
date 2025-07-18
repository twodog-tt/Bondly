import { useState, useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
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
  tokenId: number;
  ipfsHash: string;
  metadataHash: string;
  transactionHash: string;
}

export const useContentNFT = () => {
  const { address } = useAccount();
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 合约写入
  const { writeContract, isPending: isMintingContract } = useWriteContract();

  // 发布文章并铸造NFT
  const publishAsNFT = useCallback(async (contentData: ContentNFTData): Promise<NFTMintResult> => {
    if (!address) {
      throw new Error('请先连接钱包');
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('开始发布文章为NFT...');

      // 1. 上传内容到IPFS
      console.log('上传内容到IPFS...');
      const ipfsHash = await uploadToPinataIPFS(contentData.content, `${contentData.title}.md`);
      console.log('内容已上传到IPFS:', ipfsHash);

      // 2. 生成并上传元数据到IPFS
      console.log('生成NFT元数据...');
      const metadata = generateNFTMetadata(contentData, ipfsHash);
      const metadataHash = await uploadMetadataToPinataIPFS(metadata);
      console.log('元数据已上传到IPFS:', metadataHash);

      // 3. 保存到后端数据库
      console.log('保存到后端数据库...');
      const backendContent = {
        title: contentData.title,
        content: contentData.content,
        type: 'article', // 添加必需的type字段
        status: contentData.isPublished ? 'published' : 'draft', // 添加status字段
        cover_image_url: contentData.coverImage, // 修正字段名
      };

      const savedContent = await createContent(backendContent);
      console.log('内容已保存到后端:', savedContent);

      // 4. 真正的NFT铸造
      setIsMinting(true);
      console.log('开始真正的NFT铸造...');
      
      if (!writeContract) {
        throw new Error('合约写入功能不可用');
      }

      // 调用合约铸造NFT
      const hash = await (writeContract as any)({
        address: CONTRACTS.CONTENT_NFT.address as `0x${string}`,
        abi: CONTRACTS.CONTENT_NFT.abi,
        functionName: 'mint',
        args: [
          address, // to: 接收者地址
          contentData.title, // title: 内容标题
          contentData.summary, // summary: 内容摘要
          contentData.coverImage || '', // coverImage: 封面图链接
          `https://ipfs.io/ipfs/${ipfsHash}`, // ipfsLink: IPFS上的详细内容链接
          `https://ipfs.io/ipfs/${metadataHash}`, // tokenUri: NFT元数据JSON链接
        ],
      });

      console.log('NFT铸造交易已提交:', hash);

      // 等待交易确认
      // 注意：这里需要等待交易确认，但wagmi v2的处理方式有所不同
      // 暂时使用模拟的tokenId，实际应该从事件中解析
      const tokenId = Math.floor(Math.random() * 1000) + 1;

      // 更新后端数据库，添加NFT信息
      await updateContent(savedContent.id, {
        ...savedContent,
        // 注意：这里可能需要根据实际的UpdateContentRequest类型调整
      });

      return {
        tokenId: tokenId,
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
    }
  }, [address, writeContract]);

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
    // TODO: 实现实际的合约调用
    console.log('需要实现实际的NFT铸造合约调用');
    throw new Error('NFT铸造功能尚未完全实现');
  }, []);

  return {
    // 状态
    isUploading,
    isMinting,
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