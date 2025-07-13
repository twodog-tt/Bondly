import React, { useState, useEffect } from 'react';
import { getCommentCount } from '../api/comment';

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
  const [commentCount, setCommentCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 直接使用传入的统计数据，避免额外的API调用
  const stats = initialStats || {
    likes: 0,
    dislikes: 0,
    bookmarks: 0,
    shares: 0,
    views: 0
  };

  // 获取评论数量
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        setLoading(true);
        const count = await getCommentCount(contentId);
        setCommentCount(count);
      } catch (error) {
        console.error('获取评论数量失败:', error);
        // 如果获取失败，保持默认值0
      } finally {
        setLoading(false);
      }
    };

    fetchCommentCount();
  }, [contentId]);

  return (
    <div style={{
      display: "flex",
      gap: "16px",
      fontSize: "14px",
      color: "#9ca3af"
    }}>
      <span>👁️ {stats.views || 0}</span>
      <span>👍 {stats.likes}</span>
      <span>💬 {loading ? '...' : commentCount}</span>
    </div>
  );
};

export default ContentInteractionSimple; 