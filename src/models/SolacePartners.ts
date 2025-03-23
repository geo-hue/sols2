import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IOwnerPersonalInformation {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nin: string;
  referralCode: string;
}

export interface IBusinessLocation {
  state: string;
  city: string;
  detailedAddress: string;
  proofOfAgentAddress?: string;
}

export interface IBusinessInformation {
  businessName: string;
  cacOrBnNumber: string;
  cacCertificateProof: string;
  typeOfBusiness: string;
  numberOfShops: number;
  location: IBusinessLocation;
  partnershipInterest: string;
}

export interface ISolacePartner extends Document {
  _id: string;
  ownerPersonalInformation: IOwnerPersonalInformation;
  businessInformation: IBusinessInformation;
  verificationStatus: 'Verified' | 'Unverified';
}

const partnersSchema = new Schema<ISolacePartner>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    ownerPersonalInformation: {
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
      },
      nin: {
        type: String,
        required: true,
      },
      referralCode: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      }
    },
    businessInformation: {
      businessName: {
        type: String,
        required: true,
      },
      cacOrBnNumber: {
        type: String,
        required: true,
        trim: true,
      },
      cacCertificateProof: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      typeOfBusiness: {
        type: String,
        required: "Type of business is required",
      },
      numberOfShops: {
        type: Number,
        required: "Number of shop(s) is required",
      },
      location: {
        state: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        detailedAddress: {
          type: String,
          required: true,
        },
        proofOfAgentAddress: {
          type: String,
        },
      },
      partnershipInterest: {
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

export default mongoose.model<ISolacePartner>("partners", partnersSchema);