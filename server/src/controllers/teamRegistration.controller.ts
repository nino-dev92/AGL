import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as registrationService from "../services/tournamentRegistration.service";

export const applyTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const application = await registrationService.applyToTournament(
      userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Tournament application submitted successfully",
      data: application,
    });
  },
);

export const findTournamentApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const tournamentId = req.params.tournamentId as string;

    const status = req.query.status as
      "pending" | "approved" | "rejected" | undefined;

    const applications = await registrationService.getTournamentApplications(
      tournamentId,
      status,
    );

    res.status(200).json({
      success: true,
      message: "Tournament applications retrieved successfully",
      data: applications,
    });
  },
);

export const findTournamentApplicationById = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = req.params.id as string;

    const application =
      await registrationService.getApplicationById(applicationId);

    res.status(200).json({
      success: true,
      message: "Tournament application retrieved successfully",
      data: application,
    });
  },
);

export const reviewTournamentApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const applicationId = req.params.id as string;

    const application = await registrationService.reviewTournamentApplication(
      userId,
      applicationId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: `Tournament application ${req.body.status} successfully`,
      data: application,
    });
  },
);
