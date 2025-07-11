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
    console.log('useAuth.checkAuthStatus - 开始检查登录状态');
    const isLoggedIn = TokenManager.isLoggedIn();
    const user = isLoggedIn ? TokenManager.getCurrentUser() : null;
    
    console.log('useAuth.checkAuthStatus - TokenManager.isLoggedIn():', isLoggedIn);
    console.log('useAuth.checkAuthStatus - user:', user);
    
    setAuthState({
      isLoggedIn,
      user,
      loading: false
    });
    
    console.log('useAuth.checkAuthStatus - setAuthState 已调用，新的状态:', { isLoggedIn, user, loading: false });
  };

  // 登录
  const login = (token: string, userInfo: UserInfo) => {
    console.log('useAuth.login - 开始登录，token:', token ? 'exists' : 'null', 'userInfo:', userInfo);
    
    TokenManager.setToken(token);
    TokenManager.setUserInfo(userInfo);
    
    console.log('useAuth.login - TokenManager 设置完成');
    
    setAuthState({
      isLoggedIn: true,
      user: userInfo,
      loading: false
    });
    
    console.log('useAuth.login - setAuthState 已调用，新的状态:', { isLoggedIn: true, user: userInfo, loading: false });
  };

  // 登出
  const logout = () => {
    TokenManager.logout();
    // 注意：logout会刷新页面，所以这里不需要更新状态
  };

  // 组件挂载时检查登录状态
  useEffect(() => {
    console.log('useAuth - 组件挂载，开始初始检查');
    checkAuthStatus();
  }, []);

  // 监听storage变化（当其他标签页登录/登出时）
  useEffect(() => {
    console.log('useAuth - 设置storage事件监听器');
    const handleStorageChange = (e: StorageEvent) => {
      console.log('useAuth - storage事件触发:', e.key);
      if (e.key === 'bondly_auth_token' || e.key === 'bondly_user_info') {
        console.log('useAuth - 检测到认证相关storage变化，重新检查状态');
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      console.log('useAuth - 移除storage事件监听器');
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 监听authState变化
  useEffect(() => {
    console.log('useAuth - authState发生变化:', authState);
  }, [authState]);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };
};

export default useAuth; 