import api from "./api.js";

// Fetch the logged-in user's profile.
const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update the logged-in user's profile.
const updateProfile = async (profileData) => {
  const response = await api.patch("/users/profile", profileData);
  return response.data;
};

export { getProfile, updateProfile };
