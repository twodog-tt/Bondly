import React, { useState } from 'react';
import WalletConnect from './WalletConnect';
import useAuth from '../hooks/useAuth';

interface CommonNavbarProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
  onLoginClick?: () => void;
  showHomeButton?: boolean;
  showWriteButton?: boolean;
  showExploreButton?: boolean;
  showDaoButton?: boolean;
  showProfileButton?: boolean;
  showDraftsButton?: boolean;
  currentPage?: string;
}

const CommonNavbar: React.FC<CommonNavbarProps> = ({ 
  isMobile, 
  onPageChange, 
  onLoginClick,
  showHomeButton = true,
  showWriteButton = true,
  showExploreButton = true,
  showDaoButton = true,
  showProfileButton = true,
  showDraftsButton = true,
  currentPage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // 使用认证Hook
  const { isLoggedIn, user, logout } = useAuth();

  const handleBondlyClick = () => {
    if (currentPage === "home") {
      // 如果当前在首页，刷新页面
      window.location.reload();
    } else {
      // 如果不在首页，跳转到首页
      onPageChange?.("home");
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavClick = (page: string) => {
    onPageChange?.(page);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 执行搜索逻辑 - 可以跳转到搜索结果页面或在当前页面显示结果
      console.log("搜索博客:", searchQuery);
      // 这里可以添加实际的搜索逻辑
      onPageChange?.("feed"); // 暂时跳转到博客列表页面
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 处理登出确认
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // 确认登出
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  // 取消登出
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // 处理键盘事件
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutConfirm) {
        handleCancelLogout();
      }
    };

    if (showLogoutConfirm) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showLogoutConfirm]);

  return (
    <>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: isMobile ? "16px 24px" : "16px 24px",
        borderBottom: "1px solid #374151",
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#0b0c1a"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span 
            style={{ 
              fontSize: isMobile ? "18px" : "20px", 
              fontWeight: "bold",
              color: "white",
              cursor: "pointer",
              transition: "opacity 0.2s ease"
            }}
            onClick={handleBondlyClick}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Bondly
          </span>
        </div>
        
        {/* 搜索框 - 仅在桌面端显示 */}
        {!isMobile && (
          <div style={{ 
            flex: "0 0 auto",
            marginLeft: "32px",
            marginRight: "32px"
          }}>
            <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{
                  width: "300px",
                  padding: "8px 40px 8px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: `1px solid ${isSearchFocused ? "#667eea" : "rgba(255, 255, 255, 0.2)"}`,
                  borderRadius: "20px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(10px)"
                }}
              />
              
              {/* 搜索图标 */}
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: searchQuery ? "#667eea" : "#9ca3af",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "4px",
                  transition: "color 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#667eea"}
                onMouseLeave={(e) => e.currentTarget.style.color = searchQuery ? "#667eea" : "#9ca3af"}
              >
                🔍
              </button>
            </form>
          </div>
        )}
        
        {!isMobile && (
          <nav style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
            {showHomeButton && (
              <button 
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onClick={() => onPageChange?.("home")}
              >
                Home
              </button>
            )}

            {showExploreButton && (
              <button 
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onClick={() => onPageChange?.("feed")}
              >
                Explore
              </button>
            )}
            {showDaoButton && (
              <button 
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onClick={() => onPageChange?.("dao")}
              >
                DAO
              </button>
            )}
            {showProfileButton && (
              <button 
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onClick={() => onPageChange?.("profile")}
              >
                Profile
              </button>
            )}

          </nav>
        )}
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isMobile && (
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "4px",
                transition: "background 0.2s ease"
              }}
              onClick={handleMobileMenuToggle}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          )}
          
          {/* 登录/登出按钮 */}
          {isLoggedIn ? (
            <button 
              style={{
                background: "#ef4444",
                color: "white",
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          ) : (
            /* Login 按钮 */
            onLoginClick && (
              <button 
                style={{
                  background: "white",
                  color: "black",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                onClick={onLoginClick}
              >
                Login
              </button>
            )
          )}
          
          {/* 钱包连接按钮 */}
          <WalletConnect isMobile={isMobile} />
        </div>
      </header>

      {/* 移动端菜单 */}
      {isMobile && mobileMenuOpen && (
        <div style={{
          position: "fixed",
          top: "60px",
          left: 0,
          right: 0,
          background: "#0b0c1a",
          borderBottom: "1px solid #374151",
          zIndex: 49,
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          {/* 移动端搜索框 */}
          <div style={{ marginBottom: "12px" }}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"}
              />
            </form>
          </div>

          {showHomeButton && (
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
                padding: "12px 0",
                textAlign: "left",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onClick={() => handleMobileNavClick("home")}
            >
              Home
            </button>
          )}

          {showExploreButton && (
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
                padding: "12px 0",
                textAlign: "left",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onClick={() => handleMobileNavClick("feed")}
            >
              Explore
            </button>
          )}
          {showDaoButton && (
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
                padding: "12px 0",
                textAlign: "left",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onClick={() => handleMobileNavClick("dao")}
            >
              DAO
            </button>
          )}
          {showProfileButton && (
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
                padding: "12px 0",
                textAlign: "left",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              onClick={() => handleMobileNavClick("profile")}
            >
              Profile
            </button>
          )}

        </div>
      )}

      {/* 登出确认对话框 */}
      {showLogoutConfirm && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: "20px"
          }}
          onClick={handleCancelLogout}
        >
          <div 
            style={{
              background: "#151728",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid #374151",
              textAlign: "center"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              fontSize: "48px",
              marginBottom: "16px"
            }}>
              🚪
            </div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "white"
            }}>
              Confirm Logout
            </h3>
            <p style={{
              fontSize: "16px",
              color: "#9ca3af",
              lineHeight: "1.6",
              marginBottom: "24px"
            }}>
              Are you sure you want to logout? You will need to login again to access your account.
            </p>
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center"
            }}>
              <button
                onClick={handleCancelLogout}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background: "transparent",
                  color: "#9ca3af",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#374151";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#ef4444"}
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommonNavbar; 