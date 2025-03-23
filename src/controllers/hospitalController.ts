import { Request, Response } from 'express';
import HospitalClinicPartner from '../models/HospitalClinicPartner';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { generateReferralCode } from "../utils/generateReferralCode";
import { ZEPTOMAIL_TOKEN, ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE } from "../config/config";
import { SendMailClient } from "zeptomail";
import { FileRequest } from '../../types';

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

const client = new SendMailClient({ url, token: token || '' });

export const createHospitalOrClinic = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    const {
      businessRegistration,
      nameOfHospitalOrClinic,
      ownerInformation,
      operations,
      headquarters,
    } = req.body;

    // Check if a hospital or clinic with the same owner's email or phone number already exists
    const existingHospitalOrClinic = await HospitalClinicPartner.findOne({
      $or: [
        { 'ownerInformation.email': ownerInformation.email },
        { 'ownerInformation.phoneNumber': ownerInformation.phoneNumber },
      ],
    });

    if (existingHospitalOrClinic) {
      res.status(400).json({
        message: "A hospital or clinic with this email or phone number already exists.",
      });
      return;
    }

    // Upload documents to Cloudinary
    const cacCertificateProofUrl = await uploadToCloudinary(
      req.files.cacCertificateProof[0].buffer
    );
    const licenseToOperateProofUrl = await uploadToCloudinary(
      req.files.licenseToOperateProof[0].buffer
    );
    const addressProofUrl = await uploadToCloudinary(
      req.files.addressProof[0].buffer
    );

    const referralCode = `SP-${generateReferralCode(
      ownerInformation.firstName,
      nameOfHospitalOrClinic
    )}`;

    // Create a new hospital or clinic
    const newHospitalOrClinic = new HospitalClinicPartner({
      businessRegistration: {
        ...businessRegistration,
        cacCertificateProof: cacCertificateProofUrl,
      },
      nameOfHospitalOrClinic,
      referralCode,
      ownerInformation: {
        ...ownerInformation,
        licenseToOperateProof: licenseToOperateProofUrl,
      },
      operations,
      headquarters: {
        ...headquarters,
        addressProof: addressProofUrl,
      },
    });
    
    await newHospitalOrClinic.save();

   //Send Referral code email
   client
     .sendMail({
       mail_template_key: ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE || '',
       from: {
         address: "paul@solace.com.ng",
         name: "Paul Oseghale",
       },
       to: [
         {
           email_address: {
             address: ownerInformation.email,
             name: ownerInformation.firstName,
           },
         },
       ],
       merge_info: { firstName: ownerInformation.firstName, referralCode: referralCode },
       subject: "✉️ Your Solace Referral Code is Here!",
     })
     .then((response) => console.log("success"))
     .catch((error) => console.log(error, "error"));

    res.status(201).json({
      message: "Hospital or Clinic created successfully",
      hospitalOrClinic: newHospitalOrClinic,
    });
  } catch (error) {
    console.error("Error creating Hospital or Clinic:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error creating Hospital or Clinic",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error creating Hospital or Clinic",
        error: "Unknown error occurred",
      });
    }
  }
};

export const retrieveHospitalsOrClinics = async (req: Request, res: Response): Promise<void> => {
  try {
    const hospitalsOrClinics = await HospitalClinicPartner.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(hospitalsOrClinics);
  } catch (error) {
    console.error("Error fetching Hospitals or Clinics:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error fetching Hospitals or Clinics",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error fetching Hospitals or Clinics",
        error: "Unknown error occurred",
      });
    }
  }
};