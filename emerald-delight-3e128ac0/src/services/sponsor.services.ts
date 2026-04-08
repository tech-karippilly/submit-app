import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type SponsorTier = 'diamond' | 'platinum' | 'gold';
export type SponsorType = 'sponsor' | 'partner';

export interface Sponsor {
  _id: string;
  name: string;
  description: string;
  logo: {
    public_id: string;
    url: string;
  };
  tier: SponsorTier;
  type: SponsorType;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorRequest {
  name: string;
  description: string;
  tier: SponsorTier;
  type: SponsorType;
  logo?: {
    public_id: string;
    url: string;
  };
  website?: string;
  isActive?: boolean;
}

export interface UpdateSponsorRequest {
  name?: string;
  description?: string;
  tier?: SponsorTier;
  type?: SponsorType;
  logo?: {
    public_id: string;
    url: string;
  };
  website?: string;
  isActive?: boolean;
}

export interface SponsorResponse {
  success: boolean;
  message: string;
  data: Sponsor;
}

export interface SponsorsListResponse {
  success: boolean;
  count: number;
  data: Sponsor[];
}

export interface DeleteSponsorResponse {
  success: boolean;
  message: string;
}

export const sponsorApi = {
  create: async (data: CreateSponsorRequest): Promise<SponsorResponse> => {
    const response = await api.post<SponsorResponse>('/sponsor', data);
    return response.data;
  },

  getAll: async (filters?: { tier?: SponsorTier; type?: SponsorType; isActive?: boolean }): Promise<SponsorsListResponse> => {
    const params = new URLSearchParams();
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const queryString = params.toString();
    const response = await api.get<SponsorsListResponse>(`/sponsor${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id: string): Promise<SponsorResponse> => {
    const response = await api.get<SponsorResponse>(`/sponsor/${id}`);
    return response.data;
  },

  getByTier: async (tier: SponsorTier): Promise<SponsorsListResponse> => {
    const response = await api.get<SponsorsListResponse>(`/sponsor/tier/${tier}`);
    return response.data;
  },

  getByType: async (type: SponsorType): Promise<SponsorsListResponse> => {
    const response = await api.get<SponsorsListResponse>(`/sponsor/type/${type}`);
    return response.data;
  },

  update: async (id: string, data: UpdateSponsorRequest): Promise<SponsorResponse> => {
    const response = await api.put<SponsorResponse>(`/sponsor/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteSponsorResponse> => {
    const response = await api.delete<DeleteSponsorResponse>(`/sponsor/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<SponsorResponse> => {
    const response = await api.patch<SponsorResponse>(`/sponsor/${id}/toggle`);
    return response.data;
  },
};
