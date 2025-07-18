import React from 'react';
import useAuth from '../contexts/AuthContext';

interface HeroSectionProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
  onLoginClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isMobile, onPageChange, onLoginClick }) => {
  const { isLoggedIn, user } = useAuth();

  return (
    <section style={{
      textAlign: "center",
      padding: isMobile ? "96px 16px" : "96px 16px",
      maxWidth: isMobile ? "99%" : "1100px",
      margin: "0 auto"
    }}>
      <h1 style={{
        fontSize: isMobile ? "36px" : "60px",
        fontWeight: "800",
        marginBottom: "16px",
        lineHeight: "1.1"
      }}>
        Write Freely.<br /> Own What You Create.
      </h1>
      <p style={{
        color: "#d1d5db",
        fontSize: "18px",
        marginBottom: "32px"
      }}>
        Build trust. Create value. Share freely.
      </p>
      
      {/* 未登录用户显示注册引导广告 */}
      {!isLoggedIn && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: "24px",
          padding: isMobile ? "24px 8px" : "40px 56px",
          marginBottom: "32px",
          border: "1px solid #23244a",
          boxShadow: "0 4px 24px rgba(102,126,234,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <h2 style={{
            fontSize: isMobile ? "24px" : "32px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "white"
          }}>
            🎁 Register Now & Get 2000 BOND Rewards!
          </h2>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "18px" : "40px",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(102,126,234,0.10) 0%, rgba(118,75,162,0.10) 100%)",
              borderRadius: "22px",
              padding: isMobile ? "18px 12px" : "32px 36px",
              minWidth: isMobile ? "auto" : "220px",
              textAlign: "center",
              boxShadow: "0 2px 16px rgba(102,126,234,0.08)",
              border: "1.5px solid #23244a",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s cubic-bezier(.4,2,.6,1)",
              backdropFilter: "blur(2px)"
            }}>
              <div style={{
                fontSize: "48px",
                marginBottom: "8px"
              }}>
                📧
              </div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "white"
              }}>
                Email Registration
              </h3>
              <p style={{
                fontSize: "14px",
                color: "#e0e7ff",
                marginBottom: "12px"
              }}>
                Register with email to get
              </p>
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#fbbf24"
              }}>
                1000 BOND
              </div>
            </div>
            
            <div style={{
              fontSize: "24px",
              color: "white",
              fontWeight: "600"
            }}>
              +
            </div>
            
            <div style={{
              background: "linear-gradient(135deg, rgba(102,126,234,0.10) 0%, rgba(118,75,162,0.10) 100%)",
              borderRadius: "22px",
              padding: isMobile ? "18px 12px" : "32px 36px",
              minWidth: isMobile ? "auto" : "220px",
              textAlign: "center",
              boxShadow: "0 2px 16px rgba(102,126,234,0.08)",
              border: "1.5px solid #23244a",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s cubic-bezier(.4,2,.6,1)",
              backdropFilter: "blur(2px)"
            }}>
              <div style={{
                fontSize: "48px",
                marginBottom: "8px"
              }}>
                🔗
              </div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "white"
              }}>
                Bind Wallet
              </h3>
              <p style={{
                fontSize: "14px",
                color: "#e0e7ff",
                marginBottom: "12px"
              }}>
                Bind personal wallet to get
              </p>
              <div style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#fbbf24"
              }}>
                1000 BOND
              </div>
            </div>
          </div>
          
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "18px" : "40px",
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <button 
              style={{
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "14px 28px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minWidth: "160px",
                boxShadow: "0 2px 16px rgba(102,126,234,0.08)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(102,126,234,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(90deg, #667eea 0%, #764ba2 100%)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 16px rgba(102,126,234,0.08)";
              }}
              onClick={onLoginClick}
            >
              🚀 Register Now
            </button>
            
            <button 
              style={{
                background: "transparent",
                color: "white",
                padding: "14px 28px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                border: "2px solid rgba(102,126,234,0.4)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minWidth: "160px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(102,126,234,0.8)";
                e.currentTarget.style.background = "rgba(102,126,234,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(102,126,234,0.4)";
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => onPageChange?.("editor")}
            >
              ✍️ Start Writing
            </button>
          </div>
          
          <p style={{
            fontSize: "12px",
            color: "#cbd5e1",
            marginTop: "16px",
            marginBottom: "0"
          }}>
            * Rewards will be automatically credited to your account after registration
          </p>
        </div>
      )}
      
      {/* 已登录用户显示正常按钮 */}
      {isLoggedIn && (
        <button 
          style={{
            background: "#2563eb",
            color: "white",
            padding: "12px 24px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#3b82f6"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
          onClick={() => onPageChange?.("editor")}
        >
          Start Writing
        </button>
      )}
    </section>
  );
};

export default HeroSection; 