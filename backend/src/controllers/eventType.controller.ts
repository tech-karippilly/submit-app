import { Request, Response, NextFunction } from 'express';
import {
  createEventType,
  getAllEventTypes,
  getEventTypeById,
  updateEventType,
  deleteEventType,
} from '../services/eventType.services';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = await createEventType(req.body);

    res.status(201).json({
      success: true,
      message: 'Event type created successfully',
      data: type,
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
    const types = await getAllEventTypes();

    res.status(200).json({
      success: true,
      count: types.length,
      data: types,
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
    const type = await getEventTypeById(id);

    if (!type) {
      res.status(404).json({
        success: false,
        message: 'Event type not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: type,
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
    const type = await updateEventType(id, req.body);

    if (!type) {
      res.status(404).json({
        success: false,
        message: 'Event type not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event type updated successfully',
      data: type,
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
    const deleted = await deleteEventType(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Event type not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event type deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
