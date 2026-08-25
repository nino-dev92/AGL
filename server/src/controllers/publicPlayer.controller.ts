import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as publicPlayerService from "../services/publicPlayer.service";

export const getPublicPlayerProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.params;

    const player = await publicPlayerService.getPublicPlayerProfile(
      username as string,
    );

    res.status(200).json({
      success: true,
      message: "Player profile retrieved successfully",
      data: player,
    });
  },
);

export const getAllPlayers = asyncHandler(
  async (req: Request, res: Response) => {
    const search = String(req.query.search ?? "");

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const country = String(req.query.country ?? "");

    const game = String(req.query.game ?? "");

    const players = await publicPlayerService.getAllPlayers(
      search,
      page,
      limit,
      country,
      game,
    );

    res.status(200).json({
      success: true,
      message: "Players retrieved successfully",
      data: players.players,
      pagination: {
        page,
        limit,
        totalPlayers: players.total,
        totalPages: Math.ceil(players.total / limit),
      },
    });
  },
);
