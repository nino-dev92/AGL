import { Server } from "socket.io";
import {
  sendMatchChatMessage,
  joinMatchChat,
} from "../services/matchChat.service";
import { AuthenticatedSocket } from "./socketAuth";

export const registerMatchChatHandlers = (
  io: Server,
  socket: AuthenticatedSocket,
) => {
  // Join a match chatroom.
  socket.on("match:join", async (matchId: string) => {
    try {
      // Authorization is handled inside the service.
      await joinMatchChat(socket.userId, matchId);

      const room = `match:${matchId}`;

      socket.join(room);

      socket.emit("match:joined", {
        matchId,
      });
    } catch (error: any) {
      socket.emit("match:error", {
        message: error.message || "Unable to join match chat",
      });
    }
  });

  // Leave a match chatroom.
  socket.on("match:leave", (matchId: string) => {
    const room = `match:${matchId}`;

    socket.leave(room);

    socket.emit("match:left", {
      matchId,
    });
  });

  // Send a message to a match chatroom.
  socket.on(
    "match:message",
    async (data: { matchId: string; message: string }) => {
      try {
        if (!data?.matchId || !data?.message) {
          throw new Error("Match ID and message are required");
        }

        const room = `match:${data.matchId}`;

        // Make sure the socket has joined this match room.
        if (!socket.rooms.has(room)) {
          throw new Error("You have not joined this match chat");
        }

        const chatMessage = await sendMatchChatMessage(
          socket.userId,
          data.matchId,
          data.message,
        );

        io.to(room).emit("match:message", chatMessage);
      } catch (error: any) {
        socket.emit("match:error", {
          message: error.message || "Unable to send message",
        });
      }
    },
  );

  // Handle socket disconnect.
  socket.on("disconnect", () => {
    // Socket.IO automatically removes the socket from all rooms when it disconnects.
  });
};
