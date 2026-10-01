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

    // Cancelled orders should not start a new payment.
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be paid",
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

    // Check that all required payment details are provided.
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment verification details",
      });
    }

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

    // Cancelled orders should not be marked as paid.
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be paid",
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

    // Convert both signatures into buffers for secure comparison.
    const expectedBuffer = Buffer.from(generatedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    // Reject the payment if the signature does not match.
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // Fetch the payment details directly from Razorpay.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Confirm that the payment belongs to this Razorpay order
    // and that its amount, currency, and status are correct.
    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        message: "Payment is not captured or payment details are invalid",
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

    // Reduce stock only if enough stock is still available.
    for (const item of order.items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
          isActive: true,
        },
        {
          $inc: { stock: -item.quantity },
        },
        { session },
      );

      // Stop if the product is unavailable or stock has changed.
      if (result.matchedCount !== 1) {
        throw new Error("Product is unavailable or has insufficient stock");
      }
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
    // Undo database changes only if the transaction is still active.
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    next(error);
  } finally {
    // Always release the MongoDB session after the transaction finishes.
    if (session) {
      await session.endSession();
    }
  }
};

export { createRazorpayOrder, verifyPayment };
