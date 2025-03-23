import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nin: string;
}

export interface IEmployment {
  status: string;
  currentJobRole: string;
  currentWorkPlaceName?: string;
  yearsWithCurrentEmployer?: number;
}

export interface IEducation {
  highestLevel: string;
  yearGraduated: Date;
  certificationProof: string;
}

export interface ILocation {
  stateOfResidence: string;
  cityOfResidence: string;
  currentResidentialAddress: string;
  residentialAddressProof: string;
}

export interface ICertifiedTherapist extends Document {
  _id: string;
  certificateNumber: string;
  specialty: string;
  portraitPhoto: string;
  personalInfo: IPersonalInfo;
  employment: IEmployment;
  education: IEducation;
  location: ILocation;
  referralNumber?: string;
  verificationStatus: 'Verified' | 'Unverified';
}

const certifiedTherapistSchema = new Schema<ICertifiedTherapist>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    certificateNumber: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    portraitPhoto: {
      type: String,
      required: true,
    },
    personalInfo: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function (v: string) {
            return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email address!`,
        },
      },
      phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function (v: string) {
            return /^\d{10,15}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      },
      nin: {
        type: String,  
        required: true,
        unique: true
      },
    },
    employment: {
      status: {
        type: String,
        required: true,
      },
      currentJobRole: {
        type: String,
        required: true,
      },
      currentWorkPlaceName: {
        type: String,
      },
      yearsWithCurrentEmployer: {
        type: Number,
      },
    },
    education: {
      highestLevel: {
        type: String,
        required: true,
      },
      yearGraduated: {
        type: Date,
        required: true,
      },
      certificationProof: {
        type: String,
        required: true,
      },
    },
    location: {
      stateOfResidence: {
        type: String,
        required: true,
      },
      cityOfResidence: {
        type: String,
        required: true,
      },
      currentResidentialAddress: {
        type: String,
        required: true,
      },
      residentialAddressProof: {
        type: String,
        required: true,
      },
    },
    referralNumber: {
      type: String,
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["Verified", "Unverified"],
      default: "Unverified"
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICertifiedTherapist>("CertifiedTherapist", certifiedTherapistSchema);