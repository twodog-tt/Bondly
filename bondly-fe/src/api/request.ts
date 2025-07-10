import TokenManager from '../utils/token';

const API_BASE_URL = 'http://localhost:8080';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface RequestOptions {
  method: string;
  body?: string;
  headers?: Record<string, string>;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 添加认证token
  const token = TokenManager.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (result.code !== 200) {
    throw new Error(result.message || 'API request failed');
  }

  return result.data;
}; 