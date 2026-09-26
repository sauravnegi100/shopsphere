import mongoose from "mongoose";

// Validate whether the URL parameter is a valid MongoDB ObjectId.
const validateObjectId = (req, res, next) => {
  // Get the ID from the URL parameter.
  const { id } = req.params;

  // Check whether the ID is a valid MongoDB ObjectId.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid ID",
    });
  }

  // Continue to the next middleware or controller.
  next();
};

export default validateObjectId;