import { Server } from "socket.io";

const getUserNotificationRoom = (userId: string) => {
  return `user:${userId}:notifications`;
};

export const joinNotificationRoom = (socket: any, userId: string) => {
  const room = getUserNotificationRoom(userId);

  socket.join(room);
};

export const leaveNotificationRoom = (socket: any, userId: string) => {
  const room = getUserNotificationRoom(userId);

  socket.leave(room);
};

export const emitNotification = (
  io: Server,
  userId: string,
  notification: unknown,
) => {
  const room = getUserNotificationRoom(userId);

  io.to(room).emit("notification:new", notification);
};
