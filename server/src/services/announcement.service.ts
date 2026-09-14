import { Types } from "mongoose";
import Announcements from "../models/Announcement";
import Tournaments from "../models/Tournaments";
import Users from "../models/Users";
import ApiError from "../utils/apiError";
import { notifyUsersAboutAnnouncement } from "./notifications/announcementNotification.service";

interface CreateAnnouncementDTO {
  title: string;
  content: string;
  type: "general" | "tournament" | "match" | "system";
  tournament?: string;
}

interface UpdateAnnouncementDTO {
  title?: string;
  content?: string;
  type?: "general" | "tournament" | "match" | "system";
  tournament?: string;
}

export const createAnnouncement = async (
  userId: string,
  data: CreateAnnouncementDTO,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["admin", "organizer"].includes(user.role)) {
    throw new ApiError("You are not authorized to create announcements", 403);
  }

  if (data.tournament) {
    if (!Types.ObjectId.isValid(data.tournament)) {
      throw new ApiError("Invalid tournament ID", 400);
    }

    const tournament = await Tournaments.findById(data.tournament);

    if (!tournament) {
      throw new ApiError("Tournament not found", 404);
    }

    if (
      user.role === "organizer" &&
      tournament.organizer.toString() !== userId
    ) {
      throw new ApiError(
        "You can only create announcements for your tournaments",
        403,
      );
    }
  }

  const announcement = await Announcements.create({
    title: data.title.trim(),
    content: data.content.trim(),
    type: data.type,
    tournament: data.tournament || undefined,
    createdBy: user._id,
  });

  // Notify users about announcement
  await notifyUsersAboutAnnouncement(announcement._id.toString());

  return announcement;
};

export const getAnnouncements = async (
  page: number,
  limit: number,
  type?: string,
  tournament?: string,
) => {
  const filter: Record<string, unknown> = {
    isPublished: true,
  };

  if (type) {
    filter.type = type;
  }

  if (tournament) {
    if (!Types.ObjectId.isValid(tournament)) {
      throw new ApiError("Invalid tournament ID", 400);
    }

    filter.tournament = tournament;
  }

  const skip = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    Announcements.find(filter)
      .populate("createdBy", "firstName lastName userName role")
      .populate("tournament", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Announcements.countDocuments(filter),
  ]);

  return {
    announcements,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getAnnouncementById = async (announcementId: string) => {
  if (!Types.ObjectId.isValid(announcementId)) {
    throw new ApiError("Invalid announcement ID", 400);
  }

  const announcement = await Announcements.findOne({
    _id: announcementId,
    isPublished: true,
  })
    .populate("createdBy", "firstName lastName userName role")
    .populate("tournament", "name slug");

  if (!announcement) {
    throw new ApiError("Announcement not found", 404);
  }

  return announcement;
};

export const updateAnnouncement = async (
  userId: string,
  announcementId: string,
  data: UpdateAnnouncementDTO,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(announcementId)) {
    throw new ApiError("Invalid announcement ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["admin", "organizer"].includes(user.role)) {
    throw new ApiError("You are not authorized to update announcements", 403);
  }

  const announcement = await Announcements.findById(announcementId);

  if (!announcement) {
    throw new ApiError("Announcement not found", 404);
  }

  if (
    user.role === "organizer" &&
    announcement.createdBy.toString() !== userId
  ) {
    throw new ApiError("You can only update announcements you created", 403);
  }

  if (data.tournament) {
    if (!Types.ObjectId.isValid(data.tournament)) {
      throw new ApiError("Invalid tournament ID", 400);
    }

    const tournament = await Tournaments.findById(data.tournament);

    if (!tournament) {
      throw new ApiError("Tournament not found", 404);
    }

    if (
      user.role === "organizer" &&
      tournament.organizer.toString() !== userId
    ) {
      throw new ApiError("You can only use your own tournaments", 403);
    }

    announcement.tournament = tournament._id;
  }

  if (data.title !== undefined) {
    announcement.title = data.title.trim();
  }

  if (data.content !== undefined) {
    announcement.content = data.content.trim();
  }

  if (data.type !== undefined) {
    announcement.type = data.type;
  }

  await announcement.save();

  return announcement;
};

export const publishAnnouncement = async (
  userId: string,
  announcementId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(announcementId)) {
    throw new ApiError("Invalid announcement ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["admin", "organizer"].includes(user.role)) {
    throw new ApiError("You are not authorized to publish announcements", 403);
  }

  const announcement = await Announcements.findById(announcementId);

  if (!announcement) {
    throw new ApiError("Announcement not found", 404);
  }

  if (
    user.role === "organizer" &&
    announcement.createdBy.toString() !== userId
  ) {
    throw new ApiError("You can only publish announcements you created", 403);
  }

  if (announcement.isPublished) {
    throw new ApiError("Announcement is already published", 400);
  }

  announcement.isPublished = true;
  announcement.publishedAt = new Date();

  await announcement.save();

  return announcement;
};

export const unpublishAnnouncement = async (
  userId: string,
  announcementId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(announcementId)) {
    throw new ApiError("Invalid announcement ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["admin", "organizer"].includes(user.role)) {
    throw new ApiError(
      "You are not authorized to unpublish announcements",
      403,
    );
  }

  const announcement = await Announcements.findById(announcementId);

  if (!announcement) {
    throw new ApiError("Announcement not found", 404);
  }

  if (
    user.role === "organizer" &&
    announcement.createdBy.toString() !== userId
  ) {
    throw new ApiError("You can only unpublish announcements you created", 403);
  }

  if (!announcement.isPublished) {
    throw new ApiError("Announcement is already unpublished", 400);
  }

  announcement.isPublished = false;
  announcement.publishedAt = undefined;

  await announcement.save();

  return announcement;
};

export const deleteAnnouncement = async (
  userId: string,
  announcementId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(announcementId)) {
    throw new ApiError("Invalid announcement ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["admin", "organizer"].includes(user.role)) {
    throw new ApiError("You are not authorized to delete announcements", 403);
  }

  const announcement = await Announcements.findById(announcementId);

  if (!announcement) {
    throw new ApiError("Announcement not found", 404);
  }

  if (
    user.role === "organizer" &&
    announcement.createdBy.toString() !== userId
  ) {
    throw new ApiError("You can only delete announcements you created", 403);
  }

  await announcement.deleteOne();

  return true;
};
