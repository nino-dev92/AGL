import { Request, Response } from "express";
import * as notificationService from "../services/notification.service";
import asyncHandler from "../utils/asyncHandler";

export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await notificationService.getUserNotifications(
      userId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: result.notifications,
      pagination: result.pagination,
    });
  },
);

export const getUnreadNotificationCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const count = await notificationService.getUnreadNotificationCount(userId);

    return res.status(200).json({
      success: true,
      message: "Unread notification count retrieved successfully",
      data: count,
    });
  },
);

export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const id = req.params.id as string;

    const notification = await notificationService.markNotificationAsRead(
      userId,
      id,
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  },
);

export const markAllNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const result = await notificationService.markAllNotificationsAsRead(userId);

    return res.status(201).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  },
);

export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const id = req.params.id as string;

    await notificationService.deleteNotification(userId, id);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: null,
    });
  },
);
