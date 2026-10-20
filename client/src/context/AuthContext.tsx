import { useState, createContext } from "react";

type AuthContextType = {
  auth: {
    id: String;
    username: string;
    role: string;
    accessToken: string;
  };
  setAuth: React.SetStateAction<any>;
};

export const AuthContext = createContext<AuthContextType | any>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState<AuthContextType | null>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
