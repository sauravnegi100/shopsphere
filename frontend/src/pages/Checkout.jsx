import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";

import { createOrder } from "../services/orderService.js";
import { getCart } from "../services/cartService.js";
import { setCart } from "../store/slices/cartSlice.js";
import RazorpayButton from "../components/payment/RazorpayButton.jsx";

const initialAddress = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart.cart);

  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchCart = async () => {
      try {
        const data = await getCart();

        if (active) {
          dispatch(setCart(data.cart));
        }
      } catch (error) {
        if (active) {
          toast.error(
            error.response?.data?.message || "Failed to load your cart",
          );
        }
      } finally {
        if (active) {
          setLoadingCart(false);
        }
      }
    };

    fetchCart();

    return () => {
      active = false;
    };
  }, [dispatch]);

  const items = cart?.items || [];

  const totalAmount = items.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (submitting || placedOrder) return;

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createOrder(shippingAddress);

      setPlacedOrder(data.order);

      toast.success("Order created. Continue to payment.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create your order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (!placedOrder) return;

    // The backend has already verified payment and updated the server cart.
    // Keep Redux in sync with that successful result.
    dispatch(setCart({ items: [] }));

    toast.success("Payment successful. Your order is confirmed.");

    navigate(`/orders/${placedOrder._id}`);
  };

  if (loadingCart) {
    return (
      <section className="min-h-[70vh] bg-background">
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-8 w-56 rounded-lg bg-surface-muted" />
          <div className="mt-8 h-80 rounded-2xl bg-surface-muted" />
        </div>
      </section>
    );
  }

  if (!placedOrder && items.length === 0) {
    return (
      <section className="min-h-[75vh] bg-background">
        <div className="mx-auto flex min-h-[75vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
          <FiShoppingBag className="text-primary" size={38} />

          <h1 className="mt-5 text-2xl font-bold text-foreground">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-muted">
            Add some products before proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Browse products
            <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  if (placedOrder) {
    return (
      <section className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FiCheckCircle className="text-primary" size={29} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Order created
            </p>

            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              One last step: payment
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted">
              Your order has been created, but it is not paid yet. Complete
              payment below to confirm it.
            </p>

            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="text-xs text-muted">Order ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-foreground">
                {placedOrder._id}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                <span className="text-sm text-muted">Order total</span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(placedOrder.totalAmount)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Payment status</span>
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">
                  {placedOrder.paymentStatus || "Pending"}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-background p-4">
              <div className="flex items-start gap-3">
                <FiShield className="mt-0.5 shrink-0 text-primary" size={19} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Secure payment
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Razorpay will open a secure checkout window. Your order will
                    be marked paid only after the backend verifies the payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <RazorpayButton
                orderId={placedOrder._id}
                onSuccess={handlePaymentSuccess}
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-muted">
              If you close the payment window, this order will remain unpaid.
              You can try paying again from this page while it remains open.
            </p>

            <Link
              to="/orders"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary"
            >
              <FiArrowLeft size={16} />
              View my orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          <FiArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            SECURE CHECKOUT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-muted">
            Enter your delivery details to create your order.
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
        >
          {/* Shipping address */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FiMapPin className="text-primary" size={20} />
              Shipping address
            </h2>

            <p className="mt-2 text-sm text-muted">
              Where should we deliver your order?
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={shippingAddress.name}
                  onChange={handleAddressChange}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Enter recipient's full name"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  required
                  minLength={10}
                  maxLength={15}
                  pattern="[0-9+ -]{10,15}"
                  title="Enter a valid phone number"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Enter contact number"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  House number and street
                </label>
                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  required
                  maxLength={300}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="House number, street, area, landmark"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="City"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="State"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="pincode"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  PIN code
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={shippingAddress.pincode}
                  onChange={handleAddressChange}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  title="Enter a valid 6-digit PIN code"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="6-digit PIN code"
                />
              </div>
            </div>
          </div>

          {/* Order summary */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-bold text-foreground">
                Order summary
              </h2>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium text-foreground">
                        {item.product.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-success">Free</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating order..." : "Create order & continue"}
                {!submitting && <FiArrowRight size={17} />}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-muted">
                Payment is the next step. Your cart will not be cleared until
                payment is successfully verified.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface p-4">
                <FiTruck className="text-primary" size={19} />
                <p className="mt-3 text-xs font-semibold text-foreground">
                  Free shipping
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <FiShield className="text-primary" size={19} />
                <p className="mt-3 text-xs font-semibold text-foreground">
                  Secure payment
                </p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

export default Checkout;
