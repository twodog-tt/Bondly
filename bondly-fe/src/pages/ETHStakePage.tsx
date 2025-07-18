import React from 'react';
import CommonNavbar from '../components/CommonNavbar';
import ETHStakingManager from '../components/ETHStakingManager';
import ETHStakingLiquidityManager from '../components/ETHStakingLiquidityManager';

interface ETHStakePageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const ETHStakePage: React.FC<ETHStakePageProps> = ({ isMobile, onPageChange }) => {
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
        currentPage="eth-stake"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <h1 style={{
            fontSize: isMobile ? "24px" : "32px",
            fontWeight: "bold",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            💎 ETH Staking for BOND Rewards
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "16px", marginBottom: "32px" }}>
            Stake your ETH to earn BOND tokens and participate in platform governance
          </p>

          {/* ETH质押管理组件 */}
          <ETHStakingManager isMobile={isMobile} />

          {/* ETH质押流动性管理组件 */}
          <div style={{ marginTop: "32px" }}>
            <ETHStakingLiquidityManager isMobile={isMobile} />
          </div>

          {/* 说明信息 */}
          <div style={{
            marginTop: "32px",
            padding: "24px",
            background: "#151728",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
              📚 ETH Staking Guide
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "24px" }}>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#667eea" }}>
                  How It Works
                </h4>
                <ul style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6" }}>
                  <li>• Stake ETH to earn BOND rewards</li>
                  <li>• Minimum stake: 0.01 ETH</li>
                  <li>• No lock period - unstake anytime</li>
                  <li>• Rewards based on stake proportion</li>
                  <li>• Claim rewards anytime</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#667eea" }}>
                  Benefits
                </h4>
                <ul style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6" }}>
                  <li>• Earn BOND tokens passively</li>
                  <li>• Participate in governance</li>
                  <li>• Support platform development</li>
                  <li>• Flexible staking options</li>
                  <li>• Real-time APY tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 风险提示 */}
          <div style={{
            marginTop: "24px",
            padding: "16px",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(239, 68, 68, 0.3)"
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#ef4444" }}>
              ⚠️ Risk Disclaimer
            </h4>
            <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.5" }}>
              Staking involves risks including but not limited to smart contract risks, market volatility, and potential loss of funds. 
              Please ensure you understand the risks before participating. This is not financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETHStakePage; 