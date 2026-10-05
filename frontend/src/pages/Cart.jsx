import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";

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

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdatingProductId(productId);

      const data = await updateCartItem(productId, quantity);

      setCart(data.cart);
      toast.success("Cart updated");
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
      const data = await clearCart();

      setCart(data.cart);
      toast.success("Cart cleared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear cart");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted">Loading cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  const totalAmount = items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-background">
            <FiShoppingBag className="text-foreground" size={32} />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Your cart is empty
          </h1>

          <p className="mt-2 text-muted">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>

          <p className="mt-2 text-muted">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          className="text-sm font-medium text-red-500 transition-opacity hover:opacity-80"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const product = item.product;
            const productId = product._id;
            const isUpdating = updatingProductId === productId;

            return (
              <article
                key={productId}
                className="flex gap-4 rounded-xl border border-border bg-surface p-4 transition-colors"
              >
                {/* Product Image */}
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-background">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FiShoppingBag className="text-muted" size={28} />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="line-clamp-2 font-semibold text-foreground">
                        {product.name}
                      </h2>

                      <p className="mt-1 text-sm text-muted">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <p className="hidden shrink-0 font-semibold text-foreground sm:block">
                      {formatPrice(product.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    {/* Quantity */}
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        disabled={isUpdating || item.quantity <= 1}
                        onClick={() =>
                          handleQuantityChange(productId, item.quantity - 1)
                        }
                        className="p-2 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={16} />
                      </button>

                      <span className="min-w-10 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={isUpdating || item.quantity >= product.stock}
                        onClick={() =>
                          handleQuantityChange(productId, item.quantity + 1)
                        }
                        className="p-2 text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleRemove(productId)}
                      className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-opacity hover:opacity-80 disabled:opacity-50"
                    >
                      <FiTrash2 size={15} />
                      Remove
                    </button>
                  </div>

                  {/* Mobile item total */}
                  <p className="mt-4 font-semibold text-foreground sm:hidden">
                    {formatPrice(product.price * item.quantity)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Order Summary */}
        <aside className="h-fit rounded-xl border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-primary px-4 py-3 font-medium text-white opacity-50"
          >
            Proceed to Checkout
          </button>

          <Link
            to="/products"
            className="mt-4 block text-center text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;
