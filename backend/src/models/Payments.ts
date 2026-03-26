import mongoose, { Document, Schema } from "mongoose";

// Types
export type AttendeeType = 'professional' | 'student';

export interface IPayment extends Document {
  attendeeType: AttendeeType;
  professional_individuals?: number;
  student_individuals?: number;
  student_group_per_head?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    attendeeType: {
      type: String,
      enum: {
        values: ['professional', 'student'],
        message: 'Invalid attendee type',
      },
      required: [true, 'Attendee type is required'],
    },
    professional_individuals: {
      type: Number,
      min: [0, 'Professional individual fee cannot be negative'],
    },
    student_individuals: {
      type: Number,
      min: [0, 'Student individual fee cannot be negative'],
    },
    student_group_per_head: {
      type: Number,
      min: [0, 'Student group per head fee cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
