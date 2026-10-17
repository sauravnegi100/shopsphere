import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: null,
};

// Keep the server cart in Redux so pages and the navbar share one source of truth.
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = action.payload || { items: [] };
    },
    clearCartState: (state) => {
      state.cart = { items: [] };
    },
  },
});

export const { setCart, clearCartState } = cartSlice.actions;

export default cartSlice.reducer;
