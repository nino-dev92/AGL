import { Types } from "mongoose";
import AuditLog from "../models/AuditLog";
import ApiError from "../utils/apiError";
import { AuditAction, AuditResource } from "../types/auditLog.types";

interface CreateAuditLogData {
  user: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export const createAuditLog = async (data: CreateAuditLogData) => {
  if (!Types.ObjectId.isValid(data.user)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (data.resourceId && !Types.ObjectId.isValid(data.resourceId)) {
    throw new ApiError("Invalid resource ID", 400);
  }

  const auditLog = await AuditLog.create({
    user: new Types.ObjectId(data.user),
    action: data.action,
    resource: data.resource,
    ...(data.resourceId && {
      resourceId: new Types.ObjectId(data.resourceId),
    }),
    description: data.description as string,
    metadata: (data.metadata as any) || undefined,
  });

  return auditLog;
};

export const getAuditLogs = async (
  page = 1,
  limit = 20,
  resource?: AuditResource,
  action?: AuditAction,
  user?: string,
) => {
  if (page < 1) page = 1;

  if (limit < 1 || limit > 100) {
    limit = 20;
  }

  const filter: Record<string, unknown> = {};

  if (resource) {
    filter.resource = resource;
  }

  if (action) {
    filter.action = action;
  }

  if (user) {
    if (!Types.ObjectId.isValid(user)) {
      throw new ApiError("Invalid user ID", 400);
    }

    filter.user = user;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("user", "firstName lastName userName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
