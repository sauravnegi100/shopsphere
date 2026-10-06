import api from "./api.js";

// Fetch the logged-in user's wishlist.
const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

// Add a product to the logged-in user's wishlist.
const addToWishlist = async (productId) => {
  const response = await api.post("/wishlist", {
    productId,
  });

  return response.data;
};

// Remove a product from the logged-in user's wishlist.
const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export { getWishlist, addToWishlist, removeFromWishlist };
