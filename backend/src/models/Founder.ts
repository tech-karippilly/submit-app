import mongoose, { Document, Schema } from 'mongoose';

export interface IExperience {
  name: string;
  description: string;
  experienceCertificateImageUrl?: string;
}

export interface ICertification {
  title: string;
  description: string;
  certificateImage?: string;
}

export interface IFounder extends Document {
  profileImage: {
    public_id: string;
    url: string;
  };
  fullName: string;
  title: string;
  professionalSummary: string;
  about: string;
  experience: IExperience[];
  hospital: string;
  publications?: string[];
  education: string[];
  certifications: ICertification[];
  type: 'Founder' | 'CoFounder';
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  {
    name: {
      type: String,
      required: [true, 'Experience name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Experience description is required'],
      trim: true,
    },
    experienceCertificateImageUrl: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const certificationSchema = new Schema<ICertification>(
  {
    title: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Certification description is required'],
      trim: true,
    },
    certificateImage: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const founderSchema = new Schema<IFounder>(
  {
    profileImage: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
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
    professionalSummary: {
      type: String,
      required: [true, 'Professional summary is required'],
      trim: true,
    },
    about: {
      type: String,
      required: [true, 'About is required'],
      trim: true,
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
    },
    publications: {
      type: [String],
      default: [],
    },
    education: {
      type: [String],
      required: [true, 'At least one education entry is required'],
    },
    certifications: {
      type: [certificationSchema],
      default: [],
    },
    type: {
      type: String,
      enum: ['Founder', 'CoFounder'],
      required: [true, 'Type is required (Founder or CoFounder)'],
    },
  },
  {
    timestamps: true,
  }
);

export const Founder = mongoose.model<IFounder>('Founder', founderSchema);
