export interface CreateTeamDTO {
  name: string;
  description?: string;
  manager: string;
  captain: string;
  game: string;
  maxMembers: number;
}

export interface EditTeamDTO {
  name?: string;
  description?: string;
  slug?: string;
  maxMembers: number;
}
