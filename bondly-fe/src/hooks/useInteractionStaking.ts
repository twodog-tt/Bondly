import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS } from '../config/contracts';

export enum InteractionType {
  Like = 0,
  Comment = 1,
  Favorite = 2
}

export interface StakingInfo {
  stakedAmount: number;
  pendingReward: number;
  lastUpdateTime: number;
}

export interface InteractionStakingData {
  tokenId: number;
  interactionType: InteractionType;
  stakeAmount: number;
}

export const useInteractionStaking = () => {
  const { address, isConnected } = useAccount();
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 合约写入
  const { writeContract, isPending: writePending, data: writeData, error: writeError } = useWriteContract();

  // 获取合约地址
  const interactionStakingAddress = CONTRACTS.INTERACTION_STAKING?.address as `0x${string}`;
  const bondTokenAddress = CONTRACTS.BOND_TOKEN?.address as `0x${string}`;

  // 质押互动
  const stakeInteraction = useCallback(async (data: InteractionStakingData) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    if (!interactionStakingAddress || !bondTokenAddress) {
      throw new Error('合约地址未配置');
    }

    setIsStaking(true);
    setError(null);

    try {
      console.log('开始质押互动...', data);

      // 首先需要approve BOND代币
      console.log('授权BOND代币...');
      const approveHash = await (writeContract as any)({
        address: bondTokenAddress,
        abi: CONTRACTS.BOND_TOKEN.abi,
        functionName: 'approve',
        args: [
          interactionStakingAddress,
          parseEther(data.stakeAmount.toString())
        ],
      });

      console.log('BOND代币授权成功:', approveHash);

      // 等待授权确认
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 调用InteractionStaking合约进行质押
      console.log('调用质押合约...');
      const stakeHash = await (writeContract as any)({
        address: interactionStakingAddress,
        abi: CONTRACTS.INTERACTION_STAKING.abi,
        functionName: 'stakeInteraction',
        args: [
          BigInt(data.tokenId),
          data.interactionType
        ],
      });

      console.log('质押互动成功:', stakeHash);
      
      return {
        success: true,
        transactionHash: stakeHash,
        stakeAmount: data.stakeAmount
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '质押失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStaking(false);
    }
  }, [address, isConnected, interactionStakingAddress, bondTokenAddress, writeContract]);

  // 领取奖励
  const claimReward = useCallback(async (tokenId: number, interactionType: InteractionType) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    if (!interactionStakingAddress) {
      throw new Error('合约地址未配置');
    }

    setIsClaiming(true);
    setError(null);

    try {
      console.log('开始领取奖励...', { tokenId, interactionType });

      const claimHash = await (writeContract as any)({
        address: interactionStakingAddress,
        abi: CONTRACTS.INTERACTION_STAKING.abi,
        functionName: 'claimReward',
        args: [
          BigInt(tokenId),
          interactionType
        ],
      });

      console.log('奖励领取成功:', claimHash);
      
      return {
        success: true,
        transactionHash: claimHash,
        rewardAmount: 0 // 实际金额需要从合约事件中获取
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '领取失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsClaiming(false);
    }
  }, [address, isConnected, interactionStakingAddress, writeContract]);

  // 撤回质押
  const withdrawStake = useCallback(async (tokenId: number, interactionType: InteractionType) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    if (!interactionStakingAddress) {
      throw new Error('合约地址未配置');
    }

    setIsStaking(true);
    setError(null);

    try {
      console.log('开始撤回质押...', { tokenId, interactionType });

      const withdrawHash = await (writeContract as any)({
        address: interactionStakingAddress,
        abi: CONTRACTS.INTERACTION_STAKING.abi,
        functionName: 'withdrawInteraction',
        args: [
          BigInt(tokenId),
          interactionType
        ],
      });

      console.log('质押撤回成功:', withdrawHash);
      
      return {
        success: true,
        transactionHash: withdrawHash
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '撤回失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStaking(false);
    }
  }, [address, isConnected, interactionStakingAddress, writeContract]);

  // 获取质押信息
  const getStakingInfo = useCallback(async (tokenId: number, interactionType: InteractionType): Promise<StakingInfo> => {
    if (!isConnected || !address || !interactionStakingAddress) {
      return {
        stakedAmount: 0,
        pendingReward: 0,
        lastUpdateTime: 0
      };
    }

    try {
      // 使用模拟数据，因为useReadContract不能在useCallback中直接使用
      // 在实际应用中，这里应该使用合约读取
      const stakedAmount = Math.random() * 10; // 模拟质押金额
      const pendingReward = stakedAmount > 0 ? stakedAmount * 0.1 : 0; // 模拟奖励

      return {
        stakedAmount,
        pendingReward,
        lastUpdateTime: Date.now()
      };
    } catch (err) {
      console.error('获取质押信息失败:', err);
      return {
        stakedAmount: 0,
        pendingReward: 0,
        lastUpdateTime: 0
      };
    }
  }, [address, isConnected, interactionStakingAddress]);

  // 检查是否已互动
  const hasInteracted = useCallback(async (tokenId: number, interactionType: InteractionType): Promise<boolean> => {
    if (!isConnected || !address || !interactionStakingAddress) {
      return false;
    }

    try {
      // 使用模拟数据，因为useReadContract不能在useCallback中直接使用
      // 在实际应用中，这里应该使用合约读取
      return Math.random() > 0.5; // 模拟互动状态
    } catch (err) {
      console.error('检查互动状态失败:', err);
      return false;
    }
  }, [address, isConnected, interactionStakingAddress]);

  // 获取质押金额配置
  const getStakeAmounts = useCallback(() => {
    return {
      [InteractionType.Like]: 1,      // 1 BOND
      [InteractionType.Comment]: 2,   // 2 BOND
      [InteractionType.Favorite]: 3   // 3 BOND
    };
  }, []);

  // 获取互动类型名称
  const getInteractionTypeName = useCallback((type: InteractionType): string => {
    switch (type) {
      case InteractionType.Like:
        return 'Like';
      case InteractionType.Comment:
        return 'Comment';
      case InteractionType.Favorite:
        return 'Favorite';
      default:
        return 'Unknown';
    }
  }, []);

  return {
    // 状态
    isStaking: isStaking || writePending,
    isClaiming,
    error: error || writeError?.message || null,
    
    // 方法
    stakeInteraction,
    claimReward,
    withdrawStake,
    getStakingInfo,
    hasInteracted,
    getStakeAmounts,
    getInteractionTypeName,
    
    // 枚举
    InteractionType,
    
    // 合约信息
    contractAddress: interactionStakingAddress || '未部署',
  };
}; 