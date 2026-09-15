import { Types } from "mongoose";
import Dispute from "../models/Dispute";
import Match from "../models/Match";
import Tournaments from "../models/Tournaments";
import Users from "../models/Users";
import ApiError from "../utils/apiError";
import {
  notifyDisputeCreated,
  notifyDisputeResolved,
} from "./notifications/disputeNotification.service";
import { createAuditLog } from "./auditLog.service";
import logger from "../logger/logger";

interface CreateDisputeDTO {
  match: string;
  tournament: string;
  reason:
    | "match_result"
    | "player_eligibility"
    | "rule_violation"
    | "match_conduct"
    | "technical_issue"
    | "other";
  description: string;
}

interface ResolveDisputeDTO {
  status: "resolved" | "rejected";
  resolution: string;
}

export const createDispute = async (userId: string, data: CreateDisputeDTO) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(data.match)) {
    throw new ApiError("Invalid match ID", 400);
  }

  if (!Types.ObjectId.isValid(data.tournament)) {
    throw new ApiError("Invalid tournament ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!["player", "manager", "organizer", "admin"].includes(user.role)) {
    throw new ApiError("You are not authorized to create a dispute", 403);
  }

  const [match, tournament] = await Promise.all([
    Match.findById(data.match).populate("teamA").populate("teamB"),
    Tournaments.findById(data.tournament),
  ]);

  if (!match) {
    throw new ApiError("Match not found", 404);
  }

  if (!tournament) {
    throw new ApiError("Tournament not found", 404);
  }

  if (match.tournament.toString() !== tournament._id.toString()) {
    throw new ApiError(
      "The match does not belong to the specified tournament",
      400,
    );
  }

  if (match.status !== "completed") {
    throw new ApiError(
      "A dispute can only be created for a completed match",
      400,
    );
  }

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;

  if (user.role === "player") {
    const isTeamMember =
      teamA.members?.some(
        (member: Types.ObjectId) => member.toString() === userId,
      ) ||
      teamB.members?.some(
        (member: Types.ObjectId) => member.toString() === userId,
      );

    if (!isTeamMember) {
      throw new ApiError(
        "You can only dispute matches involving your team",
        403,
      );
    }
  }

  if (user.role === "manager") {
    const managesTeam =
      teamA.manager?.toString() === userId ||
      teamB.manager?.toString() === userId;

    if (!managesTeam) {
      throw new ApiError(
        "You can only dispute matches involving your team",
        403,
      );
    }
  }

  if (user.role === "organizer") {
    const isOrganizer =
      match.organizer.toString() === userId ||
      tournament.organizer.toString() === userId;

    if (!isOrganizer) {
      throw new ApiError("You can only dispute matches you organized", 403);
    }
  }

  const existingDispute = await Dispute.findOne({
    match: match._id,
    raisedBy: user._id,
    status: { $in: ["open", "under-review"] },
  });

  if (existingDispute) {
    throw new ApiError(
      "You already have an active dispute for this match",
      409,
    );
  }

  const dispute = await Dispute.create({
    match: match._id,
    tournament: tournament._id,
    raisedBy: user._id,
    reason: data.reason,
    description: data.description.trim(),
  });

  // create audit log
  try {
    await createAuditLog({
      user: userId,
      action: "create",
      resource: "dispute",
      resourceId: dispute._id.toString(),
      description: `Created dispute ${dispute._id.toString()}`,
      metadata: {
        matchId: match._id.toString(),
        tournamentId: tournament._id.toString(),
        reason: data.reason,
      },
    });
  } catch (error) {
    logger.error(error);
  }

  // send notifications to all users involved in the dispute
  await notifyDisputeCreated(dispute._id.toString());

  return dispute;
};

export const getAllDisputes = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.role !== "admin") throw new ApiError("Forbidden", 403);

  const allDisputes = await Dispute.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate("match")
    .populate("tournament", "name slug")
    .populate("raisedBy", "firstName lastName userName avatar role")
    .populate("resolvedBy", "firstName lastName userName");

  const total = await Dispute.countDocuments();

  return { allDisputes, total };
};

export const getDisputeById = async (userId: string, disputeId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(disputeId)) {
    throw new ApiError("Invalid dispute ID", 400);
  }

  const user = await Users.findById(userId);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const dispute = await Dispute.findById(disputeId)
    .populate("match")
    .populate("tournament", "name slug")
    .populate("raisedBy", "firstName lastName userName avatar role")
    .populate("resolvedBy", "firstName lastName userName");

  if (!dispute) {
    throw new ApiError("Dispute not found", 404);
  }

  // Dont return dispute if not raised by requesting user
  if (dispute.raisedBy._id.toString() !== userId) {
    throw new ApiError("You are not authorized to view this dispute", 403);
  }

  // Return dispute for Adin
  if (user.role === "admin") {
    return dispute;
  }

  return dispute;
};

export const resolveDispute = async (
  userId: string,
  disputeId: string,
  data: ResolveDisputeDTO,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(disputeId)) {
    throw new ApiError("Invalid dispute ID", 400);
  }

  const admin = await Users.findById(userId);

  if (!admin) {
    throw new ApiError("User not found", 404);
  }

  if (admin.role !== "admin") {
    throw new ApiError("Only administrators can resolve disputes", 403);
  }

  const dispute = await Dispute.findById(disputeId);

  if (!dispute) {
    throw new ApiError("Dispute not found", 404);
  }

  if (dispute.status === "resolved" || dispute.status === "rejected") {
    throw new ApiError("This dispute has already been resolved", 400);
  }

  dispute.status = data.status;
  dispute.resolution = data.resolution.trim();
  dispute.resolvedBy = admin._id;
  dispute.resolvedAt = new Date();

  await dispute.save();

  // create audit log
  try {
    await createAuditLog({
      user: userId,
      action: data.status === "resolved" ? "resolve" : "reject",
      resource: "dispute",
      resourceId: dispute._id.toString(),
      description: `${
        data.status === "resolved" ? "Resolved" : "Rejected"
      } dispute ${dispute._id.toString()}`,
      metadata: {
        status: data.status,
        resolution: data.resolution.trim(),
      },
    });
  } catch (error) {
    logger.error(error);
  }

  // send notifications all users involved in the dispute
  await notifyDisputeResolved(dispute._id.toString());

  return dispute;
};
