import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as standingsService from "../services/standings.service";

export const getTournamentStandings = asyncHandler(
  async (req: Request, res: Response) => {
    const tournamentId = req.params.tournamentId as string;
    console.log(tournamentId);

    const standings =
      await standingsService.getTournamentStandings(tournamentId);

    res.status(200).json({
      success: true,
      message: "Tournament standings retrieved successfully",
      data: standings,
    });
  },
);
