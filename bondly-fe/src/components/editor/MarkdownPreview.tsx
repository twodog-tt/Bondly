interface MarkdownPreviewProps {
  content: string;
  title?: string;
}

export default function MarkdownPreview({ content, title }: MarkdownPreviewProps) {
  // 简单的Markdown解析函数
  const parseMarkdown = (text: string) => {
    return text
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 图片
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // 列表
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // 引用
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // 换行
      .replace(/\n/g, '<br />');
  };

  const previewStyle = {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    lineHeight: '1.6',
    fontSize: '16px',
    color: '#2d3748'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '16px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '8px'
  };

  const contentStyle = {
    fontSize: '16px',
    lineHeight: '1.6'
  };

  const emptyStyle = {
    textAlign: 'center' as const,
    color: '#a0aec0',
    padding: '40px',
    fontSize: '16px'
  };

  if (!content.trim()) {
    return (
      <div style={previewStyle}>
        <div style={emptyStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <p>暂无内容</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            开始编写您的内容...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={previewStyle}>
      {title && <h1 style={titleStyle}>{title}</h1>}
      <div 
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
      />
    </div>
  );
} 