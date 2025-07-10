import config from '../config/env';

// 后端统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

// 发送验证码请求数据
export interface SendCodeRequest {
  email: string;
}

// 发送验证码响应数据
export interface SendCodeData {
  email: string;
  expires_in: string;
}

// 验证验证码请求数据
export interface VerifyCodeRequest {
  email: string;
  code: string;
}

// 验证验证码响应数据
export interface VerifyCodeData {
  email: string;
  isValid: boolean;
  token?: string;
  user_id?: number;
  nickname?: string;
  role?: string;
  is_new_user?: boolean;
}

// 登录请求数据
export interface LoginRequest {
  email: string;
  nickname: string;
}

// 登录响应数据
export interface LoginResponse {
  token: string;
  user_id: number;
  email: string;
  nickname: string;
  role: string;
  is_new_user: boolean;
  expires_in: string;
}

// 图片上传响应数据
export interface UploadImageData {
  url: string;
}

// 生成钱包请求数据
export interface GenerateWalletRequest {
  user_id: number;
}

// 生成钱包响应数据
export interface GenerateWalletResponse {
  user_id: number;
  nickname: string;
  custody_wallet_address: string;
  message: string;
}

// 钱包信息响应数据
export interface WalletInfoResponse {
  user_id: number;
  nickname: string;
  custody_wallet_address?: string;
  has_wallet: boolean;
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
  
  // 获取token
  const { TokenManager } = await import('./token');
  const token = TokenManager.getToken();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 合并自定义headers
  if (options.headers) {
    Object.assign(defaultHeaders, options.headers);
  }

  // 如果有token，添加到请求头
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

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

// 文件上传请求函数
async function uploadFile<T>(
  endpoint: string,
  file: File,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.apiUrl}${endpoint}`;
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      ...options,
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
  async sendCode(email: string): Promise<SendCodeData> {
    return post<SendCodeData>('/api/v1/auth/send-code', { email });
  },

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<VerifyCodeData> {
    return post<VerifyCodeData>('/api/v1/auth/verify-code', { email, code });
  },

  // 获取验证码状态
  async getCodeStatus(email: string): Promise<any> {
    return get<any>(`/api/v1/auth/code-status?email=${encodeURIComponent(email)}`);
  },

  // 用户登录
  async login(email: string, nickname: string): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/auth/login', { email, nickname });
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

// 文件上传相关API
export const uploadApi = {
  // 上传图片
  async uploadImage(file: File): Promise<UploadImageData> {
    return uploadFile<UploadImageData>('/api/v1/upload/image', file);
  },
};

// 钱包相关API
export const walletApi = {
  // 生成托管钱包
  async generateCustodyWallet(userId: number): Promise<GenerateWalletResponse> {
    return post<GenerateWalletResponse>('/api/v1/wallets/generate', { user_id: userId });
  },

  // 获取钱包信息
  async getWalletInfo(userId: number): Promise<WalletInfoResponse> {
    return get<WalletInfoResponse>(`/api/v1/wallets/${userId}`);
  },

  // 批量生成钱包
  async batchGenerateWallets(userIds: number[]): Promise<GenerateWalletResponse[]> {
    return post<GenerateWalletResponse[]>('/api/v1/wallets/batch-generate', userIds);
  },
};

// 导出默认的请求函数
export default { get, post, put, del, authApi, userApi, uploadApi, walletApi, ApiError }; 