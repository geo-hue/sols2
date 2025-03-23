import express from 'express';
import multer from 'multer';
import { createPharmacyPartner, retrievePharmacies } from '../controllers/pharmacyPartnerController.js';

const router = express.Router();
const upload = multer();

router.post(
  '/register',
  upload.fields([
    { name: 'cacCertificateProof', maxCount: 1 },
    { name: 'pcnProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
  ]),
  createPharmacyPartner
);

router.get('/list-of-all-pharmacies', retrievePharmacies);

export default router;
