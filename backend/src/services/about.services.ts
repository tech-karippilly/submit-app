import { About, IAbout } from '../models/About';

export interface CreateAboutData {
  heroTitle: string;
  heroSubtitle: string;
  whoWeAreTitle: string;
  whoWeAreContent: string;
  problemTitle: string;
  problemContent: string;
  vision: string;
  mission: string;
  values: string;
}

export const getAbout = async (): Promise<IAbout> => {
  let about = await About.findOne();
  if (!about) {
    // Create default about if none exists
    about = await About.create({
      heroTitle: "About The Summit LLP",
      heroSubtitle: "Pioneering healthcare quality and sustainability across India and beyond.",
      whoWeAreTitle: "Who We Are",
      whoWeAreContent: "The Summit LLP was formed with a singular vision — to elevate healthcare quality standards across India by bringing together the finest minds in patient safety, quality improvement, and sustainable healthcare delivery. Founded by internationally certified healthcare quality professionals with Harvard credentials, we bridge the gap between global best practices and local implementation.",
      problemTitle: "The Problem in Indian Healthcare",
      problemContent: "Despite remarkable progress, Indian healthcare faces critical challenges in standardizing quality, ensuring patient safety, adopting sustainable practices, and meeting international accreditation benchmarks. The Summit LLP exists to address these gaps through education, collaboration, and leadership development.",
      vision: "To be India's leading platform for healthcare quality transformation and sustainable hospital practices.",
      mission: "Empowering healthcare professionals with knowledge, tools, and networks to deliver world-class patient care.",
      values: "Excellence, integrity, patient-centricity, innovation, and a commitment to global quality standards.",
    });
  }
  return about;
};

export const updateAbout = async (data: Partial<CreateAboutData>): Promise<IAbout | null> => {
  let about = await About.findOne();
  
  if (!about) {
    // Create new about if none exists
    about = await About.create({
      heroTitle: data.heroTitle || "About The Summit LLP",
      heroSubtitle: data.heroSubtitle || "Pioneering healthcare quality and sustainability across India and beyond.",
      whoWeAreTitle: data.whoWeAreTitle || "Who We Are",
      whoWeAreContent: data.whoWeAreContent || "",
      problemTitle: data.problemTitle || "The Problem in Indian Healthcare",
      problemContent: data.problemContent || "",
      vision: data.vision || "",
      mission: data.mission || "",
      values: data.values || "",
    });
    return about;
  }
  
  return await About.findByIdAndUpdate(
    about._id,
    { $set: data },
    { new: true, runValidators: true }
  );
};
