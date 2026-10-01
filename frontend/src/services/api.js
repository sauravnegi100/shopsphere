import axios from "axios";

// Create one reusable Axios instance for all ShopSphere API requests.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach the JWT to requests when a user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
