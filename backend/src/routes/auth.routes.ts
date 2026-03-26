import { Router } from "express";
import { ROUTE } from "../constant/routes";
import { login } from "../controllers/auth.controller";

const router= Router()


router.post(ROUTE.AUTH.LOGIN,login)

export default router
