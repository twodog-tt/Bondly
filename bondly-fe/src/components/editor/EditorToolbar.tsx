import { useState } from 'react';

interface EditorToolbarProps {
  onFormatChange: (format: string) => void;
  onInsertMedia: () => void;
  onInsertCode: () => void;
  onInsertMath: () => void;
  onPreviewToggle: () => void;
  showPreview: boolean;
}

export default function EditorToolbar({
  onFormatChange,
  onInsertMedia,
  onInsertCode,
  onInsertMath,
  onPreviewToggle,
  showPreview
}: EditorToolbarProps) {
  const [activeFormat, setActiveFormat] = useState<string>('');

  const handleFormatClick = (format: string) => {
    setActiveFormat(format);
    onFormatChange(format);
  };

  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap' as const
  };

  const buttonStyle = {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#4a5568',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: '#667eea',
    color: 'white',
    border: '1px solid #667eea'
  };

  const separatorStyle = {
    width: '1px',
    height: '24px',
    background: '#e2e8f0',
    margin: '0 4px'
  };

  return (
    <div style={toolbarStyle}>
      {/* 文本格式 */}
      <button
        style={activeFormat === 'bold' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('bold')}
        title="粗体"
      >
        <strong>B</strong>
      </button>
      <button
        style={activeFormat === 'italic' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('italic')}
        title="斜体"
      >
        <em>I</em>
      </button>
      <button
        style={activeFormat === 'underline' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('underline')}
        title="下划线"
      >
        <u>U</u>
      </button>
      <button
        style={activeFormat === 'strikethrough' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('strikethrough')}
        title="删除线"
      >
        <s>S</s>
      </button>

      <div style={separatorStyle} />

      {/* 标题格式 */}
      <button
        style={activeFormat === 'h1' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('h1')}
        title="标题1"
      >
        H1
      </button>
      <button
        style={activeFormat === 'h2' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('h2')}
        title="标题2"
      >
        H2
      </button>
      <button
        style={activeFormat === 'h3' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('h3')}
        title="标题3"
      >
        H3
      </button>

      <div style={separatorStyle} />

      {/* 列表 */}
      <button
        style={activeFormat === 'ul' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('ul')}
        title="无序列表"
      >
        • 列表
      </button>
      <button
        style={activeFormat === 'ol' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('ol')}
        title="有序列表"
      >
        1. 列表
      </button>

      <div style={separatorStyle} />

      {/* 引用和代码 */}
      <button
        style={activeFormat === 'quote' ? activeButtonStyle : buttonStyle}
        onClick={() => handleFormatClick('quote')}
        title="引用"
      >
        💬 引用
      </button>
      <button
        style={buttonStyle}
        onClick={onInsertCode}
        title="插入代码块"
      >
        💻 代码
      </button>

      <div style={separatorStyle} />

      {/* 媒体和数学公式 */}
      <button
        style={buttonStyle}
        onClick={onInsertMedia}
        title="插入媒体"
      >
        🖼️ 媒体
      </button>
      <button
        style={buttonStyle}
        onClick={onInsertMath}
        title="插入数学公式"
      >
        ∑ 公式
      </button>

      <div style={separatorStyle} />

      {/* 预览切换 */}
      <button
        style={showPreview ? activeButtonStyle : buttonStyle}
        onClick={onPreviewToggle}
        title="切换预览"
      >
        👁️ 预览
      </button>
    </div>
  );
} 