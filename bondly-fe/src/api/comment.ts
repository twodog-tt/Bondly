import { get, post, del } from '../utils/api';

// 评论相关接口类型定义
export interface Comment {
  id: number;
  post_id?: number;
  content_id?: number;
  author_id: number;
  content: string;
  parent_comment_id?: number;
  likes: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    nickname: string;
    avatar_url?: string;
    reputation_score?: number;
  };
  child_comments?: Comment[];
}

export interface CreateCommentRequest {
  post_id?: number;
  content_id?: number;
  content: string;
  parent_comment_id?: number;
}

export interface CommentListRequest {
  post_id?: number;
  content_id?: number;
  parent_comment_id?: number;
  page?: number;
  limit?: number;
}

export interface CommentListResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// 获取评论列表
export const getCommentList = async (params: CommentListRequest): Promise<CommentListResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.post_id) {
    queryParams.append('post_id', params.post_id.toString());
  }
  if (params.content_id) {
    queryParams.append('content_id', params.content_id.toString());
  }
  if (params.parent_comment_id) {
    queryParams.append('parent_comment_id', params.parent_comment_id.toString());
  }
  if (params.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const response = await get<CommentListResponse>(`/api/v1/comments?${queryParams.toString()}`);
  return response;
};

// 获取单个评论详情
export const getCommentById = async (id: number): Promise<Comment> => {
  const response = await get<Comment>(`/api/v1/comments/${id}`);
  return response;
};

// 获取评论数量
export const getCommentCount = async (postId: number): Promise<number> => {
  const response = await get<{count: number}>(`/api/v1/comments/count?post_id=${postId}`);
  return response.count;
};

// 创建评论
export const createComment = async (data: CreateCommentRequest): Promise<Comment> => {
  const response = await post<Comment>('/api/v1/comments', data);
  return response;
};

// 删除评论
export const deleteComment = async (id: number): Promise<void> => {
  await del<void>(`/api/v1/comments/${id}`);
};

// 点赞评论
export const likeComment = async (id: number): Promise<void> => {
  await post<void>(`/api/v1/comments/${id}/like`);
};

// 取消点赞评论
export const unlikeComment = async (id: number): Promise<void> => {
  await post<void>(`/api/v1/comments/${id}/unlike`);
}; 