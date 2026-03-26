import mongoose, { Document, Schema } from "mongoose";

// Types
export interface IAbout extends Document {
  heroTitle: string;
  heroSubtitle: string;
  whoWeAreTitle: string;
  whoWeAreContent: string;
  problemTitle: string;
  problemContent: string;
  vision: string;
  mission: string;
  values: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const aboutSchema = new Schema<IAbout>(
  {
    heroTitle: {
      type: String,
      trim: true,
      required: [true, 'Hero title is required'],
    },
    heroSubtitle: {
      type: String,
      trim: true,
      required: [true, 'Hero subtitle is required'],
    },
    whoWeAreTitle: {
      type: String,
      trim: true,
      required: [true, 'Who we are title is required'],
    },
    whoWeAreContent: {
      type: String,
      trim: true,
      required: [true, 'Who we are content is required'],
    },
    problemTitle: {
      type: String,
      trim: true,
      required: [true, 'Problem title is required'],
    },
    problemContent: {
      type: String,
      trim: true,
      required: [true, 'Problem content is required'],
    },
    vision: {
      type: String,
      trim: true,
      required: [true, 'Vision is required'],
    },
    mission: {
      type: String,
      trim: true,
      required: [true, 'Mission is required'],
    },
    values: {
      type: String,
      trim: true,
      required: [true, 'Values is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const About = mongoose.model<IAbout>('About', aboutSchema);
