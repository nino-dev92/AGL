import { useCallback } from "react";
import apiAxios from "../api/apiAxios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  return useCallback(async () => {
    const response = await apiAxios.get("/auth/refresh");

    const newAccessToken: string | undefined =
      response.data?.data?.accessToken;
    if (!newAccessToken) {
      throw new Error("Refresh response did not include an access token");
    }

    setAuth((prev) => {
      return prev ? { ...prev, accessToken: newAccessToken } : prev;
    });
    return newAccessToken;
  }, [setAuth]);
};

export default useRefreshToken;
