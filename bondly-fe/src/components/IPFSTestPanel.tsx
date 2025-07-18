import React, { useState } from 'react';
import { ipfsService, getIPFSStatusUnified, testIPFSConnectionUnified } from '../utils/ipfs-service';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

const IPFSTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runTest = async (testFunction: () => Promise<TestResult | TestResult[]>) => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const result = await testFunction();
      const results = Array.isArray(result) ? result : [result];
      setTestResults(results);
    } catch (error) {
      setTestResults([{
        success: false,
        message: '❌ 测试执行失败',
        error: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const runEnvironmentTest = () => {
    setCurrentTest('环境变量测试');
    runTest(async () => {
      const status = getIPFSStatusUnified();
      return {
        success: status.pinata.hasCredentials,
        message: status.pinata.hasCredentials ? '✅ Pinata环境变量已配置' : '❌ Pinata环境变量未配置',
        details: {
          apiKey: import.meta.env.VITE_PINATA_API_KEY ? '已设置' : '未设置',
          secretKey: import.meta.env.VITE_PINATA_SECRET_API_KEY ? '已设置' : '未设置'
        }
      };
    });
  };

  const runClientTest = () => {
    setCurrentTest('客户端创建测试');
    runTest(async () => {
      const status = getIPFSStatusUnified();
      return {
        success: status.pinata.hasClient && !status.pinata.error,
        message: status.pinata.hasClient && !status.pinata.error 
          ? '✅ Pinata客户端创建成功' 
          : '❌ Pinata客户端创建失败',
        details: {
          initialized: status.pinata.initialized,
          hasClient: status.pinata.hasClient,
          error: status.pinata.error || '无错误'
        }
      };
    });
  };

  const runConnectionTest = () => {
    setCurrentTest('连接测试');
    runTest(async () => {
      const result = await testIPFSConnectionUnified();
      return {
        success: result.success,
        message: result.success ? '✅ Pinata连接测试成功' : '❌ Pinata连接测试失败',
        error: result.error
      };
    });
  };

  const runUploadTest = () => {
    setCurrentTest('文件上传测试');
    runTest(async () => {
      try {
        const testContent = `测试文件 - 创建时间: ${new Date().toISOString()}`;
        const hash = await ipfsService.uploadContent(testContent, 'test.txt');
        
        if (hash.startsWith('QmMock')) {
          return {
            success: false,
            message: '❌ 文件上传失败，使用模拟hash',
            details: { hash }
          };
        }

        return {
          success: true,
          message: '✅ 文件上传成功',
          details: { hash }
        };
      } catch (error) {
        return {
          success: false,
          message: '❌ 文件上传失败',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  };

  const runFullTest = () => {
    setCurrentTest('完整测试流程');
    runTest(async () => {
      const results: TestResult[] = [];
      
      // 环境变量测试
      const status = getIPFSStatusUnified();
      results.push({
        success: status.pinata.hasCredentials,
        message: status.pinata.hasCredentials ? '✅ Pinata环境变量已配置' : '❌ Pinata环境变量未配置',
        details: {
          apiKey: import.meta.env.VITE_PINATA_API_KEY ? '已设置' : '未设置',
          secretKey: import.meta.env.VITE_PINATA_SECRET_API_KEY ? '已设置' : '未设置'
        }
      });
      
      // 客户端测试
      results.push({
        success: status.pinata.hasClient && !status.pinata.error,
        message: status.pinata.hasClient && !status.pinata.error 
          ? '✅ Pinata客户端创建成功' 
          : '❌ Pinata客户端创建失败',
        details: {
          initialized: status.pinata.initialized,
          hasClient: status.pinata.hasClient,
          error: status.pinata.error || '无错误'
        }
      });
      
      // 连接测试
      const connectionResult = await testIPFSConnectionUnified();
      results.push({
        success: connectionResult.success,
        message: connectionResult.success ? '✅ Pinata连接测试成功' : '❌ Pinata连接测试失败',
        error: connectionResult.error
      });
      
      // 上传测试
      try {
        const testContent = `测试文件 - 创建时间: ${new Date().toISOString()}`;
        const hash = await ipfsService.uploadContent(testContent, 'test.txt');
        
        if (hash.startsWith('QmMock')) {
          results.push({
            success: false,
            message: '❌ 文件上传失败，使用模拟hash',
            details: { hash }
          });
        } else {
          results.push({
            success: true,
            message: '✅ 文件上传成功',
            details: { hash }
          });
        }
      } catch (error) {
        results.push({
          success: false,
          message: '❌ 文件上传失败',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      return results;
    });
  };

  const runStatusTest = () => {
    setCurrentTest('状态检查');
    runTest(async () => {
      const status = getIPFSStatusUnified();
      return {
        success: status.isAvailable,
        message: status.isAvailable ? '✅ IPFS服务可用' : '❌ IPFS服务不可用',
        details: status
      };
    });
  };

  return (
    <div style={{
      background: '#151728',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #374151',
      maxWidth: '800px',
      margin: '20px auto'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        🔧 Pinata IPFS 测试工具
      </h2>

      {/* 测试按钮 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <button
          onClick={runEnvironmentTest}
          disabled={isRunning}
          style={{
            padding: '12px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📋 环境变量测试
        </button>

        <button
          onClick={runClientTest}
          disabled={isRunning}
          style={{
            padding: '12px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🔧 客户端创建测试
        </button>

        <button
          onClick={runConnectionTest}
          disabled={isRunning}
          style={{
            padding: '12px 16px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📡 连接测试
        </button>

        <button
          onClick={runUploadTest}
          disabled={isRunning}
          style={{
            padding: '12px 16px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📤 文件上传测试
        </button>

        <button
          onClick={runStatusTest}
          disabled={isRunning}
          style={{
            padding: '12px 16px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📊 状态检查
        </button>

        <button
          onClick={runFullTest}
          disabled={isRunning}
          style={{
            padding: '12px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '500',
            gridColumn: '1 / -1'
          }}
        >
          🚀 运行完整测试流程
        </button>
      </div>

      {/* 当前测试状态 */}
      {isRunning && (
        <div style={{
          background: '#1f2937',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#fbbf24', fontSize: '16px', marginBottom: '8px' }}>
            🔄 正在运行: {currentTest}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>
            请稍候，测试可能需要几秒钟...
          </div>
        </div>
      )}

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'white'
          }}>
            📊 测试结果
          </h3>
          
          {testResults.map((result, index) => (
            <div
              key={index}
              style={{
                background: result.success ? '#065f46' : '#7f1d1d',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '12px',
                border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`
              }}
            >
              <div style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
                color: result.success ? '#10b981' : '#ef4444'
              }}>
                {result.message}
              </div>
              
              {result.error && (
                <div style={{
                  fontSize: '14px',
                  color: '#fca5a5',
                  marginBottom: '8px',
                  fontFamily: 'monospace'
                }}>
                  错误: {result.error}
                </div>
              )}
              
              {result.details && (
                <div style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  background: '#1f2937',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  <pre>{JSON.stringify(result.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
          
          {/* 测试统计 */}
          <div style={{
            background: '#1f2937',
            padding: '12px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              测试统计: {testResults.filter(r => r.success).length}/{testResults.length} 项通过
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={{
        background: '#1f2937',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '12px',
          color: 'white'
        }}>
          📖 使用说明
        </h4>
        <ul style={{
          color: '#9ca3af',
          fontSize: '14px',
          lineHeight: '1.6',
          paddingLeft: '20px'
        }}>
          <li>环境变量测试：检查Pinata凭据是否正确配置</li>
          <li>客户端创建测试：验证Pinata客户端是否能正常创建</li>
          <li>连接测试：测试与Pinata IPFS网络的连接</li>
          <li>文件上传测试：测试文件上传功能</li>
          <li>状态检查：查看当前IPFS服务的详细状态</li>
          <li>完整测试流程：运行所有测试项目</li>
        </ul>
        
        <div style={{
          background: '#374151',
          padding: '12px',
          borderRadius: '6px',
          marginTop: '12px'
        }}>
          <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            🔧 配置说明
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>
            确保在 .env.local 文件中配置了正确的Pinata凭据：
            <br />
            VITE_PINATA_API_KEY=your_pinata_api_key
            <br />
            VITE_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPFSTestPanel; 