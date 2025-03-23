import mongoose, { Document, Schema } from "mongoose";

export interface ILaceAiWaitlist extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  stateOfResidence: string;
  cityOfResidence: string;
  whatInterestsYouAboutLaceAi: string;
  whereDidYouHearAboutUs: string;
}

const WaitlistSchema = new Schema<ILaceAiWaitlist>(
  {
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
    stateOfResidence: {
      type: String,
      required: true,
    },
    cityOfResidence: {
      type: String,
      required: true,
    },
    whatInterestsYouAboutLaceAi: {
      type: String,
      required: true,
    },
    whereDidYouHearAboutUs: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ILaceAiWaitlist>("LaceAiWaitlist", WaitlistSchema);