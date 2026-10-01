import api from "./api.js";

// Register a new ShopSphere user.
const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

// Log in an existing ShopSphere user.
const loginUser = async (credentials) => {
  const response = await api.post("/users/login", credentials);
  return response.data;
};

export { registerUser, loginUser };
