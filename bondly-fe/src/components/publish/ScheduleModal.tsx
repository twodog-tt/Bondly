import { useState } from 'react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledDate: string) => void;
}

export default function ScheduleModal({ isOpen, onClose, onSchedule }: ScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  if (!isOpen) return null;

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      alert('请选择发布日期和时间');
      return;
    }

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;
    onSchedule(scheduledDateTime);
    onClose();
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
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2d3748',
    margin: 0
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#718096',
    padding: '4px',
    borderRadius: '4px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#4a5568',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '12px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none'
  };

  // 获取最小日期（今天）
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>⏰ 定时发布</h3>
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#4a5568', marginBottom: '16px' }}>
            设置文章的发布时间，文章将在指定时间自动发布。
          </p>
        </div>

        {/* 日期选择 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            发布日期 *
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            style={inputStyle}
            min={today}
          />
        </div>

        {/* 时间选择 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            发布时间 *
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* 时区信息 */}
        <div style={{ 
          background: '#f7fafc', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px',
          color: '#718096'
        }}>
          <div>🌍 时区: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
          <div>📅 当前时间: {new Date().toLocaleString()}</div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={buttonStyle} onClick={onClose}>
            取消
          </button>
          <button style={primaryButtonStyle} onClick={handleSchedule}>
            设置定时发布
          </button>
        </div>
      </div>
    </div>
  );
} 