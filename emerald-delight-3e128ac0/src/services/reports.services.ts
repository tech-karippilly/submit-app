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

// Enquiries Report
export interface EnquiriesReportData {
  totalEnquiries: number;
  enquiriesByMonth: { month: string; count: number }[];
  recentEnquiries: {
    id: string;
    name: string;
    email: string;
    title: string;
    createdAt: string;
  }[];
}

// Attendee Type Report
export interface AttendeeTypeReportData {
  totalParticipants: number;
  students: {
    count: number;
    individual: number;
    group: number;
    revenue: number;
  };
  professionals: {
    count: number;
    revenue: number;
  };
  breakdownByEvent: {
    eventId: string;
    eventName: string;
    students: number;
    professionals: number;
    total: number;
  }[];
}

// Group Registration Report
export interface GroupRegistrationReportData {
  totalGroups: number;
  totalGroupMembers: number;
  averageGroupSize: number;
  groups: {
    id: string;
    leadName: string;
    email: string;
    eventName: string;
    size: number;
    members: { name: string; email: string; phone: string }[];
    registrationFee: number;
    createdAt: string;
  }[];
}

// Event Registration Report
export interface EventRegistrationReportData {
  events: {
    eventId: string;
    eventName: string;
    eventDate: string;
    capacity: number;
    registered: number;
    seatsRemaining: number;
    revenue: number;
    students: number;
    professionals: number;
    groups: number;
  }[];
}

// Revenue Report
export interface RevenueReportData {
  totalRevenue: number;
  totalTransactions: number;
  revenueByMonth: { month: string; revenue: number; transactions: number }[];
  revenueByEvent: { eventId: string; eventName: string; revenue: number; participants: number }[];
  refunds: {
    totalRefunded: number;
    count: number;
  };
}

// Transaction History
export interface TransactionHistoryData {
  transactions: {
    id: string;
    type: 'credit' | 'debit';
    description: string;
    amount: number;
    participantName: string;
    participantEmail: string;
    eventName: string;
    status: string;
    createdAt: string;
  }[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    netAmount: number;
  };
}

export interface ReportResponse<T> {
  success: boolean;
  data: T;
}

export const reportsApi = {
  getEnquiriesReport: async (): Promise<ReportResponse<EnquiriesReportData>> => {
    const response = await api.get<ReportResponse<EnquiriesReportData>>('/reports/enquiries');
    return response.data;
  },

  getAttendeeTypeReport: async (): Promise<ReportResponse<AttendeeTypeReportData>> => {
    const response = await api.get<ReportResponse<AttendeeTypeReportData>>('/reports/attendee-types');
    return response.data;
  },

  getGroupRegistrationReport: async (): Promise<ReportResponse<GroupRegistrationReportData>> => {
    const response = await api.get<ReportResponse<GroupRegistrationReportData>>('/reports/group-registrations');
    return response.data;
  },

  getEventRegistrationReport: async (): Promise<ReportResponse<EventRegistrationReportData>> => {
    const response = await api.get<ReportResponse<EventRegistrationReportData>>('/reports/event-registrations');
    return response.data;
  },

  getRevenueReport: async (): Promise<ReportResponse<RevenueReportData>> => {
    const response = await api.get<ReportResponse<RevenueReportData>>('/reports/revenue');
    return response.data;
  },

  getTransactionHistory: async (): Promise<ReportResponse<TransactionHistoryData>> => {
    const response = await api.get<ReportResponse<TransactionHistoryData>>('/reports/transactions');
    return response.data;
  },
};
