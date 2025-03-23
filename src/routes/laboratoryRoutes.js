import express from 'express';
import multer from 'multer';
import { createLaboratoryPartner, retrieveLaboratories } from '../controllers/laboratoryPartnerController.js';

const router = express.Router();
const upload = multer();

router.post(
  '/register',
  upload.fields([
    { name: 'cacCertificateProof', maxCount: 1 },
    { name: 'licenseToOperateProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
  ]),
  createLaboratoryPartner
);

router.get('/list-of-all-laboratories', retrieveLaboratories);

export default router;
