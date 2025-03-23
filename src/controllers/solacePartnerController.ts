import { Request, Response } from 'express';
import SolacePartners from "../models/SolacePartners";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { generateReferralCode } from "../utils/generateReferralCode";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE,
} from "../config/config";
import { SendMailClient } from "zeptomail";
import { FileRequest } from '../../types';

// Initialize ZeptoMail client
const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;
const client = new SendMailClient({ url, token: token || '' });

export const createPartner = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    const { ownerPersonalInformation, businessInformation } = req.body;

    // Check if a partner with the same email or phone number already exists
    const findExistingPartner = await SolacePartners.findOne({
      $or: [
        { "ownerPersonalInformation.email": ownerPersonalInformation.email },
        {
          "ownerPersonalInformation.phoneNumber":
            ownerPersonalInformation.phoneNumber,
        },
      ],
    });

    if (findExistingPartner) {
      res.status(409).json({
        message:
          "A partner with the same email or phone number already exists.",
      });
      return;
    }

    // Check if files exist in the request
    if (
      !req.files ||
      !req.files.cacCertificateProof ||
      !req.files.proofOfAgentAddress
    ) {
      res
        .status(400)
        .json({ message: "File upload fields are missing." });
      return;
    }

    // Upload images to Cloudinary
    const cacCertificateProofUrl = await uploadToCloudinary(
      req.files.cacCertificateProof[0].buffer
    );
    const proofOfAgentAddressUrl = await uploadToCloudinary(
      req.files.proofOfAgentAddress[0].buffer
    );

    // Generate referral code
    const referralCode = `SP-${generateReferralCode(
      ownerPersonalInformation.firstName,
      businessInformation.businessName
    )}`;

    // Create a new partner record in the database
    const newPartner = new SolacePartners({
      ownerPersonalInformation: {
        ...ownerPersonalInformation,
        referralCode: referralCode,
      },
      businessInformation: {
        ...businessInformation,
        cacCertificateProof: cacCertificateProofUrl,
        location: {
          ...businessInformation.location,
          proofOfAgentAddress: proofOfAgentAddressUrl,
        },
      }
    });

    await newPartner.save();

    // Send referral code email
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
              address: ownerPersonalInformation.email,
              name: ownerPersonalInformation.firstName,
            },
          },
        ],
        merge_info: {
          firstName: ownerPersonalInformation.firstName,
          referralCode: referralCode,
        },
        subject: "✉️ Your Solace Referral Code is Here!",
      })
      .then((response) => console.log("Email sent successfully"))
      .catch((error) => console.error("Failed to send email:", error));

    // Respond with success message
    res.status(201).json({
      message: "Partner created successfully",
      partnerDetails: newPartner,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: `Error: ${error.message}` });
    } else {
      res.status(500).json({ message: `Error: Unknown error occurred` });
    }
  }
};

// Retrieve list of Solace partners
export const retrieveSolacePartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const partnersList = await SolacePartners.find().sort({ timestamp: -1 }).limit(20); 
    res.status(200).json(partnersList);
  } catch (error) {
    console.error("Error fetching partners:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error fetching partners",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error fetching partners",
        error: "Unknown error occurred",
      });
    }
  }
};