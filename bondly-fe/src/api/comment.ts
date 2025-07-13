import { get, post, del } from '../utils/api';

// 评论相关接口类型定义
export interface Comment {
  id: number;
  post_id: number;
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
  post_id: number;
  content: string;
  parent_comment_id?: number;
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
export const getCommentList = async (params: {
  post_id: number;
  parent_comment_id?: number;
  page?: number;
  limit?: number;
}): Promise<CommentListResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('post_id', params.post_id.toString());
  if (params.parent_comment_id) {
    searchParams.append('parent_comment_id', params.parent_comment_id.toString());
  }
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const endpoint = `/api/v1/comments?${searchParams.toString()}`;
  
  const response = await get<CommentListResponse>(endpoint);
  return response;
};

// 获取单个评论详情
export const getCommentById = async (id: number): Promise<Comment> => {
  const response = await get<Comment>(`/api/v1/comments/${id}`);
  return response;
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