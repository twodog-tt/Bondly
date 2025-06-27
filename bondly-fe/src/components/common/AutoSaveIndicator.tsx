interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  enabled: boolean;
}

export default function AutoSaveIndicator({ isSaving, lastSaved, enabled }: AutoSaveIndicatorProps) {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#718096'
  };

  const statusStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: isSaving ? '#f6ad55' : enabled ? '#68d391' : '#fc8181'
  };

  const getStatusText = () => {
    if (isSaving) return '保存中...';
    if (!enabled) return '自动保存已关闭';
    if (lastSaved) return `上次保存: ${lastSaved.toLocaleTimeString()}`;
    return '自动保存已启用';
  };

  return (
    <div style={containerStyle}>
      <div style={statusStyle} />
      <span>{getStatusText()}</span>
    </div>
  );
} 