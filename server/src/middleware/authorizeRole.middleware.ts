import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";

const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError("Unauthorized", 401);

    if (!allowedRoles.includes(req.user.role as string)) {
      throw new ApiError("Forbidden", 403);
    }

    next();
  };
};

export default authorizeRole;
