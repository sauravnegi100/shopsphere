import api from "./api.js";

// Fetch products from the backend with optional query parameters.
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

// Fetch a single product by its ID.
export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data.product;
};
