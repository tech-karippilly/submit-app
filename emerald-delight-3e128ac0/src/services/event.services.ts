import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface IEventItinerary {
  name: string;
  description: string;
  duration: string;
  time: string;
}

export interface PopulatedSpeaker {
  _id: string;
  fullName: string;
  title: string;
  organization: string;
  topic: string;
  bio: string;
  photo?: {
    public_id: string;
    url: string;
  };
}

export type EventStatus = 'scheduled' | 'on_time' | 'ongoing' | 'completed' | 'cancelled' | 'delayed';

export interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventGoogleLink: string;
  eventDescription: string;
  topic?: string;
  status: EventStatus;
  statusReason?: string;
  registrationFee: {
    professional_individuals: number;
    student_individuals: number;
    student_group_per_head: number;
  };
  isCommonFee: boolean;
  speakerId?: string | PopulatedSpeaker;
  eventItinerary: IEventItinerary[];
  participantCount?: number;
  capacity?: number;
  seatsRemaining?: number;
  isExpired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventGoogleLink: string;
  eventDescription: string;
  topic?: string;
  status?: EventStatus;
  statusReason?: string;
  eventTypeId?: string;
  registrationFee?: {
    professional_individuals: number;
    student_individuals: number;
    student_group_per_head: number;
  };
  isCommonFee?: boolean;
  speakerId?: string;
  eventItinerary?: IEventItinerary[];
  capacity?: number;
}

export interface UpdateEventRequest {
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventGoogleLink?: string;
  eventDescription?: string;
  topic?: string;
  status?: EventStatus;
  statusReason?: string;
  eventTypeId?: string;
  registrationFee?: {
    professional_individuals: number;
    student_individuals: number;
    student_group_per_head: number;
  };
  isCommonFee?: boolean;
  speakerId?: string;
  eventItinerary?: IEventItinerary[];
  capacity?: number;
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: Event;
}

export interface EventsListResponse {
  success: boolean;
  count: number;
  data: Event[];
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
}

export const eventApi = {
  create: async (data: CreateEventRequest): Promise<EventResponse> => {
    const response = await api.post<EventResponse>('/event', data);
    return response.data;
  },

  getAll: async (): Promise<EventsListResponse> => {
    const response = await api.get<EventsListResponse>('/event');
    return response.data;
  },

  getById: async (id: string): Promise<EventResponse> => {
    const response = await api.get<EventResponse>(`/event/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateEventRequest): Promise<EventResponse> => {
    const response = await api.put<EventResponse>(`/event/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteEventResponse> => {
    const response = await api.delete<DeleteEventResponse>(`/event/${id}`);
    return response.data;
  },

  changeStatus: async (id: string, data: { status: EventStatus; reason?: string }): Promise<EventResponse> => {
    const response = await api.patch<EventResponse>(`/event/${id}/status`, data);
    return response.data;
  },
};
