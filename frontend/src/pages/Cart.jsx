import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
  FiShield,
} from "react-icons/fi";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartService.js";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data.cart);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingProductId(productId);

      const data = await updateCartItem(productId, quantity);

      setCart(data.cart);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setUpdatingProductId(productId);

      const data = await removeCartItem(productId);

      setCart(data.cart);

      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);

      const data = await clearCart();

      setCart(data.cart);

      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-surface-muted" />
            <div className="mt-3 h-4 w-56 rounded bg-surface-muted" />

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 rounded-2xl bg-surface-muted"
                  />
                ))}
              </div>

              <div className="h-72 rounded-2xl bg-surface-muted" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const items = cart?.items || [];

  const totalAmount = items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  /*
   * Empty cart
   */
  if (items.length === 0) {
    return (
      <section className="min-h-[75vh] bg-background">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
              <FiShoppingBag className="text-primary" size={32} />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Your ShopSphere Cart
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Looks like you haven't added anything yet. Explore our collection
              and find something you'll love.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Start Shopping
              <FiArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Shopping Bag
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your Cart
            </h1>

            <p className="mt-2 text-sm text-muted">
              {items.length} {items.length === 1 ? "item" : "items"} ready for
              checkout
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearing}
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-danger transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <FiTrash2 size={15} />
            {clearing ? "Clearing..." : "Clear cart"}
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Cart Items */}
          <div className="min-w-0 space-y-4">
            {items.map((item) => {
              const product = item.product;
              const productId = product._id;
              const isUpdating = updatingProductId === productId;

              return (
                <article
                  key={productId}
                  className="group rounded-2xl border border-border bg-surface p-4 transition-all hover:shadow-md sm:p-5"
                >
                  <div className="flex gap-4 sm:gap-5">
                    {/* Product Image */}
                    <Link
                      to={`/products/${productId}`}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-32 sm:w-32"
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FiShoppingBag className="text-muted" size={26} />
                        </div>
                      )}
                    </Link>

                    {/* Product Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                            {product.category?.name || "Product"}
                          </p>

                          <Link
                            to={`/products/${productId}`}
                            className="mt-1 block"
                          >
                            <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors hover:text-primary sm:text-base">
                              {product.name}
                            </h2>
                          </Link>

                          <p className="mt-1 text-sm text-muted">
                            {formatPrice(product.price)} each
                          </p>
                        </div>

                        {/* Desktop Item Total */}
                        <p className="hidden shrink-0 text-base font-bold text-foreground sm:block">
                          {formatPrice(product.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        {/* Quantity */}
                        <div className="flex items-center overflow-hidden rounded-lg border border-border">
                          <button
                            type="button"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() =>
                              handleQuantityChange(productId, item.quantity - 1)
                            }
                            className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={15} />
                          </button>

                          <span className="flex h-9 min-w-10 items-center justify-center border-x border-border px-2 text-sm font-semibold text-foreground">
                            {isUpdating ? "..." : item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={
                              isUpdating || item.quantity >= product.stock
                            }
                            onClick={() =>
                              handleQuantityChange(productId, item.quantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={15} />
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleRemove(productId)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger transition-opacity hover:opacity-75 disabled:opacity-40 sm:text-sm"
                        >
                          <FiTrash2 size={14} />
                          Remove
                        </button>
                      </div>

                      {/* Mobile Item Total */}
                      <div className="mt-4 flex items-center justify-between sm:hidden">
                        <span className="text-xs text-muted">Item total</span>

                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              <span>←</span>
              Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-bold text-foreground">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    Subtotal ({items.length}{" "}
                    {items.length === 1 ? "item" : "items"})
                  </span>

                  <span className="font-medium text-foreground">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="font-semibold text-success">Free</span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-semibold text-foreground">Total</span>

                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout */}
              <button
                type="button"
                disabled
                className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white opacity-50"
              >
                Proceed to Checkout
                <FiArrowRight size={17} />
              </button>

              <p className="mt-3 text-center text-[11px] text-muted">
                Checkout will be available soon.
              </p>
            </div>

            {/* Trust Points */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface p-4">
                <FiTruck className="text-primary" size={19} />

                <p className="mt-3 text-xs font-semibold text-foreground">
                  Free shipping
                </p>

                <p className="mt-1 text-[11px] leading-4 text-muted">
                  On every order
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <FiShield className="text-primary" size={19} />

                <p className="mt-3 text-xs font-semibold text-foreground">
                  Secure checkout
                </p>

                <p className="mt-1 text-[11px] leading-4 text-muted">
                  Safe & protected
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Cart;
