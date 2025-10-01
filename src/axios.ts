import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://database-migration-snowy.vercel.app/api",
  withCredentials: true,
});
