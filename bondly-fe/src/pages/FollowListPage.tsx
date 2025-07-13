import React, { useState, useEffect } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import FollowButton from '../components/FollowButton';
import { getFollowers, getFollowing, UserFollowData } from '../api/follow';
import { useAuth } from '../contexts/AuthContext';

interface FollowListPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const FollowListPage: React.FC<FollowListPageProps> = ({ isMobile, onPageChange }) => {
  const { user: currentUser } = useAuth();
  
  // 从页面状态解析参数
  const getPageParams = () => {
    // 从当前页面状态获取参数
    const currentPage = window.location.pathname;
    const match = currentPage.match(/\/follow\/(\d+)\/(followers|following)/);
    if (match) {
      return {
        userId: match[1],
        type: match[2] as 'followers' | 'following'
      };
    }
    // 如果没有匹配到URL，使用当前用户的ID
    return { userId: currentUser?.user_id?.toString() || '', type: 'followers' as const };
  };
  
  const { userId, type } = getPageParams();
  
  console.log('FollowListPage - userId:', userId, 'type:', type);
  
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type as 'followers' | 'following');
  const [users, setUsers] = useState<UserFollowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const fetchUsers = async (tab: 'followers' | 'following', page: number = 1) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = tab === 'followers' 
        ? await getFollowers(parseInt(userId), page, pagination.limit)
        : await getFollowing(parseInt(userId), page, pagination.limit);

      // 兼容后端返回结构
      const res: any = response;
      let userList: UserFollowData[] = [];
      let pageInfo: any = {};
      if ('data' in res) {
        userList = tab === 'followers' ? res.data.followers || [] : res.data.following || [];
        pageInfo = res.data.pagination || {};
      } else {
        userList = tab === 'followers' ? res.followers || [] : res.following || [];
        pageInfo = res.pagination || {};
      }
      setUsers(userList);
      setPagination(pageInfo);
      
      // 更新对应标签的计数
      if (tab === 'followers') {
        setFollowersCount(pageInfo.total || 0);
      } else {
        setFollowingCount(pageInfo.total || 0);
      }
    } catch (error: any) {
      console.error(`Failed to fetch ${tab}:`, error);
      setError(error.message || `Failed to load ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsers(activeTab);
    }
  }, [userId, activeTab]);

  const handleTabChange = (tab: 'followers' | 'following') => {
    setActiveTab(tab);
    setUsers([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchUsers(activeTab, newPage);
    }
  };

  const handleFollowChange = (targetUserId: number, isFollowing: boolean) => {
    // 更新本地状态
    setUsers(prev => prev.map(user => 
      user.id === targetUserId 
        ? { ...user, isFollowing } 
        : user
    ));
  };

  const isOwnProfile = currentUser?.user_id === parseInt(userId || '0');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0c1a] via-[#0f101f] to-[#0b0c1a] text-white relative overflow-hidden">
      {/* 增强背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主装饰圆 */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* 小装饰点 */}
        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-pink-400 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '2s' }}></div>
        
                  {/* 网格背景 */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
      </div>

      <CommonNavbar 
        isMobile={isMobile} 
        onPageChange={onPageChange}
        showHomeButton={true}
        showWriteButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        showDraftsButton={true}
        currentPage="profile"
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 页面标题区域 - 增强版 */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <span className="text-4xl relative z-10">👥</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            {isOwnProfile ? '我的' : '用户'}关注关系
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            {activeTab === 'followers' 
              ? '发现关注你的优秀创作者，建立有意义的连接' 
              : '探索你关注的创作者，发现更多精彩内容'
            }
          </p>
          
          {/* 装饰线条 */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* 标签切换 - 增强版 */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-[#1a1b2e]/80 to-[#151728]/80 rounded-3xl p-3 border border-gray-700/30 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto">
            <div className="flex relative">
              {/* 滑动指示器 */}
              <div 
                className={`absolute top-3 bottom-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl transition-all duration-700 ease-out shadow-2xl ${
                  activeTab === 'followers' ? 'left-3 w-[calc(50%-0.75rem)]' : 'right-3 w-[calc(50%-0.75rem)]'
                }`}
                style={{
                  background: activeTab === 'followers' 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)' 
                    : 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)'
                }}
              />
              
              <button
                onClick={() => handleTabChange('followers')}
                className={`relative flex-1 py-8 px-10 rounded-2xl font-bold transition-all duration-500 z-10 group ${
                  activeTab === 'followers'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-4">
                  <div className={`text-3xl transition-all duration-500 group-hover:scale-110 ${
                    activeTab === 'followers' ? 'animate-bounce' : ''
                  }`}>
                    👥
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xl font-semibold">粉丝</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-500 ${
                      activeTab === 'followers' 
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                        : 'bg-gray-700/50 text-gray-300'
                    }`}>
                      {followersCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('following')}
                className={`relative flex-1 py-8 px-10 rounded-2xl font-bold transition-all duration-500 z-10 group ${
                  activeTab === 'following'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-4">
                  <div className={`text-3xl transition-all duration-500 group-hover:scale-110 ${
                    activeTab === 'following' ? 'animate-pulse' : ''
                  }`}>
                    ❤️
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xl font-semibold">关注</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-500 ${
                      activeTab === 'following' 
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                        : 'bg-gray-700/50 text-gray-300'
                    }`}>
                      {followingCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 用户列表容器 - 增强版 */}
        <div className="bg-gradient-to-br from-[#1a1b2e]/90 via-[#151728]/90 to-[#1a1b2e]/90 rounded-3xl border border-gray-700/30 shadow-2xl overflow-hidden backdrop-blur-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDelay: '1s' }}></div>
              </div>
              <p className="text-gray-300 text-xl font-medium mb-4">正在加载{activeTab === 'followers' ? '粉丝' : '关注'}列表...</p>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-white text-2xl font-bold mb-4">加载失败</h3>
              <p className="text-red-400 mb-8 text-center max-w-lg text-lg">{error}</p>
              <button
                onClick={() => fetchUsers(activeTab)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105"
              >
                重新加载
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-10 shadow-2xl">
                <span className="text-5xl">
                  {activeTab === 'followers' ? '👥' : '❤️'}
                </span>
              </div>
              <h3 className="text-white text-3xl font-bold mb-6">
                {activeTab === 'followers' ? '还没有粉丝' : '还没有关注任何人'}
              </h3>
              <p className="text-gray-400 text-center max-w-2xl leading-relaxed text-xl mb-10">
                {activeTab === 'followers' 
                  ? '分享你的精彩内容，让更多人发现你的价值。创作优质内容，建立你的影响力！' 
                  : '探索平台上的优秀创作者，关注你感兴趣的内容，建立有意义的连接。'
                }
              </p>
              <div className="flex space-x-6">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-700/30">
                {users.map((user, index) => (
                  <div 
                    key={user.id} 
                    className="group p-10 hover:bg-gradient-to-r hover:from-[#1f2937]/60 hover:to-[#1a1b2e]/60 transition-all duration-700 transform hover:scale-[1.02] hover:shadow-3xl relative overflow-hidden"
                    style={{ 
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards'
                    }}
                  >
                    {/* 悬停背景效果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* 装饰边框 */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/20 rounded-3xl transition-all duration-700"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center space-x-8">
                        {/* 用户头像 - 增强版 */}
                        <div className="relative group/avatar">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-2xl ring-4 ring-gray-700/50 group-hover/avatar:ring-blue-500/30 transition-all duration-500 transform group-hover/avatar:scale-110 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.nickname}
                                className="w-full h-full rounded-3xl object-cover relative z-10"
                              />
                            ) : (
                              <span className="relative z-10">{user.nickname.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          {/* 在线状态指示器 */}
                          <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-4 border-[#1a1b2e] shadow-lg animate-pulse"></div>
                          {/* 声誉等级指示器 */}
                          {user.reputation_score > 1000 && (
                            <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                              <span className="text-sm font-bold">⭐</span>
                            </div>
                          )}
                        </div>
                        
                        {/* 用户信息 - 增强版 */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-white font-bold text-3xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-500">
                              {user.nickname}
                            </h3>
                            {user.reputation_score > 1000 && (
                              <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-sm rounded-full font-bold border border-yellow-500/30 backdrop-blur-sm">
                                ⭐ 高声誉用户
                              </span>
                            )}
                          </div>
                          {user.bio && (
                            <p className="text-gray-300 text-xl leading-relaxed max-w-3xl">{user.bio}</p>
                          )}
                          <div className="flex items-center space-x-10 text-base">
                            <div className="flex items-center space-x-3 text-gray-400">
                              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                              <span className="font-medium">声誉积分: <span className="text-white font-bold">{user.reputation_score.toLocaleString()}</span></span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-400">
                              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                              <span className="font-medium">加入时间: <span className="text-white font-bold">{new Date(user.created_at).toLocaleDateString()}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 关注按钮 */}
                      {!isOwnProfile && currentUser?.user_id !== user.id && (
                        <div className="flex items-center space-x-4">
                          <FollowButton
                            userId={user.id}
                            isFollowing={false} // 这里需要从后端获取实际的关注状态
                            onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                            size="medium"
                            variant="outline"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 - 增强版 */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between p-10 border-t border-gray-700/30 bg-gradient-to-r from-[#1f2937]/60 to-[#1a1b2e]/60 backdrop-blur-xl">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center space-x-4 px-8 py-4 rounded-2xl border border-gray-600/50 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 font-medium shadow-lg hover:shadow-2xl transform hover:scale-105"
                  >
                    <span className="text-xl">←</span>
                    <span>上一页</span>
                  </button>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-8 py-4 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
                      <span className="text-gray-300">
                        第 <span className="text-white font-bold text-xl">{pagination.page}</span> 页
                      </span>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-300">
                        共 <span className="text-white font-bold text-xl">{pagination.total_pages}</span> 页
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="flex items-center space-x-4 px-8 py-4 rounded-2xl border border-gray-600/50 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 font-medium shadow-lg hover:shadow-2xl transform hover:scale-105"
                  >
                    <span>下一页</span>
                    <span className="text-xl">→</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListPage; 