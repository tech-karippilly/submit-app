import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TestimonialPhoto {
  public_id: string;
  url: string;
}

export interface Testimonial {
  _id: string;
  fullName: string;
  title: string;
  company: string;
  quote: string;
  photo: TestimonialPhoto;
  rating: number;
  isActive: boolean;
  user_image_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialRequest {
  fullName: string;
  title: string;
  company: string;
  quote: string;
  photo?: TestimonialPhoto;
  rating: number;
  isActive?: boolean;
  user_image_url?: string;
}

export interface UpdateTestimonialRequest {
  fullName?: string;
  title?: string;
  company?: string;
  quote?: string;
  photo?: TestimonialPhoto;
  rating?: number;
  isActive?: boolean;
  user_image_url?: string;
}

export interface TestimonialResponse {
  success: boolean;
  message: string;
  data: Testimonial;
}

export interface TestimonialsListResponse {
  success: boolean;
  count: number;
  data: Testimonial[];
}

export interface DeleteTestimonialResponse {
  success: boolean;
  message: string;
}

export const testimonialApi = {
  create: async (data: CreateTestimonialRequest): Promise<TestimonialResponse> => {
    const response = await api.post<TestimonialResponse>('/testimonial', data);
    return response.data;
  },

  getAll: async (filters?: { isActive?: boolean }): Promise<TestimonialsListResponse> => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const queryString = params.toString();
    const response = await api.get<TestimonialsListResponse>(`/testimonial${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id: string): Promise<TestimonialResponse> => {
    const response = await api.get<TestimonialResponse>(`/testimonial/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTestimonialRequest): Promise<TestimonialResponse> => {
    const response = await api.put<TestimonialResponse>(`/testimonial/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<TestimonialResponse> => {
    const response = await api.patch<TestimonialResponse>(`/testimonial/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<DeleteTestimonialResponse> => {
    const response = await api.delete<DeleteTestimonialResponse>(`/testimonial/${id}`);
    return response.data;
  },
};
