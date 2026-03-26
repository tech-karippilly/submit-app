import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import { get, update } from '../controllers/about.controller';

const router = Router();

// Get about page content
router.get(ROUTE.ABOUT.GET, get);

// Update about page content
router.put(ROUTE.ABOUT.UPDATE, update);

export default router;
