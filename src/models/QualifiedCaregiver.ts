import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ITraining {
  isTrained: string;
  schoolAttended: string;
  yearGraduated?: Date;
  certificationProof: string;
}

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

export interface ILocation {
  stateOfResidence: string;
  cityOfResidence: string;
  currentResidentialAddress: string;
  residentialAddressProof: string;
}

export interface IQualifiedCaregiver extends Document {
  _id: string;
  training: ITraining;
  specialty: string;
  portraitPhoto: string;
  personalInfo: IPersonalInfo;
  employment: IEmployment;
  location: ILocation;
  verificationStatus: 'Verified' | 'Unverified';
}

const certifiedCaregiverSchema = new Schema<IQualifiedCaregiver>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    training: {
      isTrained: {
        type: String,
        required: true
      },
      schoolAttended: {
        type: String,
        required: true,
      },
      yearGraduated: {
        type: Date,
      },
      certificationProof: {
        type: String,
        required: true,
      },
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
    verificationStatus: {
      type: String,
      required: true,
      enum: ["Verified", "Unverified"],
      default: "Unverified"
    }
  },
  { timestamps: true }
);

export default mongoose.model<IQualifiedCaregiver>("QualifiedCaregiver", certifiedCaregiverSchema);