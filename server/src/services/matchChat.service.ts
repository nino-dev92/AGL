import Match from "../models/Match";
import MatchChatMessage from "../models/MatchChatMessage";
import Users from "../models/Users";
import ApiError from "../utils/apiError";
import { Types } from "mongoose";

export const canAccessMatchChat = async (userId: string, matchId: string) => {
  if (!Types.ObjectId.isValid(userId))
    throw new ApiError("Invalid user ID", 400);

  if (!Types.ObjectId.isValid(matchId))
    throw new ApiError("Invalid match ID", 400);

  const [user, match] = await Promise.all([
    Users.findById(userId),
    Match.findById(matchId).populate("teamA").populate("teamB"),
  ]);

  if (!user) throw new ApiError("User not found", 404);

  if (!match) throw new ApiError("Match not found", 404);

  // Chat is only available while the match is ongoing.
  if (match.status !== "ongoing") {
    throw new ApiError(
      "Match chat is only available while the match is ongoing",
      403,
    );
  }

  // Admin can access every match chat.
  if (user.role === "admin") {
    return true;
  }

  // Organizer can access every match chat.
  if (user.role === "organizer") {
    return true;
  }

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;

  // Manager can access the chat if they manage either team.
  if (user.role === "manager") {
    const managesTeamA = teamA.manager?.toString() === userId;

    const managesTeamB = teamB.manager?.toString() === userId;

    if (managesTeamA || managesTeamB) {
      return true;
    }

    throw new ApiError("You are not authorized to access this match chat", 403);
  }

  // Players can access the chat if they belong to either team.
  if (user.role === "player") {
    const isTeamAMember = teamA.members?.some(
      (member: Types.ObjectId) => member.toString() === userId,
    );

    const isTeamBMember = teamB.members?.some(
      (member: Types.ObjectId) => member.toString() === userId,
    );

    if (isTeamAMember || isTeamBMember) {
      return true;
    }

    throw new ApiError("You are not authorized to access this match chat", 403);
  }

  throw new ApiError("You are not authorized to access this match chat", 403);
};

export const joinMatchChat = async (userId: string, matchId: string) => {
  await canAccessMatchChat(userId, matchId);

  return true;
};

export const sendMatchChatMessage = async (
  userId: string,
  matchId: string,
  message: string,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(matchId)) {
    throw new ApiError("Invalid match ID", 400);
  }

  if (!message || !message.trim()) {
    throw new ApiError("Message cannot be empty", 400);
  }

  if (message.trim().length > 500) {
    throw new ApiError("Message cannot exceed 500 characters", 400);
  }

  // Check whether the user is allowed to access this match chat.
  await canAccessMatchChat(userId, matchId);

  const [user, match] = await Promise.all([
    Users.findById(userId).select("firstName lastName userName avatar role"),
    Match.findById(matchId),
  ]);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (!match) {
    throw new ApiError("Match not found", 404);
  }

  // Double-check that the match is still ongoing. This protects against a match being completed between the access check and message creation.
  if (match.status !== "ongoing") {
    throw new ApiError(
      "Match chat is only available while the match is ongoing",
      403,
    );
  }

  const chatMessage = await MatchChatMessage.create({
    match: match._id,
    sender: user._id,
    message: message.trim(),
  });

  await chatMessage.populate(
    "sender",
    "firstName lastName userName avatar role",
  );

  return chatMessage;
};

export const getMatchChatHistory = async (
  userId: string,
  matchId: string,
  page: number,
  limit: number,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError("Invalid user ID", 400);
  }

  if (!Types.ObjectId.isValid(matchId)) {
    throw new ApiError("Invalid match ID", 400);
  }

  // Authorization is checked before returning chat history. Unlike sending messages, this should eventually be adjusted
  // if you want users to view historical chat after a match ends.
  await canAccessMatchChat(userId, matchId);

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    MatchChatMessage.find({
      match: matchId,
    })
      .populate("sender", "firstName lastName userName avatar role")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),

    MatchChatMessage.countDocuments({
      match: matchId,
    }),
  ]);

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
