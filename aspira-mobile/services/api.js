  import axios from "axios";
  import AsyncStorage from "@react-native-async-storage/async-storage";

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

