import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import CommonNavbar from '../components/CommonNavbar';
import { getContractAddresses, GENERAL_STAKING_ABI, BOND_TOKEN_ABI } from '../config/contracts';

interface StakePageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const StakePage: React.FC<StakePageProps> = ({ isMobile, onPageChange }) => {
  const { address, isConnected, chain } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 实际数据状态
  const [bondBalance, setBondBalance] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [pendingReward, setPendingReward] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');

  // 获取合约地址
  const contracts = getContractAddresses(chain?.id || 11155111);

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
      
      // TODO: 实现真实的质押逻辑
      // 1. 检查授权额度
      // 2. 如果授权不足，先授权
      // 3. 调用质押合约
      
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
      
      // TODO: 实现真实的解质押逻辑
      
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
    if (parseFloat(pendingReward) <= 0) {
      setError('暂无可领取的奖励');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // TODO: 实现真实的领取奖励逻辑
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('奖励领取成功！');
    } catch (err) {
      setError('奖励领取失败，请重试');
      console.error('Claim error:', err);
    } finally {
      setIsLoading(false);
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
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "24px",
            marginBottom: "32px",
            padding: "24px",
            background: "#151728",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#667eea" }}>
                {bondBalance} BOND
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Available Balance</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#10b981" }}>
                {stakedAmount} BOND
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Staked Amount</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f59e0b" }}>
                {pendingReward} BOND
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Available Reward</div>
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
              <button
                onClick={handleStake}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "#5a67d8")}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = "#667eea")}
              >
                {isLoading ? "Processing..." : "Stake BOND"}
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
                {isLoading ? "Processing..." : "Unstake BOND"}
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
              {isLoading ? "Processing..." : "Claim Rewards"}
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
                <span style={{ color: "#9ca3af" }}>APY:</span>
                <span style={{ color: "#10b981", fontWeight: "500" }}>12.5%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af" }}>Lock Period:</span>
                <span style={{ color: "white", fontWeight: "500" }}>No Lock</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#9ca3af" }}>Reward Distribution:</span>
                <span style={{ color: "white", fontWeight: "500" }}>Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage; 