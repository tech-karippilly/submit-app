import mongoose, { Document, Schema } from "mongoose";

// Types
export type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'processed' | 'refunded';

export interface IMember {
  full_name: string;
  email: string;
  phone: string;
  isLeader?: boolean;
}

export interface IParticipant extends Document {
  eventId: mongoose.Types.ObjectId;
  full_name: string;
  email: string;
  phone: string;
  designation?: string;
  organization?: string;
  yearsOfExperience?: number;
  registraionFee: number;
  paymentStatus: PaymentStatus;
  isStudent?: boolean;
  collageName?: string;
  course?: string;
  yearofStudy?: string;
  studentId?: string;
  isGroup?: boolean;
  sizeOfGroup?: number;
  members?: IMember[];
  createdAt: Date;
  updatedAt: Date;
}

// Schemas (membersSchema must be defined before participantsSchema)
const membersSchema = new Schema<IMember>(
  {
    full_name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
    },
    isLeader: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const participantsSchema = new Schema<IParticipant>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    full_name: {
      type: String,
      trim: true,
      required: [true, 'Full name is required'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required'],
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Phone number is required'],
    },
    designation: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
    },
    registraionFee: {
      type: Number,
      required: [true, 'Registration fee is required'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['paid', 'unpaid', 'pending', 'processed', 'refunded'],
        message: 'Invalid payment status',
      },
      trim: true,
      required: [true, 'Payment status is required'],
      default: 'pending',
    },
    isStudent: {
      type: Boolean,
      default: false,
    },
    collageName: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    yearofStudy: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    sizeOfGroup: {
      type: Number,
    },

    members: [membersSchema],
  },
  {
    timestamps: true,
  }
);

export const Participant = mongoose.model<IParticipant>('Participant', participantsSchema);