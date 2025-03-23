import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface ISuperAdmin extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface ISuperAdminMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type SuperAdminModel = Model<ISuperAdmin, {}, ISuperAdminMethods>;

const SuperAdminSchema = new Schema<ISuperAdmin, SuperAdminModel, ISuperAdminMethods>(
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
  },
  { timestamps: true }
);

// Pre-save middleware
SuperAdminSchema.pre("save", async function (next) {
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
SuperAdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<ISuperAdmin, SuperAdminModel>("SuperAdmin", SuperAdminSchema);