import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  fullName: string;
  title: string;
  company: string;
  quote: string;
  photo: {
    public_id: string;
    url: string;
  };
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user_image_url:string
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    title: {
      type: String,
      required: [true, 'Title/Designation is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company/Organization is required'],
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    quote: {
      type: String,
      required: [true, 'Testimonial quote is required'],
      trim: true,
      maxlength: [1000, 'Quote cannot exceed 1000 characters'],
    },
    photo: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    user_image_url:{
        type: String,
        default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Index for filtering active testimonials
testimonialSchema.index({ isActive: 1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
