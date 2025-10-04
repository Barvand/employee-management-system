import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://api.bartholomeusberg.com/api",
  withCredentials: true,
});
