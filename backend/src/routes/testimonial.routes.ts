import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  toggleStatus,
} from '../controllers/testimonial.controller';

const router = Router();

// Create a new testimonial
router.post(ROUTE.TESTIMONIALS.CREATE, create);

// Get all testimonials
router.get(ROUTE.TESTIMONIALS.GET_ALL, getAll);

// Get testimonial by ID
router.get(ROUTE.TESTIMONIALS.GET_BY_ID, getById);

// Update testimonial
router.put(ROUTE.TESTIMONIALS.UPDATE, update);

// Delete testimonial
router.delete(ROUTE.TESTIMONIALS.DELETE, remove);

// Toggle testimonial status
router.patch(ROUTE.TESTIMONIALS.TOGGLE_STATUS, toggleStatus);

export default router;
