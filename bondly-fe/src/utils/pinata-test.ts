// Pinata测试工具
import { ipfsService, getIPFSStatusUnified, testIPFSConnectionUnified } from './ipfs-service';

// 全局测试对象
declare global {
  interface Window {
    PinataTest: {
      testEnvironment: () => void;
      testConnection: () => void;
      testUpload: () => void;
      runAllTests: () => void;
      showStatus: () => void;
    };
  }
}

// 测试环境变量
const testEnvironment = () => {
  console.log('🔧 测试Pinata环境变量...');
  
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;
  
  console.log('API Key:', apiKey ? '✅ 已设置' : '❌ 未设置');
  console.log('Secret Key:', secretKey ? '✅ 已设置' : '❌ 未设置');
  
  if (!apiKey || !secretKey) {
    console.error('❌ Pinata凭据未完全配置！');
    return false;
  }
  
  console.log('✅ Pinata环境变量配置正确');
  return true;
};

// 测试连接
const testConnection = async () => {
  console.log('🔗 测试Pinata连接...');
  
  try {
    const result = await testIPFSConnectionUnified();
    
    if (result.success) {
      console.log('✅ Pinata连接测试成功');
    } else {
      console.error('❌ Pinata连接测试失败:', result.error);
    }
    
    return result.success;
  } catch (error) {
    console.error('❌ 连接测试出错:', error);
    return false;
  }
};

// 测试上传
const testUpload = async () => {
  console.log('📤 测试Pinata文件上传...');
  
  try {
    const testContent = `测试文件 - 创建时间: ${new Date().toISOString()}`;
    const hash = await ipfsService.uploadContent(testContent, 'test.txt');
    
    if (hash.startsWith('QmMock')) {
      console.error('❌ 文件上传失败，使用模拟hash:', hash);
      return false;
    }
    
    console.log('✅ 文件上传成功，IPFS Hash:', hash);
    console.log('🔗 访问链接:', `https://ipfs.io/ipfs/${hash}`);
    return true;
  } catch (error) {
    console.error('❌ 文件上传出错:', error);
    return false;
  }
};

// 显示状态
const showStatus = () => {
  console.log('📊 Pinata状态信息...');
  const status = getIPFSStatusUnified();
  console.log('当前提供商:', status.currentProvider);
  console.log('Pinata状态:', status.pinata);
  console.log('服务可用:', status.isAvailable);
  console.log('有提供商:', status.hasAnyProvider);
};

// 运行所有测试
const runAllTests = async () => {
  console.log('🚀 开始运行所有Pinata测试...');
  console.log('='.repeat(50));
  
  const results = {
    environment: false,
    connection: false,
    upload: false
  };
  
  // 测试环境变量
  results.environment = testEnvironment();
  console.log('');
  
  if (!results.environment) {
    console.log('❌ 环境变量测试失败，跳过其他测试');
    return results;
  }
  
  // 测试连接
  results.connection = await testConnection();
  console.log('');
  
  // 测试上传
  results.upload = await testUpload();
  console.log('');
  
  // 显示状态
  showStatus();
  console.log('');
  
  // 总结
  console.log('📋 测试结果总结:');
  console.log(`环境变量: ${results.environment ? '✅' : '❌'}`);
  console.log(`连接测试: ${results.connection ? '✅' : '❌'}`);
  console.log(`上传测试: ${results.upload ? '✅' : '❌'}`);
  
  const allPassed = results.environment && results.connection && results.upload;
  console.log(`\n${allPassed ? '🎉 所有测试通过！' : '⚠️ 部分测试失败'}`);
  
  return results;
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.PinataTest = {
    testEnvironment,
    testConnection,
    testUpload,
    runAllTests,
    showStatus
  };
  
  console.log('🔧 PinataTest工具已加载到全局对象');
  console.log('使用方法:');
  console.log('- PinataTest.testEnvironment() - 测试环境变量');
  console.log('- PinataTest.testConnection() - 测试连接');
  console.log('- PinataTest.testUpload() - 测试上传');
  console.log('- PinataTest.runAllTests() - 运行所有测试');
  console.log('- PinataTest.showStatus() - 显示状态');
}

export {
  testEnvironment,
  testConnection,
  testUpload,
  runAllTests,
  showStatus
}; 