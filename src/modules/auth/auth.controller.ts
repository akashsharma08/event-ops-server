import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import { env } from "../../config/env";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import {
  deleteRefreshToken,
  loginUser,
  registerUser,
  saveRefreshToken,
} from "./auth.service";
import { createRegistrationOtp, sendRegistrationOtp } from "./otp.service";
import { Request, Response } from "express";
import { registerSchema } from "./auth.validation";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await saveRefreshToken(user.id, refreshToken);

    res.json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }

    if (err.message === "Invalid credentials") {
      return res.status(401).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded: any = jwt.verify(token, env.JWT_REFRESH_SECRET);

    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({
      id: decoded.id,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err: unknown) {
    console.error("Refresh token verification failed:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token required" });
  }

  await deleteRefreshToken(token);

  res.json({ message: "Logged out successfully" });
};

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.message,
      });
    }

    const { name, email, phone, password } = parsed.data;

    const user = await registerUser({ name, email, phone, password });

    const otpCode = await createRegistrationOtp(user.id);
    await sendRegistrationOtp({
      email: user.email,
      phone: user.phone,
      code: otpCode,
    });

    res.status(201).json({
      message:
        "Registration successful. An OTP has been sent to your email or phone.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "User already exists") {
      return res.status(409).json({ message: err.message as string });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};
