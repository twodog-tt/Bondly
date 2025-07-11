import React, { useState } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../hooks/useAuth';

interface ProfileProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ isMobile, onPageChange }) => {
  const { user, checkAuthStatus } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (profileData: {
    nickname: string;
    bio: string;
    avatar_url?: string;
  }) => {
    if (!user) return;

    setIsSaving(true);
    try {
      // 调用后端API更新用户信息
      const { userApi } = await import('../utils/api');
      const result = await userApi.updateUser(user.user_id, profileData);
      
      console.log('Profile update result:', result);
      
      // API调用成功，直接处理结果
      // 刷新用户信息
      checkAuthStatus();
      
      // 关闭弹窗
      setShowEditModal(false);
      
      // 显示成功消息
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
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
        currentPage="profile"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "1000px", margin: "0 auto" }}>
        {/* 个人信息区域 */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "24px",
            alignItems: isMobile ? "center" : "flex-start"
          }}>
            {/* 头像 */}
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: user?.avatar_url 
                ? `url(${user.avatar_url}) center/cover`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
              flexShrink: 0
            }}>
              {!user?.avatar_url && (user?.nickname?.charAt(0) || 'U')}
            </div>
            
            {/* 用户信息 */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: isMobile ? "24px" : "32px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "white"
              }}>
                {user?.nickname || 'Anonymous'}
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#9ca3af",
                marginBottom: "12px"
              }}>
                {user?.role || 'User'} • Member since 2024
              </p>
              
              {/* 个性签名 */}
              {user?.bio ? (
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px"
                  }}>
                    <span style={{
                      fontSize: "16px",
                      color: "#667eea"
                    }}>
                      💬
                    </span>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Bio
                    </span>
                  </div>
                  <p style={{
                    fontSize: "15px",
                    color: "#e5e7eb",
                    lineHeight: "1.6",
                    margin: 0,
                    fontStyle: "italic"
                  }}>
                    "{user.bio}"
                  </p>
                </div>
              ) : (
                <div style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px dashed rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  textAlign: "center"
                }}>
                  <p style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: 0,
                    fontStyle: "italic"
                  }}>
                    No bio yet. Click "Edit Profile" to add your personal signature.
                  </p>
                </div>
              )}
              
              {/* 统计信息 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "24px"
              }}>
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>1,234</div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>Reputation</div>
                </div>
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>Level 5</div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>Level</div>
                </div>
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>567</div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>Bond Tokens</div>
                </div>
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>12</div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>NFTs</div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap"
              }}>
                <button 
                  onClick={handleEditProfile}
                  style={{
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
                  {isSaving ? 'Saving...' : 'Edit Profile'}
                </button>
                <button style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                >
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
          gap: "32px"
        }}>
          {/* 左侧：文章和活动 */}
          <div>
            {/* 最近活动 */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "white"
              }}>
                Recent Activities
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500", color: "white" }}>Published new article</div>
                    <div style={{ fontSize: "14px", color: "#9ca3af" }}>2 hours ago</div>
                  </div>
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    ❤️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500", color: "white" }}>Received 15 likes</div>
                    <div style={{ fontSize: "14px", color: "#9ca3af" }}>5 hours ago</div>
                  </div>
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    🎨
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "500", color: "white" }}>Minted new NFT</div>
                    <div style={{ fontSize: "14px", color: "#9ca3af" }}>1 day ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 发布的文章 */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "white"
              }}>
                Published Articles
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  padding: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                onClick={() => onPageChange?.("blog-detail")}
                >
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "white"
                  }}>
                    Web3 Social Revolution: How Bondly is Changing the Game
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                    lineHeight: "1.5"
                  }}>
                    Explore how Bondly is revolutionizing social media through blockchain technology...
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#6b7280"
                  }}>
                    <span>5 min read</span>
                    <span>•</span>
                    <span>Jan 15, 2024</span>
                    <span>•</span>
                    <span>24 likes</span>
                  </div>
                </div>
                
                <div style={{
                  padding: "16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                >
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "white"
                  }}>
                    The Future of Decentralized Social Networks
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                    lineHeight: "1.5"
                  }}>
                    Discover the potential of decentralized social platforms and how they're reshaping...
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#6b7280"
                  }}>
                    <span>7 min read</span>
                    <span>•</span>
                    <span>Jan 12, 2024</span>
                    <span>•</span>
                    <span>18 likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：NFT展示和钱包信息 */}
          <div>
            {/* NFT展示 */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "white"
              }}>
                My NFTs
              </h2>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px"
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    🎨
                  </div>
                ))}
              </div>
            </div>

            {/* 钱包管理 */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "white"
              }}>
                Wallet Management
              </h2>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px"
                }}>
                  <span style={{ color: "#9ca3af" }}>Current Wallet</span>
                  <span style={{ color: "white", fontSize: "14px" }}>0x1234...5678</span>
                </div>
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px"
                }}>
                  <span style={{ color: "#9ca3af" }}>Network</span>
                  <span style={{ color: "white", fontSize: "14px" }}>Ethereum Mainnet</span>
                </div>
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px"
                }}>
                  <span style={{ color: "#9ca3af" }}>Connection Status</span>
                  <span style={{ 
                    color: "#10b981", 
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981"
                    }}></div>
                    Connected
                  </span>
                </div>
              </div>
              
              <button style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                width: "100%",
                marginTop: "16px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        isMobile={isMobile}
      />
    </div>
  );
};

export default Profile;
