import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3001/api"
      : "https://server-production-9fee.up.railway.app/api",
  withCredentials: true,
});
