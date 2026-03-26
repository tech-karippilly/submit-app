import mongoose, { Schema, Document } from "mongoose";

export interface ICarouselItem {
  image: string;
}

export interface IHero extends Document {
  topSubtitle: string;
  mainTitle: string;
  titleHighlight: string;
  description: string;
  tagline: string;
  participationCount: number;
  carousel: ICarouselItem[];
  updatedAt: Date;
  eventsCount: number;
  backgroundImage: {
    public_id: string;
    url: string;
  };
}

const carouselSchema = new Schema<ICarouselItem>({
  image: { type: String, trim: true, required: true }
});

const heroSchema = new Schema<IHero>(
  {
    topSubtitle: {
      type: String,
      trim: true,
      required: true,
    },
    mainTitle: {
      type: String,
      trim: true,
      required: true,
    },
    titleHighlight: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    tagline: {
      type: String,
      trim: true,
      required: true,
    },
    participationCount: {
      type: Number,
      required: true,
      default: 0,
    },
    eventsCount:{
      type: Number,
      required: true,
      default: 0,
    },
    backgroundImage: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    carousel: [carouselSchema],
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Singleton pattern - only one hero section exists
heroSchema.statics.getSingleton = async function (): Promise<IHero> {
  let hero = await this.findOne();
  if (!hero) {
    hero = await this.create({});
  }
  return hero;
};

export default mongoose.model<IHero>("Hero", heroSchema);
