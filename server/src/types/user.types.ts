export type UserDTO = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role: string;
};

export interface LoginDTO {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  role: "player" | "admin" | "manager";
}

export interface Avatar {
  url: string;
  publicId: string;
}

export interface PlayerProfile {
  bio?: string;
  country?: string;
  game?: string;
  playerRole?: string;
}
