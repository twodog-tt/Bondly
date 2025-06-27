import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from './NotificationProvider';

interface ReportModalProps {
  targetId: string;
  targetType: 'post' | 'comment';
  targetContent?: string;
  authorName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ReportReason {
  id: string;
  label: string;
  description: string;
  category: 'content' | 'behavior' | 'legal';
}

// 举报原因选项
const reportReasons: ReportReason[] = [
  {
    id: 'spam',
    label: '垃圾信息',
    description: '包含广告、推广或无关内容',
    category: 'content'
  },
  {
    id: 'inappropriate',
    label: '不当内容',
    description: '包含暴力、色情或令人不适的内容',
    category: 'content'
  },
  {
    id: 'fake_news',
    label: '虚假信息',
    description: '传播谣言、虚假新闻或误导性信息',
    category: 'content'
  },
  {
    id: 'copyright',
    label: '版权侵犯',
    description: '未经授权使用他人作品或内容',
    category: 'legal'
  },
  {
    id: 'harassment',
    label: '骚扰行为',
    description: '针对个人或群体的恶意攻击',
    category: 'behavior'
  },
  {
    id: 'impersonation',
    label: '冒充他人',
    description: '冒充他人身份或组织',
    category: 'behavior'
  },
  {
    id: 'other',
    label: '其他原因',
    description: '其他违反社区规范的行为',
    category: 'content'
  }
];

export default function ReportModal({ 
  targetId, 
  targetType, 
  targetContent, 
  authorName, 
  isOpen, 
  onClose 
}: ReportModalProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason) {
      notify('请选择举报原因', 'warning');
      return;
    }

    if (!description.trim()) {
      notify('请填写详细说明', 'warning');
      return;
    }

    setLoading(true);

    // TODO: 调用后端接口
    // const response = await fetch('/api/reports', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     targetId,
    //     targetType,
    //     reason: selectedReason,
    //     description,
    //     authorName
    //   })
    // });

    // 模拟提交成功
    setTimeout(() => {
      notify('举报已提交，我们会尽快处理', 'success');
      setLoading(false);
      onClose();
      setSelectedReason('');
      setDescription('');
    }, 1500);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setSelectedReason('');
      setDescription('');
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
    maxWidth: '600px',
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
    background: '#f7fafc',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0'
  };

  const targetTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px'
  };

  const targetContentStyle = {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.5',
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

  const reasonsContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginBottom: '24px'
  };

  const reasonCardStyle = (isSelected: boolean) => ({
    padding: '16px',
    border: isSelected ? '2px solid #667eea' : '1px solid #e2e8f0',
    borderRadius: '12px',
    background: isSelected ? 'rgba(102, 126, 234, 0.05)' : 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const reasonLabelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '4px'
  };

  const reasonDescriptionStyle = {
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

  const textareaStyle = {
    width: '100%',
    minHeight: '120px',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const
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

  const submitButtonStyle = {
    padding: '12px 24px',
    background: '#f56565',
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
            ⚠️ 举报内容
          </h2>
          <button style={closeButtonStyle} onClick={handleClose}>
            ×
          </button>
        </div>

        {/* 被举报内容信息 */}
        <div style={targetInfoStyle}>
          <div style={targetTitleStyle}>
            举报 {targetType === 'post' ? '文章' : '评论'}
          </div>
          {targetContent && (
            <div style={targetContentStyle}>
              {targetContent.length > 100 
                ? targetContent.substring(0, 100) + '...' 
                : targetContent
              }
            </div>
          )}
          <div style={authorStyle}>
            作者: {authorName}
          </div>
        </div>

        {/* 选择举报原因 */}
        <div>
          <div style={sectionTitleStyle}>选择举报原因</div>
          <div style={reasonsContainerStyle}>
            {reportReasons.map((reason) => (
              <div
                key={reason.id}
                style={reasonCardStyle(selectedReason === reason.id)}
                onClick={() => setSelectedReason(reason.id)}
              >
                <div style={reasonLabelStyle}>{reason.label}</div>
                <div style={reasonDescriptionStyle}>{reason.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 详细说明 */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            详细说明 <span style={{ color: '#f56565' }}>*</span>
          </label>
          <textarea
            style={textareaStyle}
            placeholder="请详细描述举报原因，帮助我们更好地处理您的举报..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
          <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
            {description.length}/500
          </div>
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
            style={submitButtonStyle}
            onClick={handleSubmit}
            disabled={loading || !selectedReason || !description.trim()}
          >
            {loading ? '提交中...' : '提交举报'}
          </button>
        </div>
      </div>
    </div>
  );
} 