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

  // 检查BOND代币授权额度 - 智能授权检查
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: bondTokenAddress,
    abi: CONTRACTS.BOND_TOKEN.abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, interactionStakingAddress],
    query: {
      enabled: !!address && !!bondTokenAddress && !!interactionStakingAddress,
    }
  });

  // 智能质押交互 - 避免重复授权
  const stakeInteraction = useCallback(async (data: InteractionStakingData) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    if (!interactionStakingAddress || !bondTokenAddress) {
      throw new Error('Contract address not configured');
    }

    setIsStaking(true);
    setError(null);

    try {
      console.log('Starting smart interaction staking...', data);

      const requiredAmount = parseEther(data.stakeAmount.toString());
      const currentAllowance = (allowance as bigint) || BigInt(0);

      console.log('Current allowance:', formatEther(currentAllowance));
      console.log('Required amount:', formatEther(requiredAmount));

      // 智能授权检查 - 只在必要时授权
      if (currentAllowance < requiredAmount) {
        console.log('Insufficient allowance, approving BOND tokens...');
        
        const approveHash = await (writeContract as any)({
          address: bondTokenAddress,
          abi: CONTRACTS.BOND_TOKEN.abi,
          functionName: 'approve',
          args: [
            interactionStakingAddress,
            requiredAmount
          ],
        });

        console.log('BOND token approval successful:', approveHash);

        // 等待授权确认 - 减少等待时间
        console.log('Waiting for approval confirmation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 重新获取授权额度
        await refetchAllowance();
      } else {
        console.log('Sufficient allowance already exists, skipping approval');
      }

      // 直接进行质押交易
      console.log('Proceeding with staking transaction...');
      const stakeHash = await (writeContract as any)({
        address: interactionStakingAddress,
        abi: CONTRACTS.INTERACTION_STAKING.abi,
        functionName: 'stakeInteraction',
        args: [
          BigInt(data.tokenId),
          data.interactionType
        ],
      });

      console.log('Interaction staking successful:', stakeHash);
      
      return {
        success: true,
        transactionHash: stakeHash,
        stakeAmount: data.stakeAmount,
        needsApproval: currentAllowance < requiredAmount
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Staking failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStaking(false);
    }
  }, [address, isConnected, interactionStakingAddress, bondTokenAddress, writeContract, allowance, refetchAllowance]);

  // Claim reward
  const claimReward = useCallback(async (tokenId: number, interactionType: InteractionType) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    if (!interactionStakingAddress) {
      throw new Error('Contract address not configured');
    }

    setIsClaiming(true);
    setError(null);

    try {
      console.log('Starting reward claim...', { tokenId, interactionType });

      const claimHash = await (writeContract as any)({
        address: interactionStakingAddress,
        abi: CONTRACTS.INTERACTION_STAKING.abi,
        functionName: 'claimReward',
        args: [
          BigInt(tokenId),
          interactionType
        ],
      });

      console.log('Reward claim successful:', claimHash);
      
      return {
        success: true,
        transactionHash: claimHash,
        rewardAmount: 0 // Actual amount needs to be retrieved from contract events
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Claim failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsClaiming(false);
    }
  }, [address, isConnected, interactionStakingAddress, writeContract]);

  // Withdraw stake
  const withdrawStake = useCallback(async (tokenId: number, interactionType: InteractionType) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    if (!interactionStakingAddress) {
      throw new Error('Contract address not configured');
    }

    setIsStaking(true);
    setError(null);

    try {
      console.log('Starting stake withdrawal...', { tokenId, interactionType });

      const withdrawHash = await (writeContract as any)({
        address: interactionStakingAddress,
        abi: CONTRACTS.INTERACTION_STAKING.abi,
        functionName: 'withdrawInteraction',
        args: [
          BigInt(tokenId),
          interactionType
        ],
      });

      console.log('Stake withdrawal successful:', withdrawHash);
      
      return {
        success: true,
        transactionHash: withdrawHash
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsStaking(false);
    }
  }, [address, isConnected, interactionStakingAddress, writeContract]);

  // Get stake amount configuration
  const getStakeAmounts = useCallback(() => {
    return {
      [InteractionType.Like]: 1,      // 1 BOND
      [InteractionType.Comment]: 2,   // 2 BOND
      [InteractionType.Favorite]: 3   // 3 BOND
    };
  }, []);

  // Get interaction type name
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
    // State
    isStaking: isStaking || writePending,
    isClaiming,
    error: error || writeError?.message || null,
    
    // Methods
    stakeInteraction,
    claimReward,
    withdrawStake,
    getStakeAmounts,
    getInteractionTypeName,
    
    // Enum
    InteractionType,
    
    // Contract info
    contractAddress: interactionStakingAddress || 'Not deployed',
    
    // Allowance info for debugging
    allowance: allowance ? formatEther(allowance as bigint) : '0',
    refetchAllowance,
  };
}; 