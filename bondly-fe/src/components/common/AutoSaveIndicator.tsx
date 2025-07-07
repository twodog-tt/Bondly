import React from 'react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  enabled: boolean;
  lastSaved: Date | null;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ isSaving, enabled, lastSaved }) => {
  function getStatusText() {
    if (isSaving) return 'Saving...';
    if (!enabled) return 'Auto save disabled';
    if (lastSaved) return `Last saved: ${lastSaved.toLocaleTimeString()}`;
    return 'Auto save enabled';
  }

  return (
    <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '8px' }}>{getStatusText()}</span>
  );
};

export default AutoSaveIndicator;
