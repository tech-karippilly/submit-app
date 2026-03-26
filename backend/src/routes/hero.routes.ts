import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import { get, update } from '../controllers/hero.controller';

const router = Router();

// Get hero section
router.get(ROUTE.HERO.GET, get);

// Update hero section
router.put(ROUTE.HERO.UPDATE, update);

export default router;
