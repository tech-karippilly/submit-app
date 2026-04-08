import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type EmailIconCategory = 'logo' | 'social' | 'icon' | 'custom';

export interface EmailIcon {
  _id: string;
  name: string;
  url: string;
  publicId?: string;
  category: EmailIconCategory;
  width?: number;
  height?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailIconRequest {
  name: string;
  url: string;
  publicId?: string;
  category?: EmailIconCategory;
  width?: number;
  height?: number;
}

export interface UploadEmailIconRequest {
  file: File;
  name: string;
  category?: EmailIconCategory;
  width?: number;
  height?: number;
}

export interface EmailIconResponse {
  success: boolean;
  message: string;
  data: EmailIcon;
}

export interface EmailIconsListResponse {
  success: boolean;
  count: number;
  data: EmailIcon[];
}

export const emailIconApi = {
  create: async (data: CreateEmailIconRequest): Promise<EmailIconResponse> => {
    const response = await api.post<EmailIconResponse>('/email-icon', data);
    return response.data;
  },

  upload: async (data: UploadEmailIconRequest): Promise<EmailIconResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('name', data.name);
    if (data.category) formData.append('category', data.category);
    if (data.width) formData.append('width', data.width.toString());
    if (data.height) formData.append('height', data.height.toString());

    const response = await api.post<EmailIconResponse>('/email-icon/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (category?: EmailIconCategory): Promise<EmailIconsListResponse> => {
    const params = category ? { category } : {};
    const response = await api.get<EmailIconsListResponse>('/email-icon', { params });
    return response.data;
  },

  getById: async (id: string): Promise<EmailIconResponse> => {
    const response = await api.get<EmailIconResponse>(`/email-icon/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateEmailIconRequest>): Promise<EmailIconResponse> => {
    const response = await api.put<EmailIconResponse>(`/email-icon/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/email-icon/${id}`);
    return response.data;
  },
};
