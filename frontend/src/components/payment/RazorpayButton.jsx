import { useState } from "react";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../../services/paymentService.js";

const RazorpayButton = ({ orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handlePayment = async () => {
    if (!orderId || loading) return;

    setLoading(true);
    setStatus("");

    try {
      // Ask the backend to create a Razorpay order.
      const razorpayOrder = await createRazorpayOrder(orderId);

      // Check whether the Razorpay Checkout script is available.
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please refresh the page.",
        );
      }

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopSphere",
        description: "ShopSphere Order Payment",
        order_id: razorpayOrder.razorpayOrderId,

        // Called when the customer completes the checkout payment.
        handler: async (response) => {
          setStatus("Verifying payment...");

          try {
            const result = await verifyPayment(orderId, response);

            setStatus("Payment successful! Your order is confirmed.");

            // Notify the parent component, if it provided a callback.
            onSuccess?.(result);
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error.response?.data || error.message,
            );

            setStatus(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support if money was deducted.",
            );
          } finally {
            setLoading(false);
          }
        },

        // Prefill customer information in Razorpay Checkout.
        prefill: {
          name: "ShopSphere Customer",
        },

        theme: {
          color: "#4f46e5",
        },

        // Called if the customer closes the checkout window.
        modal: {
          ondismiss: () => {
            setStatus("Payment window closed.");
            setLoading(false);
          },
        },
      };

      // Create and open Razorpay Checkout.
      const razorpay = new window.Razorpay(options);

      // Show errors returned by Razorpay Checkout.
      razorpay.on("payment.failed", (response) => {
        console.error(
          "Payment failed:",
          response.error?.description || response.error?.reason,
        );

        setStatus(
          response.error?.description || "Payment failed. Please try again.",
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment initialization failed:",
        error.response?.data || error.message,
      );

      setStatus(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || !orderId}
        className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {status && (
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {status}
        </p>
      )}
    </div>
  );
};

export default RazorpayButton;
