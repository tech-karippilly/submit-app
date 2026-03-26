import { Router } from "express";
import { ROUTE } from "../constant/routes";
import * as eventController from "../controllers/event.controller";

const router = Router();

router.post(ROUTE.EVENT.CREATE, eventController.create);
router.get(ROUTE.EVENT.GET_ALL, eventController.getAll);
router.get(ROUTE.EVENT.GET_BY_ID, eventController.getById);
router.get(ROUTE.EVENT.GET_REGISTRATION_FEE_BY_ID, eventController.getRegistrationFeeById);
router.put(ROUTE.EVENT.UPDATE, eventController.update);
router.patch(ROUTE.EVENT.CHANGE_STATUS, eventController.changeStatus);
router.delete(ROUTE.EVENT.DELETE, eventController.remove);

export default router;
