import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  mostRecentOTP?: number;
  howDidYouHearAboutUs: string;
  profilePicture?: string;
  walletStatus: 'not created' | 'created';
  walletFundingStatus: 'empty' | 'funded';
  userStatus: 'Verified' | 'Unverified';
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
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
    password: {
      type: String,
      required: true,
      select: false,
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
    mostRecentOTP: {
      type: Number,
    },
    howDidYouHearAboutUs: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    walletStatus: {
      type: String,
      enum: ["not created", "created"],
      default: "not created",
    },
    walletFundingStatus: {
      type: String,
      enum: ["empty", "funded"],
      default: "empty",
    },
    userStatus: {
      type: String,
      enum: ["Verified", "Unverified"],
      default: "Unverified",
    },
    referralCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware
UserSchema.pre("save", async function (next) {
  const user = this;

  // If password is not modified, skip hashing
  if (!user.isModified("password")) {
    return next();
  }

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser, UserModel>("Users", UserSchema);