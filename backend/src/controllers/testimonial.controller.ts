import { Request, Response, NextFunction } from 'express';
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from '../services/testimonial.services';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonial = await createTestimonial(req.body);

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const testimonials = await getAllTestimonials();

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await getTestimonialById(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await updateTestimonial(id, req.body);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteTestimonial(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await toggleTestimonialStatus(id);

    if (!testimonial) {
      res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'} successfully`,
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};
