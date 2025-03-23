import express from "express";
import { getRegistrantsDetails } from "../controllers/usersController.js";
// import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/list-of-all-registrants", getRegistrantsDetails);

export default router;
