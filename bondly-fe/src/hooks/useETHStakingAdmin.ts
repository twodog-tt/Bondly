import { useCallback, useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS } from '../config/contracts';
import { useAdmin } from '../contexts/AdminContext';

export interface PoolInfo {
  totalStaked: string;
  totalRewards: string;
  apy: number;
  isLoading: boolean;
  error: string | null;
}

export interface AddRewardsResult {
  success: boolean;
  message: string;
  transactionHash?: string;
}

export const useETHStakingAdmin = () => {
  const { address, isConnected } = useAccount();
  const { isAdmin } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // 获取池子信息
  const { data: totalStaked, isLoading: isStakedLoading, error: stakedError, refetch: refetchStaked } = useReadContract({
    address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
    abi: CONTRACTS.ETH_STAKING.abi,
    functionName: 'totalStaked',
    query: {
      enabled: !!CONTRACTS.ETH_STAKING?.address,
      refetchInterval: 10000, // 10秒刷新一次
    },
  });

  const { data: totalRewards, isLoading: isRewardsLoading, error: rewardsError, refetch: refetchRewards } = useReadContract({
    address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
    abi: CONTRACTS.ETH_STAKING.abi,
    functionName: 'totalRewards',
    query: {
      enabled: !!CONTRACTS.ETH_STAKING?.address,
      refetchInterval: 10000,
    },
  });

  // 添加奖金的合约调用
  const { writeContractAsync, isPending: isAddingRewards } = useWriteContract();

  // 监听奖金添加事件
  useWatchContractEvent({
    address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
    abi: CONTRACTS.ETH_STAKING.abi,
    eventName: 'RewardsAdded',
    onLogs: (logs) => {
      console.log('Rewards added event detected:', logs);
      // 刷新池子数据
      refetchStaked();
      refetchRewards();
      setMessage('Rewards added successfully!');
    },
  });

  // 监听池子更新事件
  useWatchContractEvent({
    address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
    abi: CONTRACTS.ETH_STAKING.abi,
    eventName: 'PoolUpdated',
    onLogs: (logs) => {
      console.log('Pool updated event detected:', logs);
      refetchStaked();
      refetchRewards();
    },
  });

  // 添加奖金到池子
  const addRewardsToPool = useCallback(async (amount: number, duration: number = 30): Promise<AddRewardsResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        message: 'Please connect your wallet first'
      };
    }

    if (!isAdmin) {
      return {
        success: false,
        message: 'You do not have admin permissions to add rewards'
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        message: 'Reward amount must be greater than 0'
      };
    }

    if (duration <= 0) {
      return {
        success: false,
        message: 'Duration must be greater than 0 days'
      };
    }

    setIsLoading(true);
    setMessage('Adding rewards to pool...');

    try {
      const parsedAmount = parseEther(amount.toString());
      const durationInSeconds = duration * 24 * 60 * 60; // 转换为秒
      
      const result = await (writeContractAsync as any)({
        address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
        abi: CONTRACTS.ETH_STAKING.abi,
        functionName: 'addReward',
        args: [parsedAmount, BigInt(durationInSeconds)],
      });

      return {
        success: true,
        message: `Successfully added ${amount} BOND rewards to pool for ${duration} days`,
        transactionHash: result,
      };
    } catch (error) {
      console.error('Failed to add rewards:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        message: `Failed to add rewards: ${errorMessage}`,
      };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, isAdmin, writeContractAsync]);

  // 计算APY (简化计算，实际应该基于更复杂的算法)
  const calculateAPY = useCallback((staked: bigint, rewards: bigint): number => {
    if (!staked || staked === 0n) return 0;
    
    try {
      const stakedEth = parseFloat(formatEther(staked));
      const rewardsBond = parseFloat(formatEther(rewards));
      
      // 简化的APY计算 (年化收益率)
      // 这里假设1 ETH = 100 BOND的兑换率，实际应该从价格预言机获取
      const ethValue = stakedEth * 100; // 假设1 ETH = 100 BOND
      const apy = (rewardsBond / ethValue) * 100;
      
      return Math.max(0, Math.min(apy, 100)); // 限制在0-100%之间
    } catch {
      return 0;
    }
  }, []);

  // 获取池子信息
  const getPoolInfo = useCallback((): PoolInfo => {
    const stakedBigInt = totalStaked && typeof totalStaked === 'bigint' ? totalStaked : 0n;
    const rewardsBigInt = totalRewards && typeof totalRewards === 'bigint' ? totalRewards : 0n;
    const apy = calculateAPY(stakedBigInt, rewardsBigInt);
    
    return {
      totalStaked: stakedBigInt ? formatEther(stakedBigInt) : '0',
      totalRewards: rewardsBigInt ? formatEther(rewardsBigInt) : '0',
      apy,
      isLoading: isStakedLoading || isRewardsLoading,
      error: stakedError?.message || rewardsError?.message || null,
    };
  }, [totalStaked, totalRewards, isStakedLoading, isRewardsLoading, stakedError, rewardsError, calculateAPY]);

  // 刷新池子数据
  const refreshPoolData = useCallback(() => {
    refetchStaked();
    refetchRewards();
  }, [refetchStaked, refetchRewards]);

  return {
    // 池子信息
    poolInfo: getPoolInfo(),
    
    // 管理员操作
    addRewardsToPool,
    
    // 状态管理
    isLoading: isLoading || isAddingRewards,
    message,
    setMessage,
    
    // 工具函数
    refreshPoolData,
    
    // 权限检查
    isAdmin,
  };
}; 