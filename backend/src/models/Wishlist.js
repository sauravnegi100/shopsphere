import mongoose from "mongoose";

// Define the structure and validation rules for wishlist documents.
const wishlistSchema = new mongoose.Schema(
  {
    // Each wishlist belongs to one user.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Store references to the products saved in the wishlist.
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
