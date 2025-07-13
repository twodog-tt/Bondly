import React, { useState } from 'react';
import CommonNavbar from '../components/CommonNavbar';

interface StakePageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const StakePage: React.FC<StakePageProps> = ({ isMobile, onPageChange }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 模拟数据（实际应该从合约读取）
  const mockBondBalance = '1000.0000';
  const mockStakedAmount = '500.0000';
  const mockRewardAmount = '25.5000';

  // 处理质押
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('请输入有效的质押数量');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('质押成功！');
      setStakeAmount('');
    } catch (err) {
      setError('质押失败，请重试');
      console.error('Stake error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理解除质押
  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('请输入有效的解除质押数量');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('解除质押成功！');
      setUnstakeAmount('');
    } catch (err) {
      setError('解除质押失败，请重试');
      console.error('Unstake error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理领取奖励
  const handleClaim = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('奖励领取成功！');
    } catch (err) {
      setError('领取奖励失败，请重试');
      console.error('Claim error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "800px", margin: "0 auto" }}>
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
            Stake your BOND tokens and earn rewards
          </p>
        </div>

        {/* 用户信息卡片 */}
        <div style={{
          background: "#151728",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151",
          marginBottom: "32px"
        }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "white" }}>
            Your Staking Info
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#667eea" }}>
                {mockBondBalance} BOND
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Available Balance</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                {mockStakedAmount} BOND
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Staked Amount</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                {mockRewardAmount} BOND
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Available Reward</div>
            </div>
          </div>
        </div>

        {/* 质押操作 */}
        <div style={{
          background: "#151728",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "white" }}>
            Stake BOND
          </h3>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "16px",
            alignItems: "flex-end"
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#9ca3af" }}>
                Amount (BOND)
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount to stake"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none"
                }}
              />
            </div>
            <button
              onClick={handleStake}
              disabled={isLoading}
              style={{
                padding: "12px 24px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                transition: "opacity 0.2s ease"
              }}
            >
              {isLoading ? "Staking..." : "Stake"}
            </button>
          </div>
        </div>

        {/* 解除质押操作 */}
        <div style={{
          background: "#151728",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "white" }}>
            Unstake BOND
          </h3>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "16px",
            alignItems: "flex-end"
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#9ca3af" }}>
                Amount (BOND)
              </label>
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="Enter amount to unstake"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none"
                }}
              />
            </div>
            <button
              onClick={handleUnstake}
              disabled={isLoading}
              style={{
                padding: "12px 24px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
                transition: "opacity 0.2s ease"
              }}
            >
              {isLoading ? "Unstaking..." : "Unstake"}
            </button>
          </div>
        </div>

        {/* 领取奖励操作 */}
        <div style={{
          background: "#151728",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "white" }}>
            Claim Rewards
          </h3>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: "16px", color: "#9ca3af", marginBottom: "4px" }}>
                Available Reward
              </div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                {mockRewardAmount} BOND
              </div>
            </div>
            <button
              onClick={handleClaim}
              disabled={isLoading || parseFloat(mockRewardAmount) <= 0}
              style={{
                padding: "12px 24px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: isLoading || parseFloat(mockRewardAmount) <= 0 ? "not-allowed" : "pointer",
                opacity: isLoading || parseFloat(mockRewardAmount) <= 0 ? 0.6 : 1,
                transition: "opacity 0.2s ease"
              }}
            >
              {isLoading ? "Claiming..." : "Claim"}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            background: "#dc2626",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {/* 成功提示 */}
        {success && (
          <div style={{
            background: "#10b981",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            fontSize: "14px"
          }}>
            {success}
          </div>
        )}

        {/* 功能说明 */}
        <div style={{
          background: "#151728",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151"
        }}>
          <h3 style={{ fontSize: "20px", marginBottom: "20px", color: "white" }}>
            How Staking Works
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px"
          }}>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>🔒</div>
              <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "white" }}>Stake BOND</h4>
              <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.5" }}>
                Lock your BOND tokens to earn rewards over time
              </p>
            </div>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>💰</div>
              <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "white" }}>Earn Rewards</h4>
              <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.5" }}>
                Accumulate rewards based on your staked amount and time
              </p>
            </div>
            <div>
              <div style={{ fontSize: "24px", marginBottom: "12px" }}>🎯</div>
              <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "white" }}>Claim Anytime</h4>
              <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.5" }}>
                Withdraw your rewards or unstake your tokens at any time
              </p>
            </div>
          </div>
        </div>

        {/* 开发说明 */}
        <div style={{
          background: "#1f2937",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151",
          marginTop: "24px"
        }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px", color: "#f59e0b" }}>
            🚧 Development Status
          </h3>
          <div style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6" }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>✅ Completed:</strong>
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
              <li>UI界面设计和布局</li>
              <li>质押、解除质押、领取奖励的输入框和按钮</li>
              <li>用户信息显示（余额、质押数量、可领取奖励）</li>
              <li>响应式设计支持移动端</li>
            </ul>
            <p style={{ marginBottom: "12px" }}>
              <strong>🔧 Next Steps:</strong>
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li>集成GeneralStaking智能合约</li>
              <li>连接钱包并读取真实数据</li>
              <li>实现实际的质押、解除质押、领取奖励功能</li>
              <li>添加交易状态和错误处理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage; 