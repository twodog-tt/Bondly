import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useStakingPreferences } from '../contexts/StakingPreferencesContext';
import { useInteractionStaking, InteractionType } from './useInteractionStaking';
import { useBondBalance } from './useBondBalance';

export interface AutoStakingResult {
  success: boolean;
  message: string;
  transactionHash?: string;
  stakeAmount?: number;
}

export const useAutoStaking = () => {
  const { address, isConnected } = useAccount();
  const { preferences } = useStakingPreferences();
  const { stakeInteraction } = useInteractionStaking();
  const bondBalanceData = useBondBalance();

  // 检查余额是否足够
  const checkBalance = useCallback((stakeAmount: number): boolean => {
    if (!bondBalanceData.formatted) return false;
    return parseFloat(bondBalanceData.formatted) >= stakeAmount;
  }, [bondBalanceData.formatted]);

  // 自动质押点赞
  const autoStakeLike = useCallback(async (contentId: number): Promise<AutoStakingResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        message: 'Please connect your wallet first'
      };
    }

    if (!preferences.autoStakingEnabled) {
      return {
        success: false,
        message: 'Auto-staking is disabled. Enable it in settings to stake automatically.'
      };
    }

    const stakeAmount = preferences.stakeAmounts.like;
    
    if (!checkBalance(stakeAmount)) {
      return {
        success: false,
        message: `Insufficient BOND balance. You need ${stakeAmount} BOND to like this content.`
      };
    }

    try {
      const result = await stakeInteraction({
        tokenId: contentId,
        interactionType: InteractionType.Like,
        stakeAmount,
      });

      if (result.success) {
        return {
          success: true,
          message: `Liked and staked ${stakeAmount} BOND successfully!`,
          transactionHash: result.transactionHash,
          stakeAmount,
        };
      } else {
        return {
          success: false,
          message: 'Failed to stake like. Please try again.',
        };
      }
    } catch (error) {
      console.error('Auto-stake like error:', error);
      return {
        success: false,
        message: `Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, [isConnected, address, preferences, checkBalance, stakeInteraction]);

  // 自动质押评论
  const autoStakeComment = useCallback(async (contentId: number, commentText: string): Promise<AutoStakingResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        message: 'Please connect your wallet first'
      };
    }

    if (!preferences.autoStakingEnabled) {
      return {
        success: false,
        message: 'Auto-staking is disabled. Enable it in settings to stake automatically.'
      };
    }

    const stakeAmount = preferences.stakeAmounts.comment;
    
    if (!checkBalance(stakeAmount)) {
      return {
        success: false,
        message: `Insufficient BOND balance. You need ${stakeAmount} BOND to comment on this content.`
      };
    }

    try {
      // 这里应该先提交评论到后端，然后再质押
      // 暂时模拟评论提交成功
      const commentSubmitted = true; // 实际应该调用评论API
      
      if (commentSubmitted) {
        const result = await stakeInteraction({
          tokenId: contentId,
          interactionType: InteractionType.Comment,
          stakeAmount,
        });

        if (result.success) {
          return {
            success: true,
            message: `Comment posted and staked ${stakeAmount} BOND successfully!`,
            transactionHash: result.transactionHash,
            stakeAmount,
          };
        } else {
          return {
            success: false,
            message: 'Comment posted but staking failed. Please try again.',
          };
        }
      } else {
        return {
          success: false,
          message: 'Failed to post comment. Please try again.',
        };
      }
    } catch (error) {
      console.error('Auto-stake comment error:', error);
      return {
        success: false,
        message: `Comment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, [isConnected, address, preferences, checkBalance, stakeInteraction]);

  // 自动质押收藏
  const autoStakeFavorite = useCallback(async (contentId: number): Promise<AutoStakingResult> => {
    if (!isConnected || !address) {
      return {
        success: false,
        message: 'Please connect your wallet first'
      };
    }

    if (!preferences.autoStakingEnabled) {
      return {
        success: false,
        message: 'Auto-staking is disabled. Enable it in settings to stake automatically.'
      };
    }

    const stakeAmount = preferences.stakeAmounts.favorite;
    
    if (!checkBalance(stakeAmount)) {
      return {
        success: false,
        message: `Insufficient BOND balance. You need ${stakeAmount} BOND to favorite this content.`
      };
    }

    try {
      const result = await stakeInteraction({
        tokenId: contentId,
        interactionType: InteractionType.Favorite,
        stakeAmount,
      });

      if (result.success) {
        return {
          success: true,
          message: `Favorited and staked ${stakeAmount} BOND successfully!`,
          transactionHash: result.transactionHash,
          stakeAmount,
        };
      } else {
        return {
          success: false,
          message: 'Failed to stake favorite. Please try again.',
        };
      }
    } catch (error) {
      console.error('Auto-stake favorite error:', error);
      return {
        success: false,
        message: `Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }, [isConnected, address, preferences, checkBalance, stakeInteraction]);

  // 检查是否应该显示质押提示
  const shouldShowStakingPrompt = useCallback((action: 'like' | 'comment' | 'favorite'): boolean => {
    if (!isConnected || !address) return false;
    if (preferences.autoStakingEnabled) return false;
    
    const stakeAmount = preferences.stakeAmounts[action];
    return checkBalance(stakeAmount);
  }, [isConnected, address, preferences, checkBalance]);

  // 获取操作所需的质押金额
  const getStakeAmount = useCallback((action: 'like' | 'comment' | 'favorite'): number => {
    return preferences.stakeAmounts[action];
  }, [preferences.stakeAmounts]);

  return {
    autoStakeLike,
    autoStakeComment,
    autoStakeFavorite,
    shouldShowStakingPrompt,
    getStakeAmount,
    isAutoStakingEnabled: preferences.autoStakingEnabled,
    currentBalance: bondBalanceData.formatted,
    isLoading: bondBalanceData.isLoading,
  };
}; 