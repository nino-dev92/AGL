import { Request, Response } from "express";
import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import logger from "../logger/logger";

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const newUser = await authService.registerUser(req.body);

  logger.info(`User ${newUser.email} signed up`);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: newUser,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  console.log(req.body.email, req.body.password);
  const user = await authService.login({
    email: req.body.email,
    password: req.body.password,
  });

  logger.info(`User ${user.user.firstName} ${user.user.lastName} logged in`);

  res.cookie("jwt", user.refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Login Successful",
    data: {
      data: user.user,
      accessToken: user.accessToken,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.jwt;

  await authService.logout(refreshToken);

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.jwt;

  if (!refreshToken) {
    throw new ApiError("Refresh token not found", 401);
  }

  const accessToken = await authService.refresh(refreshToken);

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken,
    },
  });
});
