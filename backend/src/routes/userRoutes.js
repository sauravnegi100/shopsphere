import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAdminData,
} from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";
import admin from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Route for registering a new user:
router.post("/register", registerUser);

// Route for logging in an existing user:
router.post("/login", loginUser);

// Get the profile of the authenticated user.
router.get("/profile", protect, getProfile);
// router.get(
//     "/profile",      ← URL path
//     protect,         ← middleware
//     getProfile       ← controller
// );

// Allow access only to authenticated admin users.
router.get("/admin", protect, admin, getAdminData);
export default router;

// express.Router() → ek separate router object banata hai jisme related routes define kar sakte hain.
// express.Router() is used to create modular and maintainable routes. It helps us separate routes based on features or resources, such as users, products, and orders, instead of defining everything directly in the main Express application.
// router.post("/register", registerUser) → jab POST /register request aayegi, registerUser controller execute hoga.
