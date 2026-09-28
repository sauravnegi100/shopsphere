import mongoose from "mongoose";

// Define the structure of an individual cart item.
const cartItemSchema = new mongoose.Schema(
  {
    // Reference to the product added to the cart.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Number of units of this product in the cart.
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false,
  },
);

// Define the structure and validation rules for Cart documents.
const cartSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this cart.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Products currently present in the user's cart.
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
