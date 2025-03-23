import QualifiedCaregiver from "../models/QualifiedCaregiver.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE,
} from "../config/config.js";
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const createQualifiedCaregiver = async (req, res) => {
  try {
    const { training, specialty, personalInfo, employment, location } =
      req.body;

    const findExistingCaregiver = await QualifiedCaregiver.findOne({
      $or: [
        { "personalInfo.email": personalInfo.email },
        { "personalInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if(findExistingCaregiver){
      return res.status(409).json({ message: "Caregiver already exists!" });
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
        mail_template_key: ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE,
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
    res.status(500).json({
      message: "Error creating Certified Caregiver",
      error: error.message,
    });
  }
};

export const retrieveData = async (req, res) => {
  try {
    const caregivers = await QualifiedCaregiver.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(caregivers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
};
