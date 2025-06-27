import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from './NotificationProvider';

interface TipModalProps {
  targetId: string;
  targetType: 'post' | 'comment';
  targetTitle?: string;
  authorName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TipOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  type: 'token' | 'nft' | 'sbt';
  balance?: number;
  decimals?: number;
}

// 模拟打赏选项
const tipOptions: TipOption[] = [
  {
    id: 'bondly',
    name: 'Bondly Token',
    symbol: 'BONDLY',
    icon: '🪙',
    type: 'token',
    balance: 1000,
    decimals: 18
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '🔷',
    type: 'token',
    balance: 0.5,
    decimals: 18
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '💵',
    type: 'token',
    balance: 500,
    decimals: 6
  },
  {
    id: 'nft-badge',
    name: '贡献者徽章',
    symbol: 'NFT',
    icon: '🏆',
    type: 'nft',
    balance: 3
  },
  {
    id: 'sbt-reputation',
    name: '声誉积分',
    symbol: 'SBT',
    icon: '⭐',
    type: 'sbt',
    balance: 100
  }
];

export default function TipModal({ 
  targetId, 
  targetType, 
  targetTitle, 
  authorName, 
  isOpen, 
  onClose 
}: TipModalProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [selectedOption, setSelectedOption] = useState<TipOption | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTip = async () => {
    if (!selectedOption || !amount) {
      notify('请选择打赏类型并输入金额', 'warning');
      return;
    }

    setLoading(true);

    // TODO: 调用后端接口
    // const response = await fetch('/api/tips', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     targetId,
    //     targetType,
    //     amount: parseFloat(amount),
    //     tokenType: selectedOption.type,
    //     tokenId: selectedOption.id,
    //     message
    //   })
    // });

    // 模拟打赏成功
    setTimeout(() => {
      notify(`打赏成功！已向 ${authorName} 发送 ${amount} ${selectedOption.symbol}`, 'success');
      setLoading(false);
      onClose();
      setSelectedOption(null);
      setAmount('');
      setMessage('');
    }, 1500);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedOption(null);
      setAmount('');
      setMessage('');
    }
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative' as const,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  };

  const mobileModalStyle = {
    ...modalStyle,
    padding: '24px',
    borderRadius: '12px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2d3748'
  };

  const mobileTitleStyle = {
    ...titleStyle,
    fontSize: '20px'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#718096',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  };

  const targetInfoStyle = {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid rgba(102, 126, 234, 0.2)'
  };

  const targetTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px'
  };

  const authorStyle = {
    fontSize: '14px',
    color: '#718096'
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '16px'
  };

  const optionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  };

  const optionCardStyle = (isSelected: boolean) => ({
    padding: '16px',
    border: isSelected ? '2px solid #667eea' : '1px solid #e2e8f0',
    borderRadius: '12px',
    background: isSelected ? 'rgba(102, 126, 234, 0.05)' : 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const
  });

  const optionIconStyle = {
    fontSize: '24px',
    marginBottom: '8px'
  };

  const optionNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px'
  };

  const optionBalanceStyle = {
    fontSize: '12px',
    color: '#718096'
  };

  const inputGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  };

  const cancelButtonStyle = {
    padding: '12px 24px',
    background: '#f7fafc',
    color: '#4a5568',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const tipButtonStyle = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={modalOverlayStyle} onClick={handleClose}>
      <div 
        style={isMobile ? mobileModalStyle : modalStyle} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <h2 style={isMobile ? mobileTitleStyle : titleStyle}>
            💝 打赏 {authorName}
          </h2>
          <button style={closeButtonStyle} onClick={handleClose}>
            ×
          </button>
        </div>

        {/* 打赏目标信息 */}
        <div style={targetInfoStyle}>
          <div style={targetTitleStyle}>
            {targetType === 'post' ? '文章' : '评论'}
          </div>
          <div style={authorStyle}>
            作者: {authorName}
          </div>
        </div>

        {/* 选择打赏类型 */}
        <div>
          <div style={sectionTitleStyle}>选择打赏类型</div>
          <div style={optionsGridStyle}>
            {tipOptions.map((option) => (
              <div
                key={option.id}
                style={optionCardStyle(selectedOption?.id === option.id)}
                onClick={() => setSelectedOption(option)}
              >
                <div style={optionIconStyle}>{option.icon}</div>
                <div style={optionNameStyle}>{option.name}</div>
                <div style={optionBalanceStyle}>
                  余额: {option.balance} {option.symbol}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 输入金额 */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            打赏金额 {selectedOption && `(${selectedOption.symbol})`}
          </label>
          <input
            type="number"
            style={inputStyle}
            placeholder={`输入 ${selectedOption?.symbol || '金额'}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step={selectedOption?.type === 'token' ? '0.01' : '1'}
            disabled={!selectedOption}
          />
        </div>

        {/* 留言 */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>留言 (可选)</label>
          <textarea
            style={textareaStyle}
            placeholder="给作者留言..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* 操作按钮 */}
        <div style={actionsStyle}>
          <button 
            style={cancelButtonStyle} 
            onClick={handleClose}
            disabled={loading}
          >
            取消
          </button>
          <button 
            style={tipButtonStyle}
            onClick={handleTip}
            disabled={loading || !selectedOption || !amount}
          >
            {loading ? '处理中...' : `打赏 ${selectedOption?.symbol || ''}`}
          </button>
        </div>
      </div>
    </div>
  );
} 