import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as gameService from "../services/game.service";
import ApiError from "../utils/apiError";

export const addNewGame = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;

  const newGame = await gameService.addGame(userId, req.body);

  res.status(201).json({
    success: true,
    message: "Game created successfully",
    data: newGame,
  });
});

export const findGame = asyncHandler(async (req: Request, res: Response) => {
  const search = String(req.query.search ?? "");

  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const games = await gameService.findAllGames(search, page, limit);

  res.status(200).json({
    success: true,
    message: "Games retrieved successfully",
    data: games.games,
    pagination: {
      page,
      limit,
      totalGames: games.total,
      totalPages: Math.ceil(games.total / limit),
    },
  });
});

export const findGameById = asyncHandler(
  async (req: Request, res: Response) => {
    const gameId = req.params.id as string;

    const game = await gameService.findGameById(gameId);

    res.status(200).json({
      success: true,
      message: "Game retrieved successfully",
      data: game,
    });
  },
);

export const updateGame = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const gameId = req.params.id as string;

  const update = await gameService.editGame(userId, gameId, req.body);

  res.status(201).json({
    success: true,
    message: "Game updated successfully",
    data: update,
  });
});

export const updateGamePicture = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const gameId = req.params.id as string;

    if (!req.file) {
      throw new ApiError("Please upload an image", 400);
    }

    const updatePicture = await gameService.updateGamePicture(
      userId,
      gameId,
      req.file,
    );

    res.status(200).json({
      success: true,
      message: "Picture uploaded successfully",
      data: updatePicture,
    });
  },
);

export const deleteGamePicture = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const gameId = req.params.id as string;

    await gameService.deleteGamePicture(userId, gameId);

    res.status(200).json({
      success: true,
      message: "Game picture deleted successfully",
    });
  },
);

export const removeGame = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const gameId = req.params.id as string;

  await gameService.deleteGame(userId, gameId);

  res.status(200).json({ success: true, message: "Game deleted successfully" });
});
