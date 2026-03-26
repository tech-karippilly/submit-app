import Hero, { IHero, ICarouselItem } from '../models/Hero';

export interface CreateHeroData {
  topSubtitle: string;
  mainTitle: string;
  titleHighlight: string;
  description: string;
  tagline: string;
  participationCount: number;
  eventsCount: number;
  carousel: ICarouselItem[];
  backgroundImage: {
    public_id: string;
    url: string;
  };
}

export const getHero = async (): Promise<IHero> => {
  let hero = await Hero.findOne();
  if (!hero) {
    // Create default hero if none exists
    hero = await Hero.create({
      topSubtitle: 'The Summit LLP Presents',
      mainTitle: 'Healthcare Quality',
      titleHighlight: '& Sustainability',
      description: 'A premier conference bringing together global healthcare leaders, quality experts, and innovators.',
      tagline: 'Founded by Harvard-certified healthcare quality professional',
      participationCount: 150,
      eventsCount: 0,
      carousel: [],
      backgroundImage: { public_id: '', url: '' },
    });
  }
  return hero;
};

export const updateHero = async (data: Partial<CreateHeroData>): Promise<IHero | null> => {
  let hero = await Hero.findOne();
  
  if (!hero) {
    // Create new hero if none exists
    hero = await Hero.create({
      topSubtitle: data.topSubtitle || 'The Summit LLP Presents',
      mainTitle: data.mainTitle || 'Healthcare Quality',
      titleHighlight: data.titleHighlight || '& Sustainability',
      description: data.description || 'A premier conference bringing together global healthcare leaders, quality experts, and innovators.',
      tagline: data.tagline || 'Founded by Harvard-certified healthcare quality professional',
      participationCount: data.participationCount || 150,
      eventsCount: data.eventsCount || 0,
      carousel: data.carousel || [],
      backgroundImage: data.backgroundImage || { public_id: '', url: '' },
    });
    return hero;
  }
  
  return await Hero.findByIdAndUpdate(
    hero._id,
    { $set: data },
    { new: true, runValidators: true }
  );
};
