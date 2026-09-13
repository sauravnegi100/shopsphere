import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// Route for registering a new user:
router.post("/register", registerUser);

// Route for logging in an existing user:
router.post("/login", loginUser)

export default router;

// express.Router() → ek separate router object banata hai jisme related routes define kar sakte hain.
// express.Router() is used to create modular and maintainable routes. It helps us separate routes based on features or resources, such as users, products, and orders, instead of defining everything directly in the main Express application.
// router.post("/register", registerUser) → jab POST /register request aayegi, registerUser controller execute hoga.