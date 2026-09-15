import { Schema, model, Types } from "mongoose";
import { AuditAction, AuditResource } from "../types/auditLog.types";

export interface IAuditLog extends Document {
  user: Types.ObjectId;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: Types.ObjectId;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "approve",
        "reject",
        "start",
        "complete",
        "cancel",
        "resolve",
      ] satisfies AuditAction[],
      required: true,
    },

    resource: {
      type: String,
      enum: [
        "user",
        "team",
        "game",
        "tournament",
        "registration",
        "match",
        "dispute",
        "announcement",
        "notification",
      ] satisfies AuditResource[],
      required: true,
    },

    resourceId: {
      type: Schema.Types.ObjectId,
      default: undefined,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export default model<IAuditLog>("AuditLog", auditLogSchema);
