import { Sponsor, ISponsor, SponsorTier, SponsorType } from '../models/Sponsor';
import { deleteImage } from './cloudinary.services';

export interface CreateSponsorInput {
  name: string;
  description: string;
  tier: SponsorTier;
  type: SponsorType;
  logo?: {
    public_id: string;
    url: string;
  };
  website?: string;
  isActive?: boolean;
}

export interface UpdateSponsorInput {
  name?: string;
  description?: string;
  tier?: SponsorTier;
  type?: SponsorType;
  logo?: {
    public_id: string;
    url: string;
  };
  website?: string;
  isActive?: boolean;
}

export interface SponsorFilter {
  tier?: SponsorTier;
  type?: SponsorType;
  isActive?: boolean;
}

export const createSponsor = async (input: CreateSponsorInput): Promise<ISponsor> => {
  const sponsor = await Sponsor.create(input);
  return sponsor;
};

export const getAllSponsors = async (filter?: SponsorFilter): Promise<ISponsor[]> => {
  const query: Record<string, unknown> = {};
  
  if (filter?.tier) query.tier = filter.tier;
  if (filter?.type) query.type = filter.type;
  if (filter?.isActive !== undefined) query.isActive = filter.isActive;
  
  const sponsors = await Sponsor.find(query).sort({ tier: 1, createdAt: -1 });
  return sponsors;
};

export const getSponsorsByTier = async (tier: SponsorTier): Promise<ISponsor[]> => {
  const sponsors = await Sponsor.find({ tier, isActive: true }).sort({ createdAt: -1 });
  return sponsors;
};

export const getSponsorsByType = async (type: SponsorType): Promise<ISponsor[]> => {
  const sponsors = await Sponsor.find({ type, isActive: true }).sort({ createdAt: -1 });
  return sponsors;
};

export const getSponsorById = async (id: string): Promise<ISponsor | null> => {
  const sponsor = await Sponsor.findById(id);
  return sponsor;
};

export const updateSponsor = async (
  id: string,
  input: UpdateSponsorInput
): Promise<ISponsor | null> => {
  // If logo is being updated, delete the old image from Cloudinary
  if (input.logo) {
    const existingSponsor = await Sponsor.findById(id);
    if (existingSponsor?.logo?.public_id) {
      await deleteImage(existingSponsor.logo.public_id);
    }
  }

  const sponsor = await Sponsor.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return sponsor;
};

export const deleteSponsor = async (id: string): Promise<boolean> => {
  const sponsor = await Sponsor.findById(id);

  if (!sponsor) {
    return false;
  }

  // Delete logo from Cloudinary if exists
  if (sponsor.logo?.public_id) {
    await deleteImage(sponsor.logo.public_id);
  }

  await sponsor.deleteOne();
  return true;
};

export const toggleSponsorStatus = async (id: string): Promise<ISponsor | null> => {
  const sponsor = await Sponsor.findById(id);
  
  if (!sponsor) {
    return null;
  }
  
  sponsor.isActive = !sponsor.isActive;
  await sponsor.save();
  return sponsor;
};
