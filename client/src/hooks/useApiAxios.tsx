import { useEffect, useRef } from "react";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";
import { apiAxiosPrivate } from "../api/apiAxios";

type RetryRequestConfig = InternalAxiosRequestConfig & { sent?: boolean };

function useAxiosPrivate() {
  const { auth, setAuth } = useAuth();
  const refresh = useRefreshToken();
  const authRef = useRef(auth);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    const requestIntercept = apiAxiosPrivate.interceptors.request.use(
      (config) => {
        const accessToken = authRef.current?.accessToken;
        if (accessToken) {
          config.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return config;
      },
      (error: unknown) => Promise.reject(error),
    );

    const responseIntercept = apiAxiosPrivate.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const prevRequest = error.config as RetryRequestConfig | undefined;
        if (
          error.response?.status !== 401 ||
          !prevRequest ||
          prevRequest.sent
        ) {
          return Promise.reject(error);
        }

        prevRequest.sent = true;
        try {
          const accessToken = await refresh();
          prevRequest.headers.set("Authorization", `Bearer ${accessToken}`);
          return await apiAxiosPrivate(prevRequest);
        } catch (refreshError) {
          setAuth(null);
          return Promise.reject(refreshError);
        }
      },
    );

    return () => {
      apiAxiosPrivate.interceptors.request.eject(requestIntercept);
      apiAxiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [refresh, setAuth]);

  return apiAxiosPrivate;
}

export default useAxiosPrivate;
