import express from "express";
import multer from "multer";
import {
  createCertifiedUndertaker,
  retrieveData,
} from "../controllers/certifiedUndertakersController.js";

const router = express.Router();
const upload = multer();

router.post(
  "/register",
  upload.fields([
    { name: "portraitPhoto", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  createCertifiedUndertaker
);

router.get("/list-of-all-undertakers", retrieveData);

export default router;
