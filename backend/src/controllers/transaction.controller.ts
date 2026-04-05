import { Request, Response, NextFunction } from 'express';
import {
  getAllTransactions,
  getTransactionSummary,
  getTransactionById,
  getTransactionsByEvent,
} from '../services/transaction.services';

/**
 * Get all transactions with optional filters
 */
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, eventId, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type;
    if (eventId) filters.eventId = eventId as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const transactions = await getAllTransactions(Object.keys(filters).length > 0 ? filters : undefined);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction summary (for dashboard)
 */
export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const summary = await getTransactionSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction by ID
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const transaction = await getTransactionById(id);

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transactions by event ID
 */
export const getByEventId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const transactions = await getTransactionsByEvent(eventId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
