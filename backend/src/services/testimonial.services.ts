import { Testimonial, ITestimonial } from '../models/Testimonials';
import { deleteImage } from './cloudinary.services';

export interface CreateTestimonialInput {
  fullName: string;
  title: string;
  company: string;
  quote: string;
  photo?: {
    public_id: string;
    url: string;
  };
  rating?: number;
  isActive?: boolean;
  user_image_url?: string;
}

export interface UpdateTestimonialInput {
  fullName?: string;
  title?: string;
  company?: string;
  quote?: string;
  photo?: {
    public_id: string;
    url: string;
  };
  rating?: number;
  isActive?: boolean;
  user_image_url?: string;
}

export const createTestimonial = async (input: CreateTestimonialInput): Promise<ITestimonial> => {
  const testimonial = await Testimonial.create(input);
  return testimonial;
};

export const getAllTestimonials = async (): Promise<ITestimonial[]> => {
  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
  return testimonials;
};

export const getTestimonialById = async (id: string): Promise<ITestimonial | null> => {
  const testimonial = await Testimonial.findById(id);
  return testimonial;
};

export const updateTestimonial = async (
  id: string,
  input: UpdateTestimonialInput
): Promise<ITestimonial | null> => {
  // If photo is being updated, delete the old photo from Cloudinary
  if (input.photo) {
    const existingTestimonial = await Testimonial.findById(id);
    if (existingTestimonial?.photo?.public_id) {
      await deleteImage(existingTestimonial.photo.public_id);
    }
  }

  const testimonial = await Testimonial.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  return testimonial;
};

export const deleteTestimonial = async (id: string): Promise<boolean> => {
  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    return false;
  }

  // Delete photo from Cloudinary if exists
  if (testimonial.photo?.public_id) {
    await deleteImage(testimonial.photo.public_id);
  }

  await testimonial.deleteOne();
  return true;
};

export const toggleTestimonialStatus = async (id: string): Promise<ITestimonial | null> => {
  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    return null;
  }

  testimonial.isActive = !testimonial.isActive;
  await testimonial.save();
  return testimonial;
};
