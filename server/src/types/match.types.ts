export type MatchStatus = "pending" | "ongoing" | "completed" | "cancelled";

export type MatchDTO = {
  tournament: string;
  teamA: string;
  teamB: string;
  scheduledDate: string | Date;
  round: string;
  matchNumber: number;
};

export type UpdateMatchDTO = {
  tournament: string;
  scheduledDate?: string | Date;
  status?: MatchStatus;
  result?: string;
  winner?: string;
};

export type TournamentMatchDTO = {
  teamA: string;
  teamB: string;
  scheduledDate: string | Date;
  round: string;
  matchNumber: number;
};
