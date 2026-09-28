import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// Add a product to the current user's wishlist.
const addToWishlist = async (req, res, next) => {
  try {
    // Get the product ID sent by the client.
    const { productId } = req.body;

    // Make sure a product ID was provided.
    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    // Find the product to make sure it exists.
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Find the wishlist belonging to the logged-in user.
    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    // Create a wishlist if the user does not have one yet.
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        products: [productId],
      });
    } else {
      // Check whether the product is already in the wishlist.
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId,
      );

      // Stop duplicate products from being added.
      if (alreadyExists) {
        return res.status(400).json({
          message: "Product already exists in wishlist",
        });
      }

      // Add the product reference to the wishlist.
      wishlist.products.push(productId);
    }

    // Save the wishlist to MongoDB.
    const savedWishlist = await wishlist.save();

    return res.status(201).json({
      message: "Product added to wishlist successfully",
      wishlist: savedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Get the current user's wishlist.
const getWishlist = async (req, res, next) => {
  try {
    // Find the wishlist belonging to the logged-in user.
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("products");

    // Return an empty wishlist if the user does not have one yet.
    if (!wishlist) {
      return res.status(200).json({
        wishlist: {
          user: req.user._id,
          products: [],
        },
      });
    }

    return res.status(200).json({
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// Remove a product from the current user's wishlist.
const removeFromWishlist = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { productId } = req.params;

    // Find the wishlist belonging to the logged-in user.
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    // Stop if the user does not have a wishlist.
    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    // Check whether the product exists in the wishlist.
    const itemExists = wishlist.products.some(
      (id) => id.toString() === productId,
    );

    // Stop if the product is not in the wishlist.
    if (!itemExists) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    // Remove the product from the wishlist.
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId,
    );

    // Save the updated wishlist.
    const savedWishlist = await wishlist.save();

    return res.status(200).json({
      message: "Product removed from wishlist successfully",
      wishlist: savedWishlist,
    });
  } catch (error) {
    next(error);
  }
};

export { addToWishlist, getWishlist, removeFromWishlist};
