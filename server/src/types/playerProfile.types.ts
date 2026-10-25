export interface UpdateProfileDTO {
  bio?: string;
  region?: string;
  game?: string;
  playerRole?: string;
}

export interface PublicPlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avatar?: {
    url: string;
    //publicId: string;
  };
  bio?: string;
  region?: string;
  game?: string;
  createdAt: Date;
}
