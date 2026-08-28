import Match from "../models/Match";
import ApiError from "../utils/apiError";
import Users from "../models/Users";
import { MatchDTO, UpdateMatchDTO } from "../types/match.types";
import { Types } from "mongoose";

export const createMatch = async (userId: string, data: MatchDTO) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  // check if user exists
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  // verify user role
  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // check if match exists
  const matchExists = await Match.findOne(data);

  if (matchExists) throw new ApiError("Match already exists", 409);

  const match = await Match.create({
    tournament: new Types.ObjectId(data.tournament),
    teamA: new Types.ObjectId(data.teamA),
    teamB: new Types.ObjectId(data.teamB),
    scheduledDate: new Date(data.scheduledDate),
    round: data.round,
  });

  return match;
};

export const getAllMatches = async (
  tournament: string,
  page: number,
  limit: number,
  status: string,
  team: string,
) => {
  const filter: any = {};

  const skip = (page - 1) * limit;

  if (tournament) {
    filter.tournament = tournament;
  }

  if (status) {
    filter.status = status;
  }

  if (team) {
    filter.$or = [{ teamA: team }, { teamB: team }];
  }

  const matches = await Match.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("tournament", "name game banner")
    .populate("teamA", "userName logo")
    .populate("teamB", "userName logo")
    .populate("winner", "userName avatar");

  const total = await Match.countDocuments(filter);

  return { matches, total };
};

export const getMatchById = async (matchId: string) => {
  if (!Types.ObjectId.isValid(matchId))
    throw new ApiError("Invalid match ID", 400);

  const match = await Match.findById(matchId);

  if (!match) throw new ApiError("Match not found", 404);

  return match;
};

export const updateMatch = async (
  userId: string,
  matchId: string,
  update: UpdateMatchDTO,
) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(matchId))
    throw new ApiError("Invalid match ID", 400);

  // check if user and match exist
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const matchExists = await Match.findById(matchId);

  if (!matchExists) throw new ApiError("Match not found", 404);

  // verify user role

  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // update match
  const updateMatch = await Match.findByIdAndUpdate(matchId, update, {
    new: true,
  });

  return updateMatch;
};

export const deleteMatch = async (userId: string, matchId: string) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(matchId))
    throw new ApiError("Invalid match ID", 400);

  // check if user and match exist
  const user = await Users.findById(userId);

  if (!user) throw new ApiError("User not found", 404);

  const matchExists = await Match.findById(matchId);

  if (!matchExists) throw new ApiError("Match not found", 404);

  // verify user role

  const isAdminOrOrganizer = user.role === "admin" || user.role === "organizer";

  if (!isAdminOrOrganizer) throw new ApiError("Forbidden", 403);

  // delete match
  await Match.findByIdAndDelete(matchId);

  return null;
};
