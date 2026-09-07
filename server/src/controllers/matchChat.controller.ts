import { Request, Response } from "express";
import { getMatchChatHistory } from "../services/matchChat.service";
import asyncHandler from "../utils/asyncHandler";

export const getChatHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const userId = req.user?.userId as string;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const result = await getMatchChatHistory(userId, id, page, limit);

    res.status(200).json({
      success: true,
      message: "Match chat history retrieved successfully",
      data: result,
    });
  },
);
