import React, { useState, useEffect, useRef } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import { createContent, updateContent, Content } from '../api/content';

interface EditorProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
  editContentId?: number; // 用于编辑现有内容
}

interface ArticleData {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  category: string;
  coverImage?: string;
  isPublished: boolean;
  lastSaved: Date;
}

const Editor: React.FC<EditorProps> = ({ isMobile, onPageChange, editContentId }) => {
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    content: '',
    summary: '',
    tags: [],
    category: 'technology',
    isPublished: false,
    lastSaved: new Date()
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [savedContentId, setSavedContentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 自动保存功能
  useEffect(() => {
    const interval = setInterval(() => {
      if (articleData.title || articleData.content) {
        handleAutoSave();
      }
    }, 30000); // 每30秒自动保存

    setAutoSaveInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [articleData]);

  // 计算字数和阅读时间
  useEffect(() => {
    const words = articleData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200)); // 假设每分钟阅读200字
  }, [articleData.content]);

  const handleAutoSave = async () => {
    if (!articleData.title && !articleData.content) return;
    
    try {
      if (savedContentId) {
        // 更新现有内容
        await updateContent(savedContentId, {
          title: articleData.title,
          content: articleData.content,
          type: articleData.category,
          status: 'draft',
          cover_image_url: articleData.coverImage
        });
      } else {
        // 创建新内容
        const newContent = await createContent({
          title: articleData.title,
          content: articleData.content,
          type: articleData.category,
          status: 'draft',
          cover_image_url: articleData.coverImage
        });
        setSavedContentId(newContent.id);
      }
      
      setArticleData(prev => ({
        ...prev,
        lastSaved: new Date()
      }));
      setError(null);
    } catch (error) {
      console.error('Auto save failed:', error);
      setError('自动保存失败，请检查网络连接');
    }
  };

  const handleSave = async () => {
    if (!articleData.title.trim()) {
      setError('请输入文章标题');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      if (savedContentId) {
        // 更新现有内容
        await updateContent(savedContentId, {
          title: articleData.title,
          content: articleData.content,
          type: articleData.category,
          status: 'draft',
          cover_image_url: articleData.coverImage
        });
      } else {
        // 创建新内容
        const newContent = await createContent({
          title: articleData.title,
          content: articleData.content,
          type: articleData.category,
          status: 'draft',
          cover_image_url: articleData.coverImage
        });
        setSavedContentId(newContent.id);
      }
      
      setArticleData(prev => ({
        ...prev,
        lastSaved: new Date()
      }));
      
      // 显示成功消息
      alert('草稿保存成功！');
    } catch (error) {
      console.error('Save failed:', error);
      setError('保存失败，请重试');
      alert('保存失败，请检查网络连接');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!articleData.title.trim()) {
      setError('请输入文章标题');
      return;
    }
    if (!articleData.content.trim()) {
      setError('请输入文章内容');
      return;
    }
    if (!articleData.summary.trim()) {
      setError('请输入文章摘要');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      if (savedContentId) {
        // 更新现有内容为已发布
        await updateContent(savedContentId, {
          title: articleData.title,
          content: articleData.content,
          type: articleData.category,
          status: 'published',
          cover_image_url: articleData.coverImage
        });
      } else {
        // 创建新内容并发布
        const newContent = await createContent({
          title: articleData.title,
          content: articleData.content,
          type: articleData.category,
          status: 'published',
          cover_image_url: articleData.coverImage
        });
        setSavedContentId(newContent.id);
      }
      
      setArticleData(prev => ({
        ...prev,
        isPublished: true,
        lastSaved: new Date()
      }));
      
      alert('文章发布成功！');
      onPageChange?.('feed');
    } catch (error) {
      console.error('Publish failed:', error);
      setError('发布失败，请重试');
      alert('发布失败，请检查网络连接');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // 使用与现有代码相同的API调用方式
        const { uploadApi } = await import('../utils/api');
        const result = await uploadApi.uploadImage(file);
        
        setArticleData(prev => ({
          ...prev,
          coverImage: result.url
        }));
        
        alert('封面图片上传成功！');
      } catch (error: any) {
        console.error("封面图片上传失败:", error);
        
        // 显示错误信息
        if (error instanceof Error) {
          alert(`封面图片上传失败: ${error.message}`);
        } else {
          alert("封面图片上传失败，请重试");
        }
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !articleData.tags.includes(newTag.trim())) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertMarkdown = (markdown: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = articleData.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      setArticleData(prev => ({
        ...prev,
        content: before + markdown + after
      }));
      
      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + markdown.length, start + markdown.length);
      }, 0);
    }
  };

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFT' },
    { value: 'governance', label: 'Governance' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'news', label: 'News' }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "white" }}>
      <CommonNavbar 
        isMobile={isMobile} 
        onPageChange={onPageChange}
        showHomeButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        currentPage="editor"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* 顶部工具栏 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "#9ca3af" }}>
              {isSaving ? "Saving..." : `Last saved: ${articleData.lastSaved.toLocaleTimeString()}`}
            </span>
            <span style={{ fontSize: "14px", color: "#9ca3af" }}>
              • {wordCount} words • {readTime} min read
            </span>
            {savedContentId && (
              <span style={{ fontSize: "14px", color: "#10b981" }}>
                • ID: {savedContentId}
              </span>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                background: showPreview ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            color: "#ef4444"
          }}>
            {error}
          </div>
        )}

        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <h1 style={{
            fontSize: isMobile ? "24px" : "32px",
            fontWeight: "bold",
            marginBottom: "32px",
            textAlign: "center",
            color: "white"
          }}>
            {editContentId ? "Edit Article" : "Create New Article"}
          </h1>
          
          {!showPreview ? (
            <>
              {/* 文章标题 */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "white"
                }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  value={articleData.title}
                  onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your article title..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px"
                  }}
                />
              </div>

              {/* 文章摘要 */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "white"
                }}>
                  Summary *
                </label>
                <textarea
                  value={articleData.summary}
                  onChange={(e) => setArticleData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Write a brief summary of your article..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* 分类选择 */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "white"
                }}>
                  Category
                </label>
                <select
                  value={articleData.category}
                  onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px"
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* 标签管理 */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "white"
                }}>
                  Tags
                </label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  {articleData.tags.map((tag, index) => (
                    <span key={index} style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "0"
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add a tag..."
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      color: "white",
                      fontSize: "14px"
                    }}
                  />
                  <button
                    onClick={addTag}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 封面图片上传 */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "white"
                }}>
                  Cover Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    padding: "40px",
                    background: articleData.coverImage ? "none" : "rgba(255, 255, 255, 0.05)",
                    border: "2px dashed rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  {articleData.coverImage ? (
                    <img 
                      src={articleData.coverImage} 
                      alt="Cover" 
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "200px", 
                        borderRadius: "8px" 
                      }} 
                    />
                  ) : (
                    <>
                      <span style={{ fontSize: "24px" }}>📷</span>
                      <span>Click to upload cover image</span>
                    </>
                  )}
                </button>
              </div>

              {/* Markdown工具栏 */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    { label: "Bold", markdown: "**bold text**" },
                    { label: "Italic", markdown: "*italic text*" },
                    { label: "Link", markdown: "[link text](url)" },
                    { label: "Image", markdown: "![alt text](image-url)" },
                    { label: "Code", markdown: "`code`" },
                    { label: "Quote", markdown: "> quote text" },
                    { label: "List", markdown: "- list item" },
                    { label: "H1", markdown: "# Heading 1" },
                    { label: "H2", markdown: "## Heading 2" },
                    { label: "H3", markdown: "### Heading 3" }
                  ].map((tool, index) => (
                    <button
                      key={index}
                      onClick={() => insertMarkdown(tool.markdown)}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文章内容 */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "white"
                }}>
                  Article Content *
                </label>
                <textarea
                  name="content"
                  value={articleData.content}
                  onChange={(e) => setArticleData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here... (Supports Markdown)"
                  style={{
                    width: "100%",
                    minHeight: "400px",
                    padding: "16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    resize: "vertical",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </>
          ) : (
            /* 预览模式 */
            <div style={{ 
              background: "rgba(255, 255, 255, 0.02)", 
              padding: "24px", 
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              {articleData.coverImage && (
                <img 
                  src={articleData.coverImage} 
                  alt="Cover" 
                  style={{ 
                    width: "100%", 
                    maxHeight: "300px", 
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "24px"
                  }} 
                />
              )}
              
              <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px", color: "white" }}>
                {articleData.title || "Untitled Article"}
              </h1>
              
              {articleData.summary && (
                <p style={{ 
                  fontSize: "16px", 
                  color: "#9ca3af", 
                  marginBottom: "16px",
                  fontStyle: "italic"
                }}>
                  {articleData.summary}
                </p>
              )}
              
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                <span style={{ 
                  background: "rgba(102, 126, 234, 0.2)", 
                  color: "#667eea", 
                  padding: "4px 12px", 
                  borderRadius: "12px", 
                  fontSize: "12px" 
                }}>
                  {categories.find(cat => cat.value === articleData.category)?.label}
                </span>
                {articleData.tags.map((tag, index) => (
                  <span key={index} style={{ 
                    background: "rgba(255, 255, 255, 0.1)", 
                    color: "white", 
                    padding: "4px 12px", 
                    borderRadius: "12px", 
                    fontSize: "12px" 
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div style={{ 
                fontSize: "16px", 
                lineHeight: "1.7", 
                color: "white",
                whiteSpace: "pre-wrap"
              }}>
                {articleData.content || "No content yet..."}
              </div>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "32px"
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: isSaving ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            
            <button
              onClick={() => onPageChange?.("drafts")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#9ca3af",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#9ca3af";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              View Drafts
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isSaving || !articleData.title || !articleData.content || !articleData.summary}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: (isSaving || !articleData.title || !articleData.content || !articleData.summary) ? "not-allowed" : "pointer",
                transition: "opacity 0.2s ease",
                opacity: (isSaving || !articleData.title || !articleData.content || !articleData.summary) ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isSaving && articleData.title && articleData.content && articleData.summary) {
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving && articleData.title && articleData.content && articleData.summary) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              {isSaving ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
