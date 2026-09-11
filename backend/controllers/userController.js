import bcrypt from "bcryptjs";
import User from "../models/User.js";

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

export { registerUser };

// Error Handling in Registration :
// 400 Bad Request → Used when the client sends invalid or incomplete data.
// 500 Internal Server Error → Used when an unexpected server-side error occurs.
