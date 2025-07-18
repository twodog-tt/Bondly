import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface StakingPreferences {
  // 用户引导状态
  hasCompletedTutorial: boolean;
  hasSeenStakingIntro: boolean;
  
  // 自动质押设置
  autoStakingEnabled: boolean;
  
  // 质押金额设置
  stakeAmounts: {
    like: number;
    comment: number;
    favorite: number;
  };
  
  // 确认方式设置
  confirmationMode: 'auto' | 'confirm' | 'disabled';
  
  // 余额不足处理
  insufficientBalanceAction: 'prompt' | 'skip' | 'disable';
  
  // 界面显示设置
  showAdvancedOptions: boolean;
  showManualButtons: boolean;
}

interface StakingPreferencesContextType {
  preferences: StakingPreferences;
  updatePreferences: (updates: Partial<StakingPreferences>) => void;
  resetPreferences: () => void;
  markTutorialComplete: () => void;
  markStakingIntroSeen: () => void;
  toggleAutoStaking: () => void;
  updateStakeAmount: (type: 'like' | 'comment' | 'favorite', amount: number) => void;
  toggleAdvancedOptions: () => void;
  showManualButtons: () => void;
  hideManualButtons: () => void;
}

const defaultPreferences: StakingPreferences = {
  hasCompletedTutorial: false,
  hasSeenStakingIntro: false,
  autoStakingEnabled: false,
  stakeAmounts: {
    like: 0.5,
    comment: 1.0,
    favorite: 2.0,
  },
  confirmationMode: 'confirm',
  insufficientBalanceAction: 'prompt',
  showAdvancedOptions: false,
  showManualButtons: false,
};

const StakingPreferencesContext = createContext<StakingPreferencesContextType | undefined>(undefined);

export const useStakingPreferences = () => {
  const context = useContext(StakingPreferencesContext);
  if (!context) {
    throw new Error('useStakingPreferences must be used within a StakingPreferencesProvider');
  }
  return context;
};

interface StakingPreferencesProviderProps {
  children: ReactNode;
}

export const StakingPreferencesProvider: React.FC<StakingPreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<StakingPreferences>(() => {
    // 从localStorage加载用户设置
    try {
      const saved = localStorage.getItem('bondly-staking-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load staking preferences:', error);
    }
    return defaultPreferences;
  });

  // 保存设置到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bondly-staking-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save staking preferences:', error);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<StakingPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const markTutorialComplete = () => {
    updatePreferences({ hasCompletedTutorial: true });
  };

  const markStakingIntroSeen = () => {
    updatePreferences({ hasSeenStakingIntro: true });
  };

  const toggleAutoStaking = () => {
    setPreferences(prev => ({ 
      ...prev, 
      autoStakingEnabled: !prev.autoStakingEnabled 
    }));
  };

  const updateStakeAmount = (type: 'like' | 'comment' | 'favorite', amount: number) => {
    setPreferences(prev => ({
      ...prev,
      stakeAmounts: {
        ...prev.stakeAmounts,
        [type]: amount,
      },
    }));
  };

  const toggleAdvancedOptions = () => {
    setPreferences(prev => ({
      ...prev,
      showAdvancedOptions: !prev.showAdvancedOptions,
    }));
  };

  const showManualButtons = () => {
    setPreferences(prev => ({
      ...prev,
      showManualButtons: true,
    }));
  };

  const hideManualButtons = () => {
    setPreferences(prev => ({
      ...prev,
      showManualButtons: false,
    }));
  };

  const value: StakingPreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
    markTutorialComplete,
    markStakingIntroSeen,
    toggleAutoStaking,
    updateStakeAmount,
    toggleAdvancedOptions,
    showManualButtons,
    hideManualButtons,
  };

  return (
    <StakingPreferencesContext.Provider value={value}>
      {children}
    </StakingPreferencesContext.Provider>
  );
}; 