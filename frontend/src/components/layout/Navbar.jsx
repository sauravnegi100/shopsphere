import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiMoon, FiSun } from "react-icons/fi";
import { logout } from "../../store/slices/authSlice.js";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Restore the saved theme or use light mode by default.
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  // Apply the selected theme to the entire document.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Switch between light and dark themes.
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const navLinkClass = ({ isActive }) =>
    `transition-colors hover:text-primary ${
      isActive ? "font-semibold text-primary" : "text-foreground"
    }`;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-surface text-foreground transition-colors duration-200">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ShopSphere brand */}
        <Link to="/" className="text-2xl font-bold text-primary">
          ShopSphere
        </Link>

        {/* Main navigation links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>

              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="text-foreground transition-colors hover:text-primary"
            >
              Logout
            </button>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="rounded-full p-2 text-foreground transition-colors hover:bg-background hover:text-primary"
          >
            {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
