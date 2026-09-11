import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Connect to MongoDB using the connection string stored in environment variables
    console.log("MongoDB connected successfully");
  } catch(error) {
    console.error("MongoDB connection failed : ", error.message);
    process.exit(1);
    // Exit the Node.js process with an error status code
    // Exit the process because an error occurred
  }
};

export default connectDB;
