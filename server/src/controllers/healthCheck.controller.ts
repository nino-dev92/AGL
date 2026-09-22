import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const healthCheck = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const mongoState = mongoose.connection.readyState;

    const isDatabaseConnected = mongoState === 1;

    if (!isDatabaseConnected) {
      res.status(503).json({
        success: false,
        message: "Service unavailable",
        data: {
          status: "unhealthy",
          database: "disconnected",
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Service is healthy",
      data: {
        status: "healthy",
        database: "connected",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
