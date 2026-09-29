import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Create a new order from the current user's cart.
const createOrder = async (req, res, next) => {
  try {
    // Get the shipping address sent by the client.
    const { shippingAddress } = req.body;

    // Make sure shipping address was provided.
    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    // Find the cart belonging to the logged-in user.
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    // Stop if the user does not have a cart or the cart is empty.
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Get all product IDs from the cart.
    const productIds = cart.items.map((item) => item.product);

    // Fetch the current products from the database.
    const products = await Product.find({
      _id: { $in: productIds },
    });

    // Store order items with the product price at the time of purchase.
    const orderItems = [];

    // Calculate the total amount of the order.
    let totalAmount = 0;

    // Validate every cart item before creating the order.
    for (const cartItem of cart.items) {
      // Find the corresponding product from the database.
      const product = products.find(
        (item) => item._id.toString() === cartItem.product.toString(),
      );

      // Stop if a product from the cart no longer exists.
      if (!product) {
        return res.status(404).json({
          message: "One or more products in the cart no longer exist",
        });
      }

      // Stop if the product has been deactivated.
      if (!product.isActive) {
        return res.status(400).json({
          message: `${product.name} is no longer available`,
        });
      }

      // Make sure enough stock is available.
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Calculate the total price for this cart item.
      const itemTotal = product.price * cartItem.quantity;

      // Add the item total to the order total.
      totalAmount += itemTotal;

      // Store the product, quantity, and current price in the order.
      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    // Create the order using the validated cart information.
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    // Save the order to MongoDB.
    const savedOrder = await order.save();

    // Clear the user's cart after the order has been created.
    cart.items = [];

    // Save the updated empty cart.
    await cart.save();

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
    // Find all orders created by the logged-in user.
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
    // Get the order ID from the URL parameter.
    const { id } = req.params;

    // Find the order by ID and make sure it belongs to the logged-in user.
    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).populate("items.product");

    // Stop if the order does not exist or does not belong to the user.
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
    // Get the order ID from the URL parameter.
    const { id } = req.params;

    // Find the order and make sure it belongs to the logged-in user.
    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    // Stop if the order does not exist.
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only allow cancellation before the order has been shipped.
    if (!["placed", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Update the order status to cancelled.
    order.orderStatus = "cancelled";

    // Save the updated order.
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
    // Find all orders and include basic information about the user who placed each order.
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
    // Get the order ID from the URL parameter.
    const { id } = req.params;

    // Get the new status from the request body.
    const { orderStatus } = req.body;

    // Define the valid status transitions for an order.
    const allowedTransitions = {
      placed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    // Find the order by its ID.
    const order = await Order.findById(id);

    // Stop if the order does not exist.
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Get the statuses allowed from the order's current status.
    const allowedNextStatuses = allowedTransitions[order.orderStatus];

    // Stop if the requested status transition is not allowed.
    if (!allowedNextStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be changed from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // Update the order status.
    order.orderStatus = orderStatus;

    // Save the updated order.
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
