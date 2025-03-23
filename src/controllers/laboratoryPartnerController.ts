import { Request, Response } from 'express';
import LaboratoryPartner from "../models/LaboratoryPartner";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE,
} from "../config/config";
import { generateReferralCode } from "../utils/generateReferralCode";
import { SendMailClient } from "zeptomail";
import { FileRequest } from '../../types';

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

const client = new SendMailClient({ url, token: token || '' });

export const createLaboratoryPartner = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    const {
      businessRegistration,
      laboratoryName,
      ownerInformation,
      operations,
      headquarters,
    } = req.body;

    // Check if a laboratory with the same owner's email or phone number already exists
    const findExistingLaboratory = await LaboratoryPartner.findOne({
      $or: [
        { "ownerInformation.email": ownerInformation.email },
        { "ownerInformation.phoneNumber": ownerInformation.phoneNumber },
      ],
    });

    if (findExistingLaboratory) {
      res.status(400).json({
        message: "A Laboratory with this email or phone number already exists.",
      });
      return;
    }

    // Upload documents to Cloudinary
    const cacCertificateProofUrl = await uploadToCloudinary(
      req.files.cacCertificateProof[0].buffer
    );
    const licenseToOperateProofUrl = await uploadToCloudinary(req.files.licenseToOperateProof[0].buffer);
    const addressProofUrl = await uploadToCloudinary(req.files.addressProof[0].buffer);

    const referralCode = `SP-${generateReferralCode(
      ownerInformation.firstName,
      laboratoryName
    )}`;

    // Create a new laboratory partner
    const newLaboratoryPartner = new LaboratoryPartner({
      businessRegistration: {
        ...businessRegistration,
        cacCertificateProof: cacCertificateProofUrl,
      },
      laboratoryName,
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

    await newLaboratoryPartner.save();

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
      message: "Laboratory Partner created successfully",
      laboratoryPartner: newLaboratoryPartner,
    });
  } catch (error) {
    console.error("Error creating Laboratory Partner:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error creating Laboratory Partner",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error creating Laboratory Partner",
        error: "Unknown error occurred",
      });
    }
  }
};

export const retrieveLaboratories = async (req: Request, res: Response): Promise<void> => {
  try {
    const laboratories = await LaboratoryPartner.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(laboratories);
  } catch (error) {
    console.error("Error fetching laboratories:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error fetching laboratories",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error fetching laboratories",
        error: "Unknown error occurred",
      });
    }
  }
};