import api from "./api.js";

const createOrder = async (shippingAddress) => {
  const response = await api.post("/orders", { shippingAddress });
  return response.data;
};

const getMyOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export { createOrder, getMyOrders, getOrderById };
