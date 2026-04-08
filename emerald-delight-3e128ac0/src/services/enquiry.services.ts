import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Enquiry {
  _id: string;
  eventId?: {
    _id: string;
    title: string;
    topic?: string;
  };
  title: string;
  description: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnquiryRequest {
  eventId?: string;
  title: string;
  description: string;
  name: string;
  email: string;
  phone?: string;
}

export interface EnquiryResponse {
  success: boolean;
  message: string;
  data: Enquiry;
}

export interface EnquiriesListResponse {
  success: boolean;
  count: number;
  data: Enquiry[];
}

export const enquiryApi = {
  create: async (data: CreateEnquiryRequest): Promise<EnquiryResponse> => {
    const response = await api.post<EnquiryResponse>('/contact', data);
    return response.data;
  },

  getAll: async (eventId?: string): Promise<EnquiriesListResponse> => {
    const params = eventId ? { eventId } : {};
    const response = await api.get<EnquiriesListResponse>('/contact', { params });
    return response.data;
  },

  getById: async (id: string): Promise<EnquiryResponse> => {
    const response = await api.get<EnquiryResponse>(`/contact/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  },

  sendReply: async (id: string, data: { subject: string; content: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/contact/${id}/reply`, data);
    return response.data;
  },
};
