import React, { useState, useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useAuth from '../contexts/AuthContext';
import { useWalletConnect } from '../contexts/WalletConnectContext';

interface WalletConnectProps {
  isMobile: boolean;
  onWalletConnected?: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ isMobile, onWalletConnected }) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setOpenConnectModal } = useWalletConnect();
  const { login, checkAuthStatus, isLoggedIn, user } = useAuth();
  
  // 新增：新用户欢迎弹窗状态
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    nickname: string;
    walletAddress: string;
  } | null>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 监听钱包连接状态变化
  useEffect(() => {
    if (isConnected && address) {
      // 检查用户是否已经登录
      if (!isLoggedIn || !user) {
        // 用户未登录，调用钱包登录接口
        (async () => {
          try {
            const { authApi } = await import('../utils/api');
            const loginResult = await authApi.walletLogin(address);
            
            // 存储token和用户信息
            login(loginResult.token, {
              user_id: loginResult.user_id,
              email: loginResult.email,
              nickname: loginResult.nickname,
              role: loginResult.role,
              is_new_user: loginResult.is_new_user,
              wallet_address: address
            });

            // 处理新用户欢迎
            if (loginResult.is_new_user) {
              setWelcomeData({
                nickname: loginResult.nickname,
                walletAddress: address
              });
              setShowWelcomeModal(true);
            }
          } catch (error) {
            console.error('钱包自动登录失败:', error);
          }
        })();
      } else {
        // 用户已登录，只进行钱包绑定（通过onWalletConnected回调）
        console.log('用户已登录，进行钱包绑定:', address);
      }
    }
    
    // 保持原有回调逻辑（用于钱包绑定）
    if (isConnected && address && onWalletConnected) {
      onWalletConnected(address);
    }
  }, [isConnected, address, onWalletConnected, isLoggedIn, user]);

  // 关闭欢迎弹窗
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    setWelcomeData(null);
    // 移除页面刷新，改为局部更新状态
    checkAuthStatus();
  };

  // 格式化钱包地址
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 如果未连接，显示连接按钮
  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => {
          // 将连接功能提供给上下文
          React.useEffect(() => {
            setOpenConnectModal(openConnectModal);
          }, [openConnectModal, setOpenConnectModal]);

          return (
            <button
              onClick={openConnectModal}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: isMobile ? "8px 16px" : "10px 20px",
                borderRadius: "8px",
                fontSize: isMobile ? "14px" : "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 10px rgba(102, 126, 234, 0.3)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(102, 126, 234, 0.3)";
              }}
            >
              Connect Wallet
            </button>
          );
        }}
      </ConnectButton.Custom>
    );
  }

  // 如果已连接，显示地址和下拉菜单
  return (
    <>
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            padding: isMobile ? "8px 12px" : "10px 16px",
            borderRadius: "8px",
            fontSize: isMobile ? "13px" : "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "monospace"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          {/* 钱包图标 */}
          <span style={{ fontSize: "16px" }}>👛</span>
          
          {/* 地址 */}
          <span>{formatAddress(address || '')}</span>
          
          {/* 下拉箭头 */}
          <span style={{ 
            fontSize: "12px",
            transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease"
          }}>
            ▼
          </span>
        </button>

        {/* 下拉菜单 */}
        {showDropdown && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: "0",
            background: "#1f2937",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            minWidth: "200px",
            zIndex: 1000,
            overflow: "hidden"
          }}>
            {/* 钱包信息 */}
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(102, 126, 234, 0.1)"
            }}>
              <div style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "4px"
              }}>
                Connected Wallet
              </div>
              <div style={{
                fontSize: "14px",
                color: "white",
                fontFamily: "monospace",
                fontWeight: "600"
              }}>
                {formatAddress(address || '')}
              </div>
              <div style={{
                fontSize: "11px",
                color: "#667eea",
                marginTop: "4px"
              }}>
                Sepolia Testnet
              </div>
            </div>

            {/* 复制地址 */}
            <button
              onClick={() => {
                if (address) {
                  navigator.clipboard.writeText(address);
                  // 可以添加复制成功提示
                  setShowDropdown(false);
                }
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "14px",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>📋</span>
              Copy Address
            </button>

            {/* 断开连接 */}
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                color: "#ef4444",
                fontSize: "14px",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>🔌</span>
              Disconnect
            </button>
          </div>
        )}
      </div>
      
      {/* 新用户欢迎弹窗 */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        data={welcomeData}
        isMobile={isMobile}
      />
    </>
  );
};

// 新用户欢迎弹窗组件
const WelcomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: { nickname: string; walletAddress: string } | null;
  isMobile: boolean;
}> = ({ isOpen, onClose, data, isMobile }) => {
  if (!isOpen || !data) return null;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      padding: isMobile ? "16px" : "20px"
    }}>
      <div style={{
        background: "#151728",
        borderRadius: "20px",
        padding: isMobile ? "24px" : "40px",
        maxWidth: "500px",
        width: "90%",
        border: "1px solid #374151",
        textAlign: "center"
      }}>
        {/* 欢迎图标 */}
        <div style={{
          fontSize: "60px",
          marginBottom: "20px"
        }}>
          🎉
        </div>

        {/* 标题 */}
        <h3 style={{
          fontSize: isMobile ? "24px" : "28px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#10b981"
        }}>
          Welcome to Bondly!
        </h3>

        {/* 欢迎消息 */}
        <p style={{
          fontSize: isMobile ? "14px" : "16px",
          color: "#9ca3af",
          lineHeight: "1.6",
          marginBottom: "24px"
        }}>
          Your wallet account has been created successfully!
        </p>

        {/* 用户信息卡片 */}
        <div style={{
          background: "rgba(102, 126, 234, 0.1)",
          border: "1px solid rgba(102, 126, 234, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px"
        }}>
          <div style={{
            fontSize: "14px",
            color: "#667eea",
            marginBottom: "8px"
          }}>
            Account Details
          </div>
          <div style={{
            fontSize: isMobile ? "16px" : "18px",
            color: "white",
            fontWeight: "600",
            marginBottom: "8px"
          }}>
            {data.nickname}
          </div>
          <div style={{
            fontSize: "14px",
            color: "#9ca3af",
            fontFamily: "monospace"
          }}>
            {formatAddress(data.walletAddress)}
          </div>
        </div>

        {/* 功能提示 */}
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          textAlign: "left"
        }}>
          <div style={{
            fontSize: "14px",
            color: "#10b981",
            fontWeight: "600",
            marginBottom: "8px"
          }}>
            🚀 What you can do now:
          </div>
          <ul style={{
            fontSize: "14px",
            color: "#9ca3af",
            margin: 0,
            paddingLeft: "20px",
            lineHeight: "1.5"
          }}>
            <li>Create and publish content</li>
            <li>Participate in governance</li>
            <li>Earn reputation points</li>
            <li>Connect with the community</li>
          </ul>
        </div>

        {/* 确认按钮 */}
        <button
          onClick={onClose}
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: "600",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "background 0.3s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#059669"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#10b981"}
        >
          Get Started!
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;
