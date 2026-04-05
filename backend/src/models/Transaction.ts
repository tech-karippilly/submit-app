import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface ITransaction extends Document {
  transactionId: string;
  type: TransactionType;
  description: string;
  amount: number;
  participantId?: mongoose.Types.ObjectId;
  participantName?: string;
  participantEmail?: string;
  eventId?: mongoose.Types.ObjectId;
  eventName?: string;
  invoiceId?: mongoose.Types.ObjectId;
  invoiceNumber?: string;
  status: TransactionStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
    },
    participantName: {
      type: String,
    },
    participantEmail: {
      type: String,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },
    eventName: {
      type: String,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    invoiceNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ eventId: 1 });
transactionSchema.index({ participantId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
