
import api from "./api.js";

// Create a Razorpay order for an existing ShopSphere order.
const createRazorpayOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/payment`, {});

  return response.data;
};

// Verify the Razorpay payment on the ShopSphere backend.
const verifyPayment = async (orderId, paymentData) => {
  const response = await api.post(
    `/orders/${orderId}/payment/verify`,
    paymentData,
  );

  return response.data;
};

export { createRazorpayOrder, verifyPayment };
