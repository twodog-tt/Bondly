interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  languages?: Language[];
}

export default function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]
}: LanguageSelectorProps) {
  const containerStyle = {
    position: 'relative' as const,
    display: 'inline-block'
  };

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    background: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '120px'
  };

  return (
    <div style={containerStyle}>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        style={selectStyle}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
} 