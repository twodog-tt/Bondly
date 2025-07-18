import React from 'react';
import CommonNavbar from '../components/CommonNavbar';
import IPFSTestPanel from '../components/IPFSTestPanel';

interface IPFSTestPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const IPFSTestPage: React.FC<IPFSTestPageProps> = ({ isMobile, onPageChange }) => {
  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "white" }}>
      <CommonNavbar 
        isMobile={isMobile} 
        onPageChange={onPageChange}
        onLoginClick={handleLoginClick}
        showHomeButton={true}
        showWriteButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        showDraftsButton={true}
        currentPage="ipfs-test"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px" }}>
        <div style={{
          textAlign: "center",
          marginBottom: "32px"
        }}>
          <h1 style={{
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "bold",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            🔧 IPFS 客户端测试
          </h1>
          <p style={{ 
            color: "#9ca3af", 
            fontSize: "18px",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            测试你的IPFS配置是否正确，验证客户端创建、连接和文件上传功能
          </p>
        </div>

        {/* IPFS测试面板 */}
        <IPFSTestPanel />

        {/* 控制台调试信息 */}
        <div style={{
          background: '#1f2937',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '32px',
          border: '1px solid #374151'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: 'white'
          }}>
            🖥️ 控制台调试命令
          </h3>
          <p style={{
            color: '#9ca3af',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            你也可以在浏览器控制台中直接运行以下命令进行测试：
          </p>
          <div style={{
            background: '#0f172a',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#e2e8f0',
            overflowX: 'auto'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#10b981' }}>// 检查IPFS状态</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#3b82f6' }}>getIPFSStatusUnified()</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#10b981' }}>// 测试IPFS连接</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#3b82f6' }}>testIPFSConnectionUnified()</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#10b981' }}>// 上传内容到IPFS</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#3b82f6' }}>uploadToIPFSUnified('测试内容', 'test.txt')</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#10b981' }}>// 检查环境变量</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#3b82f6' }}>console.log('VITE_PINATA_API_KEY:', import.meta.env.VITE_PINATA_API_KEY ? '已设置' : '未设置')</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#3b82f6' }}>console.log('VITE_PINATA_SECRET_API_KEY:', import.meta.env.VITE_PINATA_SECRET_API_KEY ? '已设置' : '未设置')</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPFSTestPage; 