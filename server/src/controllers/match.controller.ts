import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as matchService from "../services/match.service";

export const addMatch = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;

  const newMatch = await matchService.createMatch(userId, req.body);

  res.status(201).json({
    success: true,
    message: "Match created successfully",
    data: newMatch,
  });
});

export const findAllMatches = asyncHandler(
  async (req: Request, res: Response) => {
    const tournament = String(req.query.tournament ?? "");

    const team = String(req.query.team ?? "");

    const status = String(req.query.status ?? "");

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const result = await matchService.getAllMatches(
      tournament,
      page,
      limit,
      status,
      team,
    );

    res.status(200).json({
      success: true,
      message: "Matches retrieved successfully",
      data: result.matches,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  },
);

/**
 * Get a match by ID
 */
export const findMatchById = asyncHandler(
  async (req: Request, res: Response) => {
    const matchId = req.params.id as string;

    const match = await matchService.getMatchById(matchId);

    res.status(200).json({
      success: true,
      message: "Match retrieved successfully",
      data: match,
    });
  },
);

export const editMatch = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const matchId = req.params.id as string;

  const updatedMatch = await matchService.updateMatch(
    userId,
    matchId,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Match updated successfully",
    data: updatedMatch,
  });
});

export const removeMatch = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const matchId = req.params.id as string;

  await matchService.deleteMatch(userId, matchId);

  res.status(200).json({
    success: true,
    message: "Match deleted successfully",
  });
});
