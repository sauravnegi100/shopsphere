import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// express.json() parses incoming JSON request bodies and makes the data available in req.body.
app.use(express.json());

// CORS allows the frontend and backend to communicate when they run on different origins.
app.use(cors());

// Mount all user-related routes under the /api/users path.
// app.use() is used to register middleware or mount routers at a specific path in an Express application.
app.use("/api/users", userRoutes);

// Mount all product-related routes under the /api/products path.
app.use("/api/products", productRoutes);

// Mount all category-related routes under the /api/categories path.
app.use("/api/categories", categoryRoutes);

// Mount all cart-related routes under the /api/cart path.
app.use("/api/cart", cartRoutes);

// Mount all wishlist-related routes under the /api/wishlist path.
app.use("/api/wishlist", wishlistRoutes);

// Mount all order-related routes under the /api/orders path.
app.use("/api/orders", orderRoutes);

// Basic route to confirm that the ShopSphere API is running.
app.get("/", (req, res) => {
  res.send("ShopSphere API is running");
});

// Handle routes that do not exist.
app.use((req, res) => {
  return res.status(404).json({
    message: "API route not found",
  });
});

// Handle errors from routes and controllers.
app.use(errorMiddleware);

export default app;
