import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import * as invoiceController from '../controllers/invoice.controller';

const router = Router();

// Get all invoices
router.get(ROUTE.INVOICE.GET_ALL, invoiceController.getAll);

// Get invoice stats
router.get(ROUTE.INVOICE.STATS, invoiceController.getStats);

// Get invoice by ID
router.get(ROUTE.INVOICE.GET_BY_ID, invoiceController.getById);

// Update invoice status
router.put(ROUTE.INVOICE.UPDATE_STATUS, invoiceController.updateStatus);

// Delete invoice
router.delete(ROUTE.INVOICE.DELETE, invoiceController.remove);

export default router;
