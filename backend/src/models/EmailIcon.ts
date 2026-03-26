import mongoose, { Document, Schema } from 'mongoose';

export type EmailIconCategory = 'logo' | 'social' | 'icon' | 'custom';

export interface IEmailIcon extends Document {
  name: string;
  url: string;
  publicId?: string;
  category: EmailIconCategory;
  width?: number;
  height?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailIconSchema = new Schema<IEmailIcon>(
  {
    name: {
      type: String,
      required: [true, 'Icon name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Icon URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['logo', 'social', 'icon', 'custom'],
        message: 'Invalid icon category',
      },
      default: 'custom',
    },
    width: {
      type: Number,
      default: 100,
    },
    height: {
      type: Number,
      default: 100,
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

export const EmailIcon = mongoose.model<IEmailIcon>('EmailIcon', emailIconSchema);
