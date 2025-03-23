import express from "express";
import multer from "multer";
import {
  createCertifiedDoctor,
  retrieveData,
} from "../controllers/certifiedDoctorController.js";

const router = express.Router();
const upload = multer();

router.post(
  "/register",
  upload.fields([
    { name: "portraitPhoto", maxCount: 1 },
    { name: "certificationProof", maxCount: 1 },
    { name: "residentialAddressProof", maxCount: 1 },
  ]),
  createCertifiedDoctor
);

router.get("/list-of-all-doctors", retrieveData);

export default router;
