import { Speaker, ISpeaker } from '../models/Speaker';
import { deleteImage } from './cloudinary.services';

export interface CreateSpeakerInput {
  fullName: string;
  title: string;
  organization: string;
  topic?: string;
  bio: string;
  photo?: {
    public_id: string;
    url: string;
  };
}

export interface UpdateSpeakerInput {
  fullName?: string;
  title?: string;
  organization?: string;
  topic?: string;
  bio?: string;
  photo?: {
    public_id: string;
    url: string;
  };
}

export const createSpeaker = async (input: CreateSpeakerInput): Promise<ISpeaker> => {
  const speaker = await Speaker.create(input);
  return speaker;
};

export const getAllSpeakers = async (): Promise<ISpeaker[]> => {
  const speakers = await Speaker.find({}).sort({ createdAt: -1 });
  return speakers;
};

export const getSpeakerById = async (id: string): Promise<ISpeaker | null> => {
  const speaker = await Speaker.findById(id);
  return speaker;
};

export const updateSpeaker = async (
  id: string,
  input: UpdateSpeakerInput
): Promise<ISpeaker | null> => {
  // If photo is being updated, delete the old photo from Cloudinary
  if (input.photo) {
    const existingSpeaker = await Speaker.findById(id);
    if (existingSpeaker?.photo?.public_id) {
      await deleteImage(existingSpeaker.photo.public_id);
    }
  }

  const speaker = await Speaker.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return speaker;
};

export const deleteSpeaker = async (id: string): Promise<boolean> => {
  const speaker = await Speaker.findById(id);
  
  if (!speaker) {
    return false;
  }

  // Delete photo from Cloudinary if exists
  if (speaker.photo?.public_id) {
    await deleteImage(speaker.photo.public_id);
  }

  await speaker.deleteOne();
  return true;
};
