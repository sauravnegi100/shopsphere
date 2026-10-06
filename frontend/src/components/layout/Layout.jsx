import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  const location = useLocation();

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
