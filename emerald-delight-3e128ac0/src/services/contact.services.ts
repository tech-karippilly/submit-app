import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  addressOne: string;
  addressTwo?: string;
  city: string;
  state: string;
  pinCode: string;
  googleLocation?: string;
  about: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  addressOne?: string;
  addressTwo?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  googleLocation?: string;
  about?: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data: Contact;
}

export const contactApi = {
  get: async (): Promise<ContactResponse> => {
    const response = await api.get<ContactResponse>('/contact-details');
    return response.data;
  },

  update: async (data: UpdateContactRequest): Promise<ContactResponse> => {
    const response = await api.put<ContactResponse>('/contact-details', data);
    return response.data;
  },
};
