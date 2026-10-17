import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Register a new ShopSphere user.
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({
        message: "Name and email cannot be empty",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Log in an existing ShopSphere user.
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get the authenticated user's profile.
const getProfile = (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};

// Update the authenticated user's name and email.
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body || {};

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        message: "Provide a name or email to update",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      req.user.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          message: "Email cannot be empty",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "This email is already in use",
        });
      }

      req.user.email = normalizedEmail;
    }

    const updatedUser = await req.user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already in use",
      });
    }

    console.error("Profile update error:", error.message);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

// Return a response for an authenticated admin user.
const getAdminData = async (req, res) => {
  return res.status(200).json({
    message: "Welcome Admin",
  });
};

export { registerUser, loginUser, getProfile, updateProfile, getAdminData };

// Error Handling in Registration :
// 400 Bad Request → Used when the client sends invalid or incomplete data.
// 500 Internal Server Error → Used when an unexpected server-side error occurs.
