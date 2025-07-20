// 统一IPFS服务 - 使用Pinata
import { uploadToPinataIPFS, uploadMetadataToPinataIPFS, uploadToPinataAPI, getPinataStatus } from './ipfs';

// IPFS服务类
export class IPFSService {
  // 上传内容到IPFS
  async uploadContent(content: string, filename: string = 'content.md'): Promise<string> {
    try {
      // 尝试Pinata IPFS客户端，如果失败则使用API
      try {
        return await uploadToPinataIPFS(content, filename);
      } catch (error) {
        console.log('Pinata IPFS client failed, trying API...');
        return await uploadToPinataAPI(content, filename);
      }
    } catch (error) {
      console.error('Failed to upload content using Pinata:', error);
      // 返回模拟hash作为备选
      return 'QmMockHash' + Math.random().toString(36).substr(2, 9);
    }
  }

  // 上传元数据到IPFS
  async uploadMetadata(metadata: any): Promise<string> {
    try {
      return await uploadMetadataToPinataIPFS(metadata);
    } catch (error) {
      console.error('Failed to upload metadata using Pinata:', error);
      // 返回模拟hash作为备选
      return 'QmMockMetadataHash' + Math.random().toString(36).substr(2, 9);
    }
  }

  // 获取服务状态
  getStatus() {
    const pinataStatus = getPinataStatus();

    return {
      currentProvider: 'pinata',
      pinata: pinataStatus,
      hasAnyProvider: pinataStatus.hasCredentials,
      isAvailable: pinataStatus.hasCredentials && !pinataStatus.error
    };
  }

  // 连接
  async testConnection() {
    try {
      const apiKey = import.meta.env.VITE_PINATA_API_KEY;
      if (!apiKey) {
        return { success: false, message: 'API key not configured' };
      }

      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        return { success: true, message: '连接成功' };
      } else {
        return { success: false, message: '连接失败' };
      }
    } catch (error) {
      return { success: false, message: `连接错误: ${error}` };
    }
  }

  // 上传一个小文件
  async testUpload() {
    try {
      const testContent = `测试文件 - 创建时间: ${new Date().toISOString()}`;
      const hash = await this.uploadContent(testContent, 'test.txt');
      
      if (hash.startsWith('QmMock')) {
        return { success: false, message: '上传失败，使用模拟hash' };
      }
      
      return { success: true, message: '上传成功', hash };
    } catch (error) {
      return { success: false, message: `上传错误: ${error}` };
    }
  }
}

// 创建默认IPFS服务实例
export const ipfsService = new IPFSService();

// 导出便捷函数
export const uploadToIPFSUnified = (content: string, filename?: string) => 
  ipfsService.uploadContent(content, filename);

export const uploadMetadataToIPFSUnified = (metadata: any) => 
  ipfsService.uploadMetadata(metadata);

export const getIPFSStatusUnified = () => 
  ipfsService.getStatus();

export const testIPFSConnectionUnified = () => 
  ipfsService.testConnection(); 