import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_EXPIRES_IN,
} from "../config/config.js";

interface TokenUser {
  _id: string;
  role?: string;
}

export const generateAccessToken = (user: TokenUser): string => {
  const payload = {
    _id: user._id || "",
    role: user.role,
  };

  return jwt.sign(
    payload, 
    JWT_SECRET as string, 
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

export const generateRefreshToken = (user: TokenUser): string => {
  const payload = {
    _id: user._id || "",
    role: user.role,
  };
  
  return jwt.sign(
    payload, 
    JWT_REFRESH_SECRET as string, 
    { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
};