import { Request, Response } from 'express';
import QualifiedCaregiver from "../models/QualifiedCaregiver";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE,
} from "../config/config";
import { SendMailClient } from "zeptomail";
import { FileRequest } from '../../types';

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

const client = new SendMailClient({ url, token: token || '' });

export const createQualifiedCaregiver = async (req: FileRequest, res: Response): Promise<void> => {
  try {
    const { training, specialty, personalInfo, employment, location } =
      req.body;

    const findExistingCaregiver = await QualifiedCaregiver.findOne({
      $or: [
        { "personalInfo.email": personalInfo.email },
        { "personalInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if(findExistingCaregiver) {
      res.status(409).json({ message: "Caregiver already exists!" });
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

    const newCaregiver = new QualifiedCaregiver({
      training: {
        ...training,
        certificationProof: certificationProofUrl,
      },
      specialty,
      portraitPhoto: portraitPhotoUrl,
      personalInfo,
      employment,
      location: {
        ...location,
        residentialAddressProof: residentialAddressProofUrl,
      },
    });

    await newCaregiver.save();

    // send account creation successful email
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
      message: "Qualified Caregiver created successfully",
      caregiver: newCaregiver,
    });
  } catch (error) {
    console.error("Error creating Qualified Caregiver:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error creating Certified Caregiver",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error creating Certified Caregiver",
        error: "Unknown error occurred",
      });
    }
  }
};

export const retrieveData = async (req: Request, res: Response): Promise<void> => {
  try {
    const caregivers = await QualifiedCaregiver.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(caregivers);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Error fetching data: " + error.message });
    } else {
      res.status(500).json({ message: "Error fetching data: Unknown error occurred" });
    }
  }
};