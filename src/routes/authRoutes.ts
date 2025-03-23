import express from "express";
import { 
  loginSuperAdmin, 
  loginUser, 
  registerUser, 
  registerSuperAdmin, 
  verifyAuth, 
  updateUser,
  verifyUser
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/user/signup", registerUser);
router.post("/super-admin/login", loginSuperAdmin);
router.post("/super-admin/signup", registerSuperAdmin);
router.get("/logout", loginUser);
router.get("/verify-auth", verifyAuth);
router.put("/user/:id", authMiddleware, updateUser);//new endpoint for updating user
router.put("/user/:id/verify", authMiddleware, verifyUser); // New endpoint for verifying user

export default router;