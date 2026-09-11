import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js"

dotenv.config();

// Establish a connection with MongoDB
connectDB();

const app = express();

// express.json() parses incoming JSON request bodies and makes the data available in req.body.
app.use(express.json());

// CORS allows the frontend and backend to communicate when they run on different origins.
app.use(cors());

// Mount all user-related routes under the /api/users path.
app.use("/api/users", userRoutes);
// app.use() Express application mein middleware ya router ko register/mount karne ke liye use hota hai.

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("ShopSphere API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});