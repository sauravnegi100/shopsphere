import mongoose from "mongoose";

// Define the structure and validation rules for each item inside an order.
const orderItemSchema = new mongoose.Schema(
  {
    // Reference to the product that was purchased.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Number of units of this product purchased.
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Product price at the time the order was placed.
    // This keeps a permanent price snapshot for the order.
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

// Define the structure and validation rules for Order documents.
const orderSchema = new mongoose.Schema(
  {
    // Reference to the user who placed the order.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Products purchased in this order.
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // Final total amount of the order.
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Shipping information for this order.
    shippingAddress: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Track the payment state of the order.
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    // Track the current delivery/order state.
    orderStatus: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
