import express from 'express';
import multer from 'multer';
import {authMiddleware} from '../middlewares/authMiddleware.js'
import { createQualifiedCaregiver, retrieveData } from '../controllers/qualifiedCaregiverController.js';

const router = express.Router();
const upload = multer();

router.post('/register', 
  upload.fields([
    { name: 'portraitPhoto', maxCount: 1 },
    { name: 'certificationProof', maxCount: 1 },
    { name: 'residentialAddressProof', maxCount: 1 }
  ]), 
  createQualifiedCaregiver
);

router.get('/list-of-all-caregivers', retrieveData)


export default router;
