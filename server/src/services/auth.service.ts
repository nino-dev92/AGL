import Users from "../models/Users";
import ApiError from "../utils/apiError";
import bcrypt from "bcrypt";
import ROLES from "../constants/ROLES";
import { UserDTO, LoginDTO, JWTPayload } from "../types/user.types";
import { generateAccessToken, generaterefreshToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import env from "../config/env";

export const registerUser = async (data: UserDTO) => {
  const { firstName, lastName, userName, password, email } = data;

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
    role: ROLES.PLAYER,
  });

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
