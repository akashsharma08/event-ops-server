import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};