import { Request, Response, NextFunction } from "express";
import { getAuditLogs } from "../services/auditLog.service";

export const getAuditLogsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const resource =
      typeof req.query.resource === "string" ? req.query.resource : undefined;

    const action =
      typeof req.query.action === "string" ? req.query.action : undefined;

    const user =
      typeof req.query.user === "string" ? req.query.user : undefined;

    const result = await getAuditLogs(
      page,
      limit,
      resource as any,
      action as any,
      user,
    );

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
