import React, { useState } from 'react';
import { useStakingPreferences } from '../contexts/StakingPreferencesContext';

interface StakingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (enableAutoStaking: boolean) => void;
}

const StakingTutorial: React.FC<StakingTutorialProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { preferences, updatePreferences, markTutorialComplete } = useStakingPreferences();

  const steps = [
    {
      title: "💎 Welcome to Bondly Staking",
      content: "Discover how your interactions create value and earn rewards for content creators.",
      icon: "💎",
      showButtons: false,
    },
    {
      title: "Like = Stake BOND",
      content: "When you like content, you automatically stake BOND tokens. This shows your support and helps creators earn rewards.",
      icon: "👍",
      showButtons: false,
    },
    {
      title: "Comment = Stake BOND",
      content: "Your comments are valuable! Each comment stakes BOND tokens, rewarding creators for engaging content.",
      icon: "💬",
      showButtons: false,
    },
    {
      title: "Favorite = Stake BOND",
      content: "Bookmarking content with favorites stakes more BOND, showing creators their work is truly special.",
      icon: "⭐",
      showButtons: false,
    },
    {
      title: "Enable Auto-Staking?",
      content: "Would you like to enable automatic staking for your interactions? You can change this anytime in settings.",
      icon: "⚙️",
      showButtons: true,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (enableAutoStaking: boolean) => {
    updatePreferences({ autoStakingEnabled: enableAutoStaking });
    markTutorialComplete();
    onComplete(enableAutoStaking);
    onClose();
  };

  const handleSkip = () => {
    markTutorialComplete();
    onComplete(false);
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#151728',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid #374151',
        position: 'relative',
      }}>
        {/* 进度条 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#374151',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px 16px 0 0',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* 步骤指示器 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '24px',
          gap: '8px',
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index <= currentStep ? '#667eea' : '#374151',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* 图标 */}
        <div style={{
          fontSize: '48px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          {currentStepData.icon}
        </div>

        {/* 标题 */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '16px',
          color: 'white',
        }}>
          {currentStepData.title}
        </h2>

        {/* 内容 */}
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          textAlign: 'center',
          marginBottom: '32px',
          color: '#9ca3af',
        }}>
          {currentStepData.content}
        </p>

        {/* 质押金额展示（最后一步） */}
        {isLastStep && (
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(102, 126, 234, 0.3)',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#667eea',
            }}>
              Default Stake Amounts:
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#9ca3af',
            }}>
              <span>Like: {preferences.stakeAmounts.like} BOND</span>
              <span>Comment: {preferences.stakeAmounts.comment} BOND</span>
              <span>Favorite: {preferences.stakeAmounts.favorite} BOND</span>
            </div>
          </div>
        )}

        {/* 按钮区域 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
        }}>
          {/* 跳过按钮 */}
          <button
            onClick={handleSkip}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9ca3af',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            Skip Tutorial
          </button>

          {/* 上一步按钮 */}
          {currentStep > 0 && !isLastStep && (
            <button
              onClick={handlePrevious}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#374151';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Previous
            </button>
          )}

          {/* 下一步/完成按钮 */}
          {!isLastStep ? (
            <button
              onClick={handleNext}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Next
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleComplete(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#9ca3af',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#374151';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                Later
              </button>
              <button
                onClick={() => handleComplete(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Enable Auto-Staking
              </button>
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default StakingTutorial; 