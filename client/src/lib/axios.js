import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3001/api"
      : "https://chat-application-production-fcae.up.railway.app/api",
  withCredentials: true,
});
