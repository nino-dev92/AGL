import { Server } from "socket.io";

let io: Server;

export const initializeSocketManager = (server: Server) => {
  io = server;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

export const closeMatchChat = (matchId: string) => {
  const socketServer = getIO();

  const room = `match:${matchId}`;

  // Tell everyone currently in the match chat that the match has been completed.
  socketServer.to(room).emit("match:closed", {
    matchId,
    message: "This match has been completed. Chat is now closed.",
  });

  // Remove all sockets from the match room.
  const sockets = socketServer.sockets.adapter.rooms.get(room);

  if (sockets) {
    for (const socketId of sockets) {
      const socket = socketServer.sockets.sockets.get(socketId);

      socket?.leave(room);
    }
  }
};
