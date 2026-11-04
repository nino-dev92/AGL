import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ManagerRoute() {
  const { auth } = useAuth();
  const location = useLocation();

  return auth?.role === "manager" ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}
