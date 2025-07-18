import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
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
  const { address } = useAccount();
  const [isStaking, setIsStaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 质押互动
  const stakeInteraction = useCallback(async (data: InteractionStakingData) => {
    if (!address) {
      throw new Error('请先连接钱包');
    }

    setIsStaking(true);
    setError(null);

    try {
      console.log('开始质押互动...', data);

      // TODO: 实现实际的合约调用
      // 这里需要调用InteractionStaking合约的stakeInteraction函数
      
      // 模拟质押过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('质押互动成功');
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        stakeAmount: data.stakeAmount
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '质押失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStaking(false);
    }
  }, [address]);

  // 领取奖励
  const claimReward = useCallback(async (tokenId: number, interactionType: InteractionType) => {
    if (!address) {
      throw new Error('请先连接钱包');
    }

    setIsClaiming(true);
    setError(null);

    try {
      console.log('开始领取奖励...', { tokenId, interactionType });

      // TODO: 实现实际的合约调用
      // 这里需要调用InteractionStaking合约的claimReward函数
      
      // 模拟领取过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('奖励领取成功');
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        rewardAmount: Math.random() * 10 // 模拟奖励金额
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '领取失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsClaiming(false);
    }
  }, [address]);

  // 撤回质押
  const withdrawStake = useCallback(async (tokenId: number, interactionType: InteractionType) => {
    if (!address) {
      throw new Error('请先连接钱包');
    }

    setIsStaking(true);
    setError(null);

    try {
      console.log('开始撤回质押...', { tokenId, interactionType });

      // TODO: 实现实际的合约调用
      // 这里需要调用InteractionStaking合约的withdrawStake函数
      
      // 模拟撤回过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('质押撤回成功');
      
      return {
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '撤回失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStaking(false);
    }
  }, [address]);

  // 获取质押信息
  const getStakingInfo = useCallback(async (tokenId: number, interactionType: InteractionType): Promise<StakingInfo> => {
    try {
      // TODO: 实现从合约获取质押信息的逻辑
      // 这里需要调用InteractionStaking合约的getStakingInfo函数
      
      // 返回模拟数据
      return {
        stakedAmount: Math.random() * 100,
        pendingReward: Math.random() * 10,
        lastUpdateTime: Date.now()
      };
    } catch (err) {
      console.error('获取质押信息失败:', err);
      throw err;
    }
  }, []);

  // 检查是否已互动
  const hasInteracted = useCallback(async (tokenId: number, interactionType: InteractionType): Promise<boolean> => {
    try {
      // TODO: 实现从合约检查互动状态的逻辑
      // 这里需要调用InteractionStaking合约的hasInteracted函数
      
      // 返回模拟数据
      return Math.random() > 0.5;
    } catch (err) {
      console.error('检查互动状态失败:', err);
      return false;
    }
  }, []);

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
        return '点赞';
      case InteractionType.Comment:
        return '评论';
      case InteractionType.Favorite:
        return '收藏';
      default:
        return '未知';
    }
  }, []);

  return {
    // 状态
    isStaking,
    isClaiming,
    error,
    
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
    contractAddress: CONTRACTS.INTERACTION_STAKING?.address || '未部署',
  };
}; 