import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress, getContractABI } from '../config/contracts';

interface StakingLiquidityManagerProps {
  isMobile: boolean;
}

const StakingLiquidityManager: React.FC<StakingLiquidityManagerProps> = ({ isMobile }) => {
  const { address, isConnected } = useAccount();
  const [rewardAmount, setRewardAmount] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  // 合约地址
  const stakingAddress = getContractAddress('GENERAL_STAKING') as `0x${string}`;
  const bondTokenAddress = getContractAddress('BOND_TOKEN') as `0x${string}`;

  // 检查管理员权限
  const { data: rewardManagerRole } = useReadContract({
    address: stakingAddress,
    abi: getContractABI('GENERAL_STAKING'),
    functionName: 'REWARD_MANAGER_ROLE',
  });

  const { data: hasRole, refetch: refetchRole } = useReadContract({
    address: stakingAddress,
    abi: getContractABI('GENERAL_STAKING'),
    functionName: 'hasRole',
    args: [rewardManagerRole as unknown as `0x${string}`, address as `0x${string}`],
    query: { 
      enabled: isConnected && !!address && !!rewardManagerRole,
    },
  });

  // 监听权限检查结果
  useEffect(() => {
    if (hasRole !== undefined) {
      setHasAdminRole(hasRole as unknown as boolean);
      setIsCheckingRole(false);
    }
  }, [hasRole]);

  // 当钱包连接状态改变时重新检查权限
  useEffect(() => {
    if (isConnected && address && rewardManagerRole) {
      refetchRole();
    } else {
      setHasAdminRole(false);
      setIsCheckingRole(false);
    }
  }, [isConnected, address, rewardManagerRole, refetchRole]);

  // 读取当前奖励信息
  const { data: rewardRate } = useReadContract({
    address: stakingAddress,
    abi: getContractABI('GENERAL_STAKING'),
    functionName: 'rewardRate',
  });

  const { data: rewardEndTime } = useReadContract({
    address: stakingAddress,
    abi: getContractABI('GENERAL_STAKING'),
    functionName: 'rewardEndTime',
  });

  const { data: totalStaked } = useReadContract({
    address: stakingAddress,
    abi: getContractABI('GENERAL_STAKING'),
    functionName: 'totalStaked',
  });

  const { data: rewardPoolBalance } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'balanceOf',
    args: [stakingAddress],
  });

  const { data: userBalance } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: isConnected && !!address },
  });

  const { data: allowance } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'allowance',
    args: [address as `0x${string}`, stakingAddress],
    query: { enabled: isConnected && !!address },
  });

  // 写入合约
  const { writeContract, isPending } = useWriteContract();

  // 计算APY
  const calculateAPY = () => {
    if (!rewardRate || !totalStaked) return '0';
    
    try {
      const rewardRateValue = BigInt(rewardRate.toString());
      const totalStakedValue = BigInt(totalStaked.toString());
      
      if (totalStakedValue === 0n) return '0';
      
      const secondsPerYear = 365 * 24 * 60 * 60;
      const annualReward = rewardRateValue * BigInt(secondsPerYear);
      const apy = (Number(annualReward) / Number(totalStakedValue)) * 100;
      return apy > 10000 ? '10000+' : apy.toFixed(2);
    } catch (error) {
      return '0';
    }
  };

  // 添加流动性
  const handleAddLiquidity = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!hasAdminRole) {
      setError('You do not have admin permissions to add liquidity');
      return;
    }

    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      setError('Please enter a valid reward amount');
      return;
    }

    if (!durationDays || parseInt(durationDays) <= 0) {
      setError('Please enter a valid duration');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const amountWei = parseEther(rewardAmount);
      const durationSeconds = BigInt(parseInt(durationDays) * 24 * 60 * 60);
      const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n;

      // 检查余额
      if (!userBalance || BigInt(userBalance.toString()) < amountWei) {
        setError('Insufficient BOND token balance');
        return;
      }

      // 检查授权额度
      if (currentAllowance < amountWei) {
        // 先授权
        (writeContract as any)({
          address: bondTokenAddress,
          abi: getContractABI('BOND_TOKEN'),
          functionName: 'approve',
          args: [stakingAddress, amountWei],
        });
        setSuccess('Please confirm the approval transaction');
        return;
      }

      // 添加奖励
      (writeContract as any)({
        address: stakingAddress,
        abi: getContractABI('GENERAL_STAKING'),
        functionName: 'addReward',
        args: [amountWei, durationSeconds],
      });

      setSuccess('Please confirm the add liquidity transaction');
      setRewardAmount('');
      setDurationDays('30');

    } catch (err: any) {
      setError(err.message || 'Failed to add liquidity');
    } finally {
      setIsLoading(false);
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
          🔐 Admin Permissions
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          Please connect your wallet to check admin permissions
        </p>
      </div>
    );
  }

  // 如果正在检查权限，显示加载状态
  if (isCheckingRole) {
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
          🔐 Checking Permissions...
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>
          Verifying admin permissions...
        </p>
      </div>
    );
  }

  // 如果没有管理员权限，显示权限不足提示
  if (!hasAdminRole) {
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
          ⚠️ Insufficient Permissions
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "12px" }}>
          Your wallet address does not have staking liquidity management permissions
        </p>
        <p style={{ color: "#6b7280", fontSize: "12px" }}>
          Current Address: {address?.slice(0, 6)}...{address?.slice(-4)}
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
      <h3 style={{
        fontSize: isMobile ? "20px" : "24px",
        fontWeight: "700",
        marginBottom: "16px",
        color: "white"
      }}>
        💰 BOND Staking Liquidity Management
      </h3>

      {/* 权限状态 */}
      <div style={{
        marginBottom: "20px",
        padding: "12px",
        background: "rgba(34, 197, 94, 0.1)",
        borderRadius: "8px",
        border: "1px solid rgba(34, 197, 94, 0.3)"
      }}>
        <div style={{ fontSize: "14px", color: "#22c55e", fontWeight: "600" }}>
          ✅ Admin Permissions Confirmed
        </div>
        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
          Address: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      </div>

      {/* 当前状态 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "24px",
        padding: "16px",
        background: "#151728",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>
            Current APY
          </div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#667eea" }}>
            {calculateAPY()}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>
            Reward Pool Balance
          </div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#667eea" }}>
            {rewardPoolBalance ? formatEther(BigInt(rewardPoolBalance.toString())) : '0'} BOND
          </div>
        </div>
        <div>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>
            Total Staked
          </div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#667eea" }}>
            {totalStaked ? formatEther(BigInt(totalStaked.toString())) : '0'} BOND
          </div>
        </div>
        <div>
          <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "4px" }}>
            Reward End Time
          </div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#667eea" }}>
            {rewardEndTime && Number(rewardEndTime) > 0 
              ? new Date(Number(rewardEndTime) * 1000).toLocaleDateString()
              : 'Not Set'
            }
          </div>
        </div>
      </div>

      {/* 添加流动性表单 */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            color: "#9ca3af",
            marginBottom: "8px"
          }}>
            Reward Amount (BOND)
          </label>
          <input
            type="number"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            placeholder="Enter BOND amount to add"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "14px"
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            color: "#9ca3af",
            marginBottom: "8px"
          }}>
            Duration (Days)
          </label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            placeholder="30"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "14px"
            }}
          />
        </div>

        {userBalance && (
          <div style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginBottom: "16px"
          }}>
            Available Balance: {formatEther(BigInt(userBalance.toString()))} BOND
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <button
        onClick={handleAddLiquidity}
        disabled={isLoading || isPending}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          fontSize: "16px",
          fontWeight: "600",
          cursor: isLoading || isPending ? "not-allowed" : "pointer",
          opacity: isLoading || isPending ? 0.6 : 1,
          transition: "all 0.2s ease"
        }}
      >
        {isLoading || isPending ? 'Processing...' : 'Add Liquidity'}
      </button>

      {/* 消息显示 */}
      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "8px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#ef4444",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "8px",
          background: "rgba(34, 197, 94, 0.1)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          color: "#22c55e",
          fontSize: "14px"
        }}>
          {success}
        </div>
      )}
    </div>
  );
};

export default StakingLiquidityManager; 