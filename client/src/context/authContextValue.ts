import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type Auth = {
  id: string;
  username: string;
  role: string;
  accessToken: string;
};

type AuthContextValue = {
  auth: Auth | null;
  setAuth: Dispatch<SetStateAction<Auth | null>>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
