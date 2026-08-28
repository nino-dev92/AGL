export type MatchDTO = {
  tournament: string;
  teamA: string;
  teamB: string;
  round: string;
  scheduledDate: Date;
};

export type UpdateMatchDTO = {
  tournament?: string;
  teamA?: string;
  teamB?: string;
  round?: string;
  scheduledDate?: Date;
  score?: string;
  winner?: string;
};
