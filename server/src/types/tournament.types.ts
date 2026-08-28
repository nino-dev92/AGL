export type Status =
  | "upcoming"
  | "registration-open"
  | "registration-closed"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface TournamentDTO {
  name: string;
  description?: string;
  game: string;
  maxTeams: number;
  registeredTeams: string[];
  startDate: Date;
  endDate: Date;
  rules: string[];
}

export interface UpdateTournamentDTO {
  name?: string;
  description?: string;
  game?: string;
  slug?: string;
  maxTeams?: number;
  registeredTeams?: string[];
  startDate?: Date;
  endDate?: Date;
  rules?: string[];
}
