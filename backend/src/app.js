import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// express.json() parses incoming JSON request bodies and makes the data available in req.body.
app.use(express.json());

// CORS allows the frontend and backend to communicate when they run on different origins.
app.use(cors());

// Mount all user-related routes under the /api/users path.
app.use("/api/users", userRoutes);
// app.use() Express application mein middleware ya router ko register/mount karne ke liye use hota hai.

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

// Handle errors from routes and controllers.
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("ShopSphere API is running");
});

export default app;
