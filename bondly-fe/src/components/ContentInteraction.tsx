import React, { useState, useEffect } from 'react';
import { 
  createInteraction, 
  deleteInteraction, 
  getInteractionStats, 
  getUserInteractionStatus,
  InteractionStats 
} from '../api/content';
import { useAuth } from '../contexts/AuthContext';

interface ContentInteractionProps {
  contentId: number;
  initialStats?: {
    likes: number;
    dislikes: number;
    bookmarks: number;
    shares: number;
    views?: number;
  };
  onStatsChange?: (stats: InteractionStats) => void;
}

const ContentInteraction: React.FC<ContentInteractionProps> = ({
  contentId,
  initialStats,
  onStatsChange
}) => {
  const { isLoggedIn } = useAuth();
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [userInteractions, setUserInteractions] = useState({
    liked: false,
    disliked: false,
    bookmarked: false
  });
  const [loading, setLoading] = useState(false);

  // 加载互动统计和用户状态
  useEffect(() => {
    const loadInteractionData = async () => {
      try {
        // 首先使用传入的初始统计数据
        if (initialStats) {
          setStats({
            content_id: contentId,
            ...initialStats,
            user_interactions: {
              liked: false,
              disliked: false,
              bookmarked: false
            }
          });
        }

        // 然后尝试从API获取最新数据
        const [statsData, userStatus] = await Promise.all([
          getInteractionStats(contentId),
          isLoggedIn ? getUserInteractionStatus(contentId) : Promise.resolve({
            liked: false,
            disliked: false,
            bookmarked: false
          })
        ]);
        
        // 只有在API调用成功时才更新统计数据
        setStats(statsData);
        setUserInteractions(userStatus);
      } catch (error) {
        console.error('加载互动数据失败:', error);
        // 如果API调用失败，确保至少显示初始统计数据
        if (initialStats && !stats) {
          setStats({
            content_id: contentId,
            ...initialStats,
            user_interactions: {
              liked: false,
              disliked: false,
              bookmarked: false
            }
          });
        }
      }
    };

    loadInteractionData();
  }, [contentId, isLoggedIn, initialStats]);

  // 处理互动操作
  const handleInteraction = async (interactionType: 'like' | 'dislike' | 'bookmark') => {
    if (!isLoggedIn) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const currentState = userInteractions[interactionType];
      
      if (currentState) {
        // 取消互动
        await deleteInteraction(contentId, interactionType);
        setUserInteractions(prev => ({
          ...prev,
          [interactionType]: false
        }));
      } else {
        // 添加互动
        await createInteraction({
          content_id: contentId,
          interaction_type: interactionType
        });
        setUserInteractions(prev => ({
          ...prev,
          [interactionType]: true
        }));
      }

      // 重新加载统计数据
      const newStats = await getInteractionStats(contentId);
      setStats(newStats);
      onStatsChange?.(newStats);
    } catch (error) {
      console.error('互动操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理分享
  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/blog/${contentId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: '分享文章',
          url: url
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(url);
        alert('链接已复制到剪贴板');
      }

      // 记录分享
      if (isLoggedIn) {
        await createInteraction({
          content_id: contentId,
          interaction_type: 'share'
        });
        
        // 更新分享计数
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            shares: prev.shares + 1
          } : null);
        }
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  if (!stats) {
    return (
      <div style={{
        display: "flex",
        gap: "16px",
        color: "#9ca3af",
        padding: "16px 0"
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "24px",
      padding: "16px 0",
      borderTop: "1px solid #374151"
    }}>
              {/* Like */}
      <button
        onClick={() => handleInteraction('like')}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: userInteractions.liked ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.1)",
          color: userInteractions.liked ? "#ef4444" : "#9ca3af",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (!loading && !userInteractions.liked) {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.color = "#ef4444";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !userInteractions.liked) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#9ca3af";
          }
        }}
      >
        <svg style={{ width: "20px", height: "20px" }} fill={userInteractions.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span>{stats.likes}</span>
      </button>

      {/* 点踩 */}
      <button
        onClick={() => handleInteraction('dislike')}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: userInteractions.disliked ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.1)",
          color: userInteractions.disliked ? "#3b82f6" : "#9ca3af",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (!loading && !userInteractions.disliked) {
            e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            e.currentTarget.style.color = "#3b82f6";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !userInteractions.disliked) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#9ca3af";
          }
        }}
      >
        <svg style={{ width: "20px", height: "20px" }} fill={userInteractions.disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
        </svg>
        <span>{stats.dislikes}</span>
      </button>

      {/* 收藏 */}
      <button
        onClick={() => handleInteraction('bookmark')}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: userInteractions.bookmarked ? "rgba(245, 158, 11, 0.1)" : "rgba(255, 255, 255, 0.1)",
          color: userInteractions.bookmarked ? "#f59e0b" : "#9ca3af",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          if (!loading && !userInteractions.bookmarked) {
            e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)";
            e.currentTarget.style.color = "#f59e0b";
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !userInteractions.bookmarked) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#9ca3af";
          }
        }}
      >
        <svg style={{ width: "20px", height: "20px" }} fill={userInteractions.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span>{stats.bookmarks}</span>
      </button>

      {/* 分享 */}
      <button
        onClick={handleShare}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: "rgba(255, 255, 255, 0.1)",
          color: "#9ca3af",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(34, 197, 94, 0.1)";
          e.currentTarget.style.color = "#22c55e";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.color = "#9ca3af";
        }}
      >
        <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span>{stats.shares}</span>
      </button>
    </div>
  );
};

export default ContentInteraction; 