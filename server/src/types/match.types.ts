export type MatchStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface MatchDTO {
  tournament: string;
  teamA: string;
  teamB: string;
  scheduledDate: Date;
  scheduledTime?: string;
  round: string;
  matchNumber: number;
}

export interface UpdateMatchDTO {
  teamA?: string;
  teamB?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  round?: string;
  matchNumber?: number;
}

export type TournamentMatchDTO = {
  teamA: string;
  teamB: string;
  scheduledDate: string | Date;
  scheduledTime?: string;
  round: string;
  matchNumber: number;
};
