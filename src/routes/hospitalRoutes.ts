// src/routes/hospitalRoutes.ts
import express from "express";
import multer from "multer";
import {
  createHospitalOrClinic,
  retrieveHospitalsOrClinics,
} from "../controllers/hospitalController";

const router = express.Router();
const upload = multer();
router.post(
  "/register",
  upload.fields([
    { name: "cacCertificateProof", maxCount: 1 },
    { name: "licenseToOperateProof", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  createHospitalOrClinic as express.RequestHandler
);

router.get("/list-of-all-hospitals-or-clinics", retrieveHospitalsOrClinics);

export default router;