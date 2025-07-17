import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import CommonNavbar from '../components/CommonNavbar';
import { getContractAddress, getContractABI } from '../config/contracts';
import { useBondBalance } from '../hooks/useBondBalance';
import { useStaking } from '../hooks/useStaking';

interface StakePageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const StakePage: React.FC<StakePageProps> = ({ isMobile, onPageChange }) => {
  const { address, isConnected, chain } = useAccount();
  const { formatted: bondBalance, isLoading: bondLoading, error: bondError, refetch: refetchBalance } = useBondBalance();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 使用质押hook
  const {
    stakedAmount,
    pendingReward,
    allowance,
    totalStaked,
    apy,
    rewardPoolBalance,
    isLoading,
    error: stakingError,
    stake,
    unstake,
    claimReward,
    approve,
    refreshAllData
  } = useStaking();

  // Staking handler
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid staking amount');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const stakeAmountNum = parseFloat(stakeAmount);
      const currentAllowance = parseFloat(allowance);
      
      // Check allowance
      if (currentAllowance < stakeAmountNum) {
        // Approve first
        await approve(stakeAmount);
        setSuccess('Approval successful, please confirm the transaction in your wallet');
        return;
      }
      
      // Execute staking
      await stake(stakeAmount);
      setSuccess('Please confirm the staking transaction in your wallet');
      setStakeAmount('');
    } catch (err) {
      setError('Staking failed, please try again');
      console.error('Stake error:', err);
    }
  };

  // Unstake handler
  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('Please enter a valid unstake amount');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await unstake(unstakeAmount);
      setSuccess('Please confirm the unstake transaction in your wallet');
      setUnstakeAmount('');
    } catch (err) {
      setError('Unstake failed, please try again');
      console.error('Unstake error:', err);
    }
  };

  // Claim reward handler
  const handleClaim = async () => {
    if (parseFloat(pendingReward) <= 0) {
      setError('No rewards available to claim');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await claimReward();
      setSuccess('Please confirm the reward claim transaction in your wallet');
    } catch (err) {
      setError('Claiming rewards failed, please try again');
      console.error('Claim error:', err);
    }
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refreshAllData(),
        refetchBalance()
      ]);
      setSuccess('Data refreshed successfully!');
    } catch (err) {
      setError('Refresh failed, please try again');
      console.error('Refresh error:', err);
    }
  };

  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  // TODO: 添加获取合约数据的函数
  useEffect(() => {
    if (isConnected && address) {
      // 这里添加获取合约数据的逻辑
      // fetchStakingData();
    }
  }, [isConnected, address]);

  // 自动消失成功提示
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

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
            💰 BOND Token Staking
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "16px", marginBottom: "32px" }}>
            Stake your BOND tokens to earn rewards and participate in platform governance
          </p>

          {/* 统计信息 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
            gap: isMobile ? "16px" : "20px",
            marginBottom: "32px",
            padding: "24px",
            background: "#151728",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "bold", color: "#667eea" }}>
                {bondLoading ? "Loading..." : bondError ? "Error" : bondBalance} BOND
              </div>
              <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#9ca3af" }}>
                {bondLoading ? "Loading balance..." : bondError ? "Failed to load" : "Available Balance"}
              </div>
              {bondError && (
                <div style={{ fontSize: "8px", color: "#ef4444", marginTop: "4px" }}>
                  {bondError}
                </div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "bold", color: "#10b981" }}>
                {stakedAmount} BOND
              </div>
              <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#9ca3af" }}>Staked Amount</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "bold", color: "#f59e0b" }}>
                {pendingReward} BOND
              </div>
              <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#9ca3af" }}>Available Reward</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "bold", color: "#8b5cf6" }}>
                {rewardPoolBalance} BOND
              </div>
              <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#9ca3af" }}>Reward Pool Balance</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "bold", color: "#ec4899" }}>
                {allowance} BOND
              </div>
              <div style={{ fontSize: isMobile ? "10px" : "12px", color: "#9ca3af" }}>Contract Allowance</div>
            </div>
          </div>

          {/* 刷新按钮 */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                background: "rgba(102, 126, 234, 0.1)",
                color: "#667eea",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)")}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)")}
            >
              🔄 {isLoading ? "Refreshing..." : "Refresh Data"}
            </button>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
              Data refreshes automatically every 10 seconds and when new blocks are mined
            </div>
          </div>

          {/* 错误和成功消息 */}
          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "#ef4444"
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "#10b981"
            }}>
              {success}
            </div>
          )}

          {/* 操作区域 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "32px"
          }}>
            {/* 质押区域 */}
            <div style={{
              background: "#151728",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
                Stake BOND
              </h3>
              
              {/* 授权提示 */}
              {parseFloat(allowance) === 0 && (
                <div style={{
                  background: "rgba(236, 72, 153, 0.1)",
                  border: "1px solid rgba(236, 72, 153, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                  color: "#ec4899",
                  fontSize: "14px"
                }}>
                  ⚠️ Contract allowance is 0. Please approve first to enable staking.
                </div>
              )}
              
              <input
                type="number"
                placeholder="Enter amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  marginBottom: "16px",
                  outline: "none"
                }}
              />
              
              {/* 授权按钮 */}
              {parseFloat(allowance) === 0 && (
                <button
                  onClick={() => approve(stakeAmount || '1000')}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#ec4899",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    marginBottom: "12px"
                  }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "#db2777")}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = "#ec4899")}
                >
                  {isLoading ? "Waiting for wallet confirmation..." : "Approve BOND"}
                </button>
              )}
              
              <button
                onClick={handleStake}
                disabled={isLoading || parseFloat(allowance) === 0}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: parseFloat(allowance) === 0 ? "rgba(255, 255, 255, 0.1)" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: (isLoading || parseFloat(allowance) === 0) ? "not-allowed" : "pointer",
                  opacity: (isLoading || parseFloat(allowance) === 0) ? 0.7 : 1,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && parseFloat(allowance) > 0) {
                    e.currentTarget.style.background = "#5a67d8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && parseFloat(allowance) > 0) {
                    e.currentTarget.style.background = "#667eea";
                  }
                }}
              >
                {isLoading ? "Waiting for wallet confirmation..." : parseFloat(allowance) === 0 ? "Approve First" : "Stake BOND"}
              </button>
            </div>

            {/* 解除质押区域 */}
            <div style={{
              background: "#151728",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
                Unstake BOND
              </h3>
              <input
                type="number"
                placeholder="Enter amount to unstake"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  marginBottom: "16px",
                  outline: "none"
                }}
              />
              <button
                onClick={handleUnstake}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "#dc2626")}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = "#ef4444")}
              >
                {isLoading ? "Waiting for wallet confirmation..." : "Unstake BOND"}
              </button>
            </div>
          </div>

          {/* 领取奖励区域 */}
          <div style={{
            background: "#151728",
            borderRadius: "12px",
            padding: "24px",
            marginTop: "32px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
              Claim Rewards
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                {pendingReward} BOND
              </span>
              <div style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>
                Available to claim
              </div>
            </div>
            <button
              onClick={handleClaim}
              disabled={isLoading || parseFloat(pendingReward) <= 0}
              style={{
                padding: "12px 32px",
                background: parseFloat(pendingReward) > 0 ? "#f59e0b" : "rgba(255, 255, 255, 0.1)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: (isLoading || parseFloat(pendingReward) <= 0) ? "not-allowed" : "pointer",
                opacity: (isLoading || parseFloat(pendingReward) <= 0) ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!isLoading && parseFloat(pendingReward) > 0) {
                  e.currentTarget.style.background = "#d97706";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && parseFloat(pendingReward) > 0) {
                  e.currentTarget.style.background = "#f59e0b";
                }
              }}
            >
              {isLoading ? "Waiting for wallet confirmation..." : "Claim Rewards"}
            </button>
          </div>

          {/* 质押信息 */}
          <div style={{
            background: "#151728",
            borderRadius: "12px",
            padding: "24px",
            marginTop: "32px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
              Staking Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af" }}>Total Staked:</span>
                <span style={{ color: "white", fontWeight: "500" }}>{totalStaked} BOND</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af" }}>Your Staked:</span>
                <span style={{ color: "white", fontWeight: "500" }}>{stakedAmount} BOND</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af" }}>Allowance:</span>
                <span style={{ color: "white", fontWeight: "500" }}>{allowance} BOND</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af" }}>APY:</span>
                <span style={{ color: "#10b981", fontWeight: "500" }}>{apy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage; 