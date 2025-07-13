import React, { useState, useEffect } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import EditProfileModal from '../components/EditProfileModal';
import FollowButton from '../components/FollowButton';
import { useAuth } from '../contexts/AuthContext';
import { getFollowers, getFollowing } from '../api/follow';

interface ProfileProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ isMobile, onPageChange }) => {
  const { user: currentUser, checkAuthStatus, isLoggedIn, loading } = useAuth();
  
  console.log('Profile component - AuthContext state:', { currentUser, isLoggedIn, loading });
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  // 获取用户详细信息
  const fetchUserProfile = async () => {
    console.log('Profile.fetchUserProfile called, user:', currentUser);
    console.log('Profile.fetchUserProfile - user?.user_id:', currentUser?.user_id);
    console.log('Profile.fetchUserProfile - isLoggedIn:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('Profile.fetchUserProfile - User not logged in');
      setIsLoading(false);
      setError('User not logged in');
      return;
    }
    
    if (!currentUser?.user_id) {
      console.log('Profile.fetchUserProfile - No user_id found, skipping API call');
      setIsLoading(false);
      setError('User not logged in');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Calling API with user_id:', currentUser.user_id);
      const { userApi } = await import('../utils/api');
      
      try {
        const result = await userApi.getUser(currentUser.user_id.toString());
        console.log('User profile data from API:', result);
        setProfileData(result);
        
        // 获取关注统计
        await fetchFollowStats(currentUser.user_id);
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw apiError;
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取关注统计
  const fetchFollowStats = async (userId: number) => {
    try {
      const [followersResponse, followingResponse] = await Promise.all([
        getFollowers(userId, 1, 1), // 只获取第一页，用于统计总数
        getFollowing(userId, 1, 1),
      ]);
      
      setFollowStats({
        followers: followersResponse.pagination.total,
        following: followingResponse.pagination.total,
      });
    } catch (error) {
      console.error('Failed to fetch follow stats:', error);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // 组件加载时获取用户信息
  useEffect(() => {
    console.log('Profile useEffect - loading:', loading, 'user:', currentUser);
    
    // 等待AuthContext加载完成
    if (loading) {
      console.log('Profile useEffect - AuthContext still loading, skipping');
      return;
    }
    
    fetchUserProfile();
  }, [currentUser?.user_id, loading]);

  const handleSaveProfile = async (profileData: {
    nickname: string;
    bio: string;
    avatar_url?: string;
  }) => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      // 调用后端API更新用户信息
      const { userApi } = await import('../utils/api');
      const result = await userApi.updateUser(currentUser.user_id, profileData);
      
      console.log('Profile update result:', result);
      
      // API调用成功，重新获取用户信息
      await fetchUserProfile();
      
      // 刷新用户认证状态
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
            {/* 加载状态 */}
            {loading ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "40px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid rgba(102, 126, 234, 0.3)",
                  borderTop: "3px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ color: "#9ca3af" }}>Loading profile...</p>
              </div>
            ) : !isLoggedIn ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "40px"
              }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  color: "white"
                }}>
                  👤
                </div>
                <h2 style={{ color: "white", margin: "0" }}>Please Log In</h2>
                <p style={{ color: "#9ca3af", textAlign: "center", margin: "0" }}>
                  You need to log in to view your profile information.
                </p>
                <button
                  onClick={() => onPageChange?.('home')}
                  style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Go to Login
                </button>
              </div>
            ) : isLoading ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "40px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid rgba(102, 126, 234, 0.3)",
                  borderTop: "3px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ color: "#9ca3af" }}>Loading profile...</p>
              </div>
            ) : error ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                padding: "40px"
              }}>
                <p style={{ color: "#ef4444" }}>Error: {error}</p>
                <button
                  onClick={fetchUserProfile}
                  style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* 头像 */}
                <div style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: profileData?.avatar_url || currentUser?.avatar_url
                    ? `url(${profileData?.avatar_url || currentUser?.avatar_url}) center/cover`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "white",
                  flexShrink: 0
                }}>
                  {!(profileData?.avatar_url || currentUser?.avatar_url) && 
                    ((profileData?.nickname || currentUser?.nickname)?.charAt(0) || 'U')}
                </div>
                
                {/* 用户信息 */}
                <div style={{ flex: 1 }}>
                  <h1 style={{
                    fontSize: isMobile ? "24px" : "32px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "white"
                  }}>
                    {profileData?.nickname || currentUser?.nickname || 'Anonymous'}
                  </h1>
                  <p style={{
                    fontSize: "16px",
                    color: "#9ca3af",
                    marginBottom: "12px"
                  }}>
                    {profileData?.role || currentUser?.role || 'User'} • Member since {
                      profileData?.created_at 
                        ? new Date(profileData.created_at).getFullYear()
                        : '2024'
                    }
                  </p>
                  
                                    {/* 个性签名 */}
                  {(profileData?.bio || currentUser?.bio) ? (
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
                        "{profileData?.bio || currentUser?.bio}"
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
              
              {/* 统计信息 - 优化版本 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "24px"
              }}>
                {/* 粉丝统计卡片 */}
                <div 
                  className="group cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => {
                    window.history.pushState({}, '', `/follow/${currentUser?.user_id}/followers`);
                    onPageChange?.(`follow/${currentUser?.user_id}/followers`);
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "16px",
                    opacity: "0.6"
                  }}>
                    👥
                  </div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: "bold", 
                    color: "white",
                    marginBottom: "4px"
                  }}>
                    {followStats.followers}
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#9ca3af",
                    fontWeight: "500"
                  }}>
                    粉丝
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: "2px",
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                    transform: "scaleX(0)",
                    transition: "transform 0.3s ease"
                  }} className="group-hover:scale-x-100"></div>
                </div>

                {/* 关注统计卡片 */}
                <div 
                  className="group cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "20px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => {
                    window.history.pushState({}, '', `/follow/${currentUser?.user_id}/following`);
                    onPageChange?.(`follow/${currentUser?.user_id}/following`);
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "16px",
                    opacity: "0.6"
                  }}>
                    ❤️
                  </div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: "bold", 
                    color: "white",
                    marginBottom: "4px"
                  }}>
                    {followStats.following}
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#9ca3af",
                    fontWeight: "500"
                  }}>
                    关注
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    height: "2px",
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                    transform: "scaleX(0)",
                    transition: "transform 0.3s ease"
                  }} className="group-hover:scale-x-100"></div>
                </div>

                {/* 声誉积分卡片 */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "16px",
                    opacity: "0.6"
                  }}>
                    ⭐
                  </div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: "bold", 
                    color: "white",
                    marginBottom: "4px"
                  }}>
                    {profileData?.reputation_score || 0}
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#9ca3af",
                    fontWeight: "500"
                  }}>
                    声誉积分
                  </div>
                </div>

                {/* NFTs卡片 */}
                <div style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "20px",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "16px",
                    opacity: "0.6"
                  }}>
                    🎨
                  </div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: "bold", 
                    color: "white",
                    marginBottom: "4px"
                  }}>
                    12
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#9ca3af",
                    fontWeight: "500"
                  }}>
                    NFTs
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center"
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
                  {isSaving ? '保存中...' : '编辑资料'}
                </button>
                
                {/* 关注按钮 - 只在查看其他用户资料时显示 */}
                {false && (
                  <div style={{ display: "inline-block" }}>
                    <FollowButton
                      userId={currentUser?.user_id || 0}
                      isFollowing={isFollowing}
                      onFollowChange={(following) => {
                        setIsFollowing(following);
                        // 更新关注统计
                        setFollowStats(prev => ({
                          ...prev,
                          followers: following ? prev.followers + 1 : prev.followers - 1
                        }));
                      }}
                      size="medium"
                      variant="outline"
                    />
                  </div>
                )}
                
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
                  分享资料
                </button>
              </div>
            </div>
              </>
            )}
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
