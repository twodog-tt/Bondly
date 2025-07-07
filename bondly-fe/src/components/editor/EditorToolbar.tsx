import React from 'react';

interface EditorToolbarProps {
  onFormat: (format: string) => void;
  onInsertCode: () => void;
  onInsertMedia: () => void;
  onInsertMath: () => void;
  onTogglePreview: () => void;
  activeFormat: string;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFormat,
  onInsertCode,
  onInsertMedia,
  onInsertMath,
  onTogglePreview,
  activeFormat
}) => {
  const setActiveFormat = (format: string) => {
    onFormat(format);
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    margin: '0 8px',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <button style={buttonStyle} onClick={() => setActiveFormat('bold')} title="Bold">
        <b>B</b>
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('italic')} title="Italic">
        <i>I</i>
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('underline')} title="Underline">
        <u>U</u>
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('strikethrough')} title="Strikethrough">
        <s>S</s>
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('heading_1')} title="Heading 1">
        H1
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('heading_2')} title="Heading 2">
        H2
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('heading_3')} title="Heading 3">
        H3
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('unordered_list')} title="Unordered List">
        • List
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('ordered_list')} title="Ordered List">
        1. List
      </button>
      <button style={buttonStyle} onClick={() => setActiveFormat('quote')} title="Quote">
        💬 Quote
      </button>
      <button style={buttonStyle} onClick={onInsertCode} title="Code">
        💻 Code
      </button>
      <button style={buttonStyle} onClick={onInsertMedia} title="Media">
        🖼️ Media
      </button>
      <button style={buttonStyle} onClick={onInsertMath} title="Formula">
        ∑ Formula
      </button>
      <button style={buttonStyle} onClick={onTogglePreview} title="Toggle Preview">
        👁️ Preview
      </button>
    </div>
  );
};

export default EditorToolbar;
