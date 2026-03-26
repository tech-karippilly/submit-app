import { Router } from 'express';
import { ROUTE } from '../constant/routes';
import * as eventTypeController from '../controllers/eventType.controller';

const router = Router();

router.post(ROUTE.EVENT_TYPE.CREATE, eventTypeController.create);
router.get(ROUTE.EVENT_TYPE.GET_ALL, eventTypeController.getAll);
router.get(ROUTE.EVENT_TYPE.GET_BY_ID, eventTypeController.getById);
router.put(ROUTE.EVENT_TYPE.UPDATE, eventTypeController.update);
router.delete(ROUTE.EVENT_TYPE.DELETE, eventTypeController.remove);

export default router;
