import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify the JWT sent by the client before allowing access to protected routes.
const protect = async (req, res, next) => {
  try {
    // Get the Authorization header from the request.
    const authHeader = req.headers.authorization;

    // Stop the request if the Authorization header is missing.
    if (!authHeader) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // Extract the token from "Bearer <token>".
    const token = authHeader.split(" ")[1];

    // Stop the request if a token was not provided.
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    // Verify the token using the same secret used to generate it.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded → JWT verified user information

    // Find the current user using the ID stored in the verified JWT payload.
    const user = await User.findById(decoded.userId).select("-password");

    // Stop the request if the user no longer exists in the database.
    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    // Stop the request if the user's account has been deactivated.
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    // Store the current user's database information on the request object.
    req.user = user;
    // "user" is a custom property added to the Express request object to store the verified user information for use by the next middleware or controller.

    // Continue to the next middleware or route handler.
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

export default protect;
