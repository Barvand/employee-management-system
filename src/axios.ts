import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "database-migration-i4zk68kb1-barvands-projects.vercel.app/api",
  withCredentials: true,
});
