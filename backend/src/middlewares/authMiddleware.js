import jwt from "jsonwebtoken";

// Verify the JWT sent by the client before allowing access to protected routes.
const protect = (req, res, next) => {
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

    // Store the decoded user information on the custom request object.
    req.user = decoded;
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
