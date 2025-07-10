import React from 'react';

interface WalletChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateCustodyWallet: () => void;
  onConnectWallet: () => void;
  isMobile: boolean;
}

const WalletChoiceModal: React.FC<WalletChoiceModalProps> = ({
  isOpen,
  onClose,
  onGenerateCustodyWallet,
  onConnectWallet,
  isMobile
}) => {
  if (!isOpen) return null;

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
      zIndex: 1000,
      padding: isMobile ? "16px" : "20px"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #151728 0%, #1a1d2e 100%)",
        borderRadius: "24px",
        padding: isMobile ? "24px 20px" : "40px",
        maxWidth: isMobile ? "100%" : "480px",
        width: "100%",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        position: "relative"
      }}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            fontSize: "18px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          ×
        </button>

        {/* 标题 */}
        <div style={{
          textAlign: "center",
          marginBottom: isMobile ? "24px" : "32px"
        }}>
          <h2 style={{
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Choose Your Wallet
          </h2>
          <p style={{
            color: "#b3b8c5",
            fontSize: isMobile ? "14px" : "16px",
            margin: 0,
            lineHeight: "1.5"
          }}>
            Select how you'd like to manage your wallet
          </p>
        </div>

        {/* 选项容器 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {/* 生成托管钱包选项 */}
          <button
            onClick={onGenerateCustodyWallet}
            style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              border: "2px solid rgba(102, 126, 234, 0.3)",
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "24px 20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.6)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* 图标 */}
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              🔐
            </div>
            
            {/* 内容 */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: isMobile ? "16px" : "18px",
                fontWeight: "600",
                margin: "0 0 4px 0",
                color: "white"
              }}>
                Generate Custody Wallet
              </h3>
              <p style={{
                fontSize: isMobile ? "13px" : "14px",
                color: "#b3b8c5",
                margin: 0,
                lineHeight: "1.4"
              }}>
                Create a secure wallet managed by Bondly. Perfect for beginners and enhanced security.
              </p>
            </div>
          </button>

          {/* 连接钱包选项 */}
          <button
            onClick={onConnectWallet}
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
              border: "2px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "24px 20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(59, 130, 246, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* 图标 */}
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>
              🔗
            </div>
            
            {/* 内容 */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: isMobile ? "16px" : "18px",
                fontWeight: "600",
                margin: "0 0 4px 0",
                color: "white"
              }}>
                Connect Existing Wallet
              </h3>
              <p style={{
                fontSize: isMobile ? "13px" : "14px",
                color: "#b3b8c5",
                margin: 0,
                lineHeight: "1.4"
              }}>
                Connect your existing MetaMask, WalletConnect, or other Web3 wallet.
              </p>
            </div>
          </button>
        </div>

        {/* 底部说明 */}
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "rgba(102, 126, 234, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(102, 126, 234, 0.1)"
        }}>
          <p style={{
            fontSize: isMobile ? "12px" : "13px",
            color: "#9ca3af",
            margin: 0,
            textAlign: "center",
            lineHeight: "1.4"
          }}>
            💡 <strong>Tip:</strong> Custody wallets are perfect for beginners, while connecting your own wallet gives you full control.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletChoiceModal; 