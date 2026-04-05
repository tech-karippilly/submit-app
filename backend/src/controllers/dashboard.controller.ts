import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboard.services';

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getDashboardStats();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
