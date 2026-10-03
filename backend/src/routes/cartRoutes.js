import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add a product to the current user's cart.
router.post("/", protect, addToCart);

// Get an existing user's cart.
router.get("/", protect, getCart);

// Update cart items.
router.put("/:productId", protect, updateCartItem);

// Clear all items from the current user's cart.
router.delete("/clear", protect, clearCart);

// Remove a specific product from the current user's cart.
router.delete("/:productId", protect, removeCartItem);

export default router;
