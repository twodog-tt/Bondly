// Pinata IPFS 集成工具函数
import { create } from 'ipfs-http-client';

// Pinata 配置
const PINATA_CONFIG = {
  host: 'api.pinata.cloud',
  port: 443,
  protocol: 'https',
  headers: {
    'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY || '',
    'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_API_KEY || ''
  }
};

// 创建 Pinata IPFS 客户端
let pinataClient: any = null;
let pinataInitialized = false;
let pinataError: string | null = null;

const getPinataClient = () => {
  if (pinataInitialized) {
    return pinataClient;
  }

  if (pinataError) {
    console.warn('Pinata client already failed to initialize:', pinataError);
    return null;
  }

  try {
    console.log('Initializing Pinata IPFS client...');
    console.log('Environment variables:', {
      apiKey: import.meta.env.VITE_PINATA_API_KEY ? 'Set' : 'Not set',
      secretKey: import.meta.env.VITE_PINATA_SECRET_API_KEY ? 'Set' : 'Not set'
    });

    // 检查是否有有效的配置
    if (!import.meta.env.VITE_PINATA_API_KEY || !import.meta.env.VITE_PINATA_SECRET_API_KEY) {
      console.warn('Pinata credentials not configured, using fallback mode');
      pinataError = 'Missing Pinata credentials';
      pinataInitialized = true;
      return null;
    }

    // 创建Pinata客户端
    pinataClient = create(PINATA_CONFIG);
    console.log('Pinata IPFS client created successfully');
    pinataInitialized = true;
    return pinataClient;

  } catch (error) {
    console.error('Failed to create Pinata IPFS client:', error);
    pinataError = error instanceof Error ? error.message : 'Unknown error';
    pinataInitialized = true;
    return null;
  }
};

// 获取Pinata状态
export const getPinataStatus = () => {
  return {
    initialized: pinataInitialized,
    hasClient: !!pinataClient,
    error: pinataError,
    hasCredentials: !!(import.meta.env.VITE_PINATA_API_KEY && import.meta.env.VITE_PINATA_SECRET_API_KEY)
  };
};

// 上传内容到 Pinata IPFS
export const uploadToPinataIPFS = async (content: string, filename: string = 'content.md'): Promise<string> => {
  try {
    const client = getPinataClient();
    if (!client) {
      // 如果没有Pinata客户端，返回模拟的IPFS hash
      console.warn('Pinata client not available, using mock hash');
      return 'QmMockHash' + Math.random().toString(36).substr(2, 9);
    }

    console.log('Uploading content to Pinata IPFS...');
    const file = new File([content], filename, { type: 'text/markdown' });
    const result = await client.add(file);
    
    console.log('Content uploaded to Pinata IPFS:', result.path);
    return result.path;
  } catch (error) {
    console.error('Failed to upload to Pinata IPFS:', error);
    // 返回模拟的IPFS hash作为备选
    return 'QmMockHash' + Math.random().toString(36).substr(2, 9);
  }
};

// 上传元数据到 Pinata IPFS
export const uploadMetadataToPinataIPFS = async (metadata: any): Promise<string> => {
  try {
    const client = getPinataClient();
    if (!client) {
      // 如果没有Pinata客户端，返回模拟的IPFS hash
      console.warn('Pinata client not available, using mock hash for metadata');
      return 'QmMockMetadataHash' + Math.random().toString(36).substr(2, 9);
    }

    console.log('Uploading metadata to Pinata IPFS...');
    const metadataString = JSON.stringify(metadata, null, 2);
    const file = new File([metadataString], 'metadata.json', { type: 'application/json' });
    const result = await client.add(file);
    
    console.log('Metadata uploaded to Pinata IPFS:', result.path);
    return result.path;
  } catch (error) {
    console.error('Failed to upload metadata to Pinata IPFS:', error);
    // 返回模拟的IPFS hash作为备选
    return 'QmMockMetadataHash' + Math.random().toString(36).substr(2, 9);
  }
};

// 使用Pinata API直接上传（备选方案）
export const uploadToPinataAPI = async (content: string, filename: string = 'content.md'): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_PINATA_API_KEY;
    const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;
    
    if (!apiKey || !secretKey) {
      throw new Error('Pinata credentials not configured');
    }

    // 创建FormData
    const formData = new FormData();
    const file = new File([content], filename, { type: 'text/markdown' });
    formData.append('file', file);

    // 添加元数据
    const metadata = {
      name: filename,
      description: 'Content uploaded via Bondly'
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Content uploaded to Pinata API:', result.IpfsHash);
    return result.IpfsHash;

  } catch (error) {
    console.error('Failed to upload to Pinata API:', error);
    return 'QmMockHash' + Math.random().toString(36).substr(2, 9);
  }
};

// 从 IPFS 获取内容（使用公共网关）
export const getFromIPFS = async (hash: string): Promise<string> => {
  try {
    const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io';
    const response = await fetch(`${gateway}/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to get from IPFS:', error);
    throw error;
  }
};

// 从 IPFS 获取元数据（使用公共网关）
export const getMetadataFromIPFS = async (hash: string): Promise<any> => {
  try {
    const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io';
    const response = await fetch(`${gateway}/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata from IPFS: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get metadata from IPFS:', error);
    throw error;
  }
};

// 生成 NFT 元数据
export const generateNFTMetadata = (content: any, ipfsHash: string) => {
  return {
    name: content.title,
    description: content.summary || content.content.substring(0, 200) + '...',
    image: content.coverImage || `https://ipfs.io/ipfs/${ipfsHash}`,
    external_url: `https://bondly.com/article/${ipfsHash}`,
    attributes: [
      {
        trait_type: "Category",
        value: content.category || "General"
      },
      {
        trait_type: "Author",
        value: content.author || "Unknown"
      },
      {
        trait_type: "Publish Date",
        value: new Date().toISOString()
      },
      {
        trait_type: "Content Type",
        value: "Article"
      }
    ],
    properties: {
      files: [
        {
          uri: `https://ipfs.io/ipfs/${ipfsHash}`,
          type: "text/markdown"
        }
      ],
      category: "text",
      tags: content.tags || []
    }
  };
};

// 获取 IPFS 网关 URL
export const getIPFSGatewayURL = (hash: string): string => {
  const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io';
  return `${gateway}/ipfs/${hash}`;
};

// 验证 IPFS Hash 格式
export const isValidIPFSHash = (hash: string): boolean => {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash);
}; 