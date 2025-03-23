import CertifiedNutritionist from '../models/CertifiedNutritionist.js';
import { SendMailClient } from 'zeptomail';
import { ZEPTOMAIL_TOKEN, ZEPTOMAIL_CAREGIVER_WELCOME_MAIL_TEMPLATE } from "../config/config.js";
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const createCertifiedNutritionist = async (req, res) => {
  try {
    const {
      certificateNumber,
      specialty,
      personalInfo,
      employment,
      education,
      location,
      referralNumber
    } = req.body;

    //Check for existing Therapist
    const findExistingNutritionist = await CertifiedNutritionist.findOne({
      $or: [
        { "personalInfo.email": personalInfo.email },
        { "personalInfo.phoneNumber": personalInfo.phoneNumber },
      ],
    });

    if(findExistingNutritionist){
      return res.status(409).json({ message: "Nutritionist with phone number or email already exists." });
    }

    // Upload images to Cloudinary
    const portraitPhotoUrl = await uploadToCloudinary(req.files.portraitPhoto[0].buffer);
    const certificationProofUrl = await uploadToCloudinary(req.files.certificationProof[0].buffer);
    const residentialAddressProofUrl = await uploadToCloudinary(req.files.residentialAddressProof[0].buffer);

    const newNutritionist = new CertifiedNutritionist({
      certificateNumber,
      specialty,
      portraitPhoto: portraitPhotoUrl,
      personalInfo,
      employment,
      education: {
        ...education,
        certificationProof: certificationProofUrl
      },
      location: {
        ...location,
        residentialAddressProof: residentialAddressProofUrl
      },
      referralNumber
    });

    await newNutritionist.save();

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

    res.status(201).json({ message: 'Certified Nutritionist created successfully', nutritionist: newNutritionist });
  } catch (error) {
    console.error('Error creating Certified Nutritionist:', error);
    res.status(500).json({ message: 'Error creating Certified Nutritionist', error: error.message });
  }
};

export const retrieveData = async (req, res) => {
  try {
    const nutritionists = await CertifiedNutritionist.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(nutritionists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data: " + error.message });
  }
};
