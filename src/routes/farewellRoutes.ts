import express from "express";
import multer from "multer";
import {
  createFarewellCoverPlan,
  retrieveData,
} from "../controllers/farewellCoverController";

const router = express.Router();
const upload = multer();

// Route to handle form submission
router.post(
  "/subscribe",
  upload.fields([{ name: "photo", maxCount: 1 }]),
  createFarewellCoverPlan as express.RequestHandler
);

// Route to retrieve data
router.get("/retrieve-data", retrieveData);

export default router;