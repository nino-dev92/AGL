import { Types } from "mongoose";
import Tournaments from "../models/Tournaments";
import Teams from "../models/Teams";
import Users from "../models/Users";
import ApiError from "../utils/apiError";
import TournamentRegistration from "../models/TournamentRegistration";
import {
  TournamentRegistrationDTO,
  ReviewTournamentRegistrationDTO,
} from "../types/tournamentRegistration.types";
import { createNotification } from "./notification.service";
import { createAuditLog } from "./auditLog.service";
import logger from "../logger/logger";

export const registerTeamForTournament = async (
  userId: string,
  tournamentId: string,
  teamId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(tournamentId)) {
    throw new ApiError("Invalid tournament ID", 400);
  }

  if (!Types.ObjectId.isValid(teamId)) {
    throw new ApiError("Invalid team ID", 400);
  }

  // Check if user exists
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if tournament exists
  const tournament = await Tournaments.findById(tournamentId);

  if (!tournament) {
    throw new ApiError("Tournament not found", 404);
  }

  // Registration must be open
  if (tournament.status !== "registration-open") {
    throw new ApiError("Tournament registration is not currently open", 400);
  }

  // Check if team exists
  const team = await Teams.findById(teamId);

  if (!team) {
    throw new ApiError("Team not found", 404);
  }

  // Admin or manager can register a team
  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  if (!isAdminOrManager) {
    throw new ApiError(
      "Only the team manager or admin can register this team",
      403,
    );
  }

  // Check if the team is already registered
  const isAlreadyRegistered = tournament.registeredTeams.some(
    (registeredTeamId) => registeredTeamId.toString() === team._id.toString(),
  );

  if (isAlreadyRegistered) {
    throw new ApiError(
      "This team is already registered for the tournament",
      409,
    );
  }

  // Check tournament capacity
  if (tournament.registeredTeams.length >= tournament.maxTeams) {
    throw new ApiError("Tournament registration is full", 400);
  }

  // Register the team
  tournament.registeredTeams.push(new Types.ObjectId(teamId));

  await tournament.save();

  // create audit log
  try {
    await createAuditLog({
      user: userId,
      action: "create",
      resource: "registration",
      description: `Registered team ${teamId} for tournament ${tournamentId}`,
      metadata: {
        tournamentId,
        teamId,
      },
    });
  } catch (error) {
    logger.error(error);
  }

  return await tournament.populate({
    path: "registeredTeams",
    select: "name logo members",
  });
};

export const withdrawTeamFromTournament = async (
  userId: string,
  tournamentId: string,
  teamId: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(tournamentId)) {
    throw new ApiError("Invalid tournament ID", 400);
  }

  if (!Types.ObjectId.isValid(teamId)) {
    throw new ApiError("Invalid team ID", 400);
  }

  // Check if user exists
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if tournament exists
  const tournament = await Tournaments.findById(tournamentId);

  if (!tournament) {
    throw new ApiError("Tournament not found", 404);
  }

  // Withdrawal is only allowed while registration is open
  if (tournament.status !== "registration-open") {
    throw new ApiError(
      "Teams can only withdraw while registration is open",
      400,
    );
  }

  // Check if team exists
  const team = await Teams.findById(teamId);

  if (!team) {
    throw new ApiError("Team not found", 404);
  }

  // Check permissions

  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  if (!isAdminOrManager) {
    throw new ApiError(
      "Only the team manager or admin can withdraw this team",
      403,
    );
  }

  // Check if the team is registered
  const isRegistered = tournament.registeredTeams.some(
    (registeredTeamId) => registeredTeamId.toString() === team._id.toString(),
  );

  if (!isRegistered) {
    throw new ApiError("This team is not registered for the tournament", 404);
  }

  // Remove the team
  tournament.registeredTeams = tournament.registeredTeams.filter(
    (registeredTeamId) => registeredTeamId.toString() !== teamId,
  );

  await tournament.save();

  // create audit log
  try {
    await createAuditLog({
      user: userId,
      action: "delete",
      resource: "registration",
      description: `Withdrew team ${teamId} from tournament ${tournamentId}`,
      metadata: {
        tournamentId,
        teamId,
      },
    });
  } catch (error) {
    logger.error(error);
  }

  return tournament;
};

