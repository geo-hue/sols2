import express from 'express';
import multer from 'multer';
import { createCertifiedTherapist, retrieveData } from '../controllers/certifiedTherapistController.js';

const router = express.Router();
const upload = multer();

router.post('/register', 
  upload.fields([
    { name: 'portraitPhoto', maxCount: 1 },
    { name: 'certificationProof', maxCount: 1 },
    { name: 'residentialAddressProof', maxCount: 1 }
  ]), 
  createCertifiedTherapist
);

router.get('/list-of-all-therapists', retrieveData)

export default router;
