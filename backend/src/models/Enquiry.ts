import mongoose, { Document, Schema } from 'mongoose';

export interface IEnquiry extends Document {
  eventId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by event
enquirySchema.index({ eventId: 1 });

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', enquirySchema);