export const getTournamentRegisteredTeams = async (
  tournamentId: string,
  page: number,
  limit: number,
) => {
  if (!Types.ObjectId.isValid(tournamentId)) {
    throw new ApiError("Invalid tournament ID", 400);
  }

  const tournament = await Tournaments.findById(tournamentId).populate({
    path: "registeredTeams",
    select: "name logo captain members",
    populate: [
      {
        path: "captain",
        select: "userName",
      },
      {
        path: "members",
        select: "userName avatar",
      },
    ],
  });

  if (!tournament) {
    throw new ApiError("Tournament not found", 404);
  }

  const total = tournament.registeredTeams.length;

  const skip = (page - 1) * limit;

  const teams = tournament.registeredTeams.slice(skip, skip + limit);

  return {
    teams,
    total,
  };
};

export const applyToTournament = async (
  userId: string,
  data: TournamentRegistrationDTO,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(data.tournament))
    throw new ApiError("Invalid tournament ID", 400);

  if (!Types.ObjectId.isValid(data.team))
    throw new ApiError("Invalid team ID", 400);

  // check if user exists
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  // Only managers can apply their teams to tournaments.
  if (user.role !== "manager")
    throw new ApiError("Only managers can apply teams to tournaments", 403);

  // check if tournament exists
  const tournament = await Tournaments.findById(data.tournament);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  // A team should only be able to apply while registration is open.
  if (tournament.status !== "registration-open")
    throw new ApiError("Tournament registration is not currently open", 400);

  // check if team exists
  const team = await Teams.findById(data.team);

  if (!team) throw new ApiError("Team not found", 404);

  // Make sure the team belongs to the manager submitting the application.
  if (team.manager.toString() !== userId) {
    throw new ApiError("You are not authorized to apply this team", 403);
  }

  // Inactive teams cannot register for tournaments.
  if (!team.isActive) {
    throw new ApiError(
      "This team is inactive and cannot register for a tournament",
      400,
    );
  }

  // Make sure the team's game matches the tournament's game.
  if (team.game.toString() !== tournament.game.toString()) {
    throw new ApiError(
      "This team cannot register for a tournament for a different game",
      400,
    );
  }

  // Check if this team has already applied.
  const existingApplication = await TournamentRegistration.findOne({
    tournament: data.tournament,
    team: data.team,
  });

  if (existingApplication) {
    if (existingApplication.status === "pending") {
      throw new ApiError("This team already has a pending application", 409);
    }

    if (existingApplication.status === "approved") {
      throw new ApiError(
        "This team is already registered for this tournament",
        409,
      );
    }

    // If previously rejected, allow the manager to submit again.
    existingApplication.status = "pending";
    existingApplication.rejectionReason = undefined;
    existingApplication.reviewedBy = undefined;
    existingApplication.reviewedAt = undefined;

    await existingApplication.save();

    // create audit log
    try {
      await createAuditLog({
        user: userId,
        action: "update",
        resource: "registration",
        resourceId: existingApplication._id.toString(),
        description: `Resubmitted tournament application ${existingApplication._id.toString}`,
        metadata: {
          tournamentId: data.tournament,
          teamId: data.team,
          status: "pending",
        },
      });
    } catch (error) {
      logger.error(error);
    }

    // Notify organizer about re-submitted application
    await createNotification({
      recipient: tournament.organizer.toString(),
      type: "tournament-registration",
      title: "Tournament Registration Resubmitted",
      message: `${team.name} has resubmitted an application for ${tournament.name}.`,
      tournament: tournament._id.toString(),
    });

    return existingApplication;
  }

  // Create a new tournament application.
  const application = await TournamentRegistration.create({
    tournament: data.tournament,
    team: data.team,
    manager: userId,
    status: "pending",
  });

  // create audit log
  try {
    await createAuditLog({
      user: userId,
      action: "create",
      resource: "registration",
      resourceId: application._id.toString(),
      description: `Created tournament application ${application._id.toString()}`,
      metadata: {
        tournamentId: data.tournament,
        teamId: data.team,
        status: "pending",
      },
    });
  } catch (error) {
    logger.error(error);
  }

  // Notify organizer about team application to tournament
  await createNotification({
    recipient: tournament.organizer.toString(),
    type: "tournament-registration",
    title: "New Tournament Registration",
    message: `${team.name} has applied to participate in ${tournament.name}.`,
    tournament: tournament._id.toString(),
  });

  return application;
};

export const getManagerApplications = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  // Check if user exists
  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Only managers can view their applications
  if (user.role !== "manager") {
    throw new ApiError("Forbidden", 403);
  }

  // Get applications submitted by this manager
  const applications = await TournamentRegistration.find({
    manager: userId,
  })
    .sort({ createdAt: -1 })
    .populate("tournament", "name slug status")
    .populate("team", "name logo game");

  return applications;
};

