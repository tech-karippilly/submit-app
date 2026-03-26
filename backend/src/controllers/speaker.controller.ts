import { Request, Response, NextFunction } from 'express';
import {
  createSpeaker,
  getAllSpeakers,
  getSpeakerById,
  updateSpeaker,
  deleteSpeaker,
} from '../services/speaker.services';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const speaker = await createSpeaker(req.body);

    res.status(201).json({
      success: true,
      message: 'Speaker created successfully',
      data: speaker,
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
    const speakers = await getAllSpeakers();

    res.status(200).json({
      success: true,
      count: speakers.length,
      data: speakers,
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
    const speaker = await getSpeakerById(id);

    if (!speaker) {
      res.status(404).json({
        success: false,
        message: 'Speaker not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: speaker,
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
    const speaker = await updateSpeaker(id, req.body);

    if (!speaker) {
      res.status(404).json({
        success: false,
        message: 'Speaker not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Speaker updated successfully',
      data: speaker,
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
    const deleted = await deleteSpeaker(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Speaker not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Speaker deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
