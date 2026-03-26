import mongoose, { Document, Schema } from 'mongoose';

export type EmailTemplateType = 
  | 'registration'
  | 'confirmation'
  | 'welcome'
  | 'cancellation'
  | 'payment_successful';

export interface IEmailTemplate extends Document {
  name: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['registration', 'confirmation', 'welcome', 'cancellation', 'payment_successful'],
        message: 'Invalid email template type',
      },
      required: [true, 'Template type is required'],
      unique: true,
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
    },
    htmlContent: {
      type: String,
      required: [true, 'HTML content is required'],
    },
    variables: {
      type: [String],
      default: [],
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

export const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
