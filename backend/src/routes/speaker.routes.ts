import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  create,
  getAll,
  getById,
  update,
  remove,
} from '../controllers/speaker.controller';

const router = Router();

// Create a new speaker
router.post(ROUTE.SPEAKER.CREATE, create);

// Get all speakers
router.get(ROUTE.SPEAKER.GET_ALL, getAll);

// Get speaker by ID
router.get(ROUTE.SPEAKER.GET_BY_ID, getById);

// Update speaker
router.put(ROUTE.SPEAKER.UPDATE, update);

// Delete speaker
router.delete(ROUTE.SPEAKER.DELETE, remove);

export default router;
