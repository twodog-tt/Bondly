// Token存储键名
const TOKEN_KEY = 'bondly_auth_token';
const USER_INFO_KEY = 'bondly_user_info';

// Token工具类
export class TokenManager {
  // 存储token
  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // 获取token
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // 删除token
  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // 检查是否有token
  static hasToken(): boolean {
    return !!this.getToken();
  }

  // 存储用户信息
  static setUserInfo(userInfo: any): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  }

  // 获取用户信息
  static getUserInfo(): any | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // 删除用户信息
  static removeUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY);
  }

  // 清除所有认证信息
  static clearAuth(): void {
    this.removeToken();
    this.removeUserInfo();
  }

  // 检查token是否过期（简单检查，实际应该解析JWT）
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      // 简单的JWT过期检查（不验证签名）
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token解析失败:', error);
      return true;
    }
  }
}

// 导出默认实例
export default TokenManager; 