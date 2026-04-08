import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type AttendeeType = 'professional' | 'student';

export interface PaymentFee {
  _id: string;
  attendeeType: AttendeeType;
  professional_individuals?: number;
  student_individuals?: number;
  student_group_per_head?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentFeeRequest {
  attendeeType: AttendeeType;
  professional_individuals?: number;
  student_individuals?: number;
  student_group_per_head?: number;
}

export interface UpdatePaymentFeeRequest {
  attendeeType?: AttendeeType;
  professional_individuals?: number;
  student_individuals?: number;
  student_group_per_head?: number;
  isActive?: boolean;
}

export interface PaymentFeeResponse {
  success: boolean;
  message: string;
  data: PaymentFee;
}

export interface PaymentFeesListResponse {
  success: boolean;
  count: number;
  data: PaymentFee[];
}

export interface DeletePaymentFeeResponse {
  success: boolean;
  message: string;
}

export interface ToggleStatusResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    isActive: boolean;
  };
}

export const pricingApi = {
  create: async (data: CreatePaymentFeeRequest): Promise<PaymentFeeResponse> => {
    const response = await api.post<PaymentFeeResponse>('/payment', data);
    return response.data;
  },

  getAll: async (activeOnly?: boolean): Promise<PaymentFeesListResponse> => {
    const params = activeOnly ? { active: 'true' } : {};
    const response = await api.get<PaymentFeesListResponse>('/payment', { params });
    return response.data;
  },

  getById: async (id: string): Promise<PaymentFeeResponse> => {
    const response = await api.get<PaymentFeeResponse>(`/payment/${id}`);
    return response.data;
  },

  getByType: async (type: AttendeeType): Promise<PaymentFeesListResponse> => {
    const response = await api.get<PaymentFeesListResponse>(`/payment/type/${type}`);
    return response.data;
  },

  update: async (id: string, data: UpdatePaymentFeeRequest): Promise<PaymentFeeResponse> => {
    const response = await api.put<PaymentFeeResponse>(`/payment/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ToggleStatusResponse> => {
    const response = await api.patch<ToggleStatusResponse>(`/payment/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<DeletePaymentFeeResponse> => {
    const response = await api.delete<DeletePaymentFeeResponse>(`/payment/${id}`);
    return response.data;
  },
};
