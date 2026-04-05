import { Request, Response, NextFunction } from 'express';
import {
  getEnquiriesReport,
  getAttendeeTypeReport,
  getGroupRegistrationReport,
  getEventRegistrationReport,
  getRevenueReport,
  getTransactionHistory,
} from '../services/reports.services';

/**
 * Get Enquiries Report
 */
export const enquiriesReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getEnquiriesReport();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Student vs Professional Report
 */
export const attendeeTypeReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAttendeeTypeReport();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Group Registration Report
 */
export const groupRegistrationReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getGroupRegistrationReport();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Event-wise Registration Report
 */
export const eventRegistrationReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getEventRegistrationReport();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Revenue Report
 */
export const revenueReport = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getRevenueReport();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Transaction History
 */
export const transactionHistory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getTransactionHistory();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
