import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Speaker {
  _id: string;
  fullName: string;
  title: string;
  organization: string;
  topic?: string;
  bio: string;
  photo: {
    public_id: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpeakerRequest {
  fullName: string;
  title: string;
  organization: string;
  topic?: string;
  bio: string;
  photo?: {
    public_id: string;
    url: string;
  };
}

export interface UpdateSpeakerRequest {
  fullName?: string;
  title?: string;
  organization?: string;
  topic?: string;
  bio?: string;
  photo?: {
    public_id: string;
    url: string;
  };
}

export interface SpeakerResponse {
  success: boolean;
  message: string;
  data: Speaker;
}

export interface SpeakersListResponse {
  success: boolean;
  count: number;
  data: Speaker[];
}

export interface DeleteSpeakerResponse {
  success: boolean;
  message: string;
}

export const speakerApi = {
  create: async (data: CreateSpeakerRequest): Promise<SpeakerResponse> => {
    const response = await api.post<SpeakerResponse>('/speaker', data);
    return response.data;
  },

  getAll: async (): Promise<SpeakersListResponse> => {
    const response = await api.get<SpeakersListResponse>('/speaker');
    return response.data;
  },

  getById: async (id: string): Promise<SpeakerResponse> => {
    const response = await api.get<SpeakerResponse>(`/speaker/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateSpeakerRequest): Promise<SpeakerResponse> => {
    const response = await api.put<SpeakerResponse>(`/speaker/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteSpeakerResponse> => {
    const response = await api.delete<DeleteSpeakerResponse>(`/speaker/${id}`);
    return response.data;
  },
};
