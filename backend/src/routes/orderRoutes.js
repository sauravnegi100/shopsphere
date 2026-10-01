import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create a new order from the logged-in user's cart.
router.post("/", protect, createOrder);

// Get all orders for the admin.
router.get("/admin", protect, admin, getAllOrders);

// Update an order status for the admin.
router.patch(
  "/admin/:id/status",
  protect,
  admin,
  validateObjectId,
  updateOrderStatus,
);

// Create a Razorpay payment order for an existing ShopSphere order.
router.post("/:id/payment", protect, validateObjectId, createRazorpayOrder);

// Verify the Razorpay payment signature and mark the order as paid.
router.post("/:id/payment/verify", protect, validateObjectId, verifyPayment);

// Get all orders belonging to the logged-in user.
router.get("/", protect, getMyOrders);

// Get a single order belonging to the logged-in user.
router.get("/:id", protect, validateObjectId, getOrderById);

// Cancel an order belonging to the logged-in user.
router.patch("/:id/cancel", protect, validateObjectId, cancelOrder);

export default router;
