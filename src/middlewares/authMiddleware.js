import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import User from "../models/User.js";
import SuperAdmin from "../models/SuperAdmin.js";
import {JWT_SECRET, JWT_REFRESH_SECRET} from '../config/config.js'


// Token Refresh Route Handler
export const handleTokenRefresh = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ message: "Invalid Authorization header format. It should be 'Bearer [token]'" });
    }

    const refreshToken = authHeader.split(" ")[1];
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Refresh token has expired" });
      }
      return res.status(401).json({ message: "Invalid refresh token: " + jwtError.message });
    }

    let user;
    switch (decoded.role) {
      case "admin":
        user = await User.findOne({ role: decoded.role });
        break;
      case "user":
        user = await User.findOne({ role: decoded.role });
        break;
      default:
        return res.status(400).json({ message: "Invalid user role in token" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
export const authMiddleware = async (req, res, next) => {
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

// export default { authMiddleware };