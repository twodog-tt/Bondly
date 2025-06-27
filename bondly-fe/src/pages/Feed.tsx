import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

interface FeedProps {
  isMobile: boolean;
}

const mockPosts = [
  {
    id: 1,
    user: 'Alice',
    avatar: '',
    content: 'web3_social_value',
    likes: 12,
    comments: 3,
    time: '2',
    timeUnit: 'hours_ago',
    reputation: 89
  },
  {
    id: 2,
    user: 'Bob',
    avatar: '',
    content: 'minted_first_nft',
    likes: 8,
    comments: 1,
    time: '4',
    timeUnit: 'hours_ago',
    reputation: 67
  },
  {
    id: 3,
    user: 'Charlie',
    avatar: '',
    content: 'reputation_system_great',
    likes: 15,
    comments: 5,
    time: '6',
    timeUnit: 'hours_ago',
    reputation: 156
  }
];

export default function Feed({ isMobile }: FeedProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState<number[]>([]);
  
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
  
  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
      // 逐个显示帖子动画
      mockPosts.forEach((_, index) => {
        setTimeout(() => {
          setVisiblePosts(prev => [...prev, index]);
        }, index * 200);
      });
    }, 500); // 0.5秒加载时间
    
    return () => clearTimeout(timer);
  }, []);
  
  const containerStyle = {
    maxWidth: '800px',
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
  
  const postStyle = {
    padding: '24px',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '16px',
    background: 'white',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    opacity: 0,
    transform: 'translateY(30px)',
    animation: 'slideInFromBottom 0.6s ease forwards'
  };
  
  const mobilePostStyle = {
    ...postStyle,
    padding: '20px 16px',
    marginBottom: '20px',
    borderRadius: '12px'
  };
  
  const animatedPostStyle = (index: number) => ({
    ...postStyle,
    opacity: visiblePosts.includes(index) ? 1 : 0,
    transform: visiblePosts.includes(index) ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.6s ease ${index * 0.2}s`
  });
  
  const animatedMobilePostStyle = (index: number) => ({
    ...mobilePostStyle,
    opacity: visiblePosts.includes(index) ? 1 : 0,
    transform: visiblePosts.includes(index) ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.6s ease ${index * 0.2}s`
  });
  
  const postDecoration = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    zIndex: 0
  };
  
  const postContent = {
    position: 'relative' as const,
    zIndex: 1
  };
  
  const postHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  };
  
  const mobilePostHeaderStyle = {
    ...postHeaderStyle,
    marginBottom: '12px'
  };
  
  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '16px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  };
  
  const mobileAvatarStyle = {
    ...avatarStyle,
    width: '40px',
    height: '40px',
    fontSize: '16px',
    marginRight: '12px'
  };
  
  const userInfoStyle = {
    flex: 1
  };
  
  const userNameStyle = {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#2d3748',
    marginBottom: '4px'
  };
  
  const mobileUserNameStyle = {
    ...userNameStyle,
    fontSize: '14px'
  };
  
  const userMetaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#718096'
  };
  
  const mobileUserMetaStyle = {
    ...userMetaStyle,
    fontSize: '12px',
    gap: '8px',
    flexWrap: 'wrap' as const
  };
  
  const reputationStyle = {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  };
  
  const contentStyle = {
    marginBottom: '20px',
    lineHeight: '1.7',
    fontSize: '16px',
    color: '#4a5568'
  };
  
  const mobileContentStyle = {
    ...contentStyle,
    fontSize: '14px',
    marginBottom: '16px'
  };
  
  const actionsStyle = {
    display: 'flex',
    gap: '12px'
  };
  
  const mobileActionsStyle = {
    ...actionsStyle,
    gap: '8px'
  };
  
  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };
  
  const mobileButtonStyle = {
    ...buttonStyle,
    padding: '8px 16px',
    fontSize: '12px',
    gap: '6px'
  };
  
  const likeButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  };
  
  const commentButtonStyle = {
    ...buttonStyle,
    background: '#f7fafc',
    color: '#4a5568',
    border: '1px solid #e2e8f0'
  };
  
  const dividerStyle = {
    height: '2px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    margin: '40px 0',
    borderRadius: '1px'
  };
  
  const loadingStyle = {
    textAlign: 'center' as const,
    color: '#718096',
    fontSize: '16px',
    padding: '40px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)'
  };
  
  // 骨架屏样式
  const skeletonPostStyle = {
    padding: '24px',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '16px',
    background: 'white',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };
  
  const skeletonHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  };
  
  const skeletonAvatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    marginRight: '16px'
  };
  
  const skeletonUserInfoStyle = {
    flex: 1
  };
  
  const skeletonUserNameStyle = {
    height: '16px',
    width: '120px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '8px'
  };
  
  const skeletonUserMetaStyle = {
    height: '12px',
    width: '80px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px'
  };
  
  const skeletonContentStyle = {
    height: '16px',
    width: '100%',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px',
    marginBottom: '8px'
  };
  
  const skeletonContentShortStyle = {
    ...skeletonContentStyle,
    width: '70%'
  };
  
  const skeletonActionsStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  };
  
  const skeletonButtonStyle = {
    height: '36px',
    width: '80px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '8px'
  };
  
  const skeletonButtonWideStyle = {
    ...skeletonButtonStyle,
    width: '100px'
  };
  
  const skeletonStatsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderRadius: '12px'
  };
  
  const mobileSkeletonStatsStyle = {
    ...skeletonStatsStyle,
    gap: '20px',
    padding: '16px',
    borderRadius: '10px'
  };
  
  const skeletonStatItemStyle = {
    textAlign: 'center' as const
  };
  
  const skeletonStatValueStyle = {
    height: '24px',
    width: '60px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px',
    margin: '0 auto 8px auto'
  };
  
  const mobileSkeletonStatValueStyle = {
    ...skeletonStatValueStyle,
    height: '20px',
    width: '50px'
  };
  
  const skeletonStatLabelStyle = {
    height: '12px',
    width: '80px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite',
    borderRadius: '4px',
    margin: '0 auto'
  };
  
  const mobileSkeletonStatLabelStyle = {
    ...skeletonStatLabelStyle,
    height: '10px',
    width: '60px'
  };
  
  const statsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderRadius: '12px'
  };
  
  const mobileStatsStyle = {
    ...statsStyle,
    gap: '20px',
    padding: '16px',
    borderRadius: '10px'
  };
  
  const statItemStyle = {
    textAlign: 'center' as const
  };
  
  const statValueStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#667eea'
  };
  
  const mobileStatValueStyle = {
    ...statValueStyle,
    fontSize: '20px'
  };
  
  const statLabelStyle = {
    fontSize: '14px',
    color: '#718096',
    marginTop: '4px'
  };
  
  const mobileStatLabelStyle = {
    ...statLabelStyle,
    fontSize: '12px'
  };
  
  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <h1 style={isMobile ? mobileTitleStyle : titleStyle}>
        📱 {t('feed_title')}
        <div style={titleDecoration}></div>
      </h1>
      
      {/* 统计信息骨架屏 */}
      {loading ? (
        <div style={isMobile ? mobileSkeletonStatsStyle : skeletonStatsStyle}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={skeletonStatItemStyle}>
              <div style={isMobile ? mobileSkeletonStatValueStyle : skeletonStatValueStyle}></div>
              <div style={isMobile ? mobileSkeletonStatLabelStyle : skeletonStatLabelStyle}></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={isMobile ? mobileStatsStyle : statsStyle}>
          <div style={statItemStyle}>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>1,234</div>
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>{t('today_active_users')}</div>
          </div>
          <div style={statItemStyle}>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>567</div>
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>{t('new_content')}</div>
          </div>
          <div style={statItemStyle}>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>89</div>
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>{t('minted_nfts')}</div>
          </div>
        </div>
      )}
      
      <div>
        {loading ? (
          // 骨架屏
          [...Array(3)].map((_, index) => (
            <div key={index} style={isMobile ? mobilePostStyle : skeletonPostStyle}>
              <div style={isMobile ? mobilePostHeaderStyle : skeletonHeaderStyle}>
                <div style={isMobile ? mobileAvatarStyle : skeletonAvatarStyle}></div>
                <div style={skeletonUserInfoStyle}>
                  <div style={skeletonUserNameStyle}></div>
                  <div style={skeletonUserMetaStyle}></div>
                </div>
              </div>
              <div style={skeletonContentStyle}></div>
              <div style={skeletonContentShortStyle}></div>
              <div style={isMobile ? mobileActionsStyle : skeletonActionsStyle}>
                <div style={skeletonButtonWideStyle}></div>
                <div style={skeletonButtonStyle}></div>
              </div>
            </div>
          ))
        ) : (
          // 真实内容
          posts.map((post, index) => (
            <div 
              key={post.id} 
              style={isMobile ? animatedMobilePostStyle(index) : animatedPostStyle(index)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={postDecoration}></div>
              <div style={postContent}>
                <div style={isMobile ? mobilePostHeaderStyle : postHeaderStyle}>
                  <div style={isMobile ? mobileAvatarStyle : avatarStyle}>
                    {post.user.charAt(0)}
                  </div>
                  <div style={userInfoStyle}>
                    <div style={isMobile ? mobileUserNameStyle : userNameStyle}>{post.user}</div>
                    <div style={isMobile ? mobileUserMetaStyle : userMetaStyle}>
                      <span>{post.time} {t(post.timeUnit)}</span>
                      <span style={reputationStyle}>{t('reputation_label')}: {post.reputation}</span>
                    </div>
                  </div>
                </div>
                <div style={isMobile ? mobileContentStyle : contentStyle}>{t(post.content)}</div>
                <div style={isMobile ? mobileActionsStyle : actionsStyle}>
                  <button 
                    style={isMobile ? { ...likeButtonStyle, ...mobileButtonStyle } : likeButtonStyle}
                    onClick={(e) => {
                      createRipple(e);
                      // 这里可以添加点赞逻辑
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ❤️ {t('like')} ({post.likes})
                  </button>
                  <button 
                    style={isMobile ? { ...commentButtonStyle, ...mobileButtonStyle } : commentButtonStyle}
                    onClick={(e) => {
                      createRipple(e);
                      // 这里可以添加评论逻辑
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#edf2f7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f7fafc';
                    }}
                  >
                    💬 {t('comment')} ({post.comments})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={dividerStyle} />
      
      {loading ? (
        <div style={loadingStyle}>
          <p>⏳ {t('loading_content')}</p>
        </div>
      ) : (
        <div style={loadingStyle}>
          <p>🚀 {t('loading_more')}</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            {t('share_thoughts')}
          </p>
        </div>
      )}
      
      <style>
        {`
          @keyframes skeleton-loading {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
} 