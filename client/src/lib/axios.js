import axios from "axios";


export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3001/api"
      : "https://chat-application-lp94.vercel.app/api",
  withCredentials: true,
});
