import axios from "axios";

const apiConfig = {
  baseURL: "https://agl-846o.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

const apiAxios = axios.create(apiConfig);
export const apiAxiosPrivate = axios.create(apiConfig);

export default apiAxios;
