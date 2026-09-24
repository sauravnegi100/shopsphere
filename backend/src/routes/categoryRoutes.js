import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Create a new category.
// Only authenticated admin users can create categories.
router.post("/", protect, admin, createCategory);

// Get all active categories.
// Anyone can view active categories.
router.get("/", getCategories);

// Get a category by its ID.
// Anyone can view a category.
router.get("/:id", getCategoryById);

// Update a category by its ID.
// Only authenticated admin users can update categories.
router.put("/:id", protect, admin, updateCategory);
export default router;
