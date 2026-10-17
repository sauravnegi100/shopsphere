import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { getCart } from "../../services/cartService.js";
import { setCart, clearCartState } from "../../store/slices/cartSlice.js";
import Navbar from "./Navbar";

function Layout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Keep the global cart in sync whenever the user signs in or out.
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearCartState());
      return;
    }

    let cancelled = false;

    const fetchCart = async () => {
      try {
        const data = await getCart();

        if (!cancelled) {
          dispatch(setCart(data.cart));
        }
      } catch (error) {
        if (!cancelled && error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "Failed to load cart");
        }
      }
    };

    fetchCart();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated]);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div
      className={
        isAuthPage
          ? "h-[100dvh] overflow-hidden bg-background"
          : "min-h-screen bg-background"
      }
    >
      <Navbar />

      <main
        className={
          isAuthPage ? "h-[calc(100dvh-73px)] overflow-hidden" : undefined
        }
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
