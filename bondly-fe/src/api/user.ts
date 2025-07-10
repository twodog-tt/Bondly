import { apiRequest } from './request';

export interface UpdateUserRequest {
  nickname?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  reputation_score?: number;
  custody_wallet_address?: string;
  encrypted_private_key?: string;
  wallet_address?: string;
}

export interface UserResponse {
  id: number;
  wallet_address?: string;
  email?: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  reputation_score: number;
  custody_wallet_address?: string;
  encrypted_private_key?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// 更新用户信息
export const updateUser = async (userId: number, data: UpdateUserRequest): Promise<UserResponse> => {
  const response = await apiRequest<UserResponse>(`/api/v1/users/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response;
};

// 绑定用户钱包
export const bindUserWallet = async (userId: number, walletAddress: string): Promise<any> => {
  const response = await apiRequest<any>(`/api/v1/wallets/bind`, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      wallet_address: walletAddress,
    }),
  });
  return response;
};

// 根据钱包地址获取用户信息
export const getUserByWalletAddress = async (address: string): Promise<UserResponse> => {
  const response = await apiRequest<UserResponse>(`/api/v1/users/wallet/${address}`, {
    method: 'GET',
  });
  return response;
}; 