import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type EmailTemplateType = 
  | 'registration'
  | 'confirmation'
  | 'welcome'
  | 'cancellation'
  | 'payment_successful';

export interface EmailTemplate {
  _id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  variables?: string[];
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  htmlContent?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface EmailTemplateResponse {
  success: boolean;
  message: string;
  data: EmailTemplate;
}

export interface EmailTemplatesListResponse {
  success: boolean;
  count: number;
  data: EmailTemplate[];
}

export interface DeleteEmailTemplateResponse {
  success: boolean;
  message: string;
}

export const emailTemplateApi = {
  create: async (data: CreateEmailTemplateRequest): Promise<EmailTemplateResponse> => {
    const response = await api.post<EmailTemplateResponse>('/email-template', data);
    return response.data;
  },

  getAll: async (): Promise<EmailTemplatesListResponse> => {
    const response = await api.get<EmailTemplatesListResponse>('/email-template');
    return response.data;
  },

  getById: async (id: string): Promise<EmailTemplateResponse> => {
    const response = await api.get<EmailTemplateResponse>(`/email-template/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplateResponse> => {
    const response = await api.put<EmailTemplateResponse>(`/email-template/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteEmailTemplateResponse> => {
    const response = await api.delete<DeleteEmailTemplateResponse>(`/email-template/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<EmailTemplateResponse> => {
    const response = await api.patch<EmailTemplateResponse>(`/email-template/${id}/toggle`);
    return response.data;
  },
};
