import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as disputeService from "../services/dispute.service";

export const createDispute = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const dispute = await disputeService.createDispute(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Dispute created successfully",
      data: dispute,
    });
  },
);

export const getAllDisputes = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const page = Number(req.query.page) || 1;

    const limit = Math.min(Math.max(Number(req.query.limit) || 10), 50);

    const disputes = await disputeService.getAllDisputes(userId, page, limit);

    res.status(200).json({
      success: true,
      message: "Dispute retrieved successfully",
      data: disputes.allDisputes,
      pagination: {
        page,
        limit,
        total: Math.ceil(disputes.total / limit),
      },
    });
  },
);

export const getDisputeById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const disputeId = req.params.id as string;

    const dispute = await disputeService.getDisputeById(userId, disputeId);

    res.status(200).json({
      success: true,
      message: "Dispute retrieved successfully",
      data: dispute,
    });
  },
);

export const resolveDispute = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const disputeId = req.params.id as string;

    const resolved = await disputeService.resolveDispute(
      userId,
      disputeId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Dispute resolved successfully",
      data: resolved,
    });
  },
);
