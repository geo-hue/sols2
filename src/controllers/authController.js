import User from "../models/User.js";
import SuperAdmin from "../models/SuperAdmin.js";
import bcrypt from 'bcrypt'
import { formatDate, formatTime } from "../utils/formatTimestamp.js";
import jwt from "jsonwebtoken"
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import { generateReferralCode } from "../utils/generateReferralCode.js";
import {
  ZEPTOMAIL_WELCOME_MAIL_TEMPLATE,
  ZEPTOMAIL_REFERRAL_CODE_MAIL_TEMPLATE,
  ZEPTOMAIL_LOGIN_NOTIFICATION_MAIL_TEMPLATE,
  ZEPTOMAIL_TOKEN,
} from "../config/config.js";
import { SendMailClient } from "zeptomail";
import axios from 'axios'

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, howDidYouHearAboutUs } = req.body;

    const checkExistingUser = await User.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (checkExistingUser) {
      return res.status(409).json({ message: "Email or phone number already exists" });
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
        mail_template_key: ZEPTOMAIL_WELCOME_MAIL_TEMPLATE,
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
        mail_template_key: ZEPTOMAIL_REFERRAL_CODE_MAIL_TEMPLATE,
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

export const registerSuperAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    // Check if the email already exists
    const checkExistingUser = await SuperAdmin.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (checkExistingUser) {
      return res.status(409).json({ message: "Email or Phone Number already exists" });
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
          mail_template_key: ZEPTOMAIL_WELCOME_MAIL_TEMPLATE,
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
    res.status(500).json({ message: `Error signing up: ${error.message}` });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //send login notification email
    client
      .sendMail({
        mail_template_key: ZEPTOMAIL_LOGIN_NOTIFICATION_MAIL_TEMPLATE,
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
        merge_info: { firstName: user.firstName },
        subject: "✉️ Solace Account Login Notification",
      })
      .then((response) => console.log("success"))
      .catch((error) => console.log(error, "error"));

    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include the password field for comparison
    const user = await SuperAdmin.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send login notification email
    client.sendMail({
      mail_template_key: ZEPTOMAIL_LOGIN_NOTIFICATION_MAIL_TEMPLATE,
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

    // console.log("Email sent successfully")

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
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await SuperAdmin.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use the utility function to send a logout email
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const refreshToken = req.cookies?.refreshToken; 

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Invalid Authorization header format. It should be 'Bearer [token]'" });
  }

  const accessToken = authHeader.split(' ')[1]; 
  if (!accessToken) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    // Verify access token
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    const user = await SuperAdmin.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user.toObject(); // Attach user info to request
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError && refreshToken) {
      try {
        // Verify refresh token
        const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await SuperAdmin.findById(decodedRefresh._id);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
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

        req.user = user.toObject();
        return next();

      } catch (refreshError) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }
    }

    // Handle other token errors or internal server errors
    const errorMessage = error instanceof jwt.TokenExpiredError 
      ? "Access token has expired"
      : "Invalid access token";

    res.status(401).json({ error: errorMessage });
  }
};