import { apiRequest } from './request';

export interface FollowUserResponse {
  message: string;
}

export interface UserFollowData {
  id: number;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  reputation_score: number;
  created_at: string;
}

export interface FollowListResponse {
  followers?: UserFollowData[];
  following?: UserFollowData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// 关注用户
export const followUser = async (userId: number): Promise<FollowUserResponse> => {
  const response = await apiRequest<FollowUserResponse>(`/api/v1/users/${userId}/follow`, {
    method: 'POST',
  });
  return response;
};

// 取消关注用户
export const unfollowUser = async (userId: number): Promise<FollowUserResponse> => {
  const response = await apiRequest<FollowUserResponse>(`/api/v1/users/${userId}/unfollow`, {
    method: 'DELETE',
  });
  return response;
};

// 获取用户的粉丝列表
export const getFollowers = async (userId: number, page: number = 1, limit: number = 10): Promise<FollowListResponse> => {
  const response = await apiRequest<FollowListResponse>(`/api/v1/users/${userId}/followers?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
  return response;
};

// 获取用户关注的人列表
export const getFollowing = async (userId: number, page: number = 1, limit: number = 10): Promise<FollowListResponse> => {
  const response = await apiRequest<FollowListResponse>(`/api/v1/users/${userId}/following?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
  return response;
}; 