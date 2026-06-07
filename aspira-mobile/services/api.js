  import axios from "axios";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { router } from "expo-router";

  export const api = axios.create({
    baseURL: "http://localhost:5000/api", // ganti dengan IP komputer kamu
  });

  // Auto attach token di setiap request
  api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 Unauthorized
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        await AsyncStorage.multiRemove(["token", "user", "role"]);
        try {
          router.replace("/(auth)/login");
        } catch (e) {
          console.log("Error routing to login:", e);
        }
      }
      return Promise.reject(error);
    }
  );
