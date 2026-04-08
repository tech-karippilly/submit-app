import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface EventType {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateEventTypeRequest {
  name?: string;
  description?: string;
}

export interface EventTypeResponse {
  success: boolean;
  message: string;
  data: EventType;
}

export interface EventTypesListResponse {
  success: boolean;
  count: number;
  data: EventType[];
}

export interface DeleteEventTypeResponse {
  success: boolean;
  message: string;
}

export const eventTypeApi = {
  create: async (data: CreateEventTypeRequest): Promise<EventTypeResponse> => {
    const response = await api.post<EventTypeResponse>('/event-type', data);
    return response.data;
  },

  getAll: async (): Promise<EventTypesListResponse> => {
    const response = await api.get<EventTypesListResponse>('/event-type');
    return response.data;
  },

  getById: async (id: string): Promise<EventTypeResponse> => {
    const response = await api.get<EventTypeResponse>(`/event-type/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateEventTypeRequest): Promise<EventTypeResponse> => {
    const response = await api.put<EventTypeResponse>(`/event-type/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteEventTypeResponse> => {
    const response = await api.delete<DeleteEventTypeResponse>(`/event-type/${id}`);
    return response.data;
  },
};
