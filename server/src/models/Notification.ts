import { Document, Schema, model, Types } from "mongoose";
import { NotificationType } from "../types/notification.types";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;

  tournament?: Types.ObjectId;
  match?: Types.ObjectId;
  dispute?: Types.ObjectId;
  announcement?: Types.ObjectId;

  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "tournament-registration",
        "registration-approved",
        "registration-rejected",
        "match-created",
        "match-updated",
        "match-result",
        "dispute-created",
        "dispute-resolved",
        "announcement",
        "system",
      ] satisfies NotificationType[],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      default: undefined,
    },

    match: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      default: undefined,
    },

    dispute: {
      type: Schema.Types.ObjectId,
      ref: "Dispute",
      default: undefined,
    },

    announcement: {
      type: Schema.Types.ObjectId,
      ref: "Announcement",
      default: undefined,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  isRead: 1,
});

export default model<INotification>("Notification", notificationSchema);
