import { Request, Response, NextFunction } from 'express';
import {
  createFounder,
  getAllFounders,
  getFounderById,
  getFoundersByType,
  updateFounder,
  deleteFounder,
} from '../services/founder.services';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const founder = await createFounder(req.body);

    res.status(201).json({
      success: true,
      message: 'Founder created successfully',
      data: founder,
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
    const founders = await getAllFounders();

    res.status(200).json({
      success: true,
      count: founders.length,
      data: founders,
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
    const founder = await getFounderById(id);

    if (!founder) {
      res.status(404).json({
        success: false,
        message: 'Founder not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: founder,
    });
  } catch (error) {
    next(error);
  }
};

export const getByType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.params;

    if (type !== 'Founder' && type !== 'CoFounder') {
      res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "Founder" or "CoFounder"',
      });
      return;
    }

    const founders = await getFoundersByType(type);

    res.status(200).json({
      success: true,
      count: founders.length,
      data: founders,
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
    const founder = await updateFounder(id, req.body);

    if (!founder) {
      res.status(404).json({
        success: false,
        message: 'Founder not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Founder updated successfully',
      data: founder,
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
    const deleted = await deleteFounder(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Founder not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Founder deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
