import config from '../config/env';

// 后端统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

// 发送验证码请求参数
export interface SendCodeRequest {
  email: string;
  type: string;
}

// 发送验证码响应数据
export interface SendCodeData {
  email: string;
  expiresAt: string;
  codeId: string;
}

// 验证验证码请求参数
export interface VerifyCodeRequest {
  email: string;
  code: string;
  type: string;
}

// 验证验证码响应数据
export interface VerifyCodeData {
  email: string;
  isValid: boolean;
  token?: string;
}

// API错误类
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 基础请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.apiUrl}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    // 检查网络错误
    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP Error: ${response.status} ${response.statusText}`
      );
    }

    const result: ApiResponse<T> = await response.json();

    // 检查业务逻辑错误
    if (!result.success) {
      throw new ApiError(
        result.code,
        result.message || 'Unknown error'
      );
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络错误或其他错误
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error',
      error
    );
  }
}

// GET 请求
export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

// POST 请求
export async function post<T>(
  endpoint: string,
  data?: any
): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT 请求
export async function put<T>(
  endpoint: string,
  data?: any
): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE 请求
export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

// 认证相关API
export const authApi = {
  // 发送验证码
  async sendCode(email: string, type: string = 'register'): Promise<SendCodeData> {
    return post<SendCodeData>('/api/v1/auth/send-code', { email, type });
  },

  // 验证验证码
  async verifyCode(email: string, code: string, type: string = 'register'): Promise<VerifyCodeData> {
    return post<VerifyCodeData>('/api/v1/auth/verify-code', { email, code, type });
  },

  // 获取验证码状态
  async getCodeStatus(email: string, type: string = 'register'): Promise<any> {
    return get<any>(`/api/v1/auth/code-status?email=${encodeURIComponent(email)}&type=${type}`);
  },
};

// 用户相关API
export const userApi = {
  // 创建用户
  async createUser(userData: any): Promise<any> {
    return post<any>('/api/v1/users', userData);
  },

  // 获取用户信息
  async getUser(id: string): Promise<any> {
    return get<any>(`/api/v1/users/${id}`);
  },
};

// 导出默认的请求函数
export default { get, post, put, del, authApi, userApi, ApiError }; 