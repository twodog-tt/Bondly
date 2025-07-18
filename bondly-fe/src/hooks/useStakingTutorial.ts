import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakingPreferences } from '../contexts/StakingPreferencesContext';

export const useStakingTutorial = () => {
  const { address, isConnected } = useAccount();
  const { preferences } = useStakingPreferences();
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCheckedTutorial, setHasCheckedTutorial] = useState(false);

  // 检查是否需要显示引导
  useEffect(() => {
    if (hasCheckedTutorial) return;

    // 只有在用户连接钱包且未完成引导时才显示
    if (isConnected && address && !preferences.hasCompletedTutorial) {
      // 延迟显示，确保页面加载完成
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);

      return () => clearTimeout(timer);
    }

    setHasCheckedTutorial(true);
  }, [isConnected, address, preferences.hasCompletedTutorial, hasCheckedTutorial]);

  const handleTutorialComplete = (enableAutoStaking: boolean) => {
    console.log('Tutorial completed, auto-staking enabled:', enableAutoStaking);
    setShowTutorial(false);
    setHasCheckedTutorial(true);
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setHasCheckedTutorial(true);
  };

  const showTutorialManually = () => {
    setShowTutorial(true);
  };

  return {
    showTutorial,
    handleTutorialComplete,
    handleTutorialClose,
    showTutorialManually,
    hasCompletedTutorial: preferences.hasCompletedTutorial,
  };
}; 