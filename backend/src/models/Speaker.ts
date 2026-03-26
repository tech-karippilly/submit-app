import mongoose, { Document, Schema } from 'mongoose';

export interface ISpeaker extends Document {
  fullName: string;
  title: string;
  organization: string;
  topic?: string;
  bio: string;
  photo: {
    public_id: string;
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const speakerSchema = new Schema<ISpeaker>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title/Designation is required'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: false,
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

export const Speaker = mongoose.model<ISpeaker>('Speaker', speakerSchema);
