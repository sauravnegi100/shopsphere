import api from "./api.js";

const getAllOrders = async () => {
  const response = await api.get("/orders/admin");
  return response.data;
};

const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/admin/${orderId}/status`, {
    status,
  });

  return response.data;
};

export { getAllOrders, updateOrderStatus };
