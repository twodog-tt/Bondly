import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import { WagmiProvider } from 'wagmi';
// import { config } from './config/wagmi';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Editor from './pages/Editor';
import Drafts from './pages/Drafts';

// 工具函数：合并样式
function getStyle(isMobile: boolean, desktop: any, mobile: any) {
  return isMobile ? { ...desktop, ...mobile } : desktop;
}

// 工具函数：渲染装饰元素
function renderDecorations(isMobile: boolean) {
  // 参数化尺寸
  const size = (d: number, m: number) => (isMobile ? m : d);
  // 参数化位置
  const pos = (d: string, m: string) => (isMobile ? m : d);
  // 参数化字体
  const font = (d: string, m: string) => (isMobile ? m : d);
  // 参数化数量
  const count = (d: number, m: number) => (isMobile ? m : d);

  // 主体装饰
  return (
    <>
      <div style={{ position: 'absolute', width: size(200, 100), height: size(200, 100), borderRadius: '50%', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', top: pos('10%', '5%'), right: pos('10%', '5%'), animation: 'float 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: size(150, 80), height: size(150, 80), borderRadius: '50%', background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(102, 126, 234, 0.08) 100%)', bottom: pos('20%', '10%'), left: pos('5%', '2%'), animation: 'float 8s ease-in-out infinite reverse' }} />
      <div style={{ position: 'absolute', width: size(100, 60), height: size(100, 60), background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%)', top: pos('60%', '40%'), right: pos('20%', '10%'), transform: 'rotate(45deg)', animation: 'float 7s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 0, height: 0, borderLeft: size(50, 30) + 'px solid transparent', borderRight: size(50, 30) + 'px solid transparent', borderBottom: size(86, 52) + 'px solid rgba(102, 126, 234, 0.05)', top: pos('30%', '20%'), left: pos('15%', '10%'), animation: 'float 9s ease-in-out infinite reverse' }} />
      {/* emoji装饰 */}
      <div style={{ position: 'absolute', top: pos('15%', '8%'), left: pos('8%', '5%'), fontSize: font('60px', '30px'), color: 'rgba(102, 126, 234, 0.15)', animation: 'float 10s ease-in-out infinite', transform: 'rotate(-15deg)' }}>🕊️</div>
      <div style={{ position: 'absolute', bottom: pos('15%', '8%'), right: pos('8%', '5%'), fontSize: font('50px', '25px'), color: 'rgba(118, 75, 162, 0.12)', animation: 'float 12s ease-in-out infinite reverse', transform: 'rotate(20deg)' }}>🫒</div>
      <div style={{ position: 'absolute', top: pos('40%', '25%'), right: pos('5%', '3%'), fontSize: font('80px', '40px'), color: 'rgba(102, 126, 234, 0.1)', animation: 'float 15s ease-in-out infinite', transform: 'rotate(5deg)' }}>🗽</div>
      <div style={{ position: 'absolute', bottom: pos('10%', '5%'), left: pos('20%', '15%'), fontSize: font('70px', '35px'), color: 'rgba(118, 75, 162, 0.1)', animation: 'float 11s ease-in-out infinite reverse' }}>🌍</div>
      <div style={{ position: 'absolute', top: pos('25%', '15%'), left: pos('25%', '15%'), fontSize: font('40px', '20px'), color: 'rgba(102, 126, 234, 0.08)', animation: 'twinkle 3s ease-in-out infinite' }}>⭐</div>
      <div style={{ position: 'absolute', top: pos('70%', '60%'), left: pos('10%', '5%'), fontSize: font('45px', '25px'), color: 'rgba(118, 75, 162, 0.1)', animation: 'pulse 4s ease-in-out infinite' }}>💙</div>
      {/* 随机点 */}
      {Array.from({ length: count(20, 10) }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', width: size(4, 2), height: size(4, 2), borderRadius: '50%', background: `rgba(102, 126, 234, ${0.1 + Math.random() * 0.2})`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />
      ))}
      {/* 随机和平符号 */}
      {Array.from({ length: count(8, 4) }).map((_, i) => (
        <div key={`peace-${i}`} style={{ position: 'absolute', fontSize: font('20px', '15px'), color: `rgba(102, 126, 234, ${0.05 + Math.random() * 0.1})`, left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`, animation: `float ${8 + Math.random() * 6}s ease-in-out infinite`, animationDelay: `${Math.random() * 3}s`, transform: `rotate(${Math.random() * 360}deg)` }}>☮️</div>
      ))}
      {/* 连接线 */}
      {Array.from({ length: count(5, 3) }).map((_, i) => (
        <div key={`line-${i}`} style={{ position: 'absolute', width: 2, height: size(100, 60), background: `linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.1) 50%, transparent 100%)`, left: `${20 + i * 15}%`, top: 0, animation: `float ${5 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }} />
      ))}
    </>
  );
}

