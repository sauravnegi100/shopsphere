import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Create a new order from the current user's cart.
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body || {};

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const productIds = cart.items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = products.find(
        (item) => item._id.toString() === cartItem.product.toString(),
      );

      if (!product) {
        return res.status(404).json({
          message: "One or more products in the cart no longer exist",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: `${product.name} is no longer available`,
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemTotal = product.price * cartItem.quantity;

      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get all the orders belonging to the logged-in user.
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single order belonging to the logged-in user.
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an order belonging to the logged-in user.
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // A paid order requires a proper refund workflow before cancellation.
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message:
          "Paid orders cannot be cancelled until a refund workflow is available",
      });
    }

    // Only allow cancellation before the order has been shipped.
    if (!["placed", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.orderStatus = "cancelled";

    const savedOrder = await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: savedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for the admin.
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Update the status of an order for the admin.
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body || {};

    const allowedTransitions = {
      placed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const allowedNextStatuses = allowedTransitions[order.orderStatus];

    // Reject invalid or unsupported status transitions.
    if (
      !allowedNextStatuses ||
      typeof orderStatus !== "string" ||
      !allowedNextStatuses.includes(orderStatus)
    ) {
      return res.status(400).json({
        message: `Order cannot be changed from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // Only paid orders can proceed through fulfillment.
    if (orderStatus !== "cancelled" && order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Payment must be completed before order fulfillment",
      });
    }

    // Do not cancel a paid order without refund handling.
    if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
      return res.status(400).json({
        message:
          "Paid orders cannot be cancelled until a refund workflow is available",
      });
    }

    order.orderStatus = orderStatus;

    const updatedOrder = await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
