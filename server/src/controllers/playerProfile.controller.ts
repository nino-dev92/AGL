import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as profileService from "../services/playerProfile.service";
import ApiError from "../utils/apiError";

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const profile = await profileService.getMyProfile(userId as string);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const profile = await profileService.updateProfile(
      userId as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  },
);

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    if (!req.file) {
      throw new ApiError("Please upload an image", 400);
    }

    const result = await profileService.uploadAvatar(userId, req.file);

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: result,
    });
  },
);

export const deleteAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    await profileService.deleteAvatar(userId);

    res.status(200).json({
      success: true,
      message: "Avatar deleted successfully",
    });
  },
);

export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const profile = await profileService.deleteProfile(userId as string);

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: profile,
    });
  },
);

export const updateKillDeathsGames = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const playerId = req.params.id as string;

    const { kills, deaths, games, tourneysPlayed, tourneysWon } = req.body;

    const user = await profileService.editKillsDeathsGames(
      userId,
      playerId,
      kills === undefined ? undefined : Number(kills),
      deaths === undefined ? undefined : Number(deaths),
      games === undefined ? undefined : Number(games),
      tourneysPlayed === undefined ? undefined : Number(tourneysPlayed),
      tourneysWon === undefined ? undefined : Number(tourneysWon),
    );

    return res.status(200).json({
      success: true,
      message: "Player profile updated successfully",
      data: user,
    });
  },
);
