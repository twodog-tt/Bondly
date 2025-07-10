import React, { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
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
    console.log('WalletConnect useEffect 触发:', { isConnected, address, hasCallback: !!onWalletConnected });
    if (isConnected && address && onWalletConnected) {
      console.log('调用钱包连接回调:', address);
      onWalletConnected(address);
    }
  }, [isConnected, address, onWalletConnected]);

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
  );
};

export default WalletConnect;
