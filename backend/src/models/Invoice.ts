import mongoose, { Document, Schema } from "mongoose";

// Types
export type InvoiceStatus = 'paid' | 'pending' | 'refunded';
export type AttendeeType = 'professional' | 'student';

export interface IInvoice extends Document {
  invoiceNumber: string;
  participantId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  attendeeType: AttendeeType;
  amount: number;
  status: InvoiceStatus;
  isGroup: boolean;
  groupSize?: number;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: [true, 'Invoice number is required'],
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Participant',
      required: [true, 'Participant ID is required'],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Email is required'],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Phone is required'],
    },
    attendeeType: {
      type: String,
      enum: {
        values: ['professional', 'student'],
        message: 'Invalid attendee type',
      },
      required: [true, 'Attendee type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['paid', 'pending', 'refunded'],
        message: 'Invalid invoice status',
      },
      default: 'pending',
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupSize: {
      type: Number,
      min: [1, 'Group size must be at least 1'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
invoiceSchema.index({ participantId: 1 });
invoiceSchema.index({ eventId: 1 });
invoiceSchema.index({ status: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
