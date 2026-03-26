import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import * as enquiryController from '../controllers/enquiry.controller';

const router = Router();

router.post(ROUTE.ENQUERY.CREATE, enquiryController.create);
router.get(ROUTE.ENQUERY.GET_ALL, enquiryController.getAll);
router.get(ROUTE.ENQUERY.GET_BY_ID, enquiryController.getById);
router.put(ROUTE.ENQUERY.UPDATE, enquiryController.update);
router.delete(ROUTE.ENQUERY.DELETE, enquiryController.remove);

export default router;
