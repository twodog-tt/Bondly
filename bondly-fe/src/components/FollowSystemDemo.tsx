import React, { useState } from 'react';

const FollowSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [followersCount, setFollowersCount] = useState(128);
  const [followingCount, setFollowingCount] = useState(56);

  const mockUsers = [
    {
      id: 1,
      nickname: '张三',
      bio: '区块链技术爱好者，专注于DeFi和NFT领域',
      reputation_score: 1250,
      created_at: '2023-01-15',
      avatar_url: null,
      isFollowing: false
    },
    {
      id: 2,
      nickname: '李四',
      bio: '前端开发工程师，热爱新技术',
      reputation_score: 890,
      created_at: '2023-03-20',
      avatar_url: null,
      isFollowing: true
    },
    {
      id: 3,
      nickname: '王五',
      bio: '产品经理，专注于用户体验设计',
      reputation_score: 2100,
      created_at: '2022-11-08',
      avatar_url: null,
      isFollowing: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0c1a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                关注系统演示
              </h1>
              <p className="text-gray-400 mt-1">
                展示优化后的关注系统UI效果
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片演示 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">统计卡片效果</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 粉丝统计卡片 */}
            <div 
              className="group cursor-pointer stats-card"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden"
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
                {followersCount}
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
              className="group cursor-pointer stats-card"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden"
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
                {followingCount}
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
            <div className="stats-card"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden"
              }}
            >
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
                1,250
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
            <div className="stats-card"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden"
              }}
            >
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
        </div>

        {/* 标签切换演示 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">标签切换效果</h2>
          <div className="bg-[#151728] rounded-xl p-1 border border-gray-700 shadow-lg">
            <div className="flex relative">
              {/* 滑动指示器 */}
              <div 
                className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-300 ease-out shadow-lg tab-slider ${
                  activeTab === 'followers' ? 'left-1 w-[calc(50%-0.25rem)]' : 'right-1 w-[calc(50%-0.25rem)]'
                }`}
              />
              
              <button
                onClick={() => setActiveTab('followers')}
                className={`relative flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 z-10 ${
                  activeTab === 'followers'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">👥</span>
                  <span>粉丝</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === 'followers' 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {followersCount}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('following')}
                className={`relative flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 z-10 ${
                  activeTab === 'following'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">❤️</span>
                  <span>关注</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === 'following' 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {followingCount}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 用户列表演示 */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">用户列表效果</h2>
          <div className="bg-[#151728] rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="divide-y divide-gray-700">
              {mockUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className="p-6 hover:bg-[#1f2937] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg user-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* 用户头像 */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg ring-2 ring-gray-600">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.nickname}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.nickname.charAt(0).toUpperCase()
                          )}
                        </div>
                        {/* 在线状态指示器 */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#151728]"></div>
                      </div>
                      
                      {/* 用户信息 */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-semibold text-lg">{user.nickname}</h3>
                          {user.reputation_score > 1000 && (
                            <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 text-xs rounded-full font-medium">
                              ⭐ 高声誉
                            </span>
                          )}
                        </div>
                        {user.bio && (
                          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{user.bio}</p>
                        )}
                        <div className="flex items-center space-x-6 mt-3 text-sm">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>声誉积分: {user.reputation_score}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>加入时间: {new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 关注按钮 */}
                    <div className="flex items-center space-x-3">
                      <button
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          user.isFollowing
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {user.isFollowing ? '已关注' : '关注'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowSystemDemo; 