import { Types } from "mongoose";
import Notification from "../models/Notification";
import ApiError from "../utils/apiError";
import { NotificationType } from "../types/notification.types";
import { getIO } from "../socket/socketManager";
import logger from "../logger/logger";

interface CreateNotificationData {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  tournament?: string;
  match?: string;
  dispute?: string;
  announcement?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  const {
    recipient,
    type,
    title,
    message,
    tournament,
    match,
    dispute,
    announcement,
  } = data;

  if (!Types.ObjectId.isValid(recipient)) {
    throw new ApiError("Invalid recipient ID", 400);
  }

  if (tournament && !Types.ObjectId.isValid(tournament)) {
    throw new ApiError("Invalid tournament ID", 400);
  }

  if (match && !Types.ObjectId.isValid(match)) {
    throw new ApiError("Invalid match ID", 400);
  }

  if (dispute && !Types.ObjectId.isValid(dispute)) {
    throw new ApiError("Invalid dispute ID", 400);
  }

  if (announcement && !Types.ObjectId.isValid(announcement)) {
    throw new ApiError("Invalid announcement ID", 400);
  }

  const notification = await Notification.create({
    recipient: new Types.ObjectId(recipient),
    type,
    title,
    message,
    ...(tournament && {
      tournament: new Types.ObjectId(tournament),
    }),
    ...(match && {
      match: new Types.ObjectId(match),
    }),
    ...(dispute && {
      dispute: new Types.ObjectId(dispute),
    }),
    ...(announcement && {
      announcement: new Types.ObjectId(announcement),
    }),
  });

  try {
    const socketServer = getIO();

    socketServer
      .to(`user:${recipient}:notifications`)
      .emit("notification:new", notification);
  } catch {
    // Socket.IO may not be initialized during tests or certain processes.
    logger.error("Socket is not initialized");
  }

  return notification;
};

export const getUserNotifications = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (page < 1) {
    page = 1;
  }

  if (limit < 1 || limit > 100) {
    limit = 20;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({
      recipient: userId,
    })
      .populate("tournament", "name slug")
      .populate("match", "teamA teamB round matchNumber status")
      .populate("dispute", "reason status")
      .populate("announcement", "title type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Notification.countDocuments({
      recipient: userId,
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUnreadNotificationCount = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return count;
};

export const markNotificationAsRead = async (
  userId: string,
  notificationId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(notificationId)) {
    throw new ApiError("Invalid notification ID", 400);
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  return notification;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

export const deleteNotification = async (
  userId: string,
  notificationId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(notificationId)) {
    throw new ApiError("Invalid notification ID", 400);
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError("Notification not found", 404);
  }

  return notification;
};
