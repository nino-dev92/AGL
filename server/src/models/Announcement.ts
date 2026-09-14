import { Schema, model, Types } from "mongoose";
import { AnnouncementType } from "../types/announcement.types";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: AnnouncementType;
  tournament?: Types.ObjectId | undefined;
  createdBy: Types.ObjectId;
  isPublished: boolean;
  publishedAt?: Date | undefined;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    type: {
      type: String,
      enum: [
        "general",
        "tournament",
        "match",
        "system",
      ] satisfies AnnouncementType[],
      required: true,
      default: "general",
    },

    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

announcementSchema.index({ isPublished: 1, createdAt: -1 });
announcementSchema.index({ tournament: 1, createdAt: -1 });
announcementSchema.index({ type: 1, createdAt: -1 });

const Announcements = model<IAnnouncement>("Announcements", announcementSchema);

export default Announcements;
