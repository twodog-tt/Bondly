import React, { useState } from 'react';
import WalletConnect from './WalletConnect';

interface NavbarProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
  currentPage?: string;
}

const Navbar: React.FC<NavbarProps> = ({ isMobile, onPageChange, currentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        
        {!isMobile && (
          <nav style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
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
              onClick={() => onPageChange?.("editor")}
            >
              Write
            </button>
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
            onClick={() => handleMobileNavClick("editor")}
          >
            Write
          </button>
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
        </div>
      )}
    </>
  );
};

export default Navbar; 