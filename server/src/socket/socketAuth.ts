import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import Users from "../models/Users";

interface JwtPayload {
  userId: string;
}

export interface AuthenticatedSocket extends Socket {
  userId: string;
}

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtPayload;

    if (!decoded.userId || !Types.ObjectId.isValid(decoded.userId)) {
      return next(new Error("Invalid authentication token"));
    }

    const user = await Users.findById(decoded.userId).select("_id");

    if (!user) {
      return next(new Error("User not found"));
    }

    const authenticatedSocket = socket as AuthenticatedSocket;

    authenticatedSocket.userId = user._id.toString();

    next();
  } catch (error) {
    next(new Error("Invalid or expired authentication token"));
  }
};
