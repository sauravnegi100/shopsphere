import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Create a new product.
// Only authenticated admin users can create products.
router.post("/", protect, admin, upload.array("images", 5), createProduct);

// Get all products.
// Anyone can view products.
router.get("/", getProducts);

// Get a single product by its ID.
// :id is called Route parameter: A dynamic value included in the URL that identifies a specific resource.In express we get route parameter's value from req.params.id.
router.get("/:id", validateObjectId, getProductById);

// Update a product by its ID.
// Only authenticated admin users can update products.
router.put(
  "/:id",
  protect,
  admin,
  validateObjectId,
  upload.array("images", 5),
  updateProduct,
);

// Delete a product by its ID.
// Only authenticated admin users can delete products.
router.delete("/:id", protect, admin, validateObjectId, deleteProduct);

export default router;

// protect: check karega ki user logged in hai.
// admin: check karega ki user admin hai.
// validateObjectId: URL mein product ID valid hai ya nahi, check karega.
// upload.array("images", 5): request se maximum 5 image files receive karega, jinka form-data key images hona chahiye.
