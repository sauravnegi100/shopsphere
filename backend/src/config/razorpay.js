import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

// Create a reusable Razorpay client using the credentials stored in environment variables.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
