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

// Remove a cart item.
router.delete("/:productId", protect, removeCartItem);

// Clear cart.
router.delete("/", protect, clearCart);

export default router;
