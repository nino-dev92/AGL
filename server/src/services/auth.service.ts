import Users from "../models/Users";
import ApiError from "../utils/apiError";
import bcrypt from "bcrypt";
import { UserDTO, LoginDTO, JWTPayload } from "../types/user.types";
import { generateAccessToken, generaterefreshToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./email.service";
import crypto from "crypto";
import { Types } from "mongoose";

export const registerUser = async (data: UserDTO) => {
  const {
    firstName,
    lastName,
    userName,
    password,
    email,
    role,
    game,
    region,
  } = data;

  const allowedRoles = ["player", "organizer", "admin", "manager"] as const;

  if (!allowedRoles.includes(role)) {
    throw new ApiError("Invalid role", 400);
  }

  const userRole = role;

  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = userName.toLowerCase();

  const existingEmail = await Users.findOne({ email: normalizedEmail });

  if (existingEmail) {
    throw new ApiError("Email already exists", 409);
  }

  const existingUser = await Users.findOne({ userName: normalizedUsername });

  if (existingUser) {
    throw new ApiError("Username already exists", 409);
  }

  const newUser = await Users.create({
    firstName,
    lastName,
    userName: normalizedUsername,
    email: normalizedEmail,
    password,
    ...(game && { game: new Types.ObjectId(game) }),
    ...(region && { region }),
    role: userRole,
    totalDeaths: userRole === "player" ? 0 : undefined,
    totalKills: userRole === "player" ? 0 : undefined,
    totalGames: userRole === "player" ? 0 : undefined,
    tourneysPlayed: userRole === "player" ? 0 : undefined,
    tourneysWon: userRole === "player" ? 0 : undefined,
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(newUser.email, newUser.firstName);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return {
    id: newUser._id,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    userName: newUser.userName,
    email: newUser.email,
    role: newUser.role,
  };
};

export const login = async (data: LoginDTO) => {
  const { email, password } = data;

  const dbUser = await Users.findOne({
    email: email.toLowerCase(),
  }).select("+password +refreshToken");

  if (!dbUser) {
    throw new ApiError("Invalid credentials", 401);
  }

  const validPassword = await bcrypt.compare(password, dbUser.password);

  if (!validPassword) {
    throw new ApiError("Invalid credentials", 401);
  }

  const accessToken = await generateAccessToken({
    userId: dbUser._id.toString(),
    role: dbUser.role,
  });

  const refreshToken = await generaterefreshToken({
    userId: dbUser._id.toString(),
    role: dbUser.role,
  });

  dbUser.refreshToken = refreshToken;

  await dbUser.save();

  return {
    user: {
      id: dbUser._id.toString(),
      email: dbUser.email,
      userName: dbUser.userName,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
      avatar: dbUser.avatar,
    },

    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  let decoded: JWTPayload;

  try {
    decoded = jwt.verify(
      refreshToken,
      env.REFRESH_TOKEN_SECRET as string,
    ) as JWTPayload;
  } catch {
    throw new ApiError("Invalid or expired refresh token", 403);
  }

  const user = await Users.findById(decoded.userId).select("+refreshToken");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError("Forbidden", 403);
  }

  const accessToken = await generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return accessToken;
};

export const logout = async (refreshToken?: string) => {
  if (!refreshToken) return;

  await Users.findOneAndUpdate(
    { refreshToken },
    {
      $set: {
        refreshToken: "",
      },
    },
  );
};

export const forgotPassword = async (email: string) => {
  const normalizedEmail = email.toLowerCase();

  const user = await Users.findOne({
    email: normalizedEmail,
  }).select("+passwordResetToken +passwordResetExpires");

  // Do not reveal whether the email exists. This prevents account enumeration.
  if (!user) {
    return;
  }

  // Generate a new token for every password reset request.
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Store only the hashed version in the database.
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;

  // Token expires after 15 minutes.
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetUrl = `https://localhost:4000/reset-password?token=${resetToken}`;

  try {
    await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: new Date(),
    },
  }).select(
    "+password +passwordResetToken +passwordResetExpires +refreshToken",
  );

  if (!user) {
    throw new ApiError("Invalid or expired password reset token", 400);
  }

  // Set the new password.
  user.password = newPassword;

  // Token can only be used once.
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Invalidate the user's existing refresh token.
  user.refreshToken = undefined;

  await user.save();

  return true;
};

export const deleteAccount = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const user = await Users.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return true;
};
