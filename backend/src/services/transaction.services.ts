import { Transaction, ITransaction, TransactionType, TransactionStatus } from '../models/Transaction';
import mongoose from 'mongoose';

// Generate unique transaction ID
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN${timestamp}${random}`;
};

// Create a new transaction
export const createTransaction = async (data: {
  type: TransactionType;
  description: string;
  amount: number;
  participantId?: string;
  participantName?: string;
  participantEmail?: string;
  eventId?: string;
  eventName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  status?: TransactionStatus;
  metadata?: Record<string, any>;
}): Promise<ITransaction> => {
  const transaction = await Transaction.create({
    transactionId: generateTransactionId(),
    ...data,
  });
  return transaction;
};

// Get all transactions
export const getAllTransactions = async (filters?: {
  type?: TransactionType;
  eventId?: string;
  participantId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<ITransaction[]> => {
  const query: any = {};
  
  if (filters?.type) {
    query.type = filters.type;
  }
  if (filters?.eventId) {
    query.eventId = new mongoose.Types.ObjectId(filters.eventId);
  }
  if (filters?.participantId) {
    query.participantId = new mongoose.Types.ObjectId(filters.participantId);
  }
  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .populate('eventId', 'eventName')
    .populate('participantId', 'full_name email');
  
  return transactions;
};

// Get transaction summary (for dashboard)
export const getTransactionSummary = async (): Promise<{
  totalCredits: number;
  totalDebits: number;
  balance: number;
  totalTransactions: number;
}> => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const credits = result.find((r) => r._id === 'credit')?.total || 0;
  const debits = result.find((r) => r._id === 'debit')?.total || 0;
  const totalCount = result.reduce((sum, r) => sum + r.count, 0);

  return {
    totalCredits: credits,
    totalDebits: debits,
    balance: credits - debits,
    totalTransactions: totalCount,
  };
};

// Get transaction by ID
export const getTransactionById = async (id: string): Promise<ITransaction | null> => {
  return Transaction.findById(id)
    .populate('eventId', 'eventName')
    .populate('participantId', 'full_name email');
};

// Get transactions by event ID
export const getTransactionsByEvent = async (eventId: string): Promise<ITransaction[]> => {
  return Transaction.find({ eventId: new mongoose.Types.ObjectId(eventId) })
    .sort({ createdAt: -1 })
    .populate('participantId', 'full_name email');
};
