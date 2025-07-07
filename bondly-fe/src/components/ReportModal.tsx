import React, { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onReport }) => {
  const [reason, setReason] = useState('');

  const handleReport = () => {
    if (!reason.trim()) {
      alert('Please enter a reason');
      return;
    }
    onReport(reason);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#181a2a',
        borderRadius: '16px',
        padding: '32px',
        minWidth: '320px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Report Content</h2>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter reason for report"
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #374151',
            marginBottom: '20px',
            fontSize: '16px',
            background: '#23243a',
            color: 'white',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleReport}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            Report
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
