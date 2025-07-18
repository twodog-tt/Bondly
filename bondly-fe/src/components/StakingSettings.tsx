import React, { useState } from 'react';
import { useStakingPreferences } from '../contexts/StakingPreferencesContext';

interface StakingSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const StakingSettings: React.FC<StakingSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useStakingPreferences();
  const [localSettings, setLocalSettings] = useState({
    autoStakingEnabled: preferences.autoStakingEnabled,
    stakeAmounts: { ...preferences.stakeAmounts },
    confirmationMode: preferences.confirmationMode,
  });

  const handleSave = () => {
    updatePreferences({
      autoStakingEnabled: localSettings.autoStakingEnabled,
      stakeAmounts: localSettings.stakeAmounts,
      confirmationMode: localSettings.confirmationMode,
    });
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings({
      autoStakingEnabled: preferences.autoStakingEnabled,
      stakeAmounts: { ...preferences.stakeAmounts },
      confirmationMode: preferences.confirmationMode,
    });
    onClose();
  };

  const handleStakeAmountChange = (type: 'like' | 'comment' | 'favorite', value: string) => {
    const amount = parseFloat(value) || 0;
    setLocalSettings(prev => ({
      ...prev,
      stakeAmounts: {
        ...prev.stakeAmounts,
        [type]: amount,
      },
    }));
  };

  if (!isOpen) return null;

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
        maxWidth: '600px',
        width: '100%',
        border: '1px solid #374151',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
          }}>
            💎 Staking Preferences
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* 自动质押开关 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
            }}>
              Enable Auto-Staking
            </label>
            <input
              type="checkbox"
              checked={localSettings.autoStakingEnabled}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                autoStakingEnabled: e.target.checked,
              }))}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#667eea',
              }}
            />
          </div>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af',
            margin: 0,
          }}>
            Automatically stake BOND tokens when you like, comment, or favorite content.
          </p>
          {localSettings.autoStakingEnabled && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
            }}>
              <div style={{
                fontSize: '12px',
                color: '#10b981',
                lineHeight: '1.4',
              }}>
                <div>✅ Auto-staking mode:</div>
                <div>• Manual buttons are hidden by default</div>
                <div>• Use "Show Advanced Options" for manual control</div>
                <div>• Manual buttons appear if auto-staking fails</div>
              </div>
            </div>
          )}
        </div>

        {/* 质押金额设置 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px',
          }}>
            Stake Amounts
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <label style={{ color: '#9ca3af', fontSize: '14px' }}>Like:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={localSettings.stakeAmounts.like}
                  onChange={(e) => handleStakeAmountChange('like', e.target.value)}
                  style={{
                    width: '80px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                  }}
                />
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>BOND</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <label style={{ color: '#9ca3af', fontSize: '14px' }}>Comment:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={localSettings.stakeAmounts.comment}
                  onChange={(e) => handleStakeAmountChange('comment', e.target.value)}
                  style={{
                    width: '80px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                  }}
                />
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>BOND</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <label style={{ color: '#9ca3af', fontSize: '14px' }}>Favorite:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={localSettings.stakeAmounts.favorite}
                  onChange={(e) => handleStakeAmountChange('favorite', e.target.value)}
                  style={{
                    width: '80px',
                    padding: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                  }}
                />
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>BOND</span>
              </div>
            </div>
          </div>
        </div>

        {/* 确认方式设置 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px',
          }}>
            Confirmation Mode
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="confirmationMode"
                value="auto"
                checked={localSettings.confirmationMode === 'auto'}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  confirmationMode: e.target.value as 'auto',
                }))}
                style={{ accentColor: '#667eea' }}
              />
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                Auto - No confirmation needed
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="confirmationMode"
                value="confirm"
                checked={localSettings.confirmationMode === 'confirm'}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  confirmationMode: e.target.value as 'confirm',
                }))}
                style={{ accentColor: '#667eea' }}
              />
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                Confirm - Show confirmation dialog
              </span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}>
              <input
                type="radio"
                name="confirmationMode"
                value="disabled"
                checked={localSettings.confirmationMode === 'disabled'}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  confirmationMode: e.target.value as 'disabled',
                }))}
                style={{ accentColor: '#667eea' }}
              />
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                Disabled - No staking
              </span>
            </label>
          </div>
        </div>

        {/* 按钮区域 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleCancel}
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
            Cancel
          </button>
          <button
            onClick={handleSave}
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
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakingSettings; 