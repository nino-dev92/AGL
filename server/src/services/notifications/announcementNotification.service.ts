import { Types } from "mongoose";
import Users from "../../models/Users";
import Announcements from "../../models/Announcement";
import { createNotification } from "../notification.service";

export const notifyUsersAboutAnnouncement = async (announcementId: string) => {
  if (!Types.ObjectId.isValid(announcementId)) {
    throw new Error("Invalid announcement ID");
  }

  const announcement = await Announcements.findById(announcementId);

  if (!announcement) {
    throw new Error("Announcement not found");
  }

  // Get all users.
  const users = await Users.find({}).select("_id");

  if (users.length === 0) {
    return;
  }

  await Promise.all(
    users.map((user) =>
      createNotification({
        recipient: user._id.toString(),
        type: "announcement",
        title: announcement.title,
        message: announcement.content,
        announcement: announcement._id.toString(),
      }),
    ),
  );
};
