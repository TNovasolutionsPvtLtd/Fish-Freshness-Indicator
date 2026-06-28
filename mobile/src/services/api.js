import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Point this at your backend. When testing on a physical device with Expo Go,
// use your computer's LAN IP (e.g. http://192.168.1.20:5000), not localhost.

export const API_BASE_URL = "https://glowing-couscous-9669vjjv97qxh77jx-5000.app.github.dev";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
