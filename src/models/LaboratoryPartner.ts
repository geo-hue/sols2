import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IBusinessRegistration {
  cacOrBnNumber: string;
  cacCertificateProof: string;
}

export interface IOwnerInformation {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nin: number;
  operationLicenseNumber: string;
  licenseToOperateProof: string;
}

export interface IOperations {
  numberOfLaboratories: number;
  numberOfStates: number;
}

export interface IHeadquarters {
  state: string;
  city: string;
  addressDetails: string;
  addressProof: string;
}

export interface ILaboratoryPartner extends Document {
  _id: string;
  businessRegistration: IBusinessRegistration;
  laboratoryName: string;
  ownerInformation: IOwnerInformation;
  operations: IOperations;
  headquarters: IHeadquarters;
  referralCode: string;
  verificationStatus: 'Verified' | 'Unverified';
}

const laboratoriesSchema = new Schema<ILaboratoryPartner>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    businessRegistration: {
      cacOrBnNumber: {
        type: String,
        required: true,
      },
      cacCertificateProof: {
        type: String,
        required: true,
      },
    },
    laboratoryName: {
      type: String,
      required: true,
    },
    ownerInformation: {
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
        type: Number,
        required: true,
      },
      operationLicenseNumber: {
        type: String,
        required: true,
      },
      licenseToOperateProof: {
        type: String,
        required: true,
      },
    },
    operations: {
      numberOfLaboratories: {
        type: Number,
        required: true,
      },
      numberOfStates: {
        type: Number,
        required: true,
      },
    },
    headquarters: {
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      addressDetails: {
        type: String,
        required: true,
      },
      addressProof: {
        type: String,
        required: true,
      },
    },
    referralCode: { type: String, required: true },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["Verified", "Unverified"],
      default: "Unverified"
    }
  },
  { timestamps: true }
);

export default mongoose.model<ILaboratoryPartner>("LaboratoryPartner", laboratoriesSchema);