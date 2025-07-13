import React, { useState } from 'react';

const FollowListDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  const mockUsers = [
    {
      id: 1,
      nickname: '张三',
      bio: '区块链技术爱好者，专注于DeFi和NFT领域，致力于推动Web3生态发展',
      reputation_score: 1250,
      created_at: '2023-01-15',
      avatar_url: null,
      isFollowing: false
    },
    {
      id: 2,
      nickname: '李四',
      bio: '前端开发工程师，热爱新技术，专注于用户体验设计',
      reputation_score: 890,
      created_at: '2023-03-20',
      avatar_url: null,
      isFollowing: true
    },
    {
      id: 3,
      nickname: '王五',
      bio: '产品经理，专注于用户体验设计，擅长产品战略规划',
      reputation_score: 2100,
      created_at: '2022-11-08',
      avatar_url: null,
      isFollowing: false
    },
    {
      id: 4,
      nickname: '赵六',
      bio: '设计师，专注于UI/UX设计，热爱创造美好的用户体验',
      reputation_score: 1560,
      created_at: '2023-02-10',
      avatar_url: null,
      isFollowing: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0c1a] via-[#0f101f] to-[#0b0c1a] text-white relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* 页面标题区域 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
            <span className="text-3xl">👥</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            关注系统演示
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            展示优化后的关注列表页面效果
          </p>
        </div>

        {/* 标签切换 - 全新设计 */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#1a1b2e] to-[#151728] rounded-2xl p-2 border border-gray-700/50 shadow-2xl backdrop-blur-sm">
            <div className="flex relative">
              {/* 滑动指示器 */}
              <div 
                className={`absolute top-2 bottom-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl transition-all duration-500 ease-out shadow-lg ${
                  activeTab === 'followers' ? 'left-2 w-[calc(50%-0.5rem)]' : 'right-2 w-[calc(50%-0.5rem)]'
                }`}
                style={{
                  background: activeTab === 'followers' 
                    ? 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)' 
                    : 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)'
                }}
              />
              
              <button
                onClick={() => setActiveTab('followers')}
                className={`relative flex-1 py-6 px-8 rounded-xl font-bold transition-all duration-300 z-10 group ${
                  activeTab === 'followers'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === 'followers' ? 'animate-bounce' : ''
                  }`}>
                    👥
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold">粉丝</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                      activeTab === 'followers' 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'bg-gray-700/50 text-gray-300'
                    }`}>
                      128
                    </span>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('following')}
                className={`relative flex-1 py-6 px-8 rounded-xl font-bold transition-all duration-300 z-10 group ${
                  activeTab === 'following'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === 'following' ? 'animate-pulse' : ''
                  }`}>
                    ❤️
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold">关注</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${
                      activeTab === 'following' 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'bg-gray-700/50 text-gray-300'
                    }`}>
                      56
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 用户列表容器 */}
        <div className="bg-gradient-to-br from-[#1a1b2e] via-[#151728] to-[#1a1b2e] rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="divide-y divide-gray-700/50">
            {mockUsers.map((user, index) => (
              <div 
                key={user.id} 
                className="group p-8 hover:bg-gradient-to-r hover:from-[#1f2937]/50 hover:to-[#1a1b2e]/50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* 悬停背景效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* 用户头像 - 全新设计 */}
                    <div className="relative group/avatar">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl ring-4 ring-gray-700/50 group-hover/avatar:ring-blue-500/30 transition-all duration-300 transform group-hover/avatar:scale-110">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.nickname}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          user.nickname.charAt(0).toUpperCase()
                        )}
                      </div>
                      {/* 在线状态指示器 */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-[#1a1b2e] shadow-lg animate-pulse"></div>
                      {/* 声誉等级指示器 */}
                      {user.reputation_score > 1000 && (
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-xs font-bold">⭐</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 用户信息 - 全新设计 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-white font-bold text-2xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                          {user.nickname}
                        </h3>
                        {user.reputation_score > 1000 && (
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-sm rounded-full font-bold border border-yellow-500/30">
                            ⭐ 高声誉用户
                          </span>
                        )}
                      </div>
                      {user.bio && (
                        <p className="text-gray-300 text-lg leading-relaxed mb-4 max-w-2xl">{user.bio}</p>
                      )}
                      <div className="flex items-center space-x-8 text-sm">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">声誉积分: <span className="text-white font-bold">{user.reputation_score.toLocaleString()}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <span className="font-medium">加入时间: <span className="text-white font-bold">{new Date(user.created_at).toLocaleDateString()}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 关注按钮 */}
                  <div className="flex items-center space-x-4">
                    <button
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                        user.isFollowing
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                      }`}
                    >
                      {user.isFollowing ? '已关注' : '关注'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 - 全新设计 */}
          <div className="flex items-center justify-between p-8 border-t border-gray-700/50 bg-gradient-to-r from-[#1f2937]/50 to-[#1a1b2e]/50 backdrop-blur-sm">
            <button className="flex items-center space-x-3 px-6 py-3 rounded-xl border border-gray-600/50 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
              <span className="text-lg">←</span>
              <span>上一页</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-3 rounded-xl border border-gray-600/30">
                <span className="text-gray-300">
                  第 <span className="text-white font-bold text-lg">1</span> 页
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-300">
                  共 <span className="text-white font-bold text-lg">3</span> 页
                </span>
              </div>
            </div>
            
            <button className="flex items-center space-x-3 px-6 py-3 rounded-xl border border-gray-600/50 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
              <span>下一页</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowListDemo; 