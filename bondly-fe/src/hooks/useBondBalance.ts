import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useBlockNumber } from 'wagmi';
import { getContractAddress, getContractABI } from '../config/contracts';

interface BondBalance {
  balance: string;
  formatted: string;
  symbol: string;
  decimals: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBondBalance = (): BondBalance => {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true }); // 监听新区块
  const [bondBalance, setBondBalance] = useState<BondBalance>({
    balance: '0',
    formatted: '0',
    symbol: 'BOND',
    decimals: 18,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  });

  // 读取合约余额
  const { 
    data: balanceData, 
    isLoading, 
    error,
    refetch: refetchBalance
  } = useReadContract({
    address: getContractAddress('BOND_TOKEN') as `0x${string}`,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // 每10秒自动刷新一次
    },
  });

  // 读取代币信息
  const { data: symbolData } = useReadContract({
    address: getContractAddress('BOND_TOKEN') as `0x${string}`,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'symbol',
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: decimalsData } = useReadContract({
    address: getContractAddress('BOND_TOKEN') as `0x${string}`,
    abi: getContractABI('BOND_TOKEN'),
    functionName: 'decimals',
    query: {
      enabled: isConnected && !!address,
    },
  });

  // 创建refetch函数
  const handleRefetch = useCallback(async () => {
    try {
      await refetchBalance();
    } catch (error) {
      console.error('Error refetching balance:', error);
    }
  }, [refetchBalance]);

  // 监听新区块，触发余额刷新
  useEffect(() => {
    if (blockNumber && isConnected && address) {
      // 当新区块产生时，延迟1秒后刷新余额（等待交易确认）
      const timer = setTimeout(() => {
        handleRefetch();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [blockNumber, isConnected, address, handleRefetch]);

  // 定时刷新余额（每30秒）
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      handleRefetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, address, handleRefetch]);

  useEffect(() => {
    if (!isConnected || !address) {
      setBondBalance({
        balance: '0',
        formatted: '0',
        symbol: 'BOND',
        decimals: 18,
        isLoading: false,
        error: null,
        refetch: handleRefetch
      });
      return;
    }

    if (error) {
      setBondBalance(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch balance',
        refetch: handleRefetch
      }));
      return;
    }

    if (balanceData !== undefined) {
      const balance = balanceData.toString();
      const decimals = typeof decimalsData === 'number' ? decimalsData : 18;
      const symbol = typeof symbolData === 'string' ? symbolData : 'BOND';
      
      // 格式化余额显示
      const formatted = formatBalance(balance, decimals);
      
      setBondBalance({
        balance,
        formatted,
        symbol,
        decimals,
        isLoading,
        error: null,
        refetch: handleRefetch
      });
    }
  }, [balanceData, symbolData, decimalsData, isConnected, address, isLoading, error, handleRefetch]);

  return bondBalance;
};

// 格式化余额显示
const formatBalance = (balance: string, decimals: number): string => {
  try {
    const balanceNumber = parseFloat(balance) / Math.pow(10, decimals);
    
    if (balanceNumber === 0) {
      return '0';
    }
    
    if (balanceNumber < 0.0001) {
      return '< 0.0001';
    }
    
    if (balanceNumber < 1) {
      return balanceNumber.toFixed(4);
    }
    
    if (balanceNumber < 1000) {
      return balanceNumber.toFixed(2);
    }
    
    if (balanceNumber < 1000000) {
      return (balanceNumber / 1000).toFixed(2) + 'K';
    }
    
    return (balanceNumber / 1000000).toFixed(2) + 'M';
  } catch (error) {
    return '0';
  }
}; 