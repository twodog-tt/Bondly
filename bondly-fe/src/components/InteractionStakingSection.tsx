import React, { useState, useEffect } from 'react';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { useInteractionStaking, InteractionType } from '../hooks/useInteractionStaking';
import { useInteractionStakingData } from '../hooks/useInteractionStakingData';
import { useBondBalance } from '../hooks/useBondBalance';
import { CONTRACTS } from '../config/contracts';

interface InteractionStakingSectionProps {
  contentId: number;
  isMobile: boolean;
  onInteraction?: (type: InteractionType, success: boolean) => void;
}

const InteractionStakingSection: React.FC<InteractionStakingSectionProps> = ({
  contentId,
  isMobile,
  onInteraction
}) => {
  const { address, isConnected } = useAccount();
  const bondBalanceData = useBondBalance();
  
  // Use operation hooks first to get InteractionType
  const {
    stakeInteraction,
    claimReward,
    withdrawStake,
    getStakeAmounts,
    getInteractionTypeName,
    isStaking,
    isClaiming,
    error,
    InteractionType
  } = useInteractionStaking();
  
  // Use new data reading hooks
  const likeData = useInteractionStakingData(contentId, InteractionType.Like);
  const commentData = useInteractionStakingData(contentId, InteractionType.Comment);
  const favoriteData = useInteractionStakingData(contentId, InteractionType.Favorite);

  const [interactionStates, setInteractionStates] = useState<{
    [key in InteractionType]: boolean;
  }>({
    [InteractionType.Like]: false,
    [InteractionType.Comment]: false,
    [InteractionType.Favorite]: false,
  });

  const [stakingInfo, setStakingInfo] = useState<{
    [key in InteractionType]: {
      stakedAmount: number;
      pendingReward: number;
    };
  }>({
    [InteractionType.Like]: { stakedAmount: 0, pendingReward: 0 },
    [InteractionType.Comment]: { stakedAmount: 0, pendingReward: 0 },
    [InteractionType.Favorite]: { stakedAmount: 0, pendingReward: 0 },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const stakeAmounts = getStakeAmounts();

  // Watch contract events for real-time updates
  const interactionStakingAddress = CONTRACTS.INTERACTION_STAKING?.address as `0x${string}`;

  // Watch interaction staked events
  useWatchContractEvent({
    address: interactionStakingAddress,
    abi: CONTRACTS.INTERACTION_STAKING.abi,
    eventName: 'InteractionStaked',
    onLogs: (logs) => {
      logs.forEach((log) => {
        // Parse event data manually since args might not be available
        console.log('Interaction staked event detected:', log);
        // Refetch all data when any interaction is staked
        likeData.refetch();
        commentData.refetch();
        favoriteData.refetch();
      });
    },
  });

  // Watch reward claimed events
  useWatchContractEvent({
    address: interactionStakingAddress,
    abi: CONTRACTS.INTERACTION_STAKING.abi,
    eventName: 'RewardClaimed',
    onLogs: (logs) => {
      logs.forEach((log) => {
        console.log('Reward claimed event detected:', log);
        // Refetch all data when reward is claimed
        likeData.refetch();
        commentData.refetch();
        favoriteData.refetch();
      });
    },
  });

  // Watch interaction withdrawn events
  useWatchContractEvent({
    address: interactionStakingAddress,
    abi: CONTRACTS.INTERACTION_STAKING.abi,
    eventName: 'InteractionWithdrawn',
    onLogs: (logs) => {
      logs.forEach((log) => {
        console.log('Interaction withdrawn event detected:', log);
        // Refetch all data when interaction is withdrawn
        likeData.refetch();
        commentData.refetch();
        favoriteData.refetch();
      });
    },
  });

  // Load interaction states from new data hooks
  useEffect(() => {
    if (!address || !isConnected) return;

    setInteractionStates({
      [InteractionType.Like]: likeData.hasInteracted,
      [InteractionType.Comment]: commentData.hasInteracted,
      [InteractionType.Favorite]: favoriteData.hasInteracted,
    });
  }, [contentId, address, isConnected, likeData.hasInteracted, commentData.hasInteracted, favoriteData.hasInteracted]);

  // Load staking info from new data hooks
  useEffect(() => {
    if (!address || !isConnected) return;

    setStakingInfo({
      [InteractionType.Like]: { 
        stakedAmount: likeData.stakedAmount, 
        pendingReward: 0 // TODO: Add reward calculation
      },
      [InteractionType.Comment]: { 
        stakedAmount: commentData.stakedAmount, 
        pendingReward: 0 
      },
      [InteractionType.Favorite]: { 
        stakedAmount: favoriteData.stakedAmount, 
        pendingReward: 0 
      },
    });
  }, [contentId, address, isConnected, likeData.stakedAmount, commentData.stakedAmount, favoriteData.stakedAmount]);

  // Handle stake interaction with enhanced error handling
  const handleStakeInteraction = async (interactionType: InteractionType) => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet first');
      return;
    }

    // Check if user has already interacted
    if (interactionStates[interactionType]) {
      setMessage(`You have already ${getInteractionTypeName(interactionType).toLowerCase()}d this content`);
      return;
    }

    // Check BOND balance
    const stakeAmount = stakeAmounts[interactionType];
    const currentBalance = parseFloat(bondBalanceData.formatted);
    if (currentBalance < stakeAmount) {
      setMessage(`Insufficient BOND balance. You need ${stakeAmount.toFixed(2)} BOND`);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await stakeInteraction({
        tokenId: contentId,
        interactionType,
        stakeAmount,
      });

      if (result.success) {
        setInteractionStates(prev => ({
          ...prev,
          [interactionType]: true,
        }));
        
        onInteraction?.(interactionType, true);
        setMessage(`${getInteractionTypeName(interactionType)} staking successful!`);
        
        // Refetch data after successful staking
        if (interactionType === InteractionType.Like) {
          likeData.refetch();
        } else if (interactionType === InteractionType.Comment) {
          commentData.refetch();
        } else if (interactionType === InteractionType.Favorite) {
          favoriteData.refetch();
        }
      }
    } catch (err) {
      console.error('Interaction staking failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Enhanced error messages
      if (errorMessage.includes('User rejected')) {
        setMessage('Transaction cancelled by user');
      } else if (errorMessage.includes('insufficient funds')) {
        setMessage('Insufficient BOND balance for staking');
      } else if (errorMessage.includes('already staked')) {
        setMessage(`You have already ${getInteractionTypeName(interactionType).toLowerCase()}d this content`);
      } else {
        setMessage(`Staking failed: ${errorMessage}`);
      }
      
      onInteraction?.(interactionType, false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle claim reward
  const handleClaimReward = async (interactionType: InteractionType) => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await claimReward(contentId, interactionType);
      
      if (result.success) {
        setMessage(`Reward claimed successfully! Received ${result.rewardAmount.toFixed(2)} BOND`);
        
        // Reload staking info by refetching data
        if (interactionType === InteractionType.Like) {
          likeData.refetch();
        } else if (interactionType === InteractionType.Comment) {
          commentData.refetch();
        } else if (interactionType === InteractionType.Favorite) {
          favoriteData.refetch();
        }
      }
    } catch (err) {
      console.error('Reward claim failed:', err);
      setMessage(`Claim failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw stake
  const handleWithdrawStake = async (interactionType: InteractionType) => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await withdrawStake(contentId, interactionType);
      
      if (result.success) {
        setInteractionStates(prev => ({
          ...prev,
          [interactionType]: false,
        }));
        
        setMessage(`${getInteractionTypeName(interactionType)} stake withdrawn`);
        
        // Reload staking info by refetching data
        if (interactionType === InteractionType.Like) {
          likeData.refetch();
        } else if (interactionType === InteractionType.Comment) {
          commentData.refetch();
        } else if (interactionType === InteractionType.Favorite) {
          favoriteData.refetch();
        }
      }
    } catch (err) {
      console.error('Stake withdrawal failed:', err);
      setMessage(`Withdraw failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInteractionButton = (interactionType: InteractionType) => {
    const isInteracted = interactionStates[interactionType];
    const info = stakingInfo[interactionType];
    const stakeAmount = stakeAmounts[interactionType];
    const typeName = getInteractionTypeName(interactionType);

    return (
      <div key={interactionType} style={{
        background: "#151728",
        border: "1px solid #374151",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}>
          <span style={{ color: "white", fontWeight: "600" }}>{typeName}</span>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>
            Stake {stakeAmount} BOND
          </span>
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}>
          {!isInteracted ? (
            <button
              onClick={() => handleStakeInteraction(interactionType)}
              disabled={isLoading}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? "Processing..." : `Stake ${typeName}`}
            </button>
          ) : (
            <>
              <button
                onClick={() => handleWithdrawStake(interactionType)}
                disabled={isLoading}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ef4444",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {isLoading ? "Processing..." : "Withdraw Stake"}
              </button>
              
              {info.pendingReward > 0 && (
                <button
                  onClick={() => handleClaimReward(interactionType)}
                  disabled={isLoading}
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#10b981",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.5 : 1
                  }}
                >
                  {isLoading ? "Processing..." : `Claim ${info.pendingReward.toFixed(2)} BOND`}
                </button>
              )}
            </>
          )}
        </div>

        {isInteracted && (
          <div style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#9ca3af"
          }}>
            Staked: {info.stakedAmount.toFixed(2)} BOND
            {info.pendingReward > 0 && (
              <span style={{ marginLeft: "12px", color: "#10b981" }}>
                Pending: {info.pendingReward.toFixed(2)} BOND
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div style={{
        background: "rgba(102, 126, 234, 0.1)",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "24px"
      }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          marginBottom: "12px",
          color: "#667eea"
        }}>
          💎 Interaction Staking
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
          Connect your wallet to stake BOND tokens for interactions and earn rewards
        </p>
        <div style={{ color: "#9ca3af", fontSize: "12px" }}>
          <div>• Like: Stake {stakeAmounts[InteractionType.Like]} BOND</div>
          <div>• Comment: Stake {stakeAmounts[InteractionType.Comment]} BOND</div>
          <div>• Favorite: Stake {stakeAmounts[InteractionType.Favorite]} BOND</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#151728",
      border: "1px solid #374151",
      borderRadius: "12px",
      padding: "20px",
      marginTop: "24px"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600",
          color: "white"
        }}>
          💎 Interaction Staking
        </h3>
        <div style={{ fontSize: "14px", color: "#9ca3af" }}>
          BOND Balance: {bondBalanceData.isLoading ? "Loading..." : bondBalanceData.error ? "Error" : `${bondBalanceData.formatted} ${bondBalanceData.symbol}`}
        </div>
      </div>

      {message && (
        <div style={{
          background: message.includes('成功') ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: message.includes('成功') ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
          color: message.includes('成功') ? "#10b981" : "#ef4444",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "14px"
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        {renderInteractionButton(InteractionType.Like)}
        {renderInteractionButton(InteractionType.Comment)}
        {renderInteractionButton(InteractionType.Favorite)}
      </div>

              <div style={{
          fontSize: "12px",
          color: "#9ca3af",
          lineHeight: "1.5"
        }}>
          <div>💡 Staking Guide:</div>
          <div>• Stake BOND tokens for interactions, rewards go to content creators</div>
          <div>• Creators can claim accumulated staking rewards</div>
          <div>• Users can withdraw stakes before rewards are claimed</div>
          <div>• Ensure sufficient BOND tokens in your wallet</div>
        </div>
    </div>
  );
};

export default InteractionStakingSection; 