import React, { useState, useEffect } from 'react';
import { useInteractionStaking, InteractionType } from '../hooks/useInteractionStaking';
import { useAccount } from 'wagmi';

interface NFTInteractionProps {
  tokenId: number;
  onInteraction?: (type: InteractionType, success: boolean) => void;
}

export const NFTInteraction: React.FC<NFTInteractionProps> = ({ 
  tokenId, 
  onInteraction 
}) => {
  const { address } = useAccount();
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

  const stakeAmounts = getStakeAmounts();

  // 加载互动状态
  useEffect(() => {
    const loadInteractionStates = async () => {
      if (!address) return;

      try {
        const states = await Promise.all([
          hasInteracted(tokenId, InteractionType.Like),
          hasInteracted(tokenId, InteractionType.Comment),
          hasInteracted(tokenId, InteractionType.Favorite),
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
  }, [tokenId, address, hasInteracted]);

  // 加载质押信息
  useEffect(() => {
    const loadStakingInfo = async () => {
      if (!address) return;

      try {
        const info = await Promise.all([
          getStakingInfo(tokenId, InteractionType.Like),
          getStakingInfo(tokenId, InteractionType.Comment),
          getStakingInfo(tokenId, InteractionType.Favorite),
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
  }, [tokenId, address, getStakingInfo]);

  // 处理质押互动
  const handleStakeInteraction = async (interactionType: InteractionType) => {
    if (!address) {
      alert('请先连接钱包');
      return;
    }

    try {
      const stakeAmount = stakeAmounts[interactionType];
      
      const result = await stakeInteraction({
        tokenId,
        interactionType,
        stakeAmount,
      });

      if (result.success) {
        setInteractionStates(prev => ({
          ...prev,
          [interactionType]: true,
        }));
        
        onInteraction?.(interactionType, true);
        alert(`${getInteractionTypeName(interactionType)}质押成功！`);
      }
    } catch (err) {
      console.error('质押互动失败:', err);
      alert(`质押失败: ${err instanceof Error ? err.message : '未知错误'}`);
      onInteraction?.(interactionType, false);
    }
  };

  // 处理领取奖励
  const handleClaimReward = async (interactionType: InteractionType) => {
    if (!address) {
      alert('请先连接钱包');
      return;
    }

    try {
      const result = await claimReward(tokenId, interactionType);
      
      if (result.success) {
        alert(`奖励领取成功！获得 ${result.rewardAmount.toFixed(2)} BOND`);
        
        // 重新加载质押信息
        const newInfo = await getStakingInfo(tokenId, interactionType);
        setStakingInfo(prev => ({
          ...prev,
          [interactionType]: newInfo,
        }));
      }
    } catch (err) {
      console.error('领取奖励失败:', err);
      alert(`领取失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 处理撤回质押
  const handleWithdrawStake = async (interactionType: InteractionType) => {
    if (!address) {
      alert('请先连接钱包');
      return;
    }

    try {
      const result = await withdrawStake(tokenId, interactionType);
      
      if (result.success) {
        setInteractionStates(prev => ({
          ...prev,
          [interactionType]: false,
        }));
        
        alert(`${getInteractionTypeName(interactionType)}质押已撤回`);
        
        // 重新加载质押信息
        const newInfo = await getStakingInfo(tokenId, interactionType);
        setStakingInfo(prev => ({
          ...prev,
          [interactionType]: newInfo,
        }));
      }
    } catch (err) {
      console.error('撤回质押失败:', err);
      alert(`撤回失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const renderInteractionButton = (interactionType: InteractionType) => {
    const isInteracted = interactionStates[interactionType];
    const info = stakingInfo[interactionType];
    const stakeAmount = stakeAmounts[interactionType];
    const typeName = getInteractionTypeName(interactionType);

    return (
      <div key={interactionType} className="flex flex-col space-y-2 p-4 bg-[#151728] rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{typeName}</span>
          <span className="text-gray-400 text-sm">质押 {stakeAmount} BOND</span>
        </div>
        
        {isInteracted ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-400">
              <div>已质押: {info.stakedAmount.toFixed(2)} BOND</div>
              <div>待领取: {info.pendingReward.toFixed(2)} BOND</div>
            </div>
            
            <div className="flex space-x-2">
              {info.pendingReward > 0 && (
                <button
                  onClick={() => handleClaimReward(interactionType)}
                  disabled={isClaiming}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isClaiming ? '领取中...' : '领取奖励'}
                </button>
              )}
              
              <button
                onClick={() => handleWithdrawStake(interactionType)}
                disabled={isStaking}
                className="flex-1 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50"
              >
                {isStaking ? '撤回中...' : '撤回质押'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleStakeInteraction(interactionType)}
            disabled={isStaking}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isStaking ? '质押中...' : `质押${typeName}`}
          </button>
        )}
      </div>
    );
  };

  if (!address) {
    return (
      <div className="p-6 bg-[#151728] rounded-xl border border-gray-700">
        <p className="text-gray-400 text-center">请先连接钱包以进行互动质押</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">NFT 互动质押</h3>
        <span className="text-gray-400 text-sm">Token ID: {tokenId}</span>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(InteractionType).map(renderInteractionButton)}
      </div>
      
      <div className="p-4 bg-[#151728] rounded-xl border border-gray-700">
        <h4 className="text-white font-medium mb-2">质押说明</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• 点赞需要质押 1 BOND</li>
          <li>• 评论需要质押 2 BOND</li>
          <li>• 收藏需要质押 3 BOND</li>
          <li>• 质押的代币将奖励给内容创作者</li>
          <li>• 可以在创作者领取前撤回质押</li>
        </ul>
      </div>
    </div>
  );
}; 