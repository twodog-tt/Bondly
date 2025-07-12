import React from 'react';

interface ContentInteractionSimpleProps {
  contentId: number;
  initialStats?: {
    likes: number;
    dislikes: number;
    bookmarks: number;
    shares: number;
    views?: number;
  };
}

const ContentInteractionSimple: React.FC<ContentInteractionSimpleProps> = ({
  contentId,
  initialStats
}) => {
  // 直接使用传入的统计数据，避免额外的API调用
  const stats = initialStats || {
    likes: 0,
    dislikes: 0,
    bookmarks: 0,
    shares: 0,
    views: 0
  };

  return (
    <div style={{
      display: "flex",
      gap: "16px",
      fontSize: "14px",
      color: "#9ca3af"
    }}>
      <span>👁️ {stats.views || 0}</span>
      <span>👍 {stats.likes}</span>
      <span>💬 0</span>
    </div>
  );
};

export default ContentInteractionSimple; 