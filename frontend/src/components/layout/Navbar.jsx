import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  FiHeart,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiShoppingBag,
  FiSun,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice.js";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "text-primary"
        : "text-muted hover:bg-background hover:text-foreground"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-foreground hover:bg-background"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 text-foreground backdrop-blur-xl transition-colors duration-200">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2"
          aria-label="ShopSphere home"
        >
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm"
          >
            <FiShoppingBag size={19} strokeWidth={2.4} />
          </motion.div>

          <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Shop<span className="text-primary">Sphere</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/wishlist" className={navLinkClass}>
              <FiHeart size={17} />
              Wishlist
            </NavLink>
          )}

          <NavLink to="/cart" className={navLinkClass}>
            <FiShoppingBag size={17} />
            Cart
          </NavLink>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-background text-primary"
                      : "text-foreground hover:bg-background"
                  }`
                }
              >
                <FiLogIn size={16} />
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
              >
                <FiUserPlus size={16} />
                Register
              </NavLink>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background hover:text-danger"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          )}

          {/* Theme toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-background hover:text-primary"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground"
          >
            {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isMobileMenuOpen ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-7xl space-y-2 px-4 py-4 sm:px-6"
            >
              <NavLink to="/" end className={mobileNavLinkClass}>
                <FiShoppingBag size={18} />
                Home
              </NavLink>

              <NavLink to="/products" className={mobileNavLinkClass}>
                <FiShoppingBag size={18} />
                Products
              </NavLink>

              {isAuthenticated && (
                <NavLink to="/wishlist" className={mobileNavLinkClass}>
                  <FiHeart size={18} />
                  Wishlist
                </NavLink>
              )}

              <NavLink to="/cart" className={mobileNavLinkClass}>
                <FiShoppingBag size={18} />
                Cart
              </NavLink>

              <div className="my-3 h-px bg-border" />

              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className={mobileNavLinkClass}>
                    <FiLogIn size={18} />
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    <FiUserPlus size={18} />
                    Create account
                  </NavLink>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
