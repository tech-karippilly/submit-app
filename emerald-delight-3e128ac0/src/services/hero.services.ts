import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CarouselItem {
  image: string;
}

export interface Hero {
  _id: string;
  topSubtitle: string;
  mainTitle: string;
  titleHighlight: string;
  description: string;
  tagline: string;
  participationCount: number;
  eventsCount: number;
  carousel: CarouselItem[];
  backgroundImage: {
    public_id: string;
    url: string;
  };
  updatedAt: string;
}

export interface UpdateHeroRequest {
  topSubtitle?: string;
  mainTitle?: string;
  titleHighlight?: string;
  description?: string;
  tagline?: string;
  participationCount?: number;
  eventsCount?: number;
  carousel?: CarouselItem[];
  backgroundImage?: {
    public_id: string;
    url: string;
  };
}

export interface HeroResponse {
  success: boolean;
  message?: string;
  data: Hero;
}

export const heroApi = {
  get: async (): Promise<HeroResponse> => {
    const response = await api.get<HeroResponse>('/hero');
    return response.data;
  },

  update: async (data: UpdateHeroRequest): Promise<HeroResponse> => {
    const response = await api.put<HeroResponse>('/hero', data);
    return response.data;
  },
};
