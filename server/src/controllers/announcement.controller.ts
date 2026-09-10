import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as announcementService from "../services/announcement.service";

export const createAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const announcement = await announcementService.createAnnouncement(
      userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  },
);

export const getAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const type =
      typeof req.query.type === "string" ? req.query.type : undefined;

    const tournament =
      typeof req.query.tournament === "string"
        ? req.query.tournament
        : undefined;

    const result = await announcementService.getAnnouncements(
      page,
      limit,
      type,
      tournament,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  },
);

export const getAnnouncementById = asyncHandler(
  async (req: Request, res: Response) => {
    const announcement = await announcementService.getAnnouncementById(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: announcement,
    });
  },
);

export const updateAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const announcement = await announcementService.updateAnnouncement(
      userId,
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  },
);

export const publishAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const announcement = await announcementService.publishAnnouncement(
      userId,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Announcement published successfully",
      data: announcement,
    });
  },
);

export const unpublishAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const announcement = await announcementService.unpublishAnnouncement(
      userId,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Announcement unpublished successfully",
      data: announcement,
    });
  },
);

export const deleteAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    await announcementService.deleteAnnouncement(
      userId,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  },
);
