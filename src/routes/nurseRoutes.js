import express from 'express';
import multer from 'multer';
import { createCertifiedNurse, retrieveData } from '../controllers/certifiedNurseController.js';

const router = express.Router();
const upload = multer();

router.post('/register', 
  upload.fields([
    { name: 'portraitPhoto', maxCount: 1 },
    { name: 'certificationProof', maxCount: 1 },
    { name: 'residentialAddressProof', maxCount: 1 }
  ]), 
  createCertifiedNurse
);

router.get('/list-of-all-nurses', retrieveData);

export default router;
