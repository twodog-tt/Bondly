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