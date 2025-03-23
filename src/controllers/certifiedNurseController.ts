import { Request, Response } from 'express';
import CertifiedNurse from "../models/CertifiedNurse";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { ZEPTOMAIL_TOKEN, ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE } from "../config/config";
import { SendMailClient } from "zeptomail";
import { FileRequest } from '../../types';

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

const client = new SendMailClient({ url, token: token || '' });


export const createCertifiedNurse = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    const {
      mcdnNumber,
      specialty,
      personalInfo,
      employment,
      education,
      location,
    } = req.body;

     // Check for existing Nurse
     const findExistingNurse = await CertifiedNurse.findOne({
      $or: [
        { "personalInfo.email": personalInfo.email },
        { "personalInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if(findExistingNurse) {
      res.status(409).json({ message: "Nurse with phone number or email already exists." });
      return;
    }

    // Upload images to Cloudinary
    const portraitPhotoUrl = await uploadToCloudinary(
      req.files.portraitPhoto[0].buffer
    );
    const certificationProofUrl = await uploadToCloudinary(
      req.files.certificationProof[0].buffer
    );
    const residentialAddressProofUrl = await uploadToCloudinary(
      req.files.residentialAddressProof[0].buffer
    );

    const newNurse = new CertifiedNurse({
      mcdnNumber,
      specialty,
      portraitPhoto: portraitPhotoUrl,
      personalInfo,
      employment,
      education: {
        ...education,
        certificationProof: certificationProofUrl,
      },
      location: {
        ...location,
        residentialAddressProof: residentialAddressProofUrl,
      },
    });

    await newNurse.save();

    // Send account creation successful email
    client
    .sendMail({
      mail_template_key: ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE || '',
      from: {
        address: "paul@solace.com.ng",
        name: "Paul Oseghale",
      },
      to: [
        {
          email_address: {
            address: personalInfo.email,
            name: personalInfo.firstName,
          },
        },
      ],
      merge_info: { firstName: personalInfo.firstName },
      subject: "✉️ Welcome To Solace!",
    })
    .then((response) => console.log("success"))
    .catch((error) => console.log(error, "error"));

    res.status(201).json({
      message: "Certified Nurse created successfully",
      nurse: newNurse,
    });
  } catch (error) {
    console.error("Error creating Certified Nurse:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error creating Certified Nurse",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error creating Certified Nurse",
        error: "Unknown error occurred",
      });
    }
  }
};

export const retrieveData = async (req: Request, res: Response): Promise<void> => {
  try {
    const nurses = await CertifiedNurse.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(nurses);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching data: " + error.message });
    } else {
      res.status(500).json({ message: "Error fetching data: Unknown error occurred" });
    }
  }
};