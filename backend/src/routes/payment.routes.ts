import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  create,
  getAll,
  getById,
  getByType,
  update,
  remove,
  toggleStatus,
} from '../controllers/payment.controller';

const router = Router();

// Create a new payment fee
router.post(ROUTE.PAYMENT.CREATE, create);

// Get all payment fees (optional query: ?active=true)
router.get(ROUTE.PAYMENT.GET_ALL, getAll);

// Get payment fees by attendee type
router.get('/type/:type', getByType);

// Get payment fee by ID
router.get(ROUTE.PAYMENT.GET_BY_ID, getById);

// Update payment fee
router.put(ROUTE.PAYMENT.UPDATE, update);

// Toggle payment fee active status
router.patch(ROUTE.PAYMENT.TOGGLE_STATUS, toggleStatus);

// Delete payment fee
router.delete(ROUTE.PAYMENT.DELETE, remove);

export default router;
