import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import CommentSection from '../components/CommentSection';
import TipModal from '../components/TipModal';
import ReportModal from '../components/ReportModal';

interface FeedProps {
  isMobile: boolean;
}

// 博客文章接口
interface BlogPost {
  id: number;
  author: {
    name: string;
    avatar: string;
    reputation: number;
    isVerified: boolean;
    title: string;
  };
  content: {
    title: string;
    summary: string;
    body: string;
    images?: string[];
    video?: string;
    codeBlocks?: Array<{
      language: string;
      code: string;
    }>;
  };
  metadata: {
    tags: string[];
    category: string;
    readTime: number;
    publishDate: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

// 模拟博客数据
const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    author: {
      name: 'Alice Chen',
      avatar: '',
      reputation: 89,
      isVerified: true,
      title: 'DeFi 研究员'
    },
    content: {
      title: '深入解析 Uniswap V4 的 Hook 机制',
      summary: 'Uniswap V4 引入了革命性的 Hook 机制，本文将详细分析其技术实现和潜在影响...',
      body: 'Uniswap V4 的 Hook 机制是一个重大创新，它允许开发者在流动性池的生命周期中注入自定义逻辑。',
      images: ['https://via.placeholder.com/600x300/667eea/ffffff?text=Uniswap+V4+Hook'],
      codeBlocks: [
        {
          language: 'solidity',
          code: 'contract CustomHook is IHook {\n    function beforeSwap(\n        address sender,\n        address pool,\n        uint256 amount0,\n        uint256 amount1\n    ) external returns (uint256, uint256) {\n        return (amount0, amount1);\n    }\n}'
        }
      ]
    },
    metadata: {
      tags: ['DeFi', 'Uniswap', '智能合约', '流动性'],
      category: '技术分析',
      readTime: 8,
      publishDate: '2024-01-15T10:30:00Z'
    },
    stats: {
      likes: 156,
      comments: 23,
      shares: 45,
      bookmarks: 67,
      views: 1234
    },
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 2,
    author: {
      name: 'Bob Zhang',
      avatar: '',
      reputation: 234,
      isVerified: true,
      title: '区块链安全专家'
    },
    content: {
      title: 'Web3 钱包安全最佳实践指南',
      summary: '随着 Web3 生态的快速发展，钱包安全变得尤为重要。本文总结了最新的安全实践...',
      body: '在 Web3 世界中，钱包安全是用户资产的第一道防线。以下是一些关键的安全实践。',
      images: [
        'https://via.placeholder.com/600x300/48bb78/ffffff?text=Wallet+Security',
        'https://via.placeholder.com/600x300/ed8936/ffffff?text=Hardware+Wallet'
      ]
    },
    metadata: {
      tags: ['安全', '钱包', 'Web3', '最佳实践'],
      category: '安全指南',
      readTime: 5,
      publishDate: '2024-01-14T15:20:00Z'
    },
    stats: {
      likes: 89,
      comments: 12,
      shares: 34,
      bookmarks: 45,
      views: 567
    },
    isLiked: true,
    isBookmarked: true
  }
];

