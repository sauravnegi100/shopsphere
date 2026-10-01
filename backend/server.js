import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start the server only after the database connection succeeds.
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ShopSphere server is running on port ${PORT}`);
  });
};

startServer();