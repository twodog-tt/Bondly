import React, { useState, useEffect, useCallback } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import ContentInteractionSimple from '../components/ContentInteractionSimple';
import { getContentList, Content } from '../api/content';

interface BlogListPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ isMobile, onPageChange }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 获取内容列表
  const fetchContents = useCallback(async (page: number = 1, category: string = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page,
        limit: 9, // 改为每页9条，更适合3x3网格布局
        status: 'published'
      };
      
      if (category !== 'all') {
        params.type = category;
      }
      
      const response = await getContentList(params);
      
      setContents(response.contents);
      setTotalPages(response.pagination.total_pages); // 使用API返回的total_pages
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取内容失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件挂载时获取数据
  useEffect(() => {
    fetchContents(1, selectedCategory);
  }, [selectedCategory, fetchContents]);

  // 处理分类切换
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    fetchContents(page, selectedCategory);
  };

  // 处理博客点击
  const handleBlogClick = (contentId: number) => {
    // 通过URL参数传递内容ID
    const url = `${window.location.pathname}?page=blog-detail&id=${contentId}`;
    window.history.pushState({}, '', url);
    onPageChange?.('blog-detail');
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

  const handleLoginClick = () => {
    // 处理登录点击
  };

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
        currentPage="blog-list"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px" }}>
        <div style={{ 
          marginBottom: "40px",
          textAlign: "center"
        }}>
          <h1 style={{ 
            fontSize: isMobile ? "28px" : "36px", 
            fontWeight: "bold",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Blog & Articles
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: "#9ca3af",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Discover insights, tutorials, and updates about the future of decentralized social networks
          </p>
        </div>

        {/* 分类筛选 */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "32px",
          flexWrap: "wrap"
        }}>
          {['all', 'technology', 'blockchain', 'defi', 'nft', 'governance', 'tutorial', 'analysis', 'news'].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              style={{
                background: selectedCategory === category 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                  : "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              {category === 'all' ? '全部' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#9ca3af"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderTop: "3px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }}></div>
            加载中...
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div style={{
            textAlign: "center",
            padding: "40px",
            color: "#ef4444"
          }}>
            <p>加载失败: {error}</p>
            <button
              onClick={() => fetchContents(currentPage, selectedCategory)}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                marginTop: "16px"
              }}
            >
              重试
            </button>
          </div>
        )}

        {/* 内容列表 */}
        {!loading && !error && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "32px",
              maxWidth: "1200px",
              margin: "0 auto"
            }}>
              {contents.map((content) => (
                <div key={content.id} style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => handleBlogClick(content.id)}
                >
                  <div style={{
                    height: "200px",
                    background: content.cover_image_url 
                      ? `url(${content.cover_image_url})` 
                      : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
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
                    
                    {/* 类型标签 */}
                    <div style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backdropFilter: "blur(10px)"
                    }}>
                      {content.type || 'article'}
                    </div>
                    
                    {/* 阅读时间标签 */}
                    <div style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backdropFilter: "blur(10px)"
                    }}>
                      {calculateReadTime(content.content)} min
                    </div>
                    
                    {/* 渐变遮罩，确保文字可读性 */}
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60px",
                      background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))"
                    }} />
                  </div>
                  
                  <div style={{ padding: "24px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      fontSize: "14px",
                      color: "#9ca3af"
                    }}>
                      <span>{content.author?.nickname || '匿名用户'}</span>
                      <span>•</span>
                      <span>{calculateReadTime(content.content)} min read</span>
                      <span>•</span>
                      <span>{formatDate(content.created_at)}</span>
                    </div>
                    
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      marginBottom: "12px",
                      lineHeight: "1.4",
                      color: "white"
                    }}>
                      {content.title}
                    </h3>
                    
                    <p style={{
                      fontSize: "16px",
                      color: "#d1d5db",
                      lineHeight: "1.6",
                      marginBottom: "20px"
                    }}>
                      {content.content.length > 150 
                        ? content.content.substring(0, 150) + '...' 
                        : content.content}
                    </p>
                    
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <button style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        Read More
                      </button>
                      
                      <ContentInteractionSimple
                        contentId={content.id}
                        initialStats={{
                          likes: content.likes,
                          dislikes: content.dislikes,
                          bookmarks: 0,
                          shares: 0,
                          views: content.views
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "40px"
              }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      background: currentPage === page 
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                        : "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogListPage; 