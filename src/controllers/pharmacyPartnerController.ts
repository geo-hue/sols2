import { Request, Response } from 'express';
import PharmacyPartner from "../models/PharmacyPartner";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { generateReferralCode } from "../utils/generateReferralCode";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE,
} from "../config/config";
import { SendMailClient } from "zeptomail";
import { FileRequest } from '../../types';

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

const client = new SendMailClient({ url, token: token || '' });

export const createPharmacyPartner = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    const {
      businessRegistration,
      pharmacyName,
      ownerInformation,
      operations,
      headquarters,
    } = req.body;

    // Check if a pharmacy with the same owner's email or phone number already exists
    const existingPharmacy = await PharmacyPartner.findOne({
      $or: [
        { "ownerInformation.email": ownerInformation.email },
        { "ownerInformation.phoneNumber": ownerInformation.phoneNumber },
      ],
    });

    if (existingPharmacy) {
      res.status(400).json({
        message: "A pharmacy with this email or phone number already exists.",
      });
      return;
    }

    // Upload images to Cloudinary
    const cacCertificateProofUrl = await uploadToCloudinary(
      req.files.cacCertificateProof[0].buffer
    );
    const pcnProofUrl = await uploadToCloudinary(
      req.files.pcnProof[0].buffer
    );
    const addressProofUrl = await uploadToCloudinary(
      req.files.addressProof[0].buffer
    );


    const referralCode = `SP-${generateReferralCode(
      ownerInformation.firstName,
      pharmacyName
    )}`;

    // Create a new pharmacy partner
    const newPharmacyPartner = new PharmacyPartner({
      businessRegistration: {
        ...businessRegistration,
        cacCertificateProof: cacCertificateProofUrl,
      },
      pharmacyName,
      referralCode,
      ownerInformation: {
        ...ownerInformation,
        pcnProof: pcnProofUrl,
      },
      operations,
      headquarters: {
        ...headquarters,
        addressProof: addressProofUrl,
      },
    });

    await newPharmacyPartner.save();

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
        merge_info: {
          firstName: ownerInformation.firstName,
          referralCode: referralCode,
        },
        subject: "✉️ Your Solace Referral Code is Here!",
      })
      .then((response) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    res.status(201).json({
      message: "Pharmacy Partner created successfully",
      pharmacyPartner: newPharmacyPartner,
    });
  } catch (error) {
    console.error("Error creating Pharmacy Partner:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error creating Pharmacy Partner",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error creating Pharmacy Partner",
        error: "Unknown error occurred",
      });
    }
  }
};

export const retrievePharmacies = async (req: Request, res: Response): Promise<void> => {
  try {
    const pharmacies = await PharmacyPartner.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(pharmacies);
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error fetching pharmacies",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error fetching pharmacies",
        error: "Unknown error occurred",
      });
    }
  }
};