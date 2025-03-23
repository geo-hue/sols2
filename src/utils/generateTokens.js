import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_EXPIRES_IN,
} from "../config/config.js";

export const generateAccessToken = (user) => {
  const payload = {
    _id: user._id || undefined,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (user) => {
  const payload = {
    _id: user._id || undefined,
    role: user.role,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};