export default function Feed({ isMobile }: FeedProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [tipModal, setTipModal] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: 'post' | 'comment';
    authorName: string;
  }>({
    isOpen: false,
    targetId: '',
    targetType: 'post',
    authorName: ''
  });
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: 'post' | 'comment';
    targetContent?: string;
    authorName: string;
  }>({
    isOpen: false,
    targetId: '',
    targetType: 'post',
    authorName: ''
  });
  
  // 按钮涟漪效果
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  // 处理点赞
  const handleLike = (postId: number) => {
    // TODO: 调用后端接口
    // const response = await fetch(`/api/posts/${postId}/like`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' }
    // });
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            stats: { 
              ...post.stats, 
              likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1 
            }
          }
        : post
    ));
  };

  // 处理收藏
  const handleBookmark = (postId: number) => {
    // TODO: 调用后端接口
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isBookmarked: !post.isBookmarked,
            stats: { 
              ...post.stats, 
              bookmarks: post.isBookmarked ? post.stats.bookmarks - 1 : post.stats.bookmarks + 1 
            }
          }
        : post
    ));
  };
  
  // 处理打赏
  const handleTip = (postId: number, authorName: string) => {
    setTipModal({
      isOpen: true,
      targetId: postId.toString(),
      targetType: 'post',
      authorName
    });
  };

  // 处理举报
  const handleReport = (postId: number, title: string, authorName: string) => {
    setReportModal({
      isOpen: true,
      targetId: postId.toString(),
      targetType: 'post',
      targetContent: title,
      authorName
    });
  };

  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(mockBlogPosts);
      setLoading(false);
      mockBlogPosts.forEach((_, index) => {
        setTimeout(() => {
          setVisiblePosts(prev => [...prev, index]);
        }, index * 200);
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // 获取所有标签
  const allTags = Array.from(new Set(mockBlogPosts.flatMap(post => post.metadata.tags)));

  // 过滤文章
  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === 'all' || post.metadata.category === selectedCategory;
    const tagMatch = selectedTags.length === 0 || selectedTags.some(tag => post.metadata.tags.includes(tag));
    return categoryMatch && tagMatch;
  });

  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative' as const
  };
  
  const mobileContainerStyle = {
    ...containerStyle,
    padding: '20px 16px'
  };
  
  const titleStyle = {
    fontSize: '40px',
    fontWeight: 'bold',
    marginBottom: '32px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
    position: 'relative' as const
  };
  
  const mobileTitleStyle = {
    ...titleStyle,
    fontSize: '28px',
    marginBottom: '24px'
  };
  
  const titleDecoration = {
    position: 'absolute' as const,
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '3px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '2px'
  };

  // 过滤器样式
  const filterContainerStyle = {
    marginBottom: '32px',
    padding: '20px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)'
  };

  const filterTitleStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#2d3748'
  };

  const categoryContainerStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const
  };

  const categoryButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    borderRadius: '20px',
    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
    color: isActive ? 'white' : '#4a5568',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  });

  const tagsContainerStyle = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const
  };

  const tagButtonStyle = (isActive: boolean) => ({
    padding: '6px 12px',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    borderRadius: '16px',
    background: isActive ? '#667eea' : '#f7fafc',
    color: isActive ? 'white' : '#4a5568',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  });

  const blogPostStyle = {
    padding: '32px',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '20px',
    background: 'white',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    opacity: 0,
    transform: 'translateY(30px)',
    animation: 'slideInFromBottom 0.6s ease forwards'
  };
  
  const mobileBlogPostStyle = {
    ...blogPostStyle,
    padding: '24px 20px',
    marginBottom: '24px',
    borderRadius: '16px'
  };
  
  const animatedBlogPostStyle = (index: number) => ({
    ...blogPostStyle,
    opacity: visiblePosts.includes(index) ? 1 : 0,
    transform: visiblePosts.includes(index) ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.6s ease ${index * 0.2}s`
  });
  
  const animatedMobileBlogPostStyle = (index: number) => ({
    ...mobileBlogPostStyle,
    opacity: visiblePosts.includes(index) ? 1 : 0,
    transform: visiblePosts.includes(index) ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.6s ease ${index * 0.2}s`
  });

  const postHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '24px',
    gap: '16px'
  };

  const authorAvatarStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    flexShrink: 0
  };

  const authorInfoStyle = {
    flex: 1
  };

  const authorNameStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  };

  const authorNameTextStyle = {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#2d3748'
  };

  const verifiedBadgeStyle = {
    background: '#48bb78',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 'bold'
  };

  const authorTitleStyle = {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '8px'
  };

  const postMetaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '14px',
    color: '#718096'
  };

  const postTitleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '16px',
    lineHeight: '1.3'
  };

  const mobilePostTitleStyle = {
    ...postTitleStyle,
    fontSize: '22px'
  };

  const postSummaryStyle = {
    fontSize: '16px',
    color: '#4a5568',
    lineHeight: '1.6',
    marginBottom: '20px'
  };

  const tagsStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const
  };

  const tagStyle = {
    padding: '4px 12px',
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  };

  const contentPreviewStyle = {
    fontSize: '15px',
    color: '#4a5568',
    lineHeight: '1.7',
    marginBottom: '24px'
  };

  const imageContainerStyle = {
    marginBottom: '20px',
    borderRadius: '12px',
    overflow: 'hidden' as const
  };

  const imageStyle = {
    width: '100%',
    height: 'auto',
    display: 'block'
  };

  const codeBlockStyle = {
    background: '#1a202c',
    color: '#e2e8f0',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'auto' as const,
    fontSize: '14px',
    lineHeight: '1.5'
  };

  const postActionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '12px'
  };

  const actionButtonStyle = (isActive: boolean = false) => ({
    padding: '10px 16px',
    border: isActive ? 'none' : '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f7fafc',
    color: isActive ? 'white' : '#4a5568'
  });

  const statsStyle = {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
    color: '#718096'
  };

  const statItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <h1 style={isMobile ? mobileTitleStyle : titleStyle}>
        📚 Web3 博客动态
        <div style={titleDecoration}></div>
      </h1>
      
      {/* 过滤器 */}
      <div style={filterContainerStyle}>
        <div style={filterTitleStyle}>筛选内容</div>
        
        {/* 分类过滤 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>分类</div>
          <div style={categoryContainerStyle}>
            {['all', '技术分析', '安全指南', '艺术创作'].map(category => (
              <button
                key={category}
                style={categoryButtonStyle(selectedCategory === category)}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? '全部' : category}
              </button>
            ))}
          </div>
        </div>

        {/* 标签过滤 */}
        <div>
          <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>标签</div>
          <div style={tagsContainerStyle}>
            {allTags.map(tag => (
              <button
                key={tag}
                style={tagButtonStyle(selectedTags.includes(tag))}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        {loading ? (
          // 骨架屏
          [...Array(3)].map((_, index) => (
            <div key={index} style={isMobile ? mobileBlogPostStyle : blogPostStyle}>
              <div style={{ height: '200px', background: '#f0f0f0', borderRadius: '12px', marginBottom: '20px' }}></div>
              <div style={{ height: '24px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '12px', width: '70%' }}></div>
              <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '20px', width: '90%' }}></div>
            </div>
          ))
        ) : (
          // 博客文章
          filteredPosts.map((post, index) => (
            <div key={post.id}>
              <div 
                style={isMobile ? animatedMobileBlogPostStyle(index) : animatedBlogPostStyle(index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                }}
              >
                <div style={postHeaderStyle}>
                  <div style={authorAvatarStyle}>
                    {post.author.avatar || post.author.name.charAt(0)}
                  </div>
                  <div style={authorInfoStyle}>
                    <div style={authorNameStyle}>
                      <span style={authorNameTextStyle}>{post.author.name}</span>
                      {post.author.isVerified && <span style={verifiedBadgeStyle}>✓</span>}
                    </div>
                    <div style={authorTitleStyle}>{post.author.title}</div>
                    <div style={postMetaStyle}>
                      <span>声誉: {post.author.reputation}</span>
                      <span>•</span>
                      <span>{new Date(post.metadata.publishDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.metadata.readTime} 分钟阅读</span>
                    </div>
                  </div>
                </div>

                <h2 style={isMobile ? mobilePostTitleStyle : postTitleStyle}>
                  {post.content.title}
                </h2>

                <div style={postSummaryStyle}>
                  {post.content.summary}
                </div>

                <div style={tagsStyle}>
                  {post.metadata.tags.map(tag => (
                    <span key={tag} style={tagStyle}>#{tag}</span>
                  ))}
                </div>

                {/* 内容预览 */}
                <div style={contentPreviewStyle}>
                  {post.content.body}...
                </div>

                {/* 图片展示 */}
                {post.content.images && post.content.images.length > 0 && (
                  <div style={imageContainerStyle}>
                    <img 
                      src={post.content.images[0]} 
                      alt="文章配图" 
                      style={imageStyle}
                    />
                  </div>
                )}

                {/* 代码块展示 */}
                {post.content.codeBlocks && post.content.codeBlocks.length > 0 && (
                  <div style={codeBlockStyle}>
                    <div style={{ marginBottom: '8px', color: '#a0aec0' }}>
                      {post.content.codeBlocks[0].language}
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {post.content.codeBlocks[0].code}
                    </pre>
                  </div>
                )}

                <div style={postActionsStyle}>
                  <div style={actionButtonsStyle}>
                    <button 
                      style={actionButtonStyle(post.isLiked)}
                      onClick={(e) => {
                        createRipple(e);
                        handleLike(post.id);
                      }}
                    >
                      {post.isLiked ? '❤️' : '🤍'} {post.stats.likes}
                    </button>
                    <button 
                      style={actionButtonStyle()}
                      onClick={(e) => {
                        createRipple(e);
                        setSelectedPost(selectedPost === post.id ? null : post.id);
                      }}
                    >
                      💬 {post.stats.comments}
                    </button>
                    <button 
                      style={actionButtonStyle(post.isBookmarked)}
                      onClick={(e) => {
                        createRipple(e);
                        handleBookmark(post.id);
                      }}
                    >
                      {post.isBookmarked ? '🔖' : '📖'} {post.stats.bookmarks}
                    </button>
                    <button 
                      style={actionButtonStyle()}
                      onClick={(e) => {
                        createRipple(e);
                        handleTip(post.id, post.author.name);
                      }}
                    >
                      💝 打赏
                    </button>
                    <button 
                      style={actionButtonStyle()}
                      onClick={(e) => {
                        createRipple(e);
                        // TODO: 实现分享功能
                      }}
                    >
                      📤 分享
                    </button>
                    <button 
                      style={actionButtonStyle()}
                      onClick={(e) => {
                        createRipple(e);
                        handleReport(post.id, post.content.title, post.author.name);
                      }}
                    >
                      ⚠️ 举报
                    </button>
                  </div>

                  <div style={statsStyle}>
                    <div style={statItemStyle}>
                      👁️ {post.stats.views}
                    </div>
                    <div style={statItemStyle}>
                      📤 {post.stats.shares}
                    </div>
                  </div>
                </div>
              </div>

              {/* 评论区域 */}
              {selectedPost === post.id && (
                <CommentSection 
                  postId={post.id.toString()} 
                  isMobile={isMobile}
                  onTipComment={(commentId: string, authorName: string) => {
                    setTipModal({
                      isOpen: true,
                      targetId: commentId,
                      targetType: 'comment',
                      authorName
                    });
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
      
      {!loading && filteredPosts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#718096',
          fontSize: '16px'
        }}>
          <p>🔍 没有找到符合条件的文章</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            尝试调整筛选条件或稍后再试
          </p>
        </div>
      )}

      {/* 打赏模态框 */}
      <TipModal
        targetId={tipModal.targetId}
        targetType={tipModal.targetType}
        authorName={tipModal.authorName}
        isOpen={tipModal.isOpen}
        onClose={() => setTipModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* 举报模态框 */}
      <ReportModal
        targetId={reportModal.targetId}
        targetType={reportModal.targetType}
        targetContent={reportModal.targetContent}
        authorName={reportModal.authorName}
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
} 