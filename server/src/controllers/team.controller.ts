import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as teamService from "../services/team.service";
import { Types } from "mongoose";
import ApiError from "../utils/apiError";

export const addTeam = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const newTeam = await teamService.createTeam(userId, req.body);

  res.status(201).json({
    success: true,
    message: "Team created successflly",
    data: newTeam,
  });
});

export const findAllTeams = asyncHandler(
  async (req: Request, res: Response) => {
    const search = String(req.params.search ?? "");
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Number(req.query.limit ?? 10), 50);
    const game = String(req.query.game ?? "");

    const allTeams = await teamService.getAllTeams(search, page, limit, game);

    res.status(200).json({
      success: true,
      message: "All teams retrieved successfully",
      data: allTeams.teams,
      pagination: {
        page,
        limit,
        totalTeams: allTeams.totalTeams,
        totalPages: Math.ceil(allTeams.totalTeams / limit),
      },
    });
  },
);

export const findTeambyId = asyncHandler(
  async (req: Request, res: Response) => {
    const teamId = req.params.id as string;

    const team = await teamService.getTeamById(teamId);

    res.status(200).json({
      success: true,
      message: "Team retrieved successfully",
      data: team,
    });
  },
);

export const editTeam = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const teamId = req.params.id as string;

  const update = await teamService.updateTeam(userId, teamId, req.body);

  res.status(201).json({
    success: true,
    message: "Team updated successfully",
    data: update,
  });
});

export const addTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const teamId = req.params.id as string;
    const data: string[] = req.body.members;

    const members: Types.ObjectId[] = data.map(
      (item) => new Types.ObjectId(item),
    );

    const addMembers = await teamService.addTeamMember(userId, teamId, members);

    res.status(201).json({
      success: true,
      message: "Members added successfully",
      data: addMembers,
    });
  },
);

export const removeTeamMember = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const teamId = req.params.teamId as string;
    const memberId = req.params.memberId as string;

    const update = await teamService.deleteTeamMember(userId, teamId, memberId);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: update,
    });
  },
);

export const updateTeamLogo = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const teamId = req.params.teamId as string;

    if (!req.file) {
      throw new ApiError("Please upload an image", 400);
    }

    const updateLogo = await teamService.updateTeamLogo(
      userId,
      teamId,
      req.file,
    );

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: updateLogo,
    });
  },
);

export const deleteTeamLogo = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const teamId = req.params.teamId as string;

    await teamService.deleteTeamLogo(userId, teamId);

    res.status(200).json({
      success: true,
      message: "Team logo deleted successfully",
    });
  },
);

export const leaveTeam = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const teamId = req.params.id as string;

  await teamService.leaveTeam(userId, teamId);

  res.status(200).json({ success: true, message: "Leave team successful" });
});

export const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const teamId = req.params.id as string;

  await teamService.deleteTeam(userId, teamId);

  res.status(200).json({ success: true, message: "Team deleted successfully" });
});
