import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Member interface for group registration
export interface IMember {
  full_name: string;
  email: string;
  phone: string;
  isLeader?: boolean;
}

// Student Individual Registration
export interface RegisterStudentIndividualRequest {
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  isStudent: true;
  isGroup: false;
  collageName: string;
  course: string;
  registrationFee: number;
}

// Student Group Registration
export interface RegisterStudentGroupRequest {
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  isStudent: true;
  isGroup: true;
  collageName: string;
  course: string;
  members: IMember[];
  registrationFee: number;
}

// Professional Registration
export interface RegisterProfessionalRequest {
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  isStudent: false;
  designation: string;
  organization: string;
  yearsOfExperience: number;
  registrationFee: number;
}

// Union type for all registration types
export type RegisterParticipantRequest =
  | RegisterStudentIndividualRequest
  | RegisterStudentGroupRequest
  | RegisterProfessionalRequest;

// Participant response data
export interface Participant {
  _id: string;
  eventId: string;
  full_name: string;
  email: string;
  phone: string;
  designation?: string;
  organization?: string;
  yearsOfExperience?: number;
  registraionFee: number;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'processed' | 'refunded';
  isStudent?: boolean;
  collageName?: string;
  course?: string;
  yearofStudy?: string;
  studentId?: string;
  isGroup?: boolean;
  sizeOfGroup?: number;
  members?: IMember[];
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface RegisterParticipantResponse {
  success: boolean;
  message: string;
  data: Participant;
}

export interface ParticipantsListResponse {
  success: boolean;
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: Participant[];
}

export interface ParticipantsQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface ParticipantResponse {
  success: boolean;
  message: string;
  data: Participant;
}

export interface DeleteParticipantResponse {
  success: boolean;
  message: string;
}

export const participantsApi = {
  /**
   * Register a student as an individual
   */
  registerStudentIndividual: async (
    data: Omit<RegisterStudentIndividualRequest, 'isStudent' | 'isGroup'>
  ): Promise<RegisterParticipantResponse> => {
    const payload: RegisterStudentIndividualRequest = {
      ...data,
      isStudent: true,
      isGroup: false,
    };
    const response = await api.post<RegisterParticipantResponse>('/participant/register', payload);
    return response.data;
  },

  /**
   * Register a student as a group
   */
  registerStudentGroup: async (
    data: Omit<RegisterStudentGroupRequest, 'isStudent' | 'isGroup'>
  ): Promise<RegisterParticipantResponse> => {
    const payload: RegisterStudentGroupRequest = {
      ...data,
      isStudent: true,
      isGroup: true,
    };
    const response = await api.post<RegisterParticipantResponse>('/participant/register', payload);
    return response.data;
  },

  /**
   * Register a professional (individual only)
   */
  registerProfessional: async (
    data: Omit<RegisterProfessionalRequest, 'isStudent'>
  ): Promise<RegisterParticipantResponse> => {
    const payload: RegisterProfessionalRequest = {
      ...data,
      isStudent: false,
    };
    const response = await api.post<RegisterParticipantResponse>('/participant/register', payload);
    return response.data;
  },

  /**
   * Get all participants with pagination and filtering
   */
  getAll: async (params?: ParticipantsQueryParams): Promise<ParticipantsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/participant?${queryString}` : '/participant';
    const response = await api.get<ParticipantsListResponse>(url);
    return response.data;
  },

  /**
   * Get participants by event ID
   */
  getByEventId: async (eventId: string): Promise<ParticipantsListResponse> => {
    const response = await api.get<ParticipantsListResponse>(`/participant/event/${eventId}`);
    return response.data;
  },

  /**
   * Get paid participants by event ID (for refunds)
   */
  getPaidParticipantsByEvent: async (eventId: string): Promise<ParticipantsListResponse> => {
    const response = await api.get<ParticipantsListResponse>(`/participant/event/${eventId}/paid`);
    return response.data;
  },

  /**
   * Get participant by ID
   */
  getById: async (id: string): Promise<ParticipantResponse> => {
    const response = await api.get<ParticipantResponse>(`/participant/${id}`);
    return response.data;
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (
    id: string,
    paymentStatus: 'paid' | 'unpaid' | 'pending' | 'processed' | 'refunded'
  ): Promise<ParticipantResponse> => {
    const response = await api.patch<ParticipantResponse>(`/participant/${id}/payment`, {
      paymentStatus,
    });
    return response.data;
  },

  /**
   * Process refund for a participant
   */
  processRefund: async (
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    const response = await api.post<{ success: boolean; message: string; data?: any }>(
      `/participant/${id}/refund`,
      { reason }
    );
    return response.data;
  },

  /**
   * Send payment link email to participant
   */
  sendPaymentLink: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/participant/${id}/send-payment-link`
    );
    return response.data;
  },

  /**
   * Delete participant
   */
  delete: async (id: string): Promise<DeleteParticipantResponse> => {
    const response = await api.delete<DeleteParticipantResponse>(`/participant/${id}`);
    return response.data;
  },
};
