import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `transition-colors hover:text-indigo-600 ${
      isActive ? "font-semibold text-indigo-600" : "text-gray-700"
    }`;

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ShopSphere brand */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          ShopSphere
        </Link>

        {/* Main navigation links */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>

          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>

          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
