import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || "http://localhost:5001/v1/api";

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Transaction {
  _id: string;
  transactionId: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  participantId?: string;
  participantName?: string;
  participantEmail?: string;
  eventId?: string;
  eventName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  status: 'completed' | 'pending' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  balance: number;
  totalTransactions: number;
}

export interface TransactionsResponse {
  success: boolean;
  count: number;
  data: Transaction[];
}

export interface TransactionSummaryResponse {
  success: boolean;
  data: TransactionSummary;
}

export const transactionApi = {
  /**
   * Get all transactions with optional filters
   */
  getAll: async (filters?: {
    type?: 'credit' | 'debit';
    eventId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.eventId) params.append('eventId', filters.eventId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/transaction?${queryString}` : '/transaction';
    const response = await api.get<TransactionsResponse>(url);
    return response.data;
  },

  /**
   * Get transaction summary
   */
  getSummary: async (): Promise<TransactionSummaryResponse> => {
    const response = await api.get<TransactionSummaryResponse>('/transaction/summary');
    return response.data;
  },

  /**
   * Get transactions by event ID
   */
  getByEventId: async (eventId: string): Promise<TransactionsResponse> => {
    const response = await api.get<TransactionsResponse>(`/transaction/event/${eventId}`);
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: Transaction }> => {
    const response = await api.get<{ success: boolean; data: Transaction }>(`/transaction/${id}`);
    return response.data;
  },
};

export default transactionApi;
