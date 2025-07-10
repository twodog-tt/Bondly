// Token管理工具
export class TokenManager {
  private static readonly TOKEN_KEY = 'bondly_auth_token';
  private static readonly USER_INFO_KEY = 'bondly_user_info';

  // 设置token
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // 获取token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // 设置用户信息
  static setUserInfo(userInfo: any): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }

  // 获取用户信息
  static getUserInfo(): any | null {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // 检查是否已登录
  static isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // 检查token是否有效（未过期）
    try {
      const payload = this.parseToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 检查token是否过期
      if (payload.exp && payload.exp < currentTime) {
        // token已过期，清除存储
        this.clearAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      // token解析失败，清除存储
      this.clearAuth();
      return false;
    }
  }

  // 解析JWT token
  static parseToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  // 获取当前用户信息（如果已登录）
  static getCurrentUser(): any | null {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.getUserInfo();
  }

  // 登出
  static logout(): void {
    this.clearAuth();
    // 刷新页面以确保所有组件重新渲染
    window.location.reload();
  }

  // 清除认证信息
  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  // 获取token过期时间
  static getTokenExpiration(): Date | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.parseToken(token);
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }

  // 检查token是否即将过期（比如5分钟内）
  static isTokenExpiringSoon(minutes: number = 5): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) {
      return false;
    }

    const currentTime = new Date();
    const timeDiff = expiration.getTime() - currentTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff <= minutes;
  }
}

export default TokenManager; 