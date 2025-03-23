import SolacePartners from "../models/SolacePartners.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { generateReferralCode } from "../utils/generateReferralCode.js";
import {
  ZEPTOMAIL_TOKEN,
  ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE,
} from "../config/config.js";
import { SendMailClient } from "zeptomail";

// Initialize ZeptoMail client
const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;
let client = new SendMailClient({ url, token });

export const createPartner = async (req, res) => {
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
      return res.status(409).json({
        message:
          "A partner with the same email or phone number already exists.",
      });
    }

    // Check if files exist in the request
    if (
      !req.files ||
      !req.files.cacCertificateProof ||
      !req.files.proofOfAgentAddress
    ) {
      return res
        .status(400)
        .json({ message: "File upload fields are missing." });
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
      
      },
    );

    await newPartner.save();

    // Send referral code email
    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE,
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
    res.status(500).json({ message: `Error: ${error}` });
  }
};

// Retrieve list of Solace partners
export const retrieveSolacePartners = async (req, res) => {
  try {
    const partnersList = await SolacePartners.find().sort({ timestamp: -1 }).limit(20); 
    // if (partnersList.length === 0) {
    //   return res.status(404).json({ message: "No Registrants Yet!" });
    // }
    res.status(200).json(partnersList);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({
      message: "Error fetching partners",
      error: error.message,
    });
  }
};
