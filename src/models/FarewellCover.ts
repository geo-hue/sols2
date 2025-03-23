// src/models/FarewellCover.ts
import mongoose, { Document, Schema } from "mongoose";
import { generateUniqueCustomId } from "../utils/customIdGenerator";

export interface ISubscriberDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface IAddress {
  stateOfResidence: string;
  localGovtOfResidence: string;
  detailedResidentialAddress: string;
}

export interface IBeneficiaryPersonalDetails {
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  photo?: string;
  phoneNumber: string;
  dob: Date;
  gender: 'male' | 'female' | 'Male' | 'Female';
  address: IAddress;
}

export interface IBeneficiaryHealthDetails {
  healthCondition: string;
}

export interface ISubscriptionDetails {
  farewellPlan: 'Pink Diamond Plan' | 'Blue Diamond Plan' | 'Red Diamond Plan';
  serviceBenefitWorth?: number;
  serviceDuration: 'per quarterly' | 'per bi-annual' | 'per annual';
  subscriptionAmount: number;
  subscriptionStatus: string;
  autoRenewal: 'on' | 'off';
  paymentMethod?: string;
  nextRenewal?: Date;
  referralCode?: string;
  referrerName?: string;
}

export interface IFarewellCover extends Document {
  _id: string;
  relationshipWithBeneficiary: string;
  subscriberDetails: ISubscriberDetails;
  beneficiaryPersonalDetails: IBeneficiaryPersonalDetails;
  beneficiaryHealthDetails: IBeneficiaryHealthDetails;
  subscriptionDetails: ISubscriptionDetails;
}

const farewellCoverBeneficiarySchema = new Schema<IFarewellCover>(
  {
    _id: {
      type: String,
      required: true,
    },
    relationshipWithBeneficiary: {
      type: String,
      trim: true,
      required: true,
    },
    subscriberDetails: {
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
        validate: {
          validator: function (v: string) {
            return /^\d{10,15}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      },
    },
    beneficiaryPersonalDetails: {
      title: {
        type: String,
        trim: true,
        required: true,
      },
      firstName: {
        type: String,
        trim: true,
        required: true,
      },
      lastName: {
        type: String,
        trim: true,
        required: true,
      },
      photo: {
        type: String,
      },
      phoneNumber: {
        type: String,
        trim: true,
        required: true,
      },
      dob: {
        type: Date,
        required: true,
      },
      gender: {
        type: String,
        enum: ["male", "female", "Male", "Female"],
        required: true,
      },
      address: {
        stateOfResidence: {
          type: String,
          trim: true,
          required: true,
        },
        localGovtOfResidence: {
          type: String,
          trim: true,
          required: true,
        },
        detailedResidentialAddress: {
          type: String,
          trim: true,
          required: true,
        },
      },
    },
    beneficiaryHealthDetails: {
      healthCondition: {
        type: String,
        trim: true,
        required: true,
      },
    },
    subscriptionDetails: {
      farewellPlan: {
        type: String,
        enum: ["Pink Diamond Plan", "Blue Diamond Plan", "Red Diamond Plan"],
        trim: true,
        required: true,
      },
      serviceBenefitWorth: {
        type: Number,
        min: 0,
      },
      serviceDuration: {
        type: String,
        enum: ["per quarterly", "per bi-annual", "per annual"],
        trim: true,
        required: true,
      },
      subscriptionAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      subscriptionStatus: {
        type: String,
        default: "inactive",
        required: true,
        trim: true,
      },
      autoRenewal: {
        type: String,
        enum: ["on", "off"],
        trim: true,
      },
      paymentMethod: {
        type: String,
        trim: true,
      },
      nextRenewal: {
        type: Date,
      },
      referralCode: {
        type: String,
        trim: true,
      },
      referrerName: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a unique ID before saving the document
farewellCoverBeneficiarySchema.pre("validate", async function (next) {
  if (!this._id) {
    this._id = await generateUniqueCustomId("SFC-");
  }
  next();
});

export default mongoose.model<IFarewellCover>("FarewellCover", farewellCoverBeneficiarySchema);