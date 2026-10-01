import {
  createRazorpayOrder,
  verifyPayment,
} from "../../services/paymentService.js";

const RazorpayButton = ({ orderId }) => {
  const handlePayment = async () => {
    try {
      // Ask the backend to create a Razorpay order for our ShopSphere order.
      const razorpayOrder = await createRazorpayOrder(orderId);

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopSphere",
        description: "ShopSphere Order Payment",
        order_id: razorpayOrder.razorpayOrderId,

        // Razorpay calls this function after the checkout payment succeeds.
        handler: async (response) => {
          try {
            const verificationResult = await verifyPayment(
              orderId,
              response,
            );

            console.log(verificationResult);
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error.response?.data || error.message,
            );
          }
        },

        // Prefill some customer information in the Razorpay checkout.
        prefill: {
          name: "ShopSphere Customer",
        },

        theme: {
          color: "#3399cc",
        },
      };

      // Create a Razorpay Checkout instance.
      const razorpay = new window.Razorpay(options);

      // Open the Razorpay payment window.
      razorpay.open();
    } catch (error) {
      console.error(
        "Payment initialization failed:",
        error.response?.data || error.message,
      );
    }
  };

  return (
    <button type="button" onClick={handlePayment}>
      Pay Now
    </button>
  );
};

export default RazorpayButton;
