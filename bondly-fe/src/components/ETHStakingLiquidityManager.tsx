import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress, getContractABI } from '../config/contracts';

interface ETHStakingLiquidityManagerProps {
  isMobile: boolean;
}

const ETHStakingLiquidityManager: React.FC<ETHStakingLiquidityManagerProps> = ({ isMobile }) => {
  const { address, isConnected } = useAccount();
  const [rewardAmount, setRewardAmount] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isApprovalStage, setIsApprovalStage] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<bigint>(0n);
  const [pendingDuration, setPendingDuration] = useState<bigint>(0n);

  // 合约地址
  const ethStakingAddress = getContractAddress('ETH_STAKING') as `0x${string}`;
  const bondTokenAddress = getContractAddress('BOND_TOKEN') as `0x${string}`;

  // 检查管理员权限
  const { data: rewardManagerRole } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'REWARD_MANAGER_ROLE',
  });

  const { data: hasRole, refetch: refetchRole } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
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
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'rewardRate',
  });

  const { data: rewardEndTime } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'rewardEndTime',
  });

  const { data: totalStaked } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'totalStaked',
  });

  const { data: rewardPoolBalance } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'balanceOf',
    args: [ethStakingAddress],
  });

  const { data: userBalance } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: isConnected && !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'allowance',
    args: [address as `0x${string}`, ethStakingAddress],
    query: { 
      enabled: isConnected && !!address,
      refetchInterval: 5000, // 每5秒自动刷新一次
    },
  });

  const { data: apy } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'calculateAPY',
  });

  // 写入合约
  const { writeContract, isPending, data: writeData, error: writeError } = useWriteContract();

  // 监听合约事件
  useWatchContractEvent({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    eventName: 'RewardAdded',
    onLogs: (logs) => {
      console.log('Reward added event detected:', logs);
      // 刷新数据
      refetchRole();
      setSuccess('Reward added successfully!');
      setRewardAmount('');
      setDurationDays('30');
      setIsApprovalStage(false);
      setPendingAmount(0n);
      setPendingDuration(0n);
    },
  });

  // 监听交易成功
  useEffect(() => {
    if (writeData && !isPending) {
      console.log('Transaction successful:', writeData);
      setSuccess('Transaction submitted successfully! Please wait for confirmation...');
      setIsLoading(false);
    }
  }, [writeData, isPending]);

  // 添加奖励到池子的函数
  const addRewardToPool = async (amount: bigint, duration: bigint) => {
    try {
      (writeContract as any)({
        address: ethStakingAddress,
        abi: getContractABI('ETH_STAKING'),
        functionName: 'addReward',
        args: [amount, duration],
      });
      setSuccess('Please confirm the add reward transaction in your wallet');
    } catch (err: any) {
      setError(err.message || 'Add reward failed');
      setIsLoading(false);
      setIsApprovalStage(false);
    }
  };

  // 监听写入状态变化
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Transaction failed');
      setIsLoading(false);
      setIsApprovalStage(false);
    }
  }, [writeError]);

  // 监听BOND代币授权事件
  useWatchContractEvent({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    eventName: 'Approval',
    onLogs: (logs) => {
      console.log('Approval event detected:', logs);
      // 检查是否是当前用户的授权
      const approvalLog = logs.find(log => {
        const args = log.args as any;
        return args?.owner?.toLowerCase() === address?.toLowerCase() &&
               args?.spender?.toLowerCase() === ethStakingAddress.toLowerCase();
      });
      
      if (approvalLog) {
        console.log('Approval confirmed for current user');
        // 刷新授权数据
        refetchAllowance();
        
        if (isApprovalStage) {
          console.log('Proceeding to add reward');
          setSuccess('Approval confirmed! Now adding reward to pool...');
          // 自动进行添加奖励操作
          setTimeout(() => {
            addRewardToPool(pendingAmount, pendingDuration);
          }, 2000); // 等待2秒确保授权交易已确认
        } else {
          // 用户主动授权（如点击Approve Max）
          setSuccess('Authorization updated successfully!');
        }
      }
    },
  });

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
        try {
          setIsApprovalStage(true);
          setPendingAmount(amountWei);
          setPendingDuration(durationSeconds);
          (writeContract as any)({
            address: bondTokenAddress,
            abi: getContractABI('BOND_TOKEN'),
            functionName: 'approve',
            args: [ethStakingAddress, amountWei],
          });
          setSuccess('Please confirm the approval transaction in your wallet. After approval, the reward will be added automatically.');
        } catch (err: any) {
          setError(err.message || 'Approval failed');
          setIsLoading(false);
          setIsApprovalStage(false);
        }
        return;
      }

      // 直接添加奖励（已有足够授权）
      addRewardToPool(amountWei, durationSeconds);

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
          🔐 ETH Staking Admin
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
          Your wallet address does not have ETH staking liquidity management permissions
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
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <h3 style={{
          fontSize: isMobile ? "20px" : "24px",
          fontWeight: "700",
          color: "white"
        }}>
          💎 ETH Staking Liquidity Management
        </h3>
        <button
          onClick={() => {
            refetchRole();
            refetchAllowance();
            setSuccess('Data refreshed');
          }}
          disabled={isLoading || isPending}
          style={{
            background: "rgba(102,126,234,0.1)",
            border: "1px solid rgba(102,126,234,0.3)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#667eea",
            fontSize: "12px",
            cursor: isLoading || isPending ? "not-allowed" : "pointer",
            opacity: isLoading || isPending ? 0.6 : 1,
            transition: "all 0.2s ease"
          }}
        >
          🔄 Refresh
        </button>
      </div>

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

      {/* 授权状态显示 */}
      <div style={{
        marginBottom: "20px",
        padding: "12px",
        background: "rgba(59, 130, 246, 0.1)",
        borderRadius: "8px",
        border: "1px solid rgba(59, 130, 246, 0.3)"
      }}>
        <div style={{ fontSize: "14px", color: "#3b82f6", fontWeight: "600", marginBottom: "8px" }}>
          🔐 BOND Token Authorization Status
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "8px", fontSize: "12px" }}>
          <div>
            <span style={{ color: "#9ca3af" }}>Your Balance: </span>
            <span style={{ color: "#3b82f6", fontWeight: "600" }}>
              {userBalance ? formatEther(BigInt(userBalance.toString())) : '0'} BOND
            </span>
          </div>
          <div>
            <span style={{ color: "#9ca3af" }}>Authorized: </span>
            <span style={{ color: "#3b82f6", fontWeight: "600" }}>
              {allowance ? formatEther(BigInt(allowance.toString())) : '0'} BOND
            </span>
          </div>
        </div>
        {/* 调试信息 */}
        {allowance && userBalance && (
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#6b7280" }}>
            Debug: Allowance={allowance.toString()}, Balance={userBalance.toString()}
          </div>
        )}
        {allowance && userBalance && (
          <div style={{ marginTop: "8px", fontSize: "11px", color: "#9ca3af" }}>
            {BigInt(allowance.toString()) >= BigInt(userBalance.toString()) 
              ? "✅ Sufficient authorization for all your BOND tokens"
              : (() => {
                  try {
                    const allowanceBigInt = BigInt(allowance.toString());
                    const balanceBigInt = BigInt(userBalance.toString());
                    
                    // 如果授权为0，直接显示无授权
                    if (allowanceBigInt === 0n) {
                      return "⚠️ No authorization - You need to approve BOND tokens before adding rewards";
                    }
                    
                    // 如果授权大于0但小于余额，计算百分比
                    if (allowanceBigInt > 0n && balanceBigInt > 0n) {
                      const percentage = Number((allowanceBigInt * 100n) / balanceBigInt);
                      
                      if (percentage >= 100) {
                        return "✅ Sufficient authorization for all your BOND tokens";
                      } else if (percentage > 0) {
                        return "⚠️ Authorization covers " + percentage + "% of your balance";
                      } else {
                        // 如果百分比为0但授权不为0，说明授权很小
                        return "⚠️ Authorization covers less than 1% of your balance";
                      }
                    }
                    
                    return "⚠️ Unable to calculate authorization status";
                  } catch (error) {
                    console.error('Authorization calculation error:', error);
                    return "⚠️ Unable to calculate authorization status";
                  }
                })()
            }
          </div>
        )}
        
        {/* 授权管理按钮 */}
        <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              if (userBalance) {
                const maxAmount = parseEther(formatEther(BigInt(userBalance.toString())));
                (writeContract as any)({
                  address: bondTokenAddress,
                  abi: getContractABI('BOND_TOKEN'),
                  functionName: 'approve',
                  args: [ethStakingAddress, maxAmount],
                });
                setSuccess('Approving maximum BOND tokens for convenience');
              }
            }}
            disabled={isLoading || isPending}
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#3b82f6",
              fontSize: "11px",
              cursor: isLoading || isPending ? "not-allowed" : "pointer",
              opacity: isLoading || isPending ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            🔓 Approve Max
          </button>
          <button
            onClick={() => {
              (writeContract as any)({
                address: bondTokenAddress,
                abi: getContractABI('BOND_TOKEN'),
                functionName: 'approve',
                args: [ethStakingAddress, 0n],
              });
              setSuccess('Revoking BOND token authorization');
            }}
            disabled={isLoading || isPending}
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "6px",
              padding: "6px 12px",
              color: "#ef4444",
              fontSize: "11px",
              cursor: isLoading || isPending ? "not-allowed" : "pointer",
              opacity: isLoading || isPending ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            🚫 Revoke Auth
          </button>
        </div>
      </div>

      {/* 待处理状态显示 */}
      {isApprovalStage && (
        <div style={{
          marginBottom: "20px",
          padding: "12px",
          background: "rgba(245, 158, 11, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(245, 158, 11, 0.3)"
        }}>
          <div style={{ fontSize: "14px", color: "#f59e0b", fontWeight: "600", marginBottom: "8px" }}>
            ⏳ Pending Reward Addition
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>
            Amount: {pendingAmount ? formatEther(pendingAmount) : '0'} BOND
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
            Duration: {pendingDuration ? Number(pendingDuration) / (24 * 60 * 60) : '0'} days
          </div>
          <div style={{ fontSize: "11px", color: "#f59e0b" }}>
            🔄 Waiting for approval confirmation. After approval, reward will be added automatically.
          </div>
        </div>
      )}

      {/* 操作状态指示器 */}
      {isApprovalStage && (
        <div style={{
          marginBottom: "20px",
          padding: "12px",
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
          border: "1px solid rgba(59, 130, 246, 0.3)"
        }}>
          <div style={{ fontSize: "14px", color: "#3b82f6", fontWeight: "600" }}>
            🔄 Waiting for Approval Confirmation
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            Please confirm the approval transaction in your wallet. After approval, the reward will be added automatically.
          </div>
        </div>
      )}

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
            {apy ? `${Number(apy) / 100}%` : '0%'}
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
            Total Staked ETH
          </div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#667eea" }}>
            {totalStaked ? formatEther(BigInt(totalStaked.toString())) : '0'} ETH
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
          {/* 授权状态检查 */}
          {rewardAmount && allowance && userBalance && (
            <div style={{
              marginTop: "8px",
              fontSize: "12px",
              padding: "8px",
              borderRadius: "6px",
              background: BigInt(allowance.toString()) >= parseEther(rewardAmount)
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              border: "1px solid",
              borderColor: BigInt(allowance.toString()) >= parseEther(rewardAmount)
                ? "rgba(34, 197, 94, 0.3)"
                : "rgba(239, 68, 68, 0.3)",
              color: BigInt(allowance.toString()) >= parseEther(rewardAmount)
                ? "#22c55e"
                : "#ef4444"
            }}>
              {BigInt(allowance.toString()) >= parseEther(rewardAmount)
                ? "✅ Sufficient authorization for this amount"
                : BigInt(allowance.toString()) === 0n
                ? "⚠️ No authorization - Click 'Approve Max' or proceed to authorize"
                : "⚠️ Insufficient authorization. You'll need to approve first."
              }
            </div>
          )}
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

        {/* 余额和授权信息 */}
        <div style={{
          padding: "12px",
          background: "#151728",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "16px"
        }}>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
            💰 Token Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
            <div>
              <span style={{ color: "#9ca3af" }}>Your Balance: </span>
              <span style={{ color: "#3b82f6", fontWeight: "600" }}>
                {userBalance ? formatEther(BigInt(userBalance.toString())) : '0'} BOND
              </span>
            </div>
            <div>
              <span style={{ color: "#9ca3af" }}>Authorized: </span>
              <span style={{ color: "#3b82f6", fontWeight: "600" }}>
                {allowance ? formatEther(BigInt(allowance.toString())) : '0'} BOND
              </span>
            </div>
          </div>
          {rewardAmount && allowance && userBalance && (
            <div style={{
              marginTop: "8px",
              fontSize: "11px",
              color: BigInt(allowance.toString()) >= parseEther(rewardAmount) ? "#22c55e" : "#f59e0b"
            }}>
              {BigInt(allowance.toString()) >= parseEther(rewardAmount)
                ? "✅ Ready to add reward (one transaction)"
                : BigInt(allowance.toString()) === 0n
                ? "⚠️ No authorization - Will require approval + reward addition (two transactions)"
                : "⚠️ Will require approval + reward addition (two transactions)"
              }
            </div>
          )}
        </div>
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
        {isLoading || isPending ? 'Processing...' : 'Add ETH Staking Liquidity'}
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

export default ETHStakingLiquidityManager; 