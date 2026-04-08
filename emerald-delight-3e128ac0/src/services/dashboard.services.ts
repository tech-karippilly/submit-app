import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DashboardStats {
  enquiriesCount: number;
  speakersCount: number;
  eventsCount: number;
  participantsCount: number;
  carouselImagesCount: number;
  totalRevenue: number;
}

export interface RecentEnquiry {
  id: string;
  title: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentEnquiries: RecentEnquiry[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/dashboard');
    return response.data;
  },
};
