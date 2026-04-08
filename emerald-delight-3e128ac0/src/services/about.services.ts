import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface About {
  _id: string;
  heroTitle: string;
  heroSubtitle: string;
  whoWeAreTitle: string;
  whoWeAreContent: string;
  problemTitle: string;
  problemContent: string;
  vision: string;
  mission: string;
  values: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAboutRequest {
  heroTitle?: string;
  heroSubtitle?: string;
  whoWeAreTitle?: string;
  whoWeAreContent?: string;
  problemTitle?: string;
  problemContent?: string;
  vision?: string;
  mission?: string;
  values?: string;
}

export interface AboutResponse {
  success: boolean;
  message?: string;
  data: About;
}

export const aboutApi = {
  get: async (): Promise<AboutResponse> => {
    const response = await api.get<AboutResponse>('/about');
    return response.data;
  },

  update: async (data: UpdateAboutRequest): Promise<AboutResponse> => {
    const response = await api.put<AboutResponse>('/about', data);
    return response.data;
  },
};
