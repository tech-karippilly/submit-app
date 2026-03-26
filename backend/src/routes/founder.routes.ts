import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  create,
  getAll,
  getById,
  getByType,
  update,
  remove,
} from '../controllers/founder.controller';

const router = Router();

// Create a new founder
router.post(ROUTE.FOUNDER.CREATE, create);

// Get all founders
router.get(ROUTE.FOUNDER.GET_ALL, getAll);

// Get founders by type (Founder or CoFounder)
router.get(ROUTE.FOUNDER.GET_BY_TYPE, getByType);

// Get founder by ID
router.get(ROUTE.FOUNDER.GET_BY_ID, getById);

// Update founder
router.put(ROUTE.FOUNDER.UPDATE, update);

// Delete founder
router.delete(ROUTE.FOUNDER.DELETE, remove);

export default router;
