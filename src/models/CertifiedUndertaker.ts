import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nin: string;
}

export interface IServicesOffered {
  undertaking: string;
}

export interface IAddress {
  details: string;
  proof: string;
}

export interface IOfficeLocation {
  state: string;
  city: string;
  address: IAddress;
}

export interface ICertifiedUndertaker extends Document {
  _id: string;
  cacOrBnNumber: string;
  servicesOffered: IServicesOffered;
  portraitPhoto: string;
  personalInfo: IPersonalInfo;
  officeLocation: IOfficeLocation;
  verificationStatus: 'Verified' | 'Unverified';
}

const certifiedUndertakerSchema = new Schema<ICertifiedUndertaker>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    cacOrBnNumber: {
      type: String,
      required: true
    },
    servicesOffered: {
      undertaking: {
        type: String,
        required: true,
      },
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
    officeLocation: {
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      address: {
        details: {
          type: String,
          required: true,
        },
        proof: {
          type: String,
          required: true,
        },
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

export default mongoose.model<ICertifiedUndertaker>("CertifiedUndertaker", certifiedUndertakerSchema);