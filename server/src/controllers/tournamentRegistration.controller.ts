import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as tournamentRegistrationService from "../services/tournamentRegistration.service";

/**
 * Register a team for a tournament
 */
export const registerTeam = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const tournamentId = req.params.id as string;

    const teamId = req.body.teamId as string;

    const tournament =
      await tournamentRegistrationService.registerTeamForTournament(
        userId,
        tournamentId,
        teamId,
      );

    res.status(200).json({
      success: true,
      message: "Team registered for tournament successfully",
      data: tournament,
    });
  },
);

/**
 * Withdraw a team from a tournament
 */
export const withdrawTeam = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const tournamentId = req.params.id as string;

    const teamId = req.body.teamId as string;

    const tournament =
      await tournamentRegistrationService.withdrawTeamFromTournament(
        userId,
        tournamentId,
        teamId,
      );

    res.status(200).json({
      success: true,
      message: "Team withdrawn from tournament successfully",
      data: tournament,
    });
  },
);

/**
 * Get registered teams for a tournament
 */
export const getRegisteredTeams = asyncHandler(
  async (req: Request, res: Response) => {
    const tournamentId = req.params.id as string;

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const result =
      await tournamentRegistrationService.getTournamentRegisteredTeams(
        tournamentId,
        page,
        limit,
      );

    res.status(200).json({
      success: true,
      message: "Registered teams retrieved successfully",
      data: result.teams,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  },
);
