import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// express.json() parses incoming JSON request bodies and makes the data available in req.body.
app.use(express.json());

// CORS allows the frontend and backend to communicate when they run on different origins.
app.use(cors());

// Mount all user-related routes under the /api/users path.
app.use("/api/users", userRoutes);
// app.use() Express application mein middleware ya router ko register/mount karne ke liye use hota hai.

app.get("/", (req, res) => {
  res.send("ShopSphere API is running");
});

export default app;
