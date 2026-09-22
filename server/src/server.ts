import app from "./app";
import connectDB from "./config/db";
import logger from "./logger/logger";
import env from "./config/env";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket";
import mongoose from "mongoose";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://localhost:5173",
    credentials: true,
  },
});

initializeSocket(io);

const port = env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error: any) {
    logger.error(error);
    process.exit(1);
  }
};

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  console.log("shutting down");
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info(`${signal} received. Starting graceful shutdown...`);

  const shutdownTimeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 15_000);

  shutdownTimeout.unref();

  try {
    // Close Socket.IO connections first
    await new Promise<void>((resolve) => {
      io.close(() => {
        logger.info("Socket.IO closed");
        resolve();
      });
    });

    // Stop accepting new HTTP connections and wait for existing ones
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        logger.info("HTTP server closed");
        resolve();
      });
    });

    // Close MongoDB
    await mongoose.connection.close();

    clearTimeout(shutdownTimeout);

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);

    logger.error("Error during graceful shutdown", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

void startServer();
