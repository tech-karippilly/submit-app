import { Request, Response, NextFunction } from 'express';
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByType,
  getActivePayments,
  updatePayment,
  deletePayment,
  togglePaymentStatus,
} from '../services/payment.services';
import { AttendeeType } from '../models/Payments';

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await createPayment(req.body);

    res.status(201).json({
      success: true,
      message: 'Payment fee created successfully',
      data: payment,
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
    const { active } = req.query;

    let payments;
    if (active === 'true') {
      payments = await getActivePayments();
    } else {
      payments = await getAllPayments();
    }

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
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
    const payment = await getPaymentById(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment fee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payment,
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

    if (!['professional', 'student'].includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid attendee type. Must be: professional or student',
      });
      return;
    }

    const payments = await getPaymentsByType(type as AttendeeType);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
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
    const payment = await updatePayment(id, req.body);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment fee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment fee updated successfully',
      data: payment,
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
    const deleted = await deletePayment(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Payment fee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Payment fee deleted successfully',
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
    const payment = await togglePaymentStatus(id);

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment fee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Payment fee ${payment.isActive ? 'activated' : 'deactivated'} successfully`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
