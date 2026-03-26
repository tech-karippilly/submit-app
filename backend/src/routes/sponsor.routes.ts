import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import {
  create,
  getAll,
  getByTier,
  getByType,
  getById,
  update,
  remove,
  toggleStatus,
} from '../controllers/sponsor.controller';

const router = Router();

// Create a new sponsor/partner
router.post(ROUTE.SPONSOR.CREATE, create);

// Get all sponsors/partners (with optional query filters)
router.get(ROUTE.SPONSOR.GET_ALL, getAll);

// Get sponsors by tier (diamond, platinum, gold)
router.get(ROUTE.SPONSOR.GET_BY_TIER, getByTier);

// Get sponsors by type (sponsor or partner)
router.get(ROUTE.SPONSOR.GET_BY_TYPE, getByType);

// Toggle sponsor/partner active status
router.patch(ROUTE.SPONSOR.TOGGLE_STATUS, toggleStatus);

// Get sponsor/partner by ID
router.get(ROUTE.SPONSOR.GET_BY_ID, getById);

// Update sponsor/partner
router.put(ROUTE.SPONSOR.UPDATE, update);

// Delete sponsor/partner
router.delete(ROUTE.SPONSOR.DELETE, remove);

export default router;
