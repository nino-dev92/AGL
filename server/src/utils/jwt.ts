import jwt from "jsonwebtoken";
import env from "../config/env";

type JWTPayload = {
  userId: string;
  role: string;
};

export const generateAccessToken = (data: JWTPayload) => {
  const { userId, role } = data;

  return jwt.sign({ userId, role }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const generaterefreshToken = (data: JWTPayload) => {
  const { userId, role } = data;

  return jwt.sign({ userId, role }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};
