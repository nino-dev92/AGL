export type GameSummary = {
  _id?: string;
  id?: string;
  name: string;
  category?: string;
};

export interface Tournament {
  _id: string;
  name: string;
  slug: string;
  description: string | undefined;
  game: GameSummary;
  organizer: string;
  banner?:
    | {
        url: string;
        publicId: string;
      }
    | undefined;
  registeredTeams: string[];
  maxTeams: number;
  startDate: Date;
  endDate: Date;
  status:
    | "upcoming"
    | "registration-open"
    | "registration-closed"
    | "ongoing"
    | "completed"
    | "cancelled";

  rules: string[];
  region: string;
  entryFee: number;
  prizePool: number;
  currency: string;
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  game?: GameSummary;
  bio?: string;
  region?: string;
  createdAt: Date;
  totalKills?: number;
  totalDeaths?: number;
  totalGames?: number;
  tourneysPlayed?: number;
  tourneysWon?: number;
};

export type Game = {
  _id: string;
  name: string;
  category: string;
};
