import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import razorpay from "../config/razorpay.js";

// Create a Razorpay payment order for an existing ShopSphere order.
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the order belonging to the currently logged-in user.
    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // A paid order should not create another Razorpay payment order.
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid",
      });
    }

    // Razorpay expects the amount in the smallest currency unit.
    // For INR, 1 rupee = 100 paise.
    const amountInPaise = Math.round(order.totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order._id.toString(),
    });

    // Save Razorpay's order ID so both orders can be linked.
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      message: "Razorpay order created successfully",
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// Verify the Razorpay payment signature and complete the order payment.
const verifyPayment = async (req, res, next) => {
  let session;

  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Find the ShopSphere order belonging to the currently logged-in user.
    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Stop if this order has not been linked to a Razorpay order yet.
    if (!order.razorpayOrderId) {
      return res.status(400).json({
        message: "Razorpay order not found",
      });
    }

    // Stop duplicate payment verification for an already-paid order.
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid",
      });
    }

    // Make sure the Razorpay order belongs to this ShopSphere order.
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        message: "Invalid Razorpay order",
      });
    }

    // Generate the expected signature using Razorpay's verification format.
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Reject the payment if the received signature does not match our generated signature.
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // Start a MongoDB session for the payment completion transaction.
    session = await mongoose.startSession();
    session.startTransaction();

    // Get the latest product information before reducing stock.
    const productIds = order.items.map((item) => item.product);

    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session);

    // Check every ordered product before changing any stock.
    for (const item of order.items) {
      const product = products.find(
        (product) => product._id.toString() === item.product.toString(),
      );

      if (!product) {
        throw new Error("Product not found");
      }

      if (!product.isActive) {
        throw new Error(`${product.name} is no longer available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }

    // Reduce stock only after all products pass the stock checks.
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity } },
        { session },
      );
    }

    // Mark the ShopSphere order as paid.
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save({ session });

    // Find the user's cart inside the same transaction.
    const cart = await Cart.findOne({
      user: req.user._id,
    }).session(session);

    if (cart) {
      const orderedProductIds = order.items.map((item) =>
        item.product.toString(),
      );

      // Remove only the products that were part of this order.
      cart.items = cart.items.filter(
        (item) => !orderedProductIds.includes(item.product.toString()),
      );

      await cart.save({ session });
    }

    // Make all transaction changes permanent.
    await session.commitTransaction();

    return res.status(200).json({
      message: "Payment verified successfully",
      orderId: order._id,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    // Undo all database changes if any transaction step fails.
    if (session) {
      await session.abortTransaction();
    }

    next(error);
  } finally {
    // Always release the MongoDB session after the transaction finishes.
    if (session) {
      session.endSession();
    }
  }
};

export { createRazorpayOrder, verifyPayment };
