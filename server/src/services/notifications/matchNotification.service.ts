import Match from "../../models/Match";
import Teams from "../../models/Teams";
import { createNotification } from "../notification.service";

const getMatchParticipantIds = async (match: any): Promise<string[]> => {
  const teams = await Teams.find({
    _id: { $in: [match.teamA, match.teamB] },
  }).select("manager members");

  const participantIds = new Set<string>();

  for (const team of teams) {
    participantIds.add(team.manager.toString());

    for (const member of team.members) {
      participantIds.add(member.toString());
    }
  }

  return Array.from(participantIds);
};

const getMatchNotificationData = async (matchId: string) => {
  const match = await Match.findById(matchId)
    .populate("teamA", "name")
    .populate("teamB", "name")
    .populate("tournament", "name");

  if (!match) {
    throw new Error("Match not found");
  }

  return match;
};

export const notifyMatchCreated = async (matchId: string) => {
  const match = await getMatchNotificationData(matchId);
  const recipientIds = await getMatchParticipantIds(match);

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;
  const tournament = match.tournament as any;

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "match-created",
        title: "New Match Scheduled",
        message: `${teamA.name} will play ${teamB.name} in ${match.round} of ${tournament.name}.`,
        tournament: tournament._id.toString(),
        match: match._id.toString(),
      }),
    ),
  );
};

export const notifyMatchUpdated = async (matchId: string) => {
  const match = await getMatchNotificationData(matchId);
  const recipientIds = await getMatchParticipantIds(match);

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;
  const tournament = match.tournament as any;

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "match-updated",
        title: "Match Updated",
        message: `The details for the match between ${teamA.name} and ${teamB.name} have been updated.`,
        tournament: tournament._id.toString(),
        match: match._id.toString(),
      }),
    ),
  );
};

export const notifyMatchStarted = async (matchId: string) => {
  const match = await getMatchNotificationData(matchId);
  const recipientIds = await getMatchParticipantIds(match);

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;
  const tournament = match.tournament as any;

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "match-updated",
        title: "Match Started",
        message: `The match between ${teamA.name} and ${teamB.name} has started.`,
        tournament: tournament._id.toString(),
        match: match._id.toString(),
      }),
    ),
  );
};

export const notifyMatchResult = async (matchId: string) => {
  const match = await Match.findById(matchId)
    .populate("teamA", "name")
    .populate("teamB", "name")
    .populate("tournament", "name")
    .populate("winner", "name");

  if (!match) {
    throw new Error("Match not found");
  }

  const recipientIds = await getMatchParticipantIds(match);

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;
  const tournament = match.tournament as any;
  const winner = match.winner as any;

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "match-result",
        title: "Match Result",
        message: `${winner.name} won against ${
          winner._id.toString() === teamA._id.toString()
            ? teamB.name
            : teamA.name
        } ${match.teamAScore}-${match.teamBScore}.`,
        tournament: tournament._id.toString(),
        match: match._id.toString(),
      }),
    ),
  );
};

export const notifyMatchCancelled = async (matchId: string) => {
  const match = await getMatchNotificationData(matchId);
  const recipientIds = await getMatchParticipantIds(match);

  const teamA = match.teamA as any;
  const teamB = match.teamB as any;
  const tournament = match.tournament as any;

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        recipient: recipientId,
        type: "match-updated",
        title: "Match Cancelled",
        message: `The match between ${teamA.name} and ${teamB.name} has been cancelled.`,
        tournament: tournament._id.toString(),
        match: match._id.toString(),
      }),
    ),
  );
};
