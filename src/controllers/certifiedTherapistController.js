import CertifiedTherapist from "../models/CertifiedTherapist.js";
import { SendMailClient } from "zeptomail";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE,
} from "../config/config.js";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const createCertifiedTherapist = async (req, res) => {
  try {
    const {
      certificateNumber,
      specialty,
      personalInfo,
      employment,
      education,
      location,
      referralNumber,
    } = req.body;

    //Check for existing Therapist
    const findExistingTherapist = await CertifiedTherapist.findOne({
      $or: [
        { "personalInfo.email": personalInfo.email },
        { "personalInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if(findExistingTherapist){
      return res.status(409).json({ message: "Therapist with phone number or email already exists." });
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

    const newTherapist = new CertifiedTherapist({
      certificateNumber,
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
      referralNumber,
    });

    await newTherapist.save();

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

    res
      .status(201)
      .json({
        message: "Certified Therapist created successfully",
        therapist: newTherapist,
      });
  } catch (error) {
    console.error("Error creating Certified Therapist:", error);
    res
      .status(500)
      .json({
        message: "Error creating Certified Therapist",
        error: error.message,
      });
  }
};

export const retrieveData = async (req, res) => {
  try {
    const therapists = await CertifiedTherapist.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(therapists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
};
