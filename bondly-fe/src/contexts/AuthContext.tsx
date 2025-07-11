import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import TokenManager from '../utils/token';
import { useDisconnect } from 'wagmi';

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

// AuthContext 接口
interface AuthContextType extends AuthState {
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

// 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true
  });
  
  // 获取wagmi的断开连接方法
  const { disconnect } = useDisconnect();

  // 检查登录状态
  const checkAuthStatus = () => {
    console.log('AuthContext.checkAuthStatus - 开始检查登录状态');
    const isLoggedIn = TokenManager.isLoggedIn();
    const user = isLoggedIn ? TokenManager.getCurrentUser() : null;
    
    console.log('AuthContext.checkAuthStatus - TokenManager.isLoggedIn():', isLoggedIn);
    console.log('AuthContext.checkAuthStatus - TokenManager.getCurrentUser():', user);
    
    setAuthState({
      isLoggedIn,
      user,
      loading: false
    });
    
    console.log('AuthContext.checkAuthStatus - 设置状态完成');
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
    // 先断开钱包连接
    disconnect();
    // 然后清除认证信息并刷新页面
    TokenManager.logout();
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
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);



  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 Hook 来使用 AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 