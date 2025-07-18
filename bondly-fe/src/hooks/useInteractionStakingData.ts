import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useMemo, useCallback } from 'react';
import { CONTRACTS } from '../config/contracts';
import { InteractionType } from './useInteractionStaking';

export interface StakingData {
  stakedAmount: number;
  hasInteracted: boolean;
  totalStaked: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useInteractionStakingData = (
  tokenId: number,
  interactionType: InteractionType
): StakingData => {
  const { address, isConnected } = useAccount();
  
  const interactionStakingAddress = CONTRACTS.INTERACTION_STAKING?.address as `0x${string}`;

  // Check if we should enable the queries
  const shouldEnableUserQueries = !!address && isConnected && !!tokenId && !!interactionStakingAddress;
  const shouldEnableTotalQuery = !!tokenId && !!interactionStakingAddress;

  // Read user's staked amount
  const {
    data: stakedAmount,
    isLoading: isStakeLoading,
    error: stakeError,
    refetch: refetchStake
  } = useReadContract({
    address: interactionStakingAddress,
    abi: CONTRACTS.INTERACTION_STAKING.abi,
    functionName: 'getUserStake',
    args: [address!, BigInt(tokenId), interactionType],
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
      staleTime: 3000, // Consider data stale after 3 seconds
      enabled: shouldEnableUserQueries,
    }
  });

  // Read interaction status
  const {
    data: hasInteracted,
    isLoading: isInteractionLoading,
    error: interactionError,
    refetch: refetchInteraction
  } = useReadContract({
    address: interactionStakingAddress,
    abi: CONTRACTS.INTERACTION_STAKING.abi,
    functionName: 'hasInteracted',
    args: [address!, BigInt(tokenId), interactionType],
    query: {
      refetchInterval: 5000,
      staleTime: 3000,
      enabled: shouldEnableUserQueries,
    }
  });

  // Read total staked amount for this token and interaction type
  const {
    data: totalStaked,
    isLoading: isTotalLoading,
    error: totalError,
    refetch: refetchTotal
  } = useReadContract({
    address: interactionStakingAddress,
    abi: CONTRACTS.INTERACTION_STAKING.abi,
    functionName: 'getTotalStaked',
    args: [BigInt(tokenId), interactionType],
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000,
      enabled: shouldEnableTotalQuery,
    }
  });

  // Combine loading states
  const isLoading = isStakeLoading || isInteractionLoading || isTotalLoading;
  
  // Combine errors
  const error = stakeError?.message || interactionError?.message || totalError?.message || null;

  // Format data with proper type checking
  const formattedStakedAmount = stakedAmount && typeof stakedAmount === 'bigint' 
    ? Number(formatEther(stakedAmount)) 
    : 0;
    
  const formattedTotalStaked = totalStaked && typeof totalStaked === 'bigint' 
    ? Number(formatEther(totalStaked)) 
    : 0;
    
  const interactionStatus = hasInteracted === true;

  // Combined refetch function with debouncing
  const refetch = useCallback(() => {
    if (shouldEnableUserQueries) {
      refetchStake();
      refetchInteraction();
    }
    if (shouldEnableTotalQuery) {
      refetchTotal();
    }
  }, [shouldEnableUserQueries, shouldEnableTotalQuery, refetchStake, refetchInteraction, refetchTotal]);

  // Memoize the return object to prevent unnecessary re-renders
  const result = useMemo(() => ({
    stakedAmount: formattedStakedAmount,
    hasInteracted: interactionStatus,
    totalStaked: formattedTotalStaked,
    isLoading,
    error,
    refetch
  }), [
    formattedStakedAmount,
    interactionStatus,
    formattedTotalStaked,
    isLoading,
    error,
    refetch
  ]);

  return result;
}; 