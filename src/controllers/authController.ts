import { Request, Response } from 'express';
import User, { IUser } from "../models/User";
import SuperAdmin, { ISuperAdmin } from "../models/SuperAdmin";
import bcrypt from 'bcrypt'
import { formatDate, formatTime } from "../utils/formatTimestamp";
import jwt from "jsonwebtoken"
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens";
import { generateReferralCode } from "../utils/generateReferralCode";
import {
  ZEPTOMAIL_WELCOME_MAIL_TEMPLATE,
  ZEPTOMAIL_REFERRAL_CODE_MAIL_TEMPLATE,
  ZEPTOMAIL_LOGIN_NOTIFICATION_MAIL_TEMPLATE,
  ZEPTOMAIL_TOKEN,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
} from "../config/config";
import { SendMailClient } from "zeptomail";
import { validateEmail, validatePhoneNumber, ValidationResult } from '../utils/validation';

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

interface JwtPayload {
  _id: string;
  iat?: number;
  exp?: number;
}

const client = new SendMailClient({ url, token: token || '' });

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phoneNumber, password, howDidYouHearAboutUs } = req.body;

    const checkExistingUser = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (checkExistingUser) {
      res.status(409).json({ message: "Email or phone number already exists" });
      return;
    }

    const referralCode = generateReferralCode(firstName, lastName);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      referralCode,
      howDidYouHearAboutUs
    });

    await newUser.save();

    // send account creation successful email
    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_WELCOME_MAIL_TEMPLATE || '',
        from: {
          address: "paul@solace.com.ng",
          name: "Paul Oseghale",
        },
        to: [
          {
            email_address: {
              address: email,
              name: firstName,
            },
          },
        ],
        merge_info: { firstName: firstName },
        subject: "✉️ Welcome To Solace!",
      })
      .then((response) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    //Send Referral code email
    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_REFERRAL_CODE_MAIL_TEMPLATE || '',
        from: {
          address: "paul@solace.com.ng",
          name: "Paul Oseghale",
        },
        to: [
          {
            email_address: {
              address: email,
              name: firstName,
            },
          },
        ],
        merge_info: { firstName: firstName, referralCode: referralCode },
        subject: "✉️ Your Solace Referral Code is Here!",
      })
      .then((response) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const registerSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    // Check if the email already exists
    const checkExistingUser = await SuperAdmin.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (checkExistingUser) {
      res.status(409).json({ message: "Email or Phone Number already exists" });
      return;
    }

    // Create a new User with hashed password
    const createSuperAdmin = new SuperAdmin({
      email,
      firstName,
      lastName,
      password,
      phoneNumber,
    });
    // Save the new user to the database
    await createSuperAdmin.save();

    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_WELCOME_MAIL_TEMPLATE || '',
        from: {
          address: "paul@solace.com.ng",
          name: "Paul Oseghale",
        },
        to: [
          {
            email_address: {
              address: email,
              name: firstName,
            },
          },
        ],
        merge_info: { firstName: firstName },
        subject: "✉️ Welcome To Solace!",
      })
      .then((response) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    const accessToken = generateAccessToken(createSuperAdmin);
    const refreshToken = generateRefreshToken(createSuperAdmin);

    res.status(201).json({
      message: "Account Created Successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: `Error signing up: ${error.message}` });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    //send login notification email
    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_LOGIN_NOTIFICATION_MAIL_TEMPLATE || '',
        from: {
          address: "paul@solace.com.ng",
          name: "Paul Oseghale",
        },
        to: [
          {
            email_address: {
              address: email,
              name: user.firstName,
            },
          },
        ],
        merge_info: { firstName: user.firstName },
        subject: "✉️ Solace Account Login Notification",
      })
      .then((response) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const loginSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include the password field for comparison
    const user = await SuperAdmin.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send login notification email
    client.sendMail({
      mail_template_key: ZEPTOMAIL_LOGIN_NOTIFICATION_MAIL_TEMPLATE || '',
      from: {
        address: "paul@solace.com.ng",
        name: "Paul Oseghale",
      },
      to: [
        {
          email_address: {
            address: email,
            name: user.firstName,
          },
        },
      ],
      merge_info: { firstName: user.firstName },
      subject: "✉️ Solace Account Login Notification",
    })
    .then((response) => console.log("Email sent successfully"))
    .catch((error) => console.log("Email sending error:", error));

    // Send success response
    res.status(200).json({
      message: "Logged in successfully!",
      name: `${user.firstName} ${user.lastName}`,
      tokens:{
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await SuperAdmin.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Use the utility function to send a logout email
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const verifyAuth = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.header("Authorization");
  const refreshToken = req.cookies?.refreshToken; 

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: "Invalid Authorization header format. It should be 'Bearer [token]'" });
    return;
  }

  const accessToken = authHeader.split(' ')[1]; 
  if (!accessToken) {
    res.status(401).json({ error: "Access token is required" });
    return;
  }

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, JWT_SECRET || '') as JwtPayload;
    const user = await SuperAdmin.findById(decoded._id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (req.user) {
      req.user = user.toObject();
    }
    
    res.status(200).json({ message: "Token is valid", user });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError && refreshToken) {
      try {
        // Verify refresh token
        const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET || '') as JwtPayload;
        const user = await SuperAdmin.findById(decodedRefresh._id);

        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);    

        // Send new access token in response header
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        
        // return the new token in the response body
        res.json({
          message: "Access token refreshed successfully",
          tokens:{
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          },
          user
        });

        return;

      } catch (refreshError) {
        res.status(403).json({ error: "Invalid refresh token" });
        return;
      }
    }

    // Handle other token errors or internal server errors
    const errorMessage = error instanceof jwt.TokenExpiredError 
      ? "Access token has expired"
      : "Invalid access token";

    res.status(401).json({ error: errorMessage });
  }
};


