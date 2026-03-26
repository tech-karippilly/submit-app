import { Founder, IFounder, IExperience, ICertification } from '../models/Founder';
import { deleteImage } from './cloudinary.services';

export interface CreateFounderInput {
  fullName: string;
  title: string;
  professionalSummary: string;
  about: string;
  hospital: string;
  education: string[];
  type: 'Founder' | 'CoFounder';
  profileImage?: {
    public_id: string;
    url: string;
  };
  experience?: IExperience[];
  publications?: string[];
  certifications?: ICertification[];
}

export interface UpdateFounderInput {
  fullName?: string;
  title?: string;
  professionalSummary?: string;
  about?: string;
  hospital?: string;
  education?: string[];
  type?: 'Founder' | 'CoFounder';
  profileImage?: {
    public_id: string;
    url: string;
  };
  experience?: IExperience[];
  publications?: string[];
  certifications?: ICertification[];
}

export const createFounder = async (input: CreateFounderInput): Promise<IFounder> => {
  const founder = await Founder.create(input);
  return founder;
};

export const getAllFounders = async (): Promise<IFounder[]> => {
  const founders = await Founder.find({}).sort({ createdAt: -1 });
  return founders;
};

export const getFounderById = async (id: string): Promise<IFounder | null> => {
  const founder = await Founder.findById(id);
  return founder;
};

export const getFoundersByType = async (type: 'Founder' | 'CoFounder'): Promise<IFounder[]> => {
  const founders = await Founder.find({ type }).sort({ createdAt: -1 });
  return founders;
};

export const updateFounder = async (
  id: string,
  input: UpdateFounderInput
): Promise<IFounder | null> => {
  // If profileImage is being updated, delete the old image from Cloudinary
  if (input.profileImage) {
    const existingFounder = await Founder.findById(id);
    if (existingFounder?.profileImage?.public_id) {
      await deleteImage(existingFounder.profileImage.public_id);
    }
  }

  const founder = await Founder.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return founder;
};

export const deleteFounder = async (id: string): Promise<boolean> => {
  const founder = await Founder.findById(id);

  if (!founder) {
    return false;
  }

  // Delete profile image from Cloudinary if exists
  if (founder.profileImage?.public_id) {
    await deleteImage(founder.profileImage.public_id);
  }

  await founder.deleteOne();
  return true;
};
