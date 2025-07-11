import { useState, useEffect } from 'react';
import TokenManager from '../utils/token';

// 用户信息接口
export interface UserInfo {
  user_id: number;
  email: string;
  nickname: string;
  role: string;
  is_new_user: boolean;
  wallet_address?: string;
  custody_wallet_address?: string;
  bio?: string;
  avatar_url?: string;
}

// 认证状态接口
export interface AuthState {
  isLoggedIn: boolean;
  user: UserInfo | null;
  loading: boolean;
}

// 认证Hook
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true
  });

  // 检查登录状态
  const checkAuthStatus = () => {
    const isLoggedIn = TokenManager.isLoggedIn();
    const user = isLoggedIn ? TokenManager.getCurrentUser() : null;
    
    setAuthState({
      isLoggedIn,
      user,
      loading: false
    });
  };

  // 登录
  const login = (token: string, userInfo: UserInfo) => {
    TokenManager.setToken(token);
    TokenManager.setUserInfo(userInfo);
    
    setAuthState({
      isLoggedIn: true,
      user: userInfo,
      loading: false
    });
  };

  // 登出
  const logout = () => {
    TokenManager.logout();
    // 注意：logout会刷新页面，所以这里不需要更新状态
  };

  // 组件挂载时检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 监听storage变化（当其他标签页登录/登出时）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bondly_auth_token' || e.key === 'bondly_user_info') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
};

export default useAuth; 