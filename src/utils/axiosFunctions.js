import { setAccessToken, logout } from "@/redux/slices/authslice";
import logoutService from "@/services/logoutService";
import { store } from "@/redux/store/store";
import Cookies from "js-cookie";
import {noAuthInstance} from "./axios";

const getExpiryTime = () => {
  const expiryTime = Cookies.get("expiryTime");
  return expiryTime ? parseInt(expiryTime, 10) : null;
};

const setExpiryTime = () => {
  const currentTime = new Date().getTime();
  const newExpiryTime = currentTime + 5 * 60 * 1000;
  Cookies.set("expiryTime", newExpiryTime, {path: "/", secure: true});
};

const hasTokenExpired = () => {
  const expiryTime = getExpiryTime();
  const currentTime = new Date().getTime();
  return !expiryTime || currentTime >= expiryTime;
};

const logoutUser = async () => {
  try {
    const response = await logoutService();
  } catch (error) {
    console.log("error while user logout api", error);
  }
  Cookies.remove("expiryTime", {path: "/"});
  store.dispatch(logout());
};

const refreshToken = async () => {
  console.log("entered in refresh token logic");
  try {
    const response = await noAuthInstance.post("accounts/api/token/refresh/");
    console.log("response refresh success", response.data);

    // Dispatch action to store new access token in Redux stor
    const newAccessToken = response.data.access;
    if (newAccessToken) {
      store.dispatch(setAccessToken({accessToken: newAccessToken}));
      console.log("new access token", newAccessToken);
    } else {
      console.log("refresh failed no access token");
    }
    // Set a new expiry time for the access token
    setExpiryTime();

    return newAccessToken;
  } catch (error) {
    console.log("Token refresh failed, logging out...,", error);
    await logoutUser();
    window.location.href = "/";
    return null;
  }
};

export {
  setExpiryTime,
  refreshToken,
  logoutUser,
  hasTokenExpired,
  getExpiryTime,
};
