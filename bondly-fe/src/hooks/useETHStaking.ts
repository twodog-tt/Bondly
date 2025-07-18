import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useBlockNumber } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress, getContractABI } from '../config/contracts';

interface ETHStakingData {
  stakedAmount: string;
  pendingReward: string;
  totalStaked: string;
  apy: string;
  rewardPoolBalance: string;
  rewardRate: string;
  rewardEndTime: string;
  isLoading: boolean;
  error: string | null;
}

interface ETHStakingActions {
  stake: (amount: string) => void;
  unstake: (amount: string) => void;
  claim: () => void;
  stakeAndClaim: (amount: string) => void;
  unstakeAndClaim: (amount: string) => void;
  refreshAllData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useETHStaking = (): ETHStakingData & ETHStakingActions => {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true }); // 监听新区块
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [pendingTransactionType, setPendingTransactionType] = useState<'stake' | 'unstake' | 'claim' | 'stakeAndClaim' | 'unstakeAndClaim' | null>(null);

  // 获取合约地址
  const ethStakingAddress = getContractAddress('ETH_STAKING') as `0x${string}`;
  const bondTokenAddress = getContractAddress('BOND_TOKEN') as `0x${string}`;

  // 读取用户质押信息
  const { 
    data: userInfo, 
    isLoading: userInfoLoading, 
    error: userInfoError,
    refetch: refetchUserInfo
  } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'getUserInfo',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // 每10秒自动刷新一次
    },
  });

  // 读取总质押金额
  const { 
    data: totalStakedData, 
    isLoading: totalStakedLoading,
    refetch: refetchTotalStaked
  } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'totalStaked',
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // 每10秒自动刷新一次
    },
  });

  // 读取奖励率
  const { 
    data: rewardRateData, 
    isLoading: rewardRateLoading,
    refetch: refetchRewardRate
  } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'rewardRate',
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // 每10秒自动刷新一次
    },
  });

  // 读取奖励结束时间
  const { 
    data: rewardEndTimeData, 
    isLoading: rewardEndTimeLoading,
    refetch: refetchRewardEndTime
  } = useReadContract({
    address: ethStakingAddress,
    abi: getContractABI('ETH_STAKING'),
    functionName: 'rewardEndTime',
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // 每10秒自动刷新一次
    },
  });

  // 读取质押合约BOND代币余额
  const { 
    data: rewardPoolBalanceData, 
    isLoading: rewardPoolBalanceLoading,
    refetch: refetchRewardPoolBalance
  } = useReadContract({
    address: bondTokenAddress,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'balanceOf',
    args: [ethStakingAddress],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // 每10秒自动刷新一次
    },
  });

  // 写入合约操作
  const { writeContract, isPending: writePending, data: writeData, error: writeError } = useWriteContract();

  // 手动刷新所有数据的函数
  const refreshAllData = useCallback(async () => {
    if (isConnected && address) {
      try {
        await Promise.all([
          refetchUserInfo(),
          refetchTotalStaked(),
          refetchRewardRate(),
          refetchRewardEndTime(),
          refetchRewardPoolBalance()
        ]);
        setLastRefresh(Date.now());
      } catch (err) {
        console.error('Error refreshing ETH staking data:', err);
      }
    }
  }, [isConnected, address, refetchUserInfo, refetchTotalStaked, refetchRewardRate, refetchRewardEndTime, refetchRewardPoolBalance]);

  // 计算APY
  const calculateAPY = (rewardRate: bigint, totalStaked: bigint): string => {
    if (rewardRate === 0n || totalStaked === 0n) {
      return '0';
    }
    
    try {
      const secondsPerYear = 365 * 24 * 60 * 60;
      const annualReward = rewardRate * BigInt(secondsPerYear);
      const apy = (Number(annualReward) / Number(totalStaked)) * 100;
      
      // 限制APY显示范围，避免显示过大的数值
      if (apy > 10000) {
        return '10000+';
      }
      
      return apy.toFixed(2);
    } catch (error) {
      return '0';
    }
  };

  // 格式化数据
  const formatETHStakingData = (): ETHStakingData => {
    if (!isConnected || !address) {
      return {
        stakedAmount: '0',
        pendingReward: '0',
        totalStaked: '0',
        apy: '0',
        rewardPoolBalance: '0',
        rewardRate: '0',
        rewardEndTime: '0',
        isLoading: false,
        error: null
      };
    }

    // 安全地格式化数据
    let stakedAmount = '0';
    let pendingReward = '0';
    
    try {
      if (userInfo && Array.isArray(userInfo) && userInfo.length >= 3) {
        // getUserInfo 返回 (stakedAmount, pendingReward, userLastUpdateTime)
        stakedAmount = formatEther(BigInt(userInfo[0]?.toString() || '0'));
        pendingReward = formatEther(BigInt(userInfo[1]?.toString() || '0'));
        console.log('ETH Staking User info:', {
          stakedAmount: userInfo[0]?.toString(),
          pendingReward: userInfo[1]?.toString(),
          lastUpdateTime: userInfo[2]?.toString()
        });
      }
    } catch (err) {
      console.error('Error formatting ETH staking user info:', err);
    }

    const totalStaked = totalStakedData ? formatEther(BigInt(totalStakedData.toString())) : '0';
    const rewardRate = rewardRateData ? formatEther(BigInt(rewardRateData.toString())) : '0';
    const rewardEndTime = rewardEndTimeData ? rewardEndTimeData.toString() : '0';
    
    // 计算APY
    const apy = calculateAPY(
      rewardRateData ? BigInt(rewardRateData.toString()) : 0n,
      totalStakedData ? BigInt(totalStakedData.toString()) : 0n
    );

    const rewardPoolBalance = rewardPoolBalanceData ? formatEther(BigInt(rewardPoolBalanceData.toString())) : '0';

    return {
      stakedAmount,
      pendingReward,
      totalStaked,
      apy,
      rewardPoolBalance,
      rewardRate,
      rewardEndTime,
      isLoading: userInfoLoading || totalStakedLoading || rewardRateLoading || rewardEndTimeLoading || rewardPoolBalanceLoading,
      error: userInfoError?.message || null
    };
  };

  // 质押操作
  const stake = (amount: string) => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    try {
      setError(null);
      setPendingTransactionType('stake');

      const amountWei = parseEther(amount);
      
      (writeContract as any)({
        address: ethStakingAddress,
        abi: getContractABI('ETH_STAKING'),
        functionName: 'stake',
        value: amountWei,
      });

    } catch (err: any) {
      setError(err.message || 'ETH质押失败');
      setPendingTransactionType(null);
      console.error('ETH Stake error:', err);
    }
  };

  // 解质押操作
  const unstake = (amount: string) => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    try {
      setError(null);
      setPendingTransactionType('unstake');

      const amountWei = parseEther(amount);
      
      (writeContract as any)({
        address: ethStakingAddress,
        abi: getContractABI('ETH_STAKING'),
        functionName: 'unstake',
        args: [amountWei],
      });

    } catch (err: any) {
      setError(err.message || 'ETH解质押失败');
      setPendingTransactionType(null);
      console.error('ETH Unstake error:', err);
    }
  };

  // 领取奖励操作
  const claim = () => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    try {
      setError(null);
      setPendingTransactionType('claim');
      
      (writeContract as any)({
        address: ethStakingAddress,
        abi: getContractABI('ETH_STAKING'),
        functionName: 'claim',
        args: [],
      });

    } catch (err: any) {
      setError(err.message || '领取奖励失败');
      setPendingTransactionType(null);
      console.error('ETH Claim error:', err);
    }
  };

  // 质押并领取奖励操作
  const stakeAndClaim = (amount: string) => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    try {
      setError(null);
      setPendingTransactionType('stakeAndClaim');

      const amountWei = parseEther(amount);
      
      (writeContract as any)({
        address: ethStakingAddress,
        abi: getContractABI('ETH_STAKING'),
        functionName: 'stakeAndClaim',
        value: amountWei,
      });

    } catch (err: any) {
      setError(err.message || '质押并领取失败');
      setPendingTransactionType(null);
      console.error('ETH Stake and Claim error:', err);
    }
  };

  // 解质押并领取奖励操作
  const unstakeAndClaim = (amount: string) => {
    if (!isConnected || !address) {
      setError('请先连接钱包');
      return;
    }

    try {
      setError(null);
      setPendingTransactionType('unstakeAndClaim');

      const amountWei = parseEther(amount);
      
      (writeContract as any)({
        address: ethStakingAddress,
        abi: getContractABI('ETH_STAKING'),
        functionName: 'unstakeAndClaim',
        args: [amountWei],
      });

    } catch (err: any) {
      setError(err.message || '解质押并领取失败');
      setPendingTransactionType(null);
      console.error('ETH Unstake and Claim error:', err);
    }
  };

  // 监听写入状态变化
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || '交易失败');
      setPendingTransactionType(null);
    }
  }, [writeError]);

  // 监听交易成功
  useEffect(() => {
    if (writeData && !writePending) {
      // 交易成功，刷新数据
      console.log('ETH Staking transaction successful, refreshing data...');
      refreshAllData();
      setPendingTransactionType(null);
    }
  }, [writeData, writePending, refreshAllData]);

  // 监听新区块，触发数据刷新
  useEffect(() => {
    if (blockNumber && isConnected && address) {
      // 当新区块产生时，延迟1秒后刷新数据（等待交易确认）
      const timer = setTimeout(() => {
        refreshAllData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [blockNumber, isConnected, address, refreshAllData]);

  // 定时刷新数据（每30秒）
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, address, refreshAllData]);

  const ethStakingData = formatETHStakingData();

  return {
    ...ethStakingData,
    stake,
    unstake,
    claim,
    stakeAndClaim,
    unstakeAndClaim,
    refreshAllData, // 导出手动刷新函数
    isLoading: isLoading || writePending,
    error: error || ethStakingData.error
  };
}; 