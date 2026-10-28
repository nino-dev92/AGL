import axios from "axios";

const apiAxios = axios.create({
  baseURL: "https://agl-846o.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default apiAxios;