function AppContent() {
  const { i18n, t } = useTranslation();
  const [page, setPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 点击外部区域关闭移动端菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.hamburger-button')) {
        setMobileMenuOpen(false);
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
  // 页面切换动画
  const handlePageChange = (newPage: string) => {
    if (newPage !== page) {
      setPage(newPage);
    }
  };
  
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
  
  // 优化后的样式对象
  const navBase = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000
  };
  const navStyle = { ...navBase, padding: '20px 32px' };
  const mobileNavStyle = { ...navBase, padding: '16px 20px', flexWrap: 'wrap' as const, top: 'env(safe-area-inset-top, 0px)', paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', paddingLeft: 'calc(20px + env(safe-area-inset-left, 0px))', paddingRight: 'calc(20px + env(safe-area-inset-right, 0px))' };

  const buttonStyle = {
    padding: '12px 20px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  };
  const mobileButtonStyle = { ...buttonStyle, padding: '10px 16px', fontSize: '14px' };
  const activeButtonStyle = { ...buttonStyle, background: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' };
  const mobileActiveButtonStyle = { ...mobileButtonStyle, background: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' };
  const langButtonStyle = { ...buttonStyle, fontSize: '14px', padding: '8px 16px' };
  const mobileLangButtonStyle = { ...langButtonStyle, fontSize: '12px', padding: '6px 12px' };
  const hamburgerButtonStyle = { 
    background: 'none', 
    border: 'none', 
    color: 'white', 
    fontSize: '24px', 
    cursor: 'pointer', 
    padding: '8px', 
    borderRadius: '4px', 
    transition: 'background 0.3s ease'
  };

  const backgroundDecorations = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    zIndex: 0
  };

  const containerBase = {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };
  const containerStyle = { ...containerBase, minHeight: '100vh' };
  const mobileContainerStyle = { ...containerBase, minHeight: '100dvh', backgroundAttachment: 'fixed' as const, paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' };

  const contentBase = {
    position: 'relative' as const,
    zIndex: 1
  };
  const contentStyle = { ...contentBase, padding: '40px 0', minHeight: 'calc(100vh - 100px)' };
  const mobileContentStyle = { ...contentBase, padding: '20px 0', minHeight: 'calc(100dvh - 120px)', paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' };
  
  const pageContainerStyle = {
    position: 'relative' as const,
    minHeight: '100vh'
  };
  
  const pageTransitionStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    opacity: 0,
    visibility: 'hidden' as const,
    transition: 'all 0.3s ease'
  };
  
  const loadingSpinnerStyle = {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };
  
  const keyframesStyle = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.1); opacity: 1; }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes slideInFromBottom {
      0% {
        transform: translateY(30px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideInFromRight {
      0% {
        transform: translateX(30px);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .floating-elements {
        display: none;
      }
      
      .background-decorations {
        opacity: 0.3;
      }
      
      .nav-buttons {
        font-size: 14px;
        padding: 8px 12px;
      }
      
      .content-area {
        padding: 20px 0;
      }
    }
    
    @media (max-width: 480px) {
      .nav-container {
        padding: 12px 16px;
      }
      
      .hero-section {
        padding: 30px 20px;
      }
      
      .modal-content {
        margin: 10px;
        padding: 20px;
      }
    }
  `;
  
  const mobileMenuStyle = {
    position: 'fixed' as const,
    top: 'calc(80px + env(safe-area-inset-top, 0px))',
    left: 0,
    right: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
    transition: 'transform 0.3s ease',
    zIndex: 99998,
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  };
  const mobileMenuStyleOptimized = mobileMenuStyle;
  const mobileMenuButtonStyle = {
    ...mobileButtonStyle,
    width: '100%',
    marginBottom: '12px',
    justifyContent: 'center' as const
  };
  const mobileMenuButtonActiveStyle = {
    ...mobileMenuButtonStyle,
    background: 'rgba(255,255,255,0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  };

  return (
    // <WagmiProvider config={config}>
      <div style={isMobile ? mobileContainerStyle : containerStyle}>
        <style>{keyframesStyle}</style>
        
        {/* 背景装饰元素 */}
        <div style={isMobile ? { ...backgroundDecorations, opacity: 0.3 } : backgroundDecorations}>
          {renderDecorations(isMobile)}
        </div>
        
        {/* 正常的导航栏 */}
        <nav style={isMobile ? {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        } : {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 99999,
          padding: '20px 32px'
        }}>
          {/* 桌面端导航按钮 - 平铺显示 */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
              <button 
                style={page === 'home' ? activeButtonStyle : buttonStyle} 
                onClick={(e) => {
                  createRipple(e);
                  handlePageChange('home');
                }}
                onMouseEnter={(e) => {
                  if (page !== 'home') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'home') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                🏠 {t('home')}
              </button>
              <button 
                style={page === 'feed' ? activeButtonStyle : buttonStyle} 
                onClick={(e) => {
                  createRipple(e);
                  handlePageChange('feed');
                }}
                onMouseEnter={(e) => {
                  if (page !== 'feed') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'feed') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                📱 {t('feed')}
              </button>
              <button 
                style={page === 'editor' ? activeButtonStyle : buttonStyle} 
                onClick={(e) => {
                  createRipple(e);
                  handlePageChange('editor');
                }}
                onMouseEnter={(e) => {
                  if (page !== 'editor') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'editor') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                ✍️ 创作
              </button>
              <button 
                style={page === 'drafts' ? activeButtonStyle : buttonStyle} 
                onClick={(e) => {
                  createRipple(e);
                  handlePageChange('drafts');
                }}
                onMouseEnter={(e) => {
                  if (page !== 'drafts') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'drafts') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                📝 草稿
              </button>
              <button 
                style={page === 'profile' ? activeButtonStyle : buttonStyle} 
                onClick={(e) => {
                  createRipple(e);
                  handlePageChange('profile');
                }}
                onMouseEnter={(e) => {
                  if (page !== 'profile') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'profile') {
                    const target = e.target as HTMLButtonElement;
                    target.style.background = 'rgba(255,255,255,0.1)';
                  }
                }}
              >
                👤 {t('profile')}
              </button>
            </div>
          )}
          
          {/* 移动端汉堡菜单按钮 */}
          {isMobile && (
            <button 
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '24px',
                padding: '12px',
                cursor: 'pointer',
                borderRadius: '8px',
                zIndex: 100000,
                position: 'relative',
                transition: 'all 0.3s ease',
                minWidth: '50px',
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
          
          {/* 语言切换按钮 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              style={isMobile ? mobileLangButtonStyle : langButtonStyle} 
              onClick={() => i18n.changeLanguage('zh')}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              🇨🇳 中文
            </button>
            <button 
              style={isMobile ? mobileLangButtonStyle : langButtonStyle} 
              onClick={() => i18n.changeLanguage('en')}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              🇺🇸 EN
            </button>
          </div>
        </nav>
        
        {/* 移动端菜单 - 只在移动端显示 */}
        {isMobile && (
          <div className="mobile-menu" style={mobileMenuStyleOptimized}>
            <button 
              style={page === 'home' ? mobileMenuButtonActiveStyle : mobileMenuButtonStyle} 
              onClick={(e) => {
                createRipple(e);
                handlePageChange('home');
                setMobileMenuOpen(false);
              }}
            >
              🏠 {t('home')}
            </button>
            <button 
              style={page === 'feed' ? mobileMenuButtonActiveStyle : mobileMenuButtonStyle} 
              onClick={(e) => {
                createRipple(e);
                handlePageChange('feed');
                setMobileMenuOpen(false);
              }}
            >
              📱 {t('feed')}
            </button>
            <button 
              style={page === 'editor' ? mobileMenuButtonActiveStyle : mobileMenuButtonStyle} 
              onClick={(e) => {
                createRipple(e);
                handlePageChange('editor');
                setMobileMenuOpen(false);
              }}
            >
              ✍️ 创作
            </button>
            <button 
              style={page === 'drafts' ? mobileMenuButtonActiveStyle : mobileMenuButtonStyle} 
              onClick={(e) => {
                createRipple(e);
                handlePageChange('drafts');
                setMobileMenuOpen(false);
              }}
            >
              📝 草稿
            </button>
            <button 
              style={page === 'profile' ? mobileMenuButtonActiveStyle : mobileMenuButtonStyle} 
              onClick={(e) => {
                createRipple(e);
                handlePageChange('profile');
                setMobileMenuOpen(false);
              }}
            >
              👤 {t('profile')}
            </button>
          </div>
        )}
        
        <div style={pageContainerStyle}>
          <div style={isMobile ? mobileContentStyle : contentStyle}>
            {page === 'home' && <Home isMobile={isMobile} />}
            {page === 'feed' && <Feed isMobile={isMobile} />}
            {page === 'profile' && <Profile isMobile={isMobile} />}
            {page === 'editor' && <Editor isMobile={isMobile} />}
            {page === 'drafts' && <Drafts isMobile={isMobile} />}
          </div>
        </div>
      </div>
    // </WagmiProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App; 