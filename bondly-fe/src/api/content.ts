import { apiRequest } from './request';

// 内容类型定义
export interface Content {
  id: number;
  author_id: number;
  title: string;
  content: string;
  type: string;
  status: string;
  cover_image_url?: string;
  nft_token_id?: number;
  nft_contract_address?: string;
  ip_fs_hash?: string;
  metadata_hash?: string;
  likes: number;
  dislikes: number;
  views: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    nickname: string;
    avatar_url?: string;
    reputation_score?: number;
  };
}

export interface CreateContentRequest {
  title: string;
  content: string;
  type?: string;
  status?: string;
  cover_image_url?: string;
}

export interface UpdateContentRequest {
  title?: string;
  content?: string;
  type?: string;
  status?: string;
  cover_image_url?: string;
  nft_token_id?: number;
  nft_contract_address?: string;
  ip_fs_hash?: string;
  metadata_hash?: string;
}

export interface ContentListResponse {
  contents: Content[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// 获取内容列表
export const getContentList = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  author_id?: number;
  type?: string;
}): Promise<ContentListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);
  if (params?.author_id) searchParams.append('author_id', params.author_id.toString());
  if (params?.type) searchParams.append('type', params.type);

  const queryString = searchParams.toString();
  const endpoint = `/api/v1/content${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest<ContentListResponse>(endpoint, {
    method: 'GET',
  });
  return response;
};

// 获取单个内容详情
export const getContentById = async (id: number): Promise<Content> => {
  const response = await apiRequest<Content>(`/api/v1/content/${id}`, {
    method: 'GET',
  });
  return response;
};

// 创建内容
export const createContent = async (data: CreateContentRequest): Promise<Content> => {
  const response = await apiRequest<Content>('/api/v1/content', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response;
};

// 更新内容
export const updateContent = async (id: number, data: UpdateContentRequest): Promise<Content> => {
  const response = await apiRequest<Content>(`/api/v1/content/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response;
};

// 删除内容
export const deleteContent = async (id: number): Promise<void> => {
  await apiRequest<void>(`/api/v1/content/${id}`, {
    method: 'DELETE',
  });
};

// 获取用户发布的内容
export const getUserContents = async (userId: number, params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ContentListResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('author_id', userId.toString());
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.status) searchParams.append('status', params.status);

  const endpoint = `/api/v1/content?${searchParams.toString()}`;
  
  const response = await apiRequest<ContentListResponse>(endpoint, {
    method: 'GET',
  });
  return response;
};

// 获取草稿列表
export const getDrafts = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ContentListResponse> => {
  return getContentList({
    ...params,
    status: 'draft'
  });
};

// 获取已发布内容
export const getPublishedContents = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
}): Promise<ContentListResponse> => {
  return getContentList({
    ...params,
    status: 'published'
  });
}; 

// 内容互动相关接口
export interface ContentInteraction {
  id: number;
  content_id: number;
  user_id: number;
  interaction_type: 'like' | 'dislike' | 'bookmark' | 'share';
  created_at: string;
  user?: {
    id: number;
    nickname: string;
    avatar_url?: string;
  };
}

export interface CreateInteractionRequest {
  content_id: number;
  interaction_type: 'like' | 'dislike' | 'bookmark' | 'share';
}

export interface InteractionStats {
  content_id: number;
  likes: number;
  dislikes: number;
  bookmarks: number;
  shares: number;
  user_interactions: {
    liked: boolean;
    disliked: boolean;
    bookmarked: boolean;
  };
}

// 创建内容互动
export const createInteraction = async (data: CreateInteractionRequest): Promise<ContentInteraction> => {
  const response = await apiRequest<ContentInteraction>('/api/v1/content-interactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response;
};

// 删除内容互动
export const deleteInteraction = async (contentId: number, interactionType: string): Promise<void> => {
  await apiRequest<void>(`/api/v1/content-interactions/${contentId}/${interactionType}`, {
    method: 'DELETE',
  });
};

// 获取内容的互动统计
export const getInteractionStats = async (contentId: number): Promise<InteractionStats> => {
  const response = await apiRequest<InteractionStats>(`/api/v1/content-interactions/${contentId}/stats`, {
    method: 'GET',
  });
  return response;
};

// 获取用户对特定内容的互动状态
export const getUserInteractionStatus = async (contentId: number): Promise<{
  liked: boolean;
  disliked: boolean;
  bookmarked: boolean;
}> => {
  const response = await apiRequest<{
    liked: boolean;
    disliked: boolean;
    bookmarked: boolean;
  }>(`/api/v1/content-interactions/${contentId}/user-status`, {
    method: 'GET',
  });
  return response;
}; 