import axios from "axios";
import { store } from "@/redux/store/store";
import {hasTokenExpired, refreshToken} from "./axiosFunctions";

const isLocalhost = window.location.hostname === "localhost";
const baseURL = isLocalhost
  ? "http://localhost:8000/"
  : "http://localhost:8000/";

// Axios instance for regular API calls
export const instance = axios.create({
  baseURL: baseURL,
  headers: {"Content-Type": "application/json"},
  withCredentials: true,
});

// Axios instance for refreshing tokens
export const noAuthInstance = axios.create({
  baseURL: baseURL,
  headers: {"Content-Type": "application/json"},
  withCredentials: true,
});

// Request interceptor to refresh token if needed before sending any request
instance.interceptors.request.use(
  async (config) => {
    console.log("Inside request interceptor");

    // Get access token and check if a user is logged in
    const state = store.getState();
    const isAuthenticated = state.userAuth.isAuthenticated;
    const accessToken = state.userAuth.accessToken; // 🔹 Fetch access token from Redux store

    console.log("User logged in:", isAuthenticated);

    if (!isAuthenticated || !accessToken) {
      console.log(
        "No user logged in or no access token available, skipping refresh logic."
      );
      return config; // Skip refresh logic if no user or token is missing
    }

    // Check if the access token is expired and refresh if needed
    if (hasTokenExpired()) {
      console.log("Access token expired, attempting to refresh...");
      const newAccessToken = await refreshToken();

      if (!newAccessToken) {
        console.error("Token refresh failed.");
        return Promise.reject("Token refresh failed");
      }

      config.headers["Authorization"] = `Bearer ${newAccessToken}`;
    } else {
      config.headers["Authorization"] = `Bearer ${accessToken}`; // ✅ Set the correct token
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
