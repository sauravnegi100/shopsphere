import api from "./api.js";

const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

const addToCart = async (productId, quantity = 1) => {
  const response = await api.post("/cart", {
    productId,
    quantity,
  });

  return response.data;
};

const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`/cart/${productId}`, {
    quantity,
  });

  return response.data;
};

const removeCartItem = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  return response.data;
};

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
