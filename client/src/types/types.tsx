export type Tournament = {
  _id: string;
  name: string;
  slug: string;
  description: string | undefined;
  game: Game;
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
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  game?: Game;
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
  category?: string;
};

export type TeamMember = {
  _id?: string;
  userName: string;
  totalKills?: number;
  totalDeaths?: number;
  tourneysPlayed?: number;
  tourneysWon?: number;
  totalGames?: number;
};

export type Team = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  game: Game;
  manager: string;
  members: TeamMember[];
  maxMembers: number;
  logo?: {
    url: string;
    publicId: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Match = {
  _id: string;
  tournament: {
    _id: string;
    name: string;
    game: string;
  };
  teamA: {
    _id: string;
    name: string;
    logo: {
      url: string;
      publicId: string;
    };
  };
  teamB: {
    _id: string;
    name: string;
  };
  scheduledDate: Date;
  scheduledTime?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  round: number;
  matchNumber: number;
  createdAt: Date;
  updatedAt: Date;
  result: string;
  teamAScore: number;
  teamBScore: number;
  winner: {
    _id: string;
    name: string;
    logo: {
      url: string;
      publicId: string;
    };
  };
};

export type TournamentStanding = {
  team: {
    _id: string;
    name: string;
    slug: string;
    logo?: {
      url: string;
      publicId?: string;
    };
  };
  mp: number;
  mw: number;
  ml: number;
  points: number;
};

export type AnnounceMent = {
  _id: string;
  content: string;
  title: string;
  type: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    userName: string;
    role: string;
  };
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
