// An error-handling middleware is a middleware function with four parameters: error, req, res, and next.
// Central error-handling middleware for the application.
const errorMiddleware = (error, req, res, next) => {
  console.error("Error: ", error.message);

  // Handle invalid MongoDB ObjectId errors.
  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  // Handle Mongoose schema validation errors.
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.message,
    });
  }

  // Handle MongoDB duplicate key errors.
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Duplicate value already exists",
    });
  }

  // Handle all unexpected errors.
  return res.status(500).json({
    message: "Server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

export default errorMiddleware;
