import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./src/app.js"

dotenv.config();

// Establish a connection with MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
