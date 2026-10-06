import api from "./api.js";

// Fetch all active categories.
const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export { getCategories };
