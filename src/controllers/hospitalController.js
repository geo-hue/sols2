import HospitalClinicPartner from '../models/HospitalClinicPartner.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { generateReferralCode } from "../utils/generateReferralCode.js";
import { ZEPTOMAIL_TOKEN, ZEPTOMAIL_PARTNER_REFERRAL_CODE_MAIL_TEMPLATE } from "../config/config.js";
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const createHospitalOrClinic = async (req, res) => {
  try {
    const {
      businessRegistration,
      nameOfHospitalOrClinic,
      ownerInformation,
      operations,
      headquarters,
    } = req.body;

    // Check if a hospital or clinic with the same owner's email or phone number already exists
    const existingHospitalOrClinic = await HospitalClinicPartner.findOne({
      $or: [
        { 'ownerInformation.email': ownerInformation.email },
        { 'ownerInformation.phoneNumber': ownerInformation.phoneNumber },
      ],
    });

    if (existingHospitalOrClinic) {
      return res.status(400).json({
        message: "A hospital or clinic with this email or phone number already exists.",
      });
    }

    // Upload documents to Cloudinary
    const cacCertificateProofUrl = await uploadToCloudinary(
      req.files.cacCertificateProof[0].buffer
    );
    const licenseToOperateProofUrl = await uploadToCloudinary(
      req.files.licenseToOperateProof[0].buffer
    );
    const addressProofUrl = await uploadToCloudinary(
      req.files.addressProof[0].buffer
    );

    const referralCode = `SP-${generateReferralCode(
      ownerInformation.firstName,
      nameOfHospitalOrClinic
    )}`;

    // Create a new hospital or clinic
    const newHospitalOrClinic = new HospitalClinicPartner({
      businessRegistration: {
        ...businessRegistration,
        cacCertificateProof: cacCertificateProofUrl,
      },
      nameOfHospitalOrClinic,
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
    
    await newHospitalOrClinic.save();

   //Send Referral code email
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
             address: ownerInformation.email,
             name: ownerInformation.firstName,
           },
         },
       ],
       merge_info: { firstName: ownerInformation.firstName, referralCode: referralCode },
       subject: "✉️ Your Solace Referral Code is Here!",
     })
     .then((response) => console.log("success"))
     .catch((error) => console.log(error, "error"));

    res.status(201).json({
      message: "Hospital or Clinic created successfully",
      hospitalOrClinic: newHospitalOrClinic,
    });
  } catch (error) {
    console.error("Error creating Hospital or Clinic:", error);
    res.status(500).json({
      message: "Error creating Hospital or Clinic",
      error: error.message,
    });
  }
};

export const retrieveHospitalsOrClinics = async (req, res) => {
  try {
    const hospitalsOrClinics = await HospitalClinicPartner.find().sort({ timestamp: -1 }).limit(20);
    res.status(200).json(hospitalsOrClinics);
  } catch (error) {
    console.error("Error fetching Hospitals or Clinics:", error);
    res.status(500).json({
      message: "Error fetching Hospitals or Clinics",
      error: error.message,
    });
  }
};
