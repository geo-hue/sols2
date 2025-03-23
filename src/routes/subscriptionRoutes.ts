import express from "express";
import { getUserSubscriptions, getSubscriptionById } from "../controllers/subscriptionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/user/:email", authMiddleware, getUserSubscriptions);
router.get("/:type/:id", authMiddleware, getSubscriptionById);

export default router;