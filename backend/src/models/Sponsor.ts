import mongoose, { Document, Schema } from 'mongoose';

export type SponsorTier = 'diamond' | 'platinum' | 'gold';
export type SponsorType = 'sponsor' | 'partner';

export interface ISponsor extends Document {
  name: string;
  description: string;
  logo: {
    public_id: string;
    url: string;
  };
  tier: SponsorTier;
  type: SponsorType;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorSchema = new Schema<ISponsor>(
  {
    name: {
      type: String,
      required: [true, 'Sponsor/Partner name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
    tier: {
      type: String,
      enum: {
        values: ['diamond', 'platinum', 'gold'],
        message: 'Tier must be diamond, platinum, or gold',
      },
      required: [true, 'Tier is required'],
      default: 'gold',
    },
    type: {
      type: String,
      enum: {
        values: ['sponsor', 'partner'],
        message: 'Type must be sponsor or partner',
      },
      required: [true, 'Type is required'],
      default: 'sponsor',
    },
    website: {
      type: String,
      trim: true,
      default: '',
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

// Index for filtering by tier and type
sponsorSchema.index({ tier: 1, type: 1 });
sponsorSchema.index({ isActive: 1 });

export const Sponsor = mongoose.model<ISponsor>('Sponsor', sponsorSchema);
