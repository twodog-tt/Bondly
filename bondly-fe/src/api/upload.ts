import { apiRequest } from './request';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

// 上传图片
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiRequest<UploadResponse>('/api/v1/upload/image', {
    method: 'POST',
    body: formData,
  });
  return response;
};

// 上传多个图片
export const uploadImages = async (files: File[]): Promise<UploadResponse[]> => {
  const uploadPromises = files.map(file => uploadImage(file));
  return Promise.all(uploadPromises);
}; 