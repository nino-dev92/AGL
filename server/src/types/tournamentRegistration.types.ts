export type TournamentRegistrationDTO = {
  tournament: string;
  team: string;
};

export type ReviewTournamentRegistrationDTO = {
  status: "approved" | "rejected";
  rejectionReason?: string;
};
