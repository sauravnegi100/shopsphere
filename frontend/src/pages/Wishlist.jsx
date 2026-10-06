import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { FiArrowRight, FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";

import {
  getWishlist,
  removeFromWishlist,
} from "../services/wishlistService.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function Wishlist() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingProductId, setRemovingProductId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);

        const data = await getWishlist();

        setProducts(data.wishlist?.products || []);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);

        toast.error(error.response?.data?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      setRemovingProductId(productId);

      await removeFromWishlist(productId);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId),
      );

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);

      toast.error(error.response?.data?.message || "Failed to remove product");
    } finally {
      setRemovingProductId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-[75vh] bg-background">
        <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FiHeart className="text-primary" size={28} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              Your wishlist awaits
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              Login to save products you love and find them easily later.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Login to continue
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            SAVED FOR LATER
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                My Wishlist
              </h1>

              {!loading && products.length > 0 && (
                <p className="mt-2 text-sm text-muted">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} saved
                </p>
              )}
            </div>

            <Link
              to="/products"
              className="hidden items-center gap-2 text-sm font-semibold text-primary sm:flex"
            >
              Continue shopping
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface"
              >
                <div className="aspect-square bg-surface-muted" />

                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 rounded bg-surface-muted" />
                  <div className="h-5 w-4/5 rounded bg-surface-muted" />
                  <div className="h-5 w-24 rounded bg-surface-muted" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty wishlist */}
        {!loading && products.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FiHeart className="text-primary" size={28} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-foreground">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Save products you love by tapping the heart icon. They will appear
              here for easy access later.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Explore Products
              <FiArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Wishlist products */}
        {!loading && products.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
            className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <motion.article
                key={product._id}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 16,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                }}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <Link
                  to={`/products/${product._id}`}
                  className="relative block aspect-square overflow-hidden bg-surface-muted"
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FiShoppingBag className="text-muted" size={32} />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      handleRemove(product._id);
                    }}
                    disabled={removingProductId === product._id}
                    aria-label={`Remove ${product.name} from wishlist`}
                    title="Remove from wishlist"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-danger shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </Link>

                {/* Product information */}
                <div className="p-4">
                  {product.category?.name && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                      {product.category.name}
                    </p>
                  )}

                  <Link to={`/products/${product._id}`}>
                    <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-foreground transition-colors hover:text-primary sm:text-base">
                      {product.name}
                    </h2>
                  </Link>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-foreground">
                      {formatPrice(product.price)}
                    </p>

                    {product.rating > 0 && (
                      <span className="text-xs text-muted">
                        ★ {product.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/products/${product._id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    View Product
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Mobile continue shopping */}
        {!loading && products.length > 0 && (
          <div className="mt-8 sm:hidden">
            <Link
              to="/products"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Continue Shopping
              <FiArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;
