export type MatchStatus = "pending" | "ongoing" | "completed" | "cancelled";

export interface MatchDTO {
  tournament: string;
  teamA: string;
  teamB: string;
  scheduledDate: Date;
  round: string;
  matchNumber: number;
}

export interface UpdateMatchDTO {
  teamA?: string;
  teamB?: string;
  scheduledDate?: Date;
  round?: string;
  matchNumber?: number;
}

export type TournamentMatchDTO = {
  teamA: string;
  teamB: string;
  scheduledDate: string | Date;
  round: string;
  matchNumber: number;
};
