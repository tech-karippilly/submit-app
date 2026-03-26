import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import { get, update } from '../controllers/contact.controller';

const router = Router();

// Get contact details
router.get(ROUTE.CONTACT.GET, get);

// Update contact details
router.put(ROUTE.CONTACT.UPDATE, update);

export default router;
