import { Request, Response, NextFunction } from "express";

const credentials = (_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Credentials", "true");

  next();
};

export default credentials;
