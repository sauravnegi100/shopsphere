import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Add a product to the current user's cart.
const addToCart = async (req, res, next) => {
  try {
    // Get product ID and quantity from the request body.
    const { productId, quantity = 1 } = req.body;

    // Find the product in the database.
    const product = await Product.findById(productId);

    // Stop if the product does not exist.
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Stop if the product is inactive.
    if (!product.isActive) {
      return res.status(400).json({
        message: "Product is not available",
      });
    }

    // Make sure the requested quantity is valid.
    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Make sure enough stock is available.
    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    // Find the current user's cart.
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    // Create a cart if the user does not have one yet.
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity,
          },
        ],
      });
    } else {
      // Check whether the product is already in the cart.
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId,
      );

      if (existingItem) {
        // Calculate the new total quantity.
        const newQuantity = existingItem.quantity + quantity;

        // Make sure the new total does not exceed stock.
        if (newQuantity > product.stock) {
          return res.status(400).json({
            message: "Insufficient stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        // Add the product as a new cart item.
        cart.items.push({
          product: productId,
          quantity,
        });
      }
    }

    // Save the cart to MongoDB.
    const savedCart = await cart.save();

    // Return the updated cart.
    return res.status(200).json({
      message: "Product added to cart successfully",
      cart: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

// Get the current user's cart.
const getCart = async (req, res, next) => {
  try {
    // Find the cart belonging to the logged-in user.
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    // Return an empty cart if the user does not have one yet.
    if (!cart) {
      return res.status(200).json({
        cart: {
          user: req.user._id,
          items: [],
        },
      });
    }

    return res.status(200).json({
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// Update the quantity of a product already present in the current user's cart.
const updateCartItem = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { productId } = req.params;

    // Get the new quantity from the request body.
    const { quantity } = req.body;

    // Make sure a valid quantity was provided.
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
      });
    }

    // Find the product to verify that it exists and to check its stock.
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Stop if the product is inactive.
    if (!product.isActive) {
      return res.status(400).json({
        message: "Product is not available",
      });
    }

    // Make sure the requested quantity does not exceed available stock.
    if (quantity > product.stock) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    // Find the current user's cart.
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    // Stop if the user does not have a cart.
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Find the product inside the cart.
    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    // Stop if the product is not currently in the cart.
    if (!cartItem) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    // Update the cart item's quantity.
    cartItem.quantity = quantity;

    // Save the updated cart.
    const savedCart = await cart.save();

    return res.status(200).json({
      message: "Cart item updated successfully",
      cart: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

// Remove a product from the current user's cart.
const removeCartItem = async (req, res, next) => {
  try {
    // Get the product ID from the URL parameter.
    const { productId } = req.params;

    // Find the current user's cart.
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    // Stop if the user does not have a cart.
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Check whether the product exists in the cart.
    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId,
    );

    // Stop if the product is not in the cart.
    if (!itemExists) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    // Remove the product from the cart.
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    // Save the updated cart.
    const savedCart = await cart.save();

    return res.status(200).json({
      message: "Product removed from cart successfully",
      cart: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

// Remove all products from the current user's cart.
const clearCart = async (req, res, next) => {
  try {
    // Find the current user's cart.
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    // Stop if the user does not have a cart.
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Remove all items from the cart.
    cart.items = [];

    // Save the updated cart.
    const savedCart = await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart: savedCart,
    });
  } catch (error) {
    next(error);
  }
};

export { addToCart, getCart, updateCartItem, removeCartItem, clearCart };
