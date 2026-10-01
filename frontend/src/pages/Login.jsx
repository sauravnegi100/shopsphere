import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { login } from "../store/slices/authSlice.js";
import { loginUser } from "../services/authService.js";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Show registration success message once after redirecting to login.
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(formData);

      // Store the JWT in Redux and localStorage.
      dispatch(login(data.token));

      toast.success("Logged in successfully!");

      // Redirect to the home page after successful login.
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const labelClass = "mb-1 block text-sm font-medium text-foreground";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-10 text-foreground transition-colors duration-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-sm transition-colors duration-200"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted">
            Login to your ShopSphere account
          </p>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className={`${inputClass} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-muted transition-colors hover:text-primary"
            >
              {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
