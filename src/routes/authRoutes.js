import express from "express";
import { loginSuperAdmin, loginUser, registerUser, registerSuperAdmin, verifyAuth } from "../controllers/authController.js";

const router = express.Router();

router.post("/user/signup", registerUser);
router.post("/super-admin/login", loginSuperAdmin);
router.post("/super-admin/signup", registerSuperAdmin);
router.get("/logout", loginUser);
router.get("/verify-auth", verifyAuth)

export default router;
