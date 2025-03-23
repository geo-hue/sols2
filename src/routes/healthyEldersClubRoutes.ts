import express from "express";
import { createHealthEldersClubSubscription, retrieveData } from "../controllers/healthyEldersClubController";

const router = express.Router();

// Route for handling form submissions with file upload
router.post("/subscribe", createHealthEldersClubSubscription);

// Route for retrieving data from the database
router.get("/retrieve-data", retrieveData);

export default router;