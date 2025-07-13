import React, { useState } from 'react';
import { followUser, unfollowUser } from '../api/follow';

interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing,
  onFollowChange,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(isFollowing);

  const handleFollowToggle = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
        onFollowChange?.(false);
      } else {
        await followUser(userId);
        setFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      // 可以在这里添加错误提示
    } finally {
      setLoading(false);
    }
  };

  // 尺寸样式
  const sizeStyles = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // 变体样式
  const variantStyles = {
    primary: following
      ? 'bg-gray-600 hover:bg-gray-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: following
      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      : 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    outline: following
      ? 'border border-gray-600 text-gray-600 hover:bg-gray-50'
      : 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading || disabled}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        rounded-xl font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          {following ? '取消关注中...' : '关注中...'}
        </div>
      ) : (
        following ? '取消关注' : '关注'
      )}
    </button>
  );
};

export default FollowButton; 