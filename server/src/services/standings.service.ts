import { Types } from "mongoose";
import Match from "../models/Match";
import Tournaments from "../models/Tournaments";
import ApiError from "../utils/apiError";

export const getTournamentStandings = async (tournamentId: string) => {
  if (!Types.ObjectId.isValid(tournamentId)) {
    throw new ApiError("Invalid tournament ID", 400);
  }

  const tournament = await Tournaments.findById(tournamentId).populate(
    "registeredTeams",
    "name slug logo",
  );

  if (!tournament) {
    throw new ApiError("Tournament not found", 404);
  }

  const matches = await Match.find({
    tournament: tournamentId,
    status: "completed",
  });

  const standings = new Map<
    string,
    {
      team: any;
      mp: number;
      mw: number;
      ml: number;
      points: number;
    }
  >();

  for (const team of tournament.registeredTeams as any[]) {
    standings.set(team._id.toString(), {
      team,
      mp: 0,
      mw: 0,
      ml: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.teamAScore === undefined || match.teamBScore === undefined) {
      continue;
    }

    const teamA = standings.get(match.teamA.toString());
    const teamB = standings.get(match.teamB.toString());

    if (!teamA || !teamB) {
      continue;
    }

    // One completed series/match played.
    teamA.mp += 1;
    teamB.mp += 1;

    teamA.mw += match.teamAScore;
    teamA.ml += match.teamBScore;

    teamB.mw += match.teamBScore;
    teamB.ml += match.teamAScore;

    if (match.teamAScore > match.teamBScore) {
      teamA.points += 2;
    } else {
      teamB.points += 2;
    }
  }

  return Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.mw !== a.mw) {
      return b.mw - a.mw;
    }

    return a.ml - b.ml;
  });
};
