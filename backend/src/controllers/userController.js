import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Handle the logic for registering a new user.
const registerUser = async (req, res) => {
  try {
    // Get the user data sent by the client in the request body.
    const { name, email, password } = req.body || {};

    // Check whether all required registration fields are provided.
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Validate the password format before hashing it.
    // Regex stands for Regular Expression. It is a pattern used to search, match, or validate text according to specific rules.
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      });
    }

    // Check whether a user with the same email already exists.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash the user's password before storing it in the database.
    const hashedPassword = await bcrypt.hash(password, 10);
    // The second argument (10) is the salt rounds/cost factor.
    // A higher number increases the computational work required to generate the hash.

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    // new User({...}) → Creates a new Mongoose User document using the structure and rules defined in the `User` model.

    // Save the new User document to MongoDB.
    await user.save();
    // Mongoose sends it to MongoDB → User stored in `users` collection.

    // Send a success response after the user is successfully saved.
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error : ", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Handle the logic for Logging in a user.
const loginUser = async (req, res) => {
  try {
    // Get the login credentials sent by the client.
    const { email, password } = req.body || {};

    // Check whether both email and password are provided.
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find the user associated with the provided email.
    const user = await User.findOne({ email });

    // Stop the login process if no user exists with the provided email.
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare the password provided by the user with the hashed password stored in the database.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Stop the login process if the provided password is incorrect.
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Stop the login process if the user's account is inactive.
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }
    // Generate a JWT containing the user's ID. --> jwt.sign(payload, secret, options)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send a successful login response along with the JWT token.
    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error : ", error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Return the profile of the currently authenticated user.
const getProfile = (req, res) => {
  // Send the authenticated user's profile stored by the protect middleware.
  return res.status(200).json({
    user: req.user,
  });
};

// Return a response for an authenticated admin user.
const getAdminData = async (req, res) => {
  // Send a response after the admin authorization check succeeds.
  return res.status(200).json({
    message: "Welcome Admin",
  });
};

export { registerUser, loginUser, getProfile, getAdminData };

// Error Handling in Registration :
// 400 Bad Request → Used when the client sends invalid or incomplete data.
// 500 Internal Server Error → Used when an unexpected server-side error occurs.
