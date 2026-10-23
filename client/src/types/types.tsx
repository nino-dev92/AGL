export interface Tournament {
  id: string;
  name: string;
  slug: string;
  description: string | undefined;
  game: any;
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
