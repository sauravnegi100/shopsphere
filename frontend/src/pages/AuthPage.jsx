import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "motion/react";
import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";

import { loginUser, registerUser } from "../services/authService.js";
import { login } from "../store/slices/authSlice.js";

const panelTransition = {
  type: "spring",
  stiffness: 70,
  damping: 15,
  mass: 0.9,
};

const contentTransition = {
  type: "spring",
  stiffness: 90,
  damping: 14,
};

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isRegister = location.pathname === "/register";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [registeredMessage, setRegisteredMessage] = useState(
    location.state?.registeredMessage || "",
  );

  useEffect(() => {
    if (location.state?.registeredMessage) {
      setRegisteredMessage(location.state.registeredMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const switchToRegister = () => {
    setRegisteredMessage("");
    navigate("/register");
  };

  const switchToLogin = () => {
    setRegisteredMessage("");
    navigate("/login");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      dispatch(login(data.token));

      toast.success("Welcome back!");

      navigate("/", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name || !email || !password || !formData.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error("Please ensure your password meets all requirements.");
      return;
    }

    if (password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name,
        email,
        password,
      });

      setFormData({
        name: "",
        email,
        password: "",
        confirmPassword: "",
      });

      toast.success("Account created successfully!");

      navigate("/login", {
        replace: true,
        state: {
          registeredMessage: "Account created successfully. Please sign in.",
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        flex
        h-full
        min-h-0
        flex-col
        items-center
        justify-center
        overflow-hidden
        bg-background
        px-4
        py-6
        text-foreground
        transition-colors
        duration-200
        sm:px-6
        lg:py-8
      "
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* ============================================================
            DESKTOP AUTH CARD
            ============================================================ */}

        <div
          className="
            relative
            hidden
            h-[min(640px,calc(100dvh-200px))]
            min-h-[580px]
            w-full
            overflow-hidden
            rounded-3xl
            border
            border-border
            bg-surface
            shadow-[0_24px_80px_rgb(var(--shadow-color)/0.12)]
            lg:block
          "
        >
          {/* ========================================================
              BRAND PANEL
              Login  -> left
              Register -> right
              ======================================================== */}

          <motion.section
            className="
              absolute
              inset-y-0
              left-0
              z-20
              w-1/2
              overflow-hidden
              bg-primary
              p-10
              text-white
            "
            initial={{ x: isRegister ? "0%" : "100%" }}
            animate={{
              x: isRegister ? "100%" : "0%",
            }}
            transition={panelTransition}
          >
            <BrandContent isRegister={isRegister} />
          </motion.section>

          {/* ========================================================
              FORM PANEL
              Login  -> right
              Register -> left
              ======================================================== */}

          <motion.section
            className="
              absolute
              inset-y-0
              right-0
              z-10
              w-1/2
              bg-surface
              px-10
              py-6
            "
            initial={{ x: isRegister ? "0%" : "-100%" }}
            animate={{
              x: isRegister ? "-100%" : "0%",
            }}
            transition={panelTransition}
          >
            <div className="flex h-full items-center">
              <div className="mx-auto w-full max-w-md">
                <AnimatePresence mode="wait" initial={false}>
                  {isRegister ? (
                    <motion.div
                      key="desktop-register-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={contentTransition}
                    >
                      <RegisterForm
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleRegister}
                        loading={loading}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        showConfirmPassword={showConfirmPassword}
                        setShowConfirmPassword={setShowConfirmPassword}
                        onLogin={switchToLogin}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="desktop-login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={contentTransition}
                    >
                      <LoginForm
                        formData={formData}
                        handleChange={handleChange}
                        handleSubmit={handleLogin}
                        loading={loading}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        registeredMessage={registeredMessage}
                        onRegister={switchToRegister}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ============================================================
            MOBILE / TABLET
            ============================================================ */}

        <div
          className="
            rounded-3xl
            border
            border-border
            bg-surface
            p-6
            shadow-[0_24px_80px_rgb(var(--shadow-color)/0.12)]
            sm:p-10
            lg:hidden
          "
        >
          <AnimatePresence mode="wait" initial={false}>
            {isRegister ? (
              <motion.div
                key="mobile-register"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={contentTransition}
              >
                <RegisterForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleRegister}
                  loading={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                  onLogin={switchToLogin}
                  mobile
                />
              </motion.div>
            ) : (
              <motion.div
                key="mobile-login"
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 25 }}
                transition={contentTransition}
              >
                <LoginForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleLogin}
                  loading={loading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  registeredMessage={registeredMessage}
                  onRegister={switchToRegister}
                  mobile
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function BrandContent({ isRegister }) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-between">
      <Link to="/" className="inline-flex w-fit items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur transition-transform hover:scale-105">
          <FiShoppingBag size={22} />
        </span>

        <span className="text-2xl font-bold tracking-tight">ShopSphere</span>
      </Link>

      <AnimatePresence mode="wait" initial={false}>
        {isRegister ? (
          <motion.div
            key="register-brand-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={contentTransition}
            className="max-w-sm"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Everything in one place
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Discover products you&apos;ll love.
            </h1>

            <p className="mt-5 leading-7 text-white/75">
              Keep your cart, orders and shopping preferences connected with
              your ShopSphere account.
            </p>

            <div className="mt-7 space-y-3 text-sm text-white/80">
              <BrandFeature text="Fast and simple checkout" />
              <BrandFeature text="Track your orders" />
              <BrandFeature text="Save your favorite products" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login-brand-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={contentTransition}
            className="max-w-sm"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Welcome back
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Your shopping journey starts here.
            </h1>

            <p className="mt-5 leading-7 text-white/75">
              Sign in to access your cart, orders, wishlist and personalized
              shopping experience.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm font-medium text-white/60">
        Shop smarter. Shop better.
      </p>
    </div>
  );
}

function BrandFeature({ text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
        <FiCheck size={14} />
      </span>

      {text}
    </div>
  );
}

function LoginForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
  showPassword,
  setShowPassword,
  registeredMessage,
  onRegister,
  mobile = false,
}) {
  return (
    <div>
      {mobile && <MobileBrand />}

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-semibold text-primary">
          Welcome back
        </p>

        <h2 className="text-3xl font-bold tracking-tight">
          Sign in to ShopSphere
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Enter your details to continue.
        </p>
      </div>

      {registeredMessage && (
        <div className="mb-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          {registeredMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <InputField
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon={<FiMail size={18} />}
          autoComplete="email"
        />

        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoComplete="current-password"
        />

        <div className="pt-1">
          <SubmitButton loading={loading} text="Sign in" />
        </div>
      </form>

      <div className="my-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onRegister}
          className="font-semibold text-primary underline-offset-4 transition hover:text-primary-hover hover:underline"
        >
          Create one
        </button>
      </p>
    </div>
  );
}

function RegisterForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onLogin,
  mobile = false,
}) {
  const pwd = formData.password;

  const passwordRequirements = [
    {
      label: "8+ characters",
      isValid: pwd.length >= 8,
    },
    {
      label: "uppercase letter",
      isValid: /[A-Z]/.test(pwd),
    },
    {
      label: "lowercase letter",
      isValid: /[a-z]/.test(pwd),
    },
    {
      label: "number",
      isValid: /[0-9]/.test(pwd),
    },
    {
      label: "special character",
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  const metCount = passwordRequirements.filter(
    (requirement) => requirement.isValid,
  ).length;

  const unmetLabels = passwordRequirements
    .filter((requirement) => !requirement.isValid)
    .map((requirement) => requirement.label);

  return (
    <div>
      {mobile && <MobileBrand />}

      <div className="mb-3">
        <p className="mb-1 text-sm font-semibold text-primary">
          Join ShopSphere
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>

        <p className="mt-1.5 text-sm leading-6 text-muted">
          Start your shopping journey today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <InputField
          id="register-name"
          name="name"
          label="Full name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          icon={<FiUser size={18} />}
          autoComplete="name"
        />

        <InputField
          id="register-email"
          name="email"
          label="Email address"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon={<FiMail size={18} />}
          autoComplete="email"
        />

        <div>
          <PasswordField
            id="register-password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            autoComplete="new-password"
          />

          <div className="mt-1.5">
            <div className="flex h-1 w-full gap-1">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                    metCount >= index
                      ? metCount === 5
                        ? "bg-success"
                        : "bg-primary/60"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>

            <div
              className={`mt-1 text-[11px] font-medium leading-tight transition-colors duration-300 ${
                metCount === 5 ? "text-success" : "text-muted"
              }`}
            >
              {metCount === 5 ? (
                <span className="flex items-center gap-1">
                  <FiCheck size={12} />
                  Password is strong and ready!
                </span>
              ) : pwd.length > 0 ? (
                <span>Needs: {unmetLabels.join(", ")}</span>
              ) : (
                <span>
                  At least 8 characters, with an uppercase letter, a lowercase
                  letter, a number, and a special character.
                </span>
              )}
            </div>
          </div>
        </div>

        <PasswordField
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          showPassword={showConfirmPassword}
          setShowPassword={setShowConfirmPassword}
          autoComplete="new-password"
        />

        {formData.confirmPassword && (
          <div
            className={`flex items-center gap-1.5 pt-0.5 text-xs font-medium ${
              formData.password === formData.confirmPassword
                ? "text-success"
                : "text-danger"
            }`}
          >
            <FiCheck size={13} />

            {formData.password === formData.confirmPassword
              ? "Passwords match"
              : "Passwords do not match"}
          </div>
        )}

        <div className="pt-3">
          <SubmitButton loading={loading} text="Create account" />
        </div>
      </form>

      <div className="mt-2 pt-1">
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="font-semibold text-primary underline-offset-4 transition hover:text-primary-hover hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function InputField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-foreground"
      >
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
          {icon}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full
            rounded-2xl
            border
            border-border
            bg-surface-muted
            py-2.5
            pl-11
            pr-4
            text-sm
            text-foreground
            outline-none
            transition-all
            placeholder:text-muted
            hover:border-primary/50
            focus:border-primary
            focus:ring-4
            focus:ring-primary/10
          "
        />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-foreground"
      >
        {label}
      </label>

      <div className="group relative">
        <FiLock
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
        />

        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="
            w-full
            rounded-2xl
            border
            border-border
            bg-surface-muted
            py-2.5
            pl-11
            pr-12
            text-sm
            text-foreground
            outline-none
            transition-all
            placeholder:text-muted
            hover:border-primary/50
            focus:border-primary
            focus:ring-4
            focus:ring-primary/10
          "
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="
            absolute
            right-3
            top-1/2
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-xl
            text-muted
            transition-colors
            hover:bg-surface
            hover:text-foreground
          "
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        group
        mt-1
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-2xl
        bg-primary
        px-5
        py-3
        text-sm
        font-semibold
        text-primary-foreground
        transition-all
        hover:scale-[1.01]
        hover:bg-primary-hover
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
      style={{ color: "white" }}
    >
      {loading ? "Please wait..." : text}

      {!loading && (
        <FiArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      )}
    </button>
  );
}

function MobileBrand() {
  return (
    <Link to="/" className="mb-6 flex w-fit items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform hover:scale-105">
        <FiShoppingBag size={20} />
      </span>

      <span className="text-xl font-bold">ShopSphere</span>
    </Link>
  );
}

export default AuthPage;
