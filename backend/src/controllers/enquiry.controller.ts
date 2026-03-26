import { Request, Response, NextFunction } from 'express';
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} from '../services/enquiry.services';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const enquiry = await createEnquiry(req.body);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.query;
    const enquiries = await getAllEnquiries(eventId as string | undefined);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
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
    const enquiry = await getEnquiryById(id);

    if (!enquiry) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: enquiry,
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
    const enquiry = await updateEnquiry(id, req.body);

    if (!enquiry) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry,
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
    const deleted = await deleteEnquiry(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
