import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError";
import env from "../config/env";
import { JWTPayload } from "../types/user.types";
import Users from "../models/Users";
import asyncHandler from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

const verifyJWT = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) throw new ApiError("Token not found", 401);

    const decoded = (await jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET,
    )) as JWTPayload;

    if (!decoded) throw new ApiError("Forbidden", 403);

    const user = await Users.findById(decoded.userId);

    if (!user) throw new ApiError("Unauthorized", 401);

    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  },
);

export default verifyJWT;
