import CertifiedDoctor from "../models/CertifiedDoctor.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE,
} from "../config/config.js";
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const createCertifiedDoctor = async (req, res) => {
  try {
    const {
      mcdnNumber,
      specialty,
      personalInfo,
      employment,
      education,
      location,
    } = req.body;

    // Check if a Doctor with the same owner's email or phone number already exists
    const findExistingDoctor = await CertifiedDoctor.findOne({
      $or: [
        { "personallInfo.email": personalInfo.email },
        { "personallInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if (findExistingDoctor) {
      return res.status(400).json({
        message: "Doctor with this email or phone number already exists.",
      });
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

    const newDoctor = new CertifiedDoctor({
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

    await newDoctor.save();

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
      message: "Certified Doctor created successfully",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error("Error creating Certified Doctor:", error);
    res.status(500).json({
      message: "Error creating Certified Doctor",
      error: error.message,
    });
  }
};

export const retrieveData = async (req, res) => {
  try {
    const doctors = await CertifiedDoctor.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
};
