// Check whether the authenticated user has admin permissions.
const admin = (req, res, next) => {
  // Stop the request if the authenticated user does not exist.
  if (!req.user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Stop the request if the authenticated user is not an admin.
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admins only",
    });
  }

  // Continue to the next middleware or controller.
  next();
};

export default admin;