import { Server } from "socket.io";
import { authenticateSocket, AuthenticatedSocket } from "./socketAuth";
import { registerMatchChatHandlers } from "./matchChat.socket";
import { initializeSocketManager } from "./socketManager";

export const initializeSocket = (io: Server) => {
  initializeSocketManager(io);

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    registerMatchChatHandlers(io, socket as AuthenticatedSocket);
  });
};
