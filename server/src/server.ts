import app from "./app";
import connectDB from "./config/db";
import logger from "./logger/logger";
import env from "./config/env";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://localhost:5173",
    credentials: true,
  },
});

initializeSocket(io);

const port = env.PORT || 5000;

const connect = async () => {
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

connect();
