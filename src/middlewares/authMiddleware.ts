import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens";
import User from "../models/User";
import SuperAdmin from "../models/SuperAdmin";
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/config';

interface JwtPayload {
  _id: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Token Refresh Route Handler
export const handleTokenRefresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({ message: "Invalid Authorization header format. It should be 'Bearer [token]'" });
      return;
    }

    const refreshToken = authHeader.split(" ")[1];
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "Refresh token has expired" });
        return;
      }
      res.status(401).json({ message: "Invalid refresh token: " + (jwtError as Error).message });
      return;
    }

    let user;
    if (!decoded.role || !decoded._id) {
      res.status(400).json({ message: "Invalid token payload" });
      return;
    }

    switch (decoded.role) {
      case "admin":
        user = await User.findOne({ role: decoded.role } as any);
        break;
      case "user":
        user = await User.findOne({ role: decoded.role } as any);
        break;
      default:
        res.status(400).json({ message: "Invalid user role in token" });
        return;
    }

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to authenticate token
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const decoded = jwt.verify(accessToken, JWT_SECRET as string) as JwtPayload;
    const user = await SuperAdmin.findById(decoded._id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    req.user = user.toObject();
    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError && refreshToken) {
      try {
        // Verify refresh token
        const decodedRefresh = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as JwtPayload;
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

        req.user = user.toObject();
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