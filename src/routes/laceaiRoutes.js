import express from "express";
import {
  handleFormSubmission,
  retrieveData,
} from "../controllers/laceaiController.js";

// Initialize express router
const router = express.Router();

// Define routes
router.post("/join", handleFormSubmission);

router.get("/fetch-waitlist", retrieveData);

export default router;
