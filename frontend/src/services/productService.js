import api from "./api.js";

// Fetch products from the backend with optional query parameters.
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};
