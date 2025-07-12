import React, { useState, useEffect } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import ContentInteraction from '../components/ContentInteraction';
import { getContentById, Content } from '../api/content';

interface BlogDetailPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ isMobile, onPageChange }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从URL参数获取内容ID
  const getContentIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id ? parseInt(id) : null;
  };

  // 获取内容详情
  useEffect(() => {
    const fetchContent = async () => {
      const contentId = getContentIdFromUrl();
      
      if (!contentId) {
        setError('未找到内容ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const contentData = await getContentById(contentId);
        setContent(contentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取内容失败');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  // 计算阅读时间
  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(words / 200); // 假设每分钟阅读200字
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "white" }}>
        <CommonNavbar 
          isMobile={isMobile} 
          onPageChange={onPageChange}
          onLoginClick={handleLoginClick}
          showHomeButton={true}
          showWriteButton={true}
          showExploreButton={true}
          showDaoButton={true}
          showProfileButton={true}
          showDraftsButton={true}
          currentPage="blog-detail"
        />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "60vh",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255, 255, 255, 0.3)",
            borderTop: "3px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: "#9ca3af" }}>加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !content) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "white" }}>
        <CommonNavbar 
          isMobile={isMobile} 
          onPageChange={onPageChange}
          onLoginClick={handleLoginClick}
          showHomeButton={true}
          showWriteButton={true}
          showExploreButton={true}
          showDaoButton={true}
          showProfileButton={true}
          showDraftsButton={true}
          currentPage="blog-detail"
        />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "60vh",
          flexDirection: "column",
          gap: "20px"
        }}>
          <p style={{ color: "#ef4444" }}>加载失败: {error || '内容不存在'}</p>
          <button
            onClick={() => onPageChange?.('feed')}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "white" }}>
      <CommonNavbar 
        isMobile={isMobile} 
        onPageChange={onPageChange}
        onLoginClick={handleLoginClick}
        showHomeButton={true}
        showWriteButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        showDraftsButton={true}
        currentPage="blog-detail"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "800px", margin: "0 auto" }}>
        {/* 博客头部 */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#9ca3af"
          }}>
            <span>{content.type || 'article'}</span>
            <span>•</span>
            <span>{calculateReadTime(content.content)} min read</span>
            <span>•</span>
            <span>{formatDate(content.created_at)}</span>
          </div>
          
          <h1 style={{
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "bold",
            marginBottom: "20px",
            lineHeight: "1.3",
            color: "white"
          }}>
            {content.title}
          </h1>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: content.author?.avatar_url 
                ? `url(${content.author.avatar_url})` 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px"
            }}>
              {content.author?.avatar_url ? '' : (content.author?.nickname?.charAt(0) || 'U')}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white" }}>
                {content.author?.nickname || '匿名用户'}
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                声誉积分: {content.author?.reputation_score || 0}
              </div>
            </div>
          </div>
          
          {/* 封面图片 */}
          <div style={{
            height: "300px",
            background: content.cover_image_url 
              ? `url(${content.cover_image_url})` 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "12px",
            marginBottom: "32px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* 如果没有封面图片，显示渐变背景 */}
            {!content.cover_image_url && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              }} />
            )}
            
            {/* 渐变遮罩，确保文字可读性 */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))"
            }} />
          </div>
        </div>

        {/* 博客内容 */}
        <div style={{ lineHeight: "1.8", fontSize: "18px" }}>
          <div style={{ 
            color: "#d1d5db",
            whiteSpace: "pre-wrap"
          }}>
            {content.content}
          </div>
        </div>

        {/* 互动区域 */}
        <div style={{
          borderTop: "1px solid #374151",
          marginTop: "40px",
          paddingTop: "32px"
        }}>
          {/* 内容互动组件 */}
          <ContentInteraction
            contentId={content.id}
            initialStats={{
              likes: content.likes,
              dislikes: content.dislikes,
              bookmarks: 0,
              shares: 0,
              views: content.views
            }}
            onStatsChange={(newStats) => {
              // 更新本地内容状态
              setContent(prev => prev ? {
                ...prev,
                likes: newStats.likes,
                dislikes: newStats.dislikes
              } : null);
            }}
          />
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "white"
            }}>
              Comments (0)
            </h3>
            
            <div style={{ marginBottom: "16px" }}>
              <textarea
                placeholder="Share your thoughts..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "white",
                  fontSize: "14px",
                  resize: "vertical"
                }}
              />
              <button style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                marginTop: "8px"
              }}>
                Post Comment
              </button>
            </div>
            
            {/* 暂无评论 */}
            <div style={{ 
              color: "#9ca3af", 
              textAlign: "center", 
              padding: "40px 20px",
              fontSize: "14px"
            }}>
              暂无评论，成为第一个评论者吧！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage; 