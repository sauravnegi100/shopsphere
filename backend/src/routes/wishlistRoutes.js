import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add a product to the logged-in user's wishlist.
router.post("/", protect, addToWishlist);

// Get the wishlist of the logged-in user.
router.get("/", protect, getWishlist);

// Remove a product from the logged-in user's wishlist.
router.delete("/:productId", protect, removeFromWishlist);

export default router;
