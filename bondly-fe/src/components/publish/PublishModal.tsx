import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ScheduleModal from './ScheduleModal';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (publishData: PublishData) => void;
  title: string;
  content: string;
}

interface PublishData {
  title: string;
  summary: string;
  tags: string[];
  category: string;
  language: string;
  coverImage?: string;
  visibility: 'public' | 'private' | 'password';
  password?: string;
  scheduledPublish?: string;
}

export default function PublishModal({ 
  isOpen, 
  onClose, 
  onPublish, 
  title, 
  content 
}: PublishModalProps) {
  const { t } = useTranslation();
  const [publishData, setPublishData] = useState<PublishData>({
    title: title,
    summary: '',
    tags: [],
    category: '技术分析',
    language: 'zh',
    visibility: 'public'
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (newTag.trim() && !publishData.tags.includes(newTag.trim())) {
      setPublishData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPublishData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSchedule = (scheduledDate: string) => {
    setPublishData(prev => ({ ...prev, scheduledPublish: scheduledDate }));
  };

  const handlePublish = async () => {
    if (!publishData.title.trim()) {
      alert('请输入文章标题');
      return;
    }

    setLoading(true);
    
    try {
      await onPublish(publishData);
      onClose();
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setLoading(false);
    }
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
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
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

  const textareaStyle = {
    ...inputStyle,
    height: '80px',
    resize: 'vertical' as const
  };

  const selectStyle = {
    ...inputStyle,
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

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#e2e8f0',
    color: '#4a5568',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    margin: '4px',
    gap: '4px'
  };

  const removeTagButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#718096',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '0',
    marginLeft: '4px'
  };

  const categories = ['技术分析', '安全指南', '艺术创作', '市场动态', '教程指南'];
  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>🚀 发布设置</h3>
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 标题 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            文章标题 *
          </label>
          <input
            type="text"
            value={publishData.title}
            onChange={(e) => setPublishData(prev => ({ ...prev, title: e.target.value }))}
            style={inputStyle}
            placeholder="请输入文章标题..."
          />
        </div>

        {/* 摘要 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            文章摘要
          </label>
          <textarea
            value={publishData.summary}
            onChange={(e) => setPublishData(prev => ({ ...prev, summary: e.target.value }))}
            style={textareaStyle}
            placeholder="请输入文章摘要..."
          />
        </div>

        {/* 分类 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            分类
          </label>
          <select
            value={publishData.category}
            onChange={(e) => setPublishData(prev => ({ ...prev, category: e.target.value }))}
            style={selectStyle}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* 标签 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            标签
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
              placeholder="添加标签..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button style={buttonStyle} onClick={handleAddTag}>
              添加
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {publishData.tags.map(tag => (
              <span key={tag} style={tagStyle}>
                #{tag}
                <button
                  style={removeTagButtonStyle}
                  onClick={() => handleRemoveTag(tag)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 语言 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            语言
          </label>
          <select
            value={publishData.language}
            onChange={(e) => setPublishData(prev => ({ ...prev, language: e.target.value }))}
            style={selectStyle}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* 可见性 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            可见性
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                value="public"
                checked={publishData.visibility === 'public'}
                onChange={(e) => setPublishData(prev => ({ ...prev, visibility: e.target.value as any }))}
              />
              公开
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                value="private"
                checked={publishData.visibility === 'private'}
                onChange={(e) => setPublishData(prev => ({ ...prev, visibility: e.target.value as any }))}
              />
              私有
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="radio"
                value="password"
                checked={publishData.visibility === 'password'}
                onChange={(e) => setPublishData(prev => ({ ...prev, visibility: e.target.value as any }))}
              />
              密码保护
            </label>
          </div>
        </div>

        {/* 密码输入 */}
        {publishData.visibility === 'password' && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              访问密码
            </label>
            <input
              type="password"
              value={publishData.password || ''}
              onChange={(e) => setPublishData(prev => ({ ...prev, password: e.target.value }))}
              style={inputStyle}
              placeholder="请输入访问密码..."
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button style={buttonStyle} onClick={onClose}>
            取消
          </button>
          <button 
            style={buttonStyle}
            onClick={() => setShowScheduleModal(true)}
          >
            ⏰ 定时发布
          </button>
          <button 
            style={primaryButtonStyle} 
            onClick={handlePublish}
            disabled={loading}
          >
            {loading ? '发布中...' : publishData.scheduledPublish ? '设置定时发布' : '立即发布'}
          </button>
        </div>

        {/* 定时发布模态框 */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleSchedule}
        />
      </div>
    </div>
  );
} 