export const getTournamentApplications = async (
  tournamentId: string,
  status?: "pending" | "approved" | "rejected",
) => {
  if (!Types.ObjectId.isValid(tournamentId))
    throw new ApiError("Invalid tournament ID", 400);

  // check if tournament exists
  const tournament = await Tournaments.findById(tournamentId);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  const filter: Record<string, unknown> = {
    tournament: tournamentId,
  };

  if (status) {
    filter.status = status;
  }

  const applications = await TournamentRegistration.find(filter)
    .sort({ createdAt: -1 })
    .populate("team", "name logo")
    .populate("manager", "userName email")
    .populate("reviewedBy", "userName email");

  return applications;
};

export const reviewTournamentApplication = async (
  userId: string,
  applicationId: string,
  data: ReviewTournamentRegistrationDTO,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(applicationId))
    throw new ApiError("Invalid application ID", 400);

  // check if reviewer exists
  const reviewer = await Users.findById(userId);

  if (!reviewer) throw new ApiError("User not found", 404);

  // Only admin or organizer can approve/reject applications.
  const isAdminOrOrganizer =
    reviewer.role === "admin" || reviewer.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // check if application exists
  const application = await TournamentRegistration.findById(applicationId);

  if (!application) throw new ApiError("Tournament application not found", 404);

  // Prevent an already approved/rejected application from being reviewed again.
  if (application.status !== "pending") {
    throw new ApiError(
      `Application has already been ${application.status}`,
      400,
    );
  }

  // Get tournament
  const tournament = await Tournaments.findById(application.tournament);

  if (!tournament) throw new ApiError("Tournament not found", 404);

  if (data.status === "approved") {
    // Make sure the tournament has not reached its maximum capacity.
    if (tournament.registeredTeams.length >= tournament.maxTeams) {
      throw new ApiError(
        "Tournament has reached its maximum number of teams",
        400,
      );
    }

    // Make sure the team hasn't somehow already been registered.
    const alreadyRegistered = tournament.registeredTeams.some(
      (teamId) => teamId.toString() === application.team.toString(),
    );

    if (alreadyRegistered) {
      throw new ApiError("Team is already registered for this tournament", 409);
    }

    // Add team to tournament's registered teams.
    tournament.registeredTeams.push(application.team);

    await tournament.save();

    // Approve the application.
    application.status = "approved";
    application.reviewedBy = new Types.ObjectId(userId);
    application.reviewedAt = new Date();
    application.rejectionReason = undefined;

    await application.save();

    // create audit log
    try {
      await createAuditLog({
        user: userId,
        action: "approve",
        resource: "registration",
        resourceId: application._id.toString(),
        description: `Approved tournament application ${application._id.toString()}`,
        metadata: {
          tournamentId: application.tournament.toString(),
          teamId: application.team.toString(),
          status: application.status,
        },
      });
    } catch (error) {
      logger.error(error);
    }

    // Notify team manager about application approval
    await createNotification({
      recipient: application.manager.toString(),
      type: "registration-approved",
      title: "Tournament Registration Approved",
      message: `Your team has been approved to participate in ${tournament.name}.`,
      tournament: tournament._id.toString(),
    });
  }

  if (data.status === "rejected") {
    application.status = "rejected";
    application.reviewedBy = new Types.ObjectId(userId);
    application.reviewedAt = new Date();

    if (data.rejectionReason) {
      application.rejectionReason = data.rejectionReason;
    }

    await application.save();

    // create audit log
    try {
      await createAuditLog({
        user: userId,
        action: "reject",
        resource: "registration",
        resourceId: application._id.toString(),
        description: `Rejected tournament application ${application._id.toString()}`,
        metadata: {
          tournamentId: application.tournament.toString(),
          teamId: application.team.toString(),
          status: application.status,
          rejectionReason: application.rejectionReason,
        },
      });
    } catch (error) {
      logger.error(error);
    }

    // Notify team manager about application rejection
    await createNotification({
      recipient: application.manager.toString(),
      type: "registration-rejected",
      title: "Tournament Registration Rejected",
      message: data.rejectionReason
        ? `Your team application for ${tournament.name} was rejected. Reason: ${data.rejectionReason}`
        : `Your team application for ${tournament.name} was rejected.`,
      tournament: tournament._id.toString(),
    });
  }

  return application;
};

export const getApplicationById = async (applicationId: string) => {
  if (!Types.ObjectId.isValid(applicationId))
    throw new ApiError("Invalid application ID", 400);

  const application = await TournamentRegistration.findById(applicationId)
    .populate("tournament", "name slug status")
    .populate("team", "name logo")
    .populate("manager", "userName email")
    .populate("reviewedBy", "userName email");

  if (!application) throw new ApiError("Tournament application not found", 404);

  return application;
};
