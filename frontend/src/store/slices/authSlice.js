import { createSlice } from "@reduxjs/toolkit";

// Restore the authentication token when the application starts.
const storedToken = localStorage.getItem("token");

const initialState = {
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken),
};

// Manage authentication-related state.
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Store the JWT after a successful login.
    login: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload);
    },

    // Remove the JWT when the user logs out.
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
