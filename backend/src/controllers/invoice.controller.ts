import { Request, Response, NextFunction } from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceStats,
} from '../services/invoice.services';
import { InvoiceStatus } from '../models/Invoice';

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const invoices = await getAllInvoices(status as InvoiceStatus | undefined);

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
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
    const invoice = await getInvoiceById(id);

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['paid', 'pending', 'refunded'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be paid, pending, or refunded',
      });
      return;
    }

    const invoice = await updateInvoiceStatus(id, status as InvoiceStatus);

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice,
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
    const deleted = await deleteInvoice(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getInvoiceStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
