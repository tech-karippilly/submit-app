import { Router } from 'express';
import {
  getAll,
  getSummary,
  getById,
  getByEventId,
} from '../controllers/transaction.controller';

const router = Router();

// Get all transactions
router.get('/', getAll);

// Get transaction summary
router.get('/summary', getSummary);

// Get transactions by event ID
router.get('/event/:eventId', getByEventId);

// Get transaction by ID
router.get('/:id', getById);

export default router;