export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    if (user.userStatus === "Verified") {
      res.status(400).json({ message: "User is already verified" });
      return;
    }
    
    user.userStatus = "Verified";
    await user.save();
    
    // Send verification confirmation email
    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_WELCOME_MAIL_TEMPLATE || '',
        from: {
          address: "paul@solace.com.ng",
          name: "Paul Oseghale",
        },
        to: [
          {
            email_address: {
              address: user.email,
              name: user.firstName,
            },
          },
        ],
        merge_info: { firstName: user.firstName },
        subject: "✅ Your Solace Account is Verified!",
      })
      .then((response) => console.log("Verification email sent successfully"))
      .catch((error) => console.log("Error sending verification email:", error));
    
    res.status(200).json({
      message: "User verified successfully",
      user
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Error verifying user", error: error.message });
    } else {
      res.status(500).json({ message: "Error verifying user", error: "Unknown error occurred" });
    }
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, phoneNumber, profilePicture } = req.body;

    // Validate the request
    const validation = new ValidationResult();
    
    if (email && !validateEmail(email)) {
      validation.addError('email', 'Invalid email format');
    }
    
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      validation.addError('phoneNumber', 'Invalid phone number format');
    }
    
    if (validation.hasErrors()) {
      res.status(400).json({ errors: validation.getErrors() });
      return;
    }

    // Check if email or phone number already exists for another user
    if (email) {
      const existingUserWithEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUserWithEmail) {
        res.status(409).json({ message: "Email already in use by another account" });
        return;
      }
    } 

    if (phoneNumber) {
      const existingUserWithPhone = await User.findOne({ phoneNumber, _id: { $ne: userId } });
      if (existingUserWithPhone) {
        res.status(409).json({ message: "Phone number already in use by another account" });
        return;
      }
    }

    // Create an object with fields to update
    const updateFields: Record<string, any> = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (profilePicture) updateFields.profilePicture = profilePicture;

    // Only update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Error updating user", error: error.message });
    } else {
      res.status(500).json({ message: "Error updating user", error: "Unknown error occurred" });
    }
  }
};