import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    return origin.replace(/:8081(?=\/|$)/, ":5000").replace(/-8081\./, "-5000.");
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
