import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useInteractionStaking, InteractionType } from '../hooks/useInteractionStaking';
import { useBondBalance } from '../hooks/useBondBalance';

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
  const { balance: bondBalance } = useBondBalance();
  const {
    stakeInteraction,
    claimReward,
    withdrawStake,
    getStakingInfo,
    hasInteracted,
    getStakeAmounts,
    getInteractionTypeName,
    isStaking,
    isClaiming,
    error,
    InteractionType
  } = useInteractionStaking();

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

  // 加载互动状态
  useEffect(() => {
    const loadInteractionStates = async () => {
      if (!address || !isConnected) return;

      try {
        const states = await Promise.all([
          hasInteracted(contentId, InteractionType.Like),
          hasInteracted(contentId, InteractionType.Comment),
          hasInteracted(contentId, InteractionType.Favorite),
        ]);

        setInteractionStates({
          [InteractionType.Like]: states[0],
          [InteractionType.Comment]: states[1],
          [InteractionType.Favorite]: states[2],
        });
      } catch (err) {
        console.error('加载互动状态失败:', err);
      }
    };

    loadInteractionStates();
  }, [contentId, address, isConnected, hasInteracted]);

  // 加载质押信息
  useEffect(() => {
    const loadStakingInfo = async () => {
      if (!address || !isConnected) return;

      try {
        const info = await Promise.all([
          getStakingInfo(contentId, InteractionType.Like),
          getStakingInfo(contentId, InteractionType.Comment),
          getStakingInfo(contentId, InteractionType.Favorite),
        ]);

        setStakingInfo({
          [InteractionType.Like]: info[0],
          [InteractionType.Comment]: info[1],
          [InteractionType.Favorite]: info[2],
        });
      } catch (err) {
        console.error('加载质押信息失败:', err);
      }
    };

    loadStakingInfo();
  }, [contentId, address, isConnected, getStakingInfo]);

  // 处理质押互动
  const handleStakeInteraction = async (interactionType: InteractionType) => {
    if (!isConnected || !address) {
      setMessage('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const stakeAmount = stakeAmounts[interactionType];
      
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
      }
    } catch (err) {
      console.error('质押互动失败:', err);
      setMessage(`Staking failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      onInteraction?.(interactionType, false);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理领取奖励
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
        
        // 重新加载质押信息
        const newInfo = await getStakingInfo(contentId, interactionType);
        setStakingInfo(prev => ({
          ...prev,
          [interactionType]: newInfo,
        }));
      }
    } catch (err) {
      console.error('领取奖励失败:', err);
      setMessage(`Claim failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理撤回质押
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
        
        // 重新加载质押信息
        const newInfo = await getStakingInfo(contentId, interactionType);
        setStakingInfo(prev => ({
          ...prev,
          [interactionType]: newInfo,
        }));
      }
    } catch (err) {
      console.error('撤回质押失败:', err);
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
          BOND Balance: {bondBalance ? `${Number(bondBalance).toFixed(2)}` : "Loading..."}
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