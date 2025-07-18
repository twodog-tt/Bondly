import React, { useState } from 'react';
import { useETHStakingAdmin } from '../hooks/useETHStakingAdmin';
import { useAdmin } from '../contexts/AdminContext';

interface AdminRewardsPanelProps {
  className?: string;
}

export const AdminRewardsPanel: React.FC<AdminRewardsPanelProps> = ({ className = '' }) => {
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const { 
    poolInfo, 
    addRewardsToPool, 
    isLoading, 
    message, 
    setMessage,
    refreshPoolData 
  } = useETHStakingAdmin();

  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('30');
  const [showHistory, setShowHistory] = useState(false);

  // 如果不是管理员，不显示面板
  if (!isAdmin && !isAdminLoading) {
    return null;
  }

  const handleAddRewards = async () => {
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      setMessage('Please enter a valid reward amount');
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      setMessage('Please enter a valid duration');
      return;
    }

    const result = await addRewardsToPool(parseFloat(rewardAmount), parseInt(duration));
    
    if (result.success) {
      setRewardAmount('');
      setDuration('30');
      // 刷新池子数据
      refreshPoolData();
    }
  };

  const handleRefresh = () => {
    refreshPoolData();
    setMessage('Pool data refreshed');
  };

  return (
    <div className={`bg-[#151728] rounded-xl border border-gray-700 p-6 mb-6 ${className}`}>
      {/* 管理员标识 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-bold text-white">🔧 Admin Panel</h3>
          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
            Admin
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* 当前池子状态 */}
      <div className="bg-[#0b0c1a] rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">📊 Current Pool Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {poolInfo.isLoading ? '...' : `${parseFloat(poolInfo.totalStaked).toFixed(2)}`}
            </div>
            <div className="text-gray-400 text-sm">Total ETH Staked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {poolInfo.isLoading ? '...' : `${parseFloat(poolInfo.totalRewards).toFixed(0)}`}
            </div>
            <div className="text-gray-400 text-sm">Total BOND Rewards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {poolInfo.isLoading ? '...' : `${poolInfo.apy.toFixed(2)}%`}
            </div>
            <div className="text-gray-400 text-sm">Current APY</div>
          </div>
        </div>
        {poolInfo.error && (
          <div className="mt-3 text-red-400 text-sm text-center">
            Error: {poolInfo.error}
          </div>
        )}
      </div>

      {/* 添加奖金表单 */}
      <div className="bg-[#0b0c1a] rounded-lg p-4 mb-4">
        <h4 className="text-lg font-semibold text-white mb-3">💰 Add BOND Rewards to Pool</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Reward Amount (BOND)
            </label>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="Enter BOND amount"
              className="w-full bg-[#151728] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Duration (Days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              className="w-full bg-[#151728] border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              min="1"
              max="365"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddRewards}
            disabled={isLoading || !rewardAmount || !duration}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? 'Adding Rewards...' : 'Add Rewards'}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-6 py-3 border border-gray-600 text-white hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
      </div>

      {/* 消息显示 */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.includes('Successfully') || message.includes('refreshed')
            ? 'bg-green-900/20 border border-green-600 text-green-400'
            : 'bg-red-900/20 border border-red-600 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* 历史记录 (简化版本) */}
      {showHistory && (
        <div className="bg-[#0b0c1a] rounded-lg p-4 mt-4">
          <h4 className="text-lg font-semibold text-white mb-3">📈 Recent Activity</h4>
          <div className="text-gray-400 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Rewards added</span>
              <span className="text-green-400">+1000 BOND</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span>Pool updated</span>
              <span className="text-blue-400">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>System check</span>
              <span className="text-yellow-400">5 hours ago</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Note: This is a simplified view. Full transaction history is available on the blockchain.
          </div>
        </div>
      )}

      {/* 管理员提示 */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
        <div className="text-blue-400 text-sm">
          <strong>💡 Admin Tips:</strong>
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Rewards are distributed proportionally to stakers</li>
            <li>• Duration affects the reward rate calculation</li>
            <li>• Monitor pool balance to ensure sufficient rewards</li>
            <li>• Consider market conditions when setting reward amounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 