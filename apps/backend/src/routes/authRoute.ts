import { Router } from "express";
import { iAM, loginController } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginController);

router.get("/me", authenticate, iAM)


export default router;