import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("Context is to be used within context provider");

  return context;
};

export default useAuth;
