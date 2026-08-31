import { Types } from "mongoose";
import Tournaments from "../models/Tournaments";
import Teams from "../models/Teams";
import Users from "../models/Users";
import ApiError from "../utils/apiError";

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

  // Only the team captain can register the team
  const isCaptain = team.captain!.toString() === user._id.toString();

  // Admin or manager can also register a team
  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  if (!isCaptain && !isAdminOrManager) {
    throw new ApiError("Only the team captain can register this team", 403);
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

  return await tournament.populate({
    path: "registeredTeams",
    select: "name logo captain members",
    populate: {
      path: "captain",
      select: "userName",
    },
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
  const isCaptain = team.captain!.toString() === user._id.toString();

  const isAdminOrManager = user.role === "admin" || user.role === "manager";

  if (!isCaptain && !isAdminOrManager) {
    throw new ApiError("Only the team captain can withdraw this team", 403);
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
