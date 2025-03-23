import CertifiedUndertaker from "../models/CertifiedUndertaker.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { SendMailClient } from "zeptomail";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE,
} from "../config/config.js";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const createCertifiedUndertaker = async (req, res) => {
  try {
    const {
      cacOrBnNumber,
      servicesOffered,
      personalInfo,
      officeLocation,
      referralNumber,
    } = req.body;

    //Check for existing Undertaker
    const findExistingUndertaker = await CertifiedUndertaker.findOne({
      $or: [
        { "personalInfo.email": personalInfo.email },
        { "personalInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if (findExistingUndertaker) {
      res
        .status(409)
        .json({
          message: "Undertaker with this email or phone number already exists",
        });
    }

    // Upload images to Cloudinary
    const portraitPhotoUrl = await uploadToCloudinary(
      req.files.portraitPhoto[0].buffer
    );
    const addressProofUrl = await uploadToCloudinary(
      req.files.addressProof[0].buffer
    );

    const newUndertaker = new CertifiedUndertaker({
      cacOrBnNumber,
      servicesOffered,
      portraitPhoto: portraitPhotoUrl,
      personalInfo,
      officeLocation: {
        ...officeLocation,
        address: {
          ...officeLocation.address,
          proof: addressProofUrl,
        },
      },
      referralNumber,
    });

    await newUndertaker.save();

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
        message: "Certified Undertaker created successfully",
        undertaker: newUndertaker,
      });
  } catch (error) {
    console.error("Error creating Certified Undertaker:", error);
    res
      .status(500)
      .json({
        message: "Error creating Certified Undertaker",
        error: error.message,
      });
  }
};

export const retrieveData = async (req, res) => {
  try {
    const undertakers = await CertifiedUndertaker.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(undertakers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
};
