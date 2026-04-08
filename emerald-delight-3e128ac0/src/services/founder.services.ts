import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Experience {
  name: string;
  description: string;
  experienceCertificateImageUrl?: string;
}

export interface Certification {
  title: string;
  description: string;
  certificateImage?: string;
}

export interface Founder {
  _id: string;
  profileImage: {
    public_id: string;
    url: string;
  };
  fullName: string;
  title: string;
  professionalSummary: string;
  about: string;
  experience: Experience[];
  hospital: string;
  publications: string[];
  education: string[];
  certifications: Certification[];
  type: 'Founder' | 'CoFounder';
  createdAt: string;
  updatedAt: string;
}

export interface CreateFounderRequest {
  fullName: string;
  title: string;
  professionalSummary: string;
  about: string;
  hospital: string;
  education: string[];
  type: 'Founder' | 'CoFounder';
  profileImage?: {
    public_id: string;
    url: string;
  };
  experience?: Experience[];
  publications?: string[];
  certifications?: Certification[];
}

export interface UpdateFounderRequest {
  fullName?: string;
  title?: string;
  professionalSummary?: string;
  about?: string;
  hospital?: string;
  education?: string[];
  type?: 'Founder' | 'CoFounder';
  profileImage?: {
    public_id: string;
    url: string;
  };
  experience?: Experience[];
  publications?: string[];
  certifications?: Certification[];
}

export interface FounderResponse {
  success: boolean;
  message: string;
  data: Founder;
}

export interface FoundersListResponse {
  success: boolean;
  count: number;
  data: Founder[];
}

export interface DeleteFounderResponse {
  success: boolean;
  message: string;
}

export const founderApi = {
  create: async (data: CreateFounderRequest): Promise<FounderResponse> => {
    const response = await api.post<FounderResponse>('/founder', data);
    return response.data;
  },

  getAll: async (): Promise<FoundersListResponse> => {
    const response = await api.get<FoundersListResponse>('/founder');
    return response.data;
  },

  getById: async (id: string): Promise<FounderResponse> => {
    const response = await api.get<FounderResponse>(`/founder/${id}`);
    return response.data;
  },

  getByType: async (type: 'Founder' | 'CoFounder'): Promise<FoundersListResponse> => {
    const response = await api.get<FoundersListResponse>(`/founder/type/${type}`);
    return response.data;
  },

  update: async (id: string, data: UpdateFounderRequest): Promise<FounderResponse> => {
    const response = await api.put<FounderResponse>(`/founder/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteFounderResponse> => {
    const response = await api.delete<DeleteFounderResponse>(`/founder/${id}`);
    return response.data;
  },
};
