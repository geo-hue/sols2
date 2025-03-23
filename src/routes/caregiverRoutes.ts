import express from 'express';
import multer from 'multer';
import {authMiddleware} from '../middlewares/authMiddleware'
import { createQualifiedCaregiver, retrieveData } from '../controllers/qualifiedCaregiverController';

const router = express.Router();
const upload = multer();

router.post('/register', 
  upload.fields([
    { name: 'portraitPhoto', maxCount: 1 },
    { name: 'certificationProof', maxCount: 1 },
    { name: 'residentialAddressProof', maxCount: 1 }
  ]), 
  createQualifiedCaregiver as express.RequestHandler
);

router.get('/list-of-all-caregivers', retrieveData)


export default router;
