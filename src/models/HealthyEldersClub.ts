import mongoose, { Document, Schema } from 'mongoose';
import { generateUniqueCustomId } from '../utils/customIdGenerator';

export interface ISubscriberDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface IBeneficiaryLocation {
  state: string;
  city: string;
  detailedAddress: string;
}

export interface IBeneficiaryDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: IBeneficiaryLocation;
}

export interface IPaymentInformation {
  membershipFee: number;
  totalAmountToBePaid: number;
  autoRenewal: 'on' | 'off';
  paymentMethod: string;
  status: 'unverified' | 'verified';
  nextRenewal?: Date;
  referralCode?: string;
  referrerName?: string;
}

export interface IHealthyEldersClub extends Document {
  _id: string;
  subscriberDetails: ISubscriberDetails;
  beneficiaryDetails: IBeneficiaryDetails;
  paymentInformation: IPaymentInformation;
}

const healthyEldersClubBeneficiarySchema = new Schema<IHealthyEldersClub>(
  {
    _id: {
      type: String,
      required: true
    },
    subscriberDetails:{
      firstName: {
        type: String,
        required: true
      },
      lastName: {
        type: String,
        required: true
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
      }
    },
    beneficiaryDetails: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
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
        trim: true,
        validate: {
          validator: function (v: string) {
            return /^\d{10,15}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      },
      location: {
        state: {
          type: String,
          trim: true,
          required: true,
        },
        city: {
          type: String,
          trim: true,
          required: true,
        },
        detailedAddress: {
          type: String,
          required: true,
          trim: true,
        },
      },
    },
    paymentInformation: {
      membershipFee: {
        type: Number,
        min: 0,
        default: 1000
      },
      totalAmountToBePaid: {
        type: Number,
        default: 12000,
        min: 0,
      },
      autoRenewal: {
        type: String,
        enum: ['on', 'off'],
        default: 'on',
      },
      paymentMethod: {
        type: String,
        trim: true,
        default: "card"
      },
      status: {
        type: String,
        enum: ['unverified', 'verified'],
        default: 'unverified',
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

healthyEldersClubBeneficiarySchema.pre("validate", async function (next) {
  if (!this._id) {
    this._id = await generateUniqueCustomId("HEC-");
  }
  next();
});

export default mongoose.model<IHealthyEldersClub>('HealthyEldersClub', healthyEldersClubBeneficiarySchema);