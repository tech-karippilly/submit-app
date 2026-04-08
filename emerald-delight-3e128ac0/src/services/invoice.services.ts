import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type InvoiceStatus = 'paid' | 'pending' | 'refunded';
export type AttendeeType = 'professional' | 'student';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  participantId: {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  eventId: {
    _id: string;
    eventName: string;
  };
  name: string;
  email: string;
  phone: string;
  attendeeType: AttendeeType;
  amount: number;
  status: InvoiceStatus;
  isGroup: boolean;
  groupSize?: number;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceStats {
  paid: number;
  pending: number;
  refunded: number;
  total: number;
}

export interface InvoicesListResponse {
  success: boolean;
  count: number;
  data: Invoice[];
}

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  data: Invoice;
}

export interface InvoiceStatsResponse {
  success: boolean;
  data: InvoiceStats;
}

export const invoiceApi = {
  getAll: async (status?: InvoiceStatus): Promise<InvoicesListResponse> => {
    const params = status ? { status } : {};
    const response = await api.get<InvoicesListResponse>('/invoice', { params });
    return response.data;
  },

  getById: async (id: string): Promise<InvoiceResponse> => {
    const response = await api.get<InvoiceResponse>(`/invoice/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: InvoiceStatus): Promise<InvoiceResponse> => {
    const response = await api.put<InvoiceResponse>(`/invoice/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/invoice/${id}`);
    return response.data;
  },

  getStats: async (): Promise<InvoiceStatsResponse> => {
    const response = await api.get<InvoiceStatsResponse>('/invoice/stats');
    return response.data;
  },
};
