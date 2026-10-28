import { useEffect, useState } from "react";
import { AuthContext } from "./authContextValue";
import type { Auth } from "./authContextValue";

function getStoredAuth(): Auth | null {
  const storedAuth = localStorage.getItem("auth");
  if (!storedAuth) return null;

  try {
    const parsed: unknown = JSON.parse(storedAuth);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      typeof parsed.id === "string" &&
      "username" in parsed &&
      typeof parsed.username === "string" &&
      "role" in parsed &&
      typeof parsed.role === "string" &&
      "accessToken" in parsed &&
      typeof parsed.accessToken === "string"
    ) {
      return parsed as Auth;
    }
  } catch (error) {
    console.error("Could not read saved authentication state", error);
  }

  localStorage.removeItem("auth");
  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState<Auth | null>(getStoredAuth);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
