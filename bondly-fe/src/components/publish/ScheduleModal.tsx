import React, { useState } from 'react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: string, time: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSchedule }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSchedule = () => {
    if (!date || !time) {
      alert('Please select publish date and time');
      return;
    }
    onSchedule(date, time);
    setDate('');
    setTime('');
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
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>📅 Schedule Publish</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Publish Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #374151',
              fontSize: '16px',
              background: '#23243a',
              color: 'white'
            }}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Publish Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #374151',
              fontSize: '16px',
              background: '#23243a',
              color: 'white'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleSchedule}
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
            Schedule
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

export default ScheduleModal;
