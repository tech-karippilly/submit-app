import { Request, Response, NextFunction } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
} from '../services/event.services';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await createEvent(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
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
    const events = await getAllEvents();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
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
    const event = await getEventById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationFeeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await getEventById(id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        eventName: event.eventName,
        registrationFee: event.registrationFee,
      },
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
    const event = await updateEvent(id, req.body);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
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
    const deleted = await deleteEvent(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body as { status?: string; reason?: string };

    const allowedStatuses = ['scheduled', 'on_time', 'ongoing', 'completed', 'cancelled', 'delayed'];

    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    if ((status === 'cancelled' || status === 'delayed') && !reason?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Reason is required when status is cancelled or delayed',
      });
      return;
    }

    const event = await updateEventStatus(id, status as any, reason);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event status updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
