import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";

import ApiError from "../utils/apiError";
import logger from "../logger/logger";

const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Joi.ValidationError) {
    return res.status(422).json({
      success: false,
      message: err.details[0]?.message ?? "Validation error",
    });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorMiddleware;
