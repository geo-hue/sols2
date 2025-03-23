import express from "express";
import multer from "multer";
import {
  createPartner,
  retrieveSolacePartners,
} from "../controllers/solacePartnerController";

const router = express.Router();
const upload = multer();

router.post(
  "/register",
  upload.fields([
    { name: "cacCertificateProof", maxCount: 1 },
    { name: "proofOfAgentAddress", maxCount: 1 },
  ]),
  createPartner as express.RequestHandler
);

router.get("/list-of-all-partners", retrieveSolacePartners);

export default router;