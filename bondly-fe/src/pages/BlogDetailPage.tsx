import React from 'react';
import CommonNavbar from '../components/CommonNavbar';

interface BlogDetailPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ isMobile, onPageChange }) => {
  const handleLoginClick = () => {
    console.log("Login clicked");
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
            <span>Technology</span>
            <span>•</span>
            <span>5 min read</span>
            <span>•</span>
            <span>January 15, 2024</span>
          </div>
          
          <h1 style={{
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "bold",
            marginBottom: "20px",
            lineHeight: "1.3",
            color: "white"
          }}>
            Web3 Social Revolution: How Bondly is Changing the Game
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
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold"
            }}>
              BT
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white" }}>Bondly Team</div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>Official Bondly Team</div>
            </div>
          </div>
          
          <div style={{
            height: "300px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            marginBottom: "32px",
            position: "relative",
            overflow: "hidden"
          }}>
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=300&fit=crop"
              alt="Blog cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: "0.8"
              }}
            />
          </div>
        </div>

        {/* 博客内容 */}
        <div style={{ lineHeight: "1.8", fontSize: "18px" }}>
          <p style={{ marginBottom: "24px", color: "#d1d5db" }}>
            The social media landscape is undergoing a revolutionary transformation, and at the forefront of this change is Bondly - a decentralized social value network that's redefining how we interact, create, and monetize content online.
          </p>
          
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "16px",
            marginTop: "32px",
            color: "white"
          }}>
            The Problem with Traditional Social Media
          </h2>
          
          <p style={{ marginBottom: "24px", color: "#d1d5db" }}>
            Traditional social media platforms have created a system where users generate massive value through their content and interactions, but see little to no financial return. The platforms themselves capture all the value, leaving creators and active users with nothing but likes and follows.
          </p>
          
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "16px",
            marginTop: "32px",
            color: "white"
          }}>
            How Bondly Solves This
          </h2>
          
          <p style={{ marginBottom: "24px", color: "#d1d5db" }}>
            Bondly introduces a revolutionary approach where every interaction becomes a valuable asset. Through our innovative staking mechanism, users can stake tokens to interact with content, creating a direct value exchange between creators and consumers.
          </p>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px"
          }}>
            <h3 style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "white"
            }}>
              Key Features:
            </h3>
            <ul style={{ color: "#d1d5db", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>Staking-based interactions that create real value</li>
              <li style={{ marginBottom: "8px" }}>NFT minting for content monetization</li>
              <li style={{ marginBottom: "8px" }}>Reputation system based on on-chain behavior</li>
              <li style={{ marginBottom: "8px" }}>DAO governance for community-driven decisions</li>
            </ul>
          </div>
          
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "16px",
            marginTop: "32px",
            color: "white"
          }}>
            The Future of Social Media
          </h2>
          
          <p style={{ marginBottom: "24px", color: "#d1d5db" }}>
            As we move towards a more decentralized web, platforms like Bondly are paving the way for a future where users truly own their data, content, and social connections. This isn't just about technology - it's about creating a more equitable and sustainable social ecosystem.
          </p>
          
          <p style={{ marginBottom: "24px", color: "#d1d5db" }}>
            The Web3 social revolution is here, and Bondly is leading the charge towards a future where every interaction matters, every creator is valued, and every user has a stake in the platform's success.
          </p>
        </div>

        {/* 互动区域 */}
        <div style={{
          borderTop: "1px solid #374151",
          marginTop: "40px",
          paddingTop: "32px"
        }}>
          <div style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px"
          }}>
            <button style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              👍 Like (24)
            </button>
            <button style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              💬 Comment (8)
            </button>
            <button style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              🔗 Share
            </button>
          </div>
          
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
              Comments (8)
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
            
            {/* 评论列表 */}
            <div style={{ color: "#d1d5db" }}>
              <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    U
                  </div>
                  <span style={{ fontWeight: "600", color: "white" }}>User123</span>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>2 hours ago</span>
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
                  This is exactly what social media needs! Can't wait to see how this develops.
                </p>
              </div>
              
              <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    C
                  </div>
                  <span style={{ fontWeight: "600", color: "white" }}>Creator456</span>
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>5 hours ago</span>
                </div>
                <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
                  As a content creator, I'm excited about the monetization possibilities here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage; 