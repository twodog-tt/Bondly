import TokenManager from '../utils/token';

const API_BASE_URL = 'http://localhost:8080';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface RequestOptions {
  method: string;
  body?: string | FormData;
  headers?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...options.headers,
  };

  // 如果不是FormData，添加Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 添加认证token
  const token = TokenManager.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body,
    redirect: 'follow', // 自动跟随重定向
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (result.code !== 1000) {
    throw new Error(result.message || 'API request failed');
  }

  return result.data;
}; 