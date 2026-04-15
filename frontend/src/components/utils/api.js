import axios from "axios";

// ✅ Create instance - Use environment variable for backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const API = axios.create({
  baseURL: BACKEND_URL,
});

// ✅ Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Token expired / unauthorized
    if (error.response?.status === 401) {
      console.log("Session expired. Please login again.");

      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;