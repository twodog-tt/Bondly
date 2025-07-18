import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useETHStaking } from '../hooks/useETHStaking';

interface ETHStakingManagerProps {
  isMobile: boolean;
}

const ETHStakingManager: React.FC<ETHStakingManagerProps> = ({ isMobile }) => {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 使用 ETH Staking hook
  const {
    stakedAmount,
    pendingReward,
    totalStaked,
    apy,
    rewardPoolBalance,
    rewardRate,
    rewardEndTime,
    isLoading,
    error: stakingError,
    stake,
    unstake,
    claim,
    stakeAndClaim,
    unstakeAndClaim,
    refreshAllData
  } = useETHStaking();

  // 质押ETH
  const handleStake = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    if (parseFloat(stakeAmount) < 0.01) {
      setError('Minimum stake amount is 0.01 ETH');
      return;
    }

    try {
      setError('');
      setSuccess('');
      stake(stakeAmount);
      setSuccess('Please confirm the staking transaction');
      setStakeAmount('');
    } catch (err: any) {
      setError(err.message || 'Staking failed');
    }
  };

  // 解除质押
  const handleUnstake = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('Please enter a valid unstake amount');
      return;
    }

    if (parseFloat(unstakeAmount) > parseFloat(stakedAmount)) {
      setError('Unstake amount exceeds staked amount');
      return;
    }

    try {
      setError('');
      setSuccess('');
      unstake(unstakeAmount);
      setSuccess('Please confirm the unstake transaction');
      setUnstakeAmount('');
    } catch (err: any) {
      setError(err.message || 'Unstaking failed');
    }
  };

  // 领取奖励
  const handleClaim = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (parseFloat(pendingReward) <= 0) {
      setError('No rewards available to claim');
      return;
    }

    try {
      setError('');
      setSuccess('');
      claim();
      setSuccess('Please confirm the claim transaction');
    } catch (err: any) {
      setError(err.message || 'Claiming failed');
    }
  };

  // 质押并领取奖励
  const handleStakeAndClaim = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    if (parseFloat(stakeAmount) < 0.01) {
      setError('Minimum stake amount is 0.01 ETH');
      return;
    }

    try {
      setError('');
      setSuccess('');
      stakeAndClaim(stakeAmount);
      setSuccess('Please confirm the stake and claim transaction');
      setStakeAmount('');
    } catch (err: any) {
      setError(err.message || 'Stake and claim failed');
    }
  };

  // 解除质押并领取奖励
  const handleUnstakeAndClaim = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('Please enter a valid unstake amount');
      return;
    }

    if (parseFloat(unstakeAmount) > parseFloat(stakedAmount)) {
      setError('Unstake amount exceeds staked amount');
      return;
    }

    try {
      setError('');
      setSuccess('');
      unstakeAndClaim(unstakeAmount);
      setSuccess('Please confirm the unstake and claim transaction');
      setUnstakeAmount('');
    } catch (err: any) {
      setError(err.message || 'Unstake and claim failed');
    }
  };

  // 手动刷新数据
  const handleRefresh = async () => {
    try {
      await refreshAllData();
      setSuccess('Data refreshed successfully!');
    } catch (err) {
      setError('Refresh failed, please try again');
    }
  };

  // 自动清除消息
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // 监听 hook 中的错误
  useEffect(() => {
    if (stakingError) {
      setError(stakingError);
    }
  }, [stakingError]);

  // 如果没有连接钱包，显示连接提示
  if (!isConnected) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: "20px",
        padding: isMobile ? "24px 16px" : "32px",
        border: "1px solid #23244a",
        boxShadow: "0 4px 24px rgba(102,126,234,0.08)"
      }}>
        <h3 style={{
          fontSize: isMobile ? "20px" : "24px",
          fontWeight: "700",
          marginBottom: "16px",
          color: "white"
        }}>
          🔐 ETH Staking
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          Please connect your wallet to start staking ETH for BOND rewards
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      borderRadius: "20px",
      padding: isMobile ? "24px 16px" : "32px",
      border: "1px solid #23244a",
      boxShadow: "0 4px 24px rgba(102,126,234,0.08)"
    }}>
      {/* 标题和刷新按钮 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <h3 style={{
          fontSize: isMobile ? "20px" : "24px",
          fontWeight: "700",
          color: "white"
        }}>
          🔐 ETH Staking
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            background: "rgba(102,126,234,0.1)",
            border: "1px solid rgba(102,126,234,0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#667eea",
            fontSize: "12px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {isLoading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* 统计信息 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "rgba(102,126,234,0.1)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(102,126,234,0.2)"
        }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
            Your Staked
          </div>
          <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#667eea" }}>
            {isLoading ? "Loading..." : `${parseFloat(stakedAmount).toFixed(4)} ETH`}
          </div>
        </div>

        <div style={{
          background: "rgba(16,185,129,0.1)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(16,185,129,0.2)"
        }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
            Pending Reward
          </div>
          <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#10b981" }}>
            {isLoading ? "Loading..." : `${parseFloat(pendingReward).toFixed(4)} BOND`}
          </div>
        </div>

        <div style={{
          background: "rgba(245,158,11,0.1)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(245,158,11,0.2)"
        }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
            Current APY
          </div>
          <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#f59e0b" }}>
            {isLoading ? "Loading..." : `${apy}%`}
          </div>
        </div>

        <div style={{
          background: "rgba(139,92,246,0.1)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(139,92,246,0.2)"
        }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
            Total Staked
          </div>
          <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: "600", color: "#8b5cf6" }}>
            {isLoading ? "Loading..." : `${parseFloat(totalStaked).toFixed(4)} ETH`}
          </div>
        </div>
      </div>

      {/* 错误和成功消息 */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
          color: "#ef4444",
          fontSize: "14px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
          color: "#10b981",
          fontSize: "14px"
        }}>
          ✅ {success}
        </div>
      )}

      {/* 质押操作 */}
      <div style={{
        background: "#151728",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
          💎 Stake ETH
        </h4>
        
        <div style={{ marginBottom: "16px" }}>
          <input
            type="number"
            placeholder="Enter ETH amount (min 0.01)"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: "12px"
        }}>
          <button
            onClick={handleStake}
            disabled={isLoading || !stakeAmount}
            style={{
              background: isLoading || !stakeAmount ? "rgba(255,255,255,0.1)" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading || !stakeAmount ? "not-allowed" : "pointer",
              opacity: isLoading || !stakeAmount ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {isLoading ? "Processing..." : "Stake ETH"}
          </button>

          <button
            onClick={handleStakeAndClaim}
            disabled={isLoading || !stakeAmount}
            style={{
              background: isLoading || !stakeAmount ? "rgba(255,255,255,0.1)" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading || !stakeAmount ? "not-allowed" : "pointer",
              opacity: isLoading || !stakeAmount ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {isLoading ? "Processing..." : "Stake & Claim"}
          </button>
        </div>
      </div>

      {/* 解除质押操作 */}
      <div style={{
        background: "#151728",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
          🔓 Unstake ETH
        </h4>
        
        <div style={{ marginBottom: "16px" }}>
          <input
            type="number"
            placeholder="Enter ETH amount to unstake"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: "12px"
        }}>
          <button
            onClick={handleUnstake}
            disabled={isLoading || !unstakeAmount}
            style={{
              background: isLoading || !unstakeAmount ? "rgba(255,255,255,0.1)" : "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading || !unstakeAmount ? "not-allowed" : "pointer",
              opacity: isLoading || !unstakeAmount ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {isLoading ? "Processing..." : "Unstake ETH"}
          </button>

          <button
            onClick={handleUnstakeAndClaim}
            disabled={isLoading || !unstakeAmount}
            style={{
              background: isLoading || !unstakeAmount ? "rgba(255,255,255,0.1)" : "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading || !unstakeAmount ? "not-allowed" : "pointer",
              opacity: isLoading || !unstakeAmount ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {isLoading ? "Processing..." : "Unstake & Claim"}
          </button>
        </div>
      </div>

      {/* 领取奖励操作 */}
      <div style={{
        background: "#151728",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "white" }}>
          🎁 Claim Rewards
        </h4>
        
        <button
          onClick={handleClaim}
          disabled={isLoading || parseFloat(pendingReward) <= 0}
          style={{
            width: "100%",
            background: isLoading || parseFloat(pendingReward) <= 0 ? "rgba(255,255,255,0.1)" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isLoading || parseFloat(pendingReward) <= 0 ? "not-allowed" : "pointer",
            opacity: isLoading || parseFloat(pendingReward) <= 0 ? 0.6 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {isLoading ? "Processing..." : `Claim ${parseFloat(pendingReward).toFixed(4)} BOND`}
        </button>
      </div>

      {/* 奖励池信息 */}
      <div style={{
        marginTop: "20px",
        padding: "16px",
        background: "rgba(102,126,234,0.05)",
        borderRadius: "8px",
        border: "1px solid rgba(102,126,234,0.2)"
      }}>
        <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
          📊 Pool Information
        </div>
        <div style={{ fontSize: "14px", color: "#667eea" }}>
          Reward Pool: {isLoading ? "Loading..." : `${parseFloat(rewardPoolBalance).toFixed(2)} BOND`}
        </div>
        <div style={{ fontSize: "14px", color: "#667eea" }}>
          Reward Rate: {isLoading ? "Loading..." : `${parseFloat(rewardRate).toFixed(8)} BOND/s`}
        </div>
        {rewardEndTime !== '0' && (
          <div style={{ fontSize: "14px", color: "#667eea" }}>
            End Time: {isLoading ? "Loading..." : new Date(parseInt(rewardEndTime) * 1000).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ETHStakingManager; 