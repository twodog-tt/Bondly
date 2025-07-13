import { useState, useEffect } from "react";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './config/wagmi';
import { WalletConnectProvider } from './contexts/WalletConnectContext';
import { AuthProvider } from './contexts/AuthContext';
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Editor from "./pages/Editor";
import Drafts from "./pages/Drafts";
import BlogListPage from "./pages/BlogListPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import DaoPage from "./pages/DaoPage";
import UserPublicProfilePage from "./pages/UserPublicProfilePage";
import FollowListPage from "./pages/FollowListPage";

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
      <div
        style={{
          position: "absolute",
          width: size(200, 100),
          height: size(200, 100),
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
          top: pos("10%", "5%"),
          right: pos("10%", "5%"),
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: size(150, 80),
          height: size(150, 80),
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(118, 75, 162, 0.08) 0%, rgba(102, 126, 234, 0.08) 100%)",
          bottom: pos("20%", "10%"),
          left: pos("5%", "2%"),
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: size(100, 60),
          height: size(100, 60),
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%)",
          top: pos("60%", "40%"),
          right: pos("20%", "10%"),
          transform: "rotate(45deg)",
          animation: "float 7s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          borderLeft: size(50, 30) + "px solid transparent",
          borderRight: size(50, 30) + "px solid transparent",
          borderBottom: size(86, 52) + "px solid rgba(102, 126, 234, 0.05)",
          top: pos("30%", "20%"),
          left: pos("15%", "10%"),
          animation: "float 9s ease-in-out infinite reverse",
        }}
      />
      {/* emoji装饰 */}
      <div
        style={{
          position: "absolute",
          top: pos("15%", "8%"),
          left: pos("8%", "5%"),
          fontSize: font("60px", "30px"),
          color: "rgba(102, 126, 234, 0.15)",
          animation: "float 10s ease-in-out infinite",
          transform: "rotate(-15deg)",
        }}
      >
        🕊️
      </div>
      <div
        style={{
          position: "absolute",
          bottom: pos("15%", "8%"),
          right: pos("8%", "5%"),
          fontSize: font("50px", "25px"),
          color: "rgba(118, 75, 162, 0.12)",
          animation: "float 12s ease-in-out infinite reverse",
          transform: "rotate(20deg)",
        }}
      >
        🫒
      </div>
      <div
        style={{
          position: "absolute",
          top: pos("40%", "25%"),
          right: pos("5%", "3%"),
          fontSize: font("80px", "40px"),
          color: "rgba(102, 126, 234, 0.1)",
          animation: "float 15s ease-in-out infinite",
          transform: "rotate(5deg)",
        }}
      >
        🗽
      </div>
      <div
        style={{
          position: "absolute",
          bottom: pos("10%", "5%"),
          left: pos("20%", "15%"),
          fontSize: font("70px", "35px"),
          color: "rgba(118, 75, 162, 0.1)",
          animation: "float 11s ease-in-out infinite reverse",
        }}
      >
        🌍
      </div>
      <div
        style={{
          position: "absolute",
          top: pos("25%", "15%"),
          left: pos("25%", "15%"),
          fontSize: font("40px", "20px"),
          color: "rgba(102, 126, 234, 0.08)",
          animation: "twinkle 3s ease-in-out infinite",
        }}
      >
        ⭐
      </div>
      <div
        style={{
          position: "absolute",
          top: pos("70%", "60%"),
          left: pos("10%", "5%"),
          fontSize: font("45px", "25px"),
          color: "rgba(118, 75, 162, 0.1)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      >
        💙
      </div>
      {/* 随机点 */}
      {Array.from({ length: count(20, 10) }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: size(4, 2),
            height: size(4, 2),
            borderRadius: "50%",
            background: `rgba(102, 126, 234, ${0.1 + Math.random() * 0.2})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      {/* 随机和平符号 */}
      {Array.from({ length: count(8, 4) }).map((_, i) => (
        <div
          key={`peace-${i}`}
          style={{
            position: "absolute",
            fontSize: font("20px", "15px"),
            color: `rgba(102, 126, 234, ${0.05 + Math.random() * 0.1})`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animation: `float ${8 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          ☮️
        </div>
      ))}
      {/* 连接线 */}
      {Array.from({ length: count(5, 3) }).map((_, i) => (
        <div
          key={`line-${i}`}
          style={{
            position: "absolute",
            width: 2,
            height: size(100, 60),
            background: `linear-gradient(180deg, transparent 0%, rgba(102, 126, 234, 0.1) 50%, transparent 100%)`,
            left: `${20 + i * 15}%`,
            top: 0,
            animation: `float ${5 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </>
  );
}

function AppContent() {
  const [page, setPage] = useState("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 页面切换动画
  const handlePageChange = (newPage: string) => {
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  // 处理用户个人资料页面导航
  const handleUserProfileNavigation = (address: string) => {
    // 这里可以添加地址验证逻辑
    setPage(`user-profile-${address}`);
  };

  // 按钮涟漪效果
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "ripple 0.6s linear";
    ripple.style.pointerEvents = "none";

    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const backgroundDecorations = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none" as const,
    zIndex: 0,
  };

  const containerBase = {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: "relative" as const,
    overflow: "hidden" as const,
  };
  const containerStyle = { ...containerBase, minHeight: "100vh" };
  const mobileContainerStyle = {
    ...containerBase,
    minHeight: "100dvh",
    backgroundAttachment: "fixed" as const,
    paddingTop: "env(safe-area-inset-top, 0px)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  };

  const contentBase = {
    position: "relative" as const,
    zIndex: 1,
  };
  const contentStyle = {
    ...contentBase,
    padding: "40px 0",
    minHeight: "calc(100vh - 100px)",
  };
  const mobileContentStyle = {
    ...contentBase,
    padding: "20px 0",
    minHeight: "calc(100dvh - 120px)",
    paddingTop: "calc(20px + env(safe-area-inset-top, 0px))",
    paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
  };

  const pageContainerStyle = {
    position: "relative" as const,
    minHeight: "100vh",
  };

  const pageTransitionStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    opacity: 0,
    visibility: "hidden" as const,
    transition: "all 0.3s ease",
  };

  const loadingSpinnerStyle = {
    width: "60px",
    height: "60px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
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

  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <style>{keyframesStyle}</style>

      {/* 全局导航栏已移除 - 每个页面使用自己的导航栏 */}

      {/* 移动端菜单已移除 - 每个页面使用自己的导航栏 */}

      <div style={pageContainerStyle}>
        <div style={
          page === "home" 
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page === "feed"
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page === "blog-detail"
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page === "profile"
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page === "dao"
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page === "editor"
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page === "drafts"
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : page.startsWith("user-profile-")
            ? { ...contentBase, padding: 0, minHeight: "100vh" }
            : isMobile ? mobileContentStyle : contentStyle
        }>

          {page === "home" && <Home isMobile={isMobile} onPageChange={handlePageChange} />}
          {page === "feed" && <BlogListPage isMobile={isMobile} onPageChange={handlePageChange} />}
          {page === "profile" && <Profile isMobile={isMobile} onPageChange={handlePageChange} />}
          {page === "editor" && <Editor isMobile={isMobile} onPageChange={handlePageChange} />}
          {page === "drafts" && <Drafts isMobile={isMobile} onPageChange={handlePageChange} />}
          {page === "blog-detail" && <BlogDetailPage isMobile={isMobile} onPageChange={handlePageChange} />}
          {page === "dao" && <DaoPage isMobile={isMobile} onPageChange={handlePageChange} />}
          {page.startsWith("user-profile-") && <UserPublicProfilePage isMobile={isMobile} onPageChange={handlePageChange} />}
          {page.startsWith("follow/") && <FollowListPage isMobile={isMobile} onPageChange={handlePageChange} />}
        </div>
      </div>
    </div>
  );
}

// 创建 QueryClient 实例
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          <WalletConnectProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </WalletConnectProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
