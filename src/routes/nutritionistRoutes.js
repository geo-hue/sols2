import express from 'express';
import multer from 'multer';
import { createCertifiedNutritionist, retrieveData } from '../controllers/certifiedNutritionistController.js';

const router = express.Router();
const upload = multer();

router.post('/register', 
  upload.fields([
    { name: 'portraitPhoto', maxCount: 1 },
    { name: 'certificationProof', maxCount: 1 },
    { name: 'residentialAddressProof', maxCount: 1 }
  ]), 
  createCertifiedNutritionist
);

router.get('/list-of-all-nutritionists', retrieveData)

export default router;
