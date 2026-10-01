import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";

// Create the central Redux store for the ShopSphere application.
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
