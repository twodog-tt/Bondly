import React from 'react';
import CommonNavbar from '../components/CommonNavbar';

interface StakePageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const StakePage: React.FC<StakePageProps> = ({ isMobile, onPageChange }) => {
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
        currentPage="stake"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* 页面标题 */}
        <div style={{ 
          marginBottom: "40px",
          textAlign: "center"
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
            Stake & Earn
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: "#9ca3af",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Stake your tokens and earn rewards while supporting the Bondly ecosystem
          </p>
        </div>

        {/* 主要内容区域 */}
        <div style={{
          background: "#151728",
          borderRadius: "16px",
          padding: isMobile ? "24px" : "40px",
          border: "1px solid #374151",
          marginBottom: "32px"
        }}>
          <h2 style={{
            fontSize: isMobile ? "20px" : "24px",
            fontWeight: "600",
            marginBottom: "24px",
            color: "white"
          }}>
            Coming Soon
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#9ca3af",
            lineHeight: "1.6"
          }}>
            The staking functionality is currently under development. Stay tuned for updates!
          </p>
        </div>

        {/* 功能预览卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginTop: "40px"
        }}>
          <div style={{
            background: "#151728",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #374151",
            transition: "transform 0.2s ease, border-color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "#667eea";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "#374151";
          }}>
            <div style={{
              fontSize: "32px",
              marginBottom: "16px"
            }}>
              🔒
            </div>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "white"
            }}>
              Secure Staking
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#9ca3af",
              lineHeight: "1.5"
            }}>
              Stake your tokens securely with smart contract protection
            </p>
          </div>

          <div style={{
            background: "#151728",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #374151",
            transition: "transform 0.2s ease, border-color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "#667eea";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "#374151";
          }}>
            <div style={{
              fontSize: "32px",
              marginBottom: "16px"
            }}>
              💰
            </div>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "white"
            }}>
              Earn Rewards
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#9ca3af",
              lineHeight: "1.5"
            }}>
              Earn passive income through staking rewards and governance tokens
            </p>
          </div>

          <div style={{
            background: "#151728",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #374151",
            transition: "transform 0.2s ease, border-color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "#667eea";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "#374151";
          }}>
            <div style={{
              fontSize: "32px",
              marginBottom: "16px"
            }}>
              🏛️
            </div>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "white"
            }}>
              Governance Rights
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#9ca3af",
              lineHeight: "1.5"
            }}>
              Participate in DAO governance and vote on important proposals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage; 