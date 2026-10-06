import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiStar,
} from "react-icons/fi";
import { useSelector } from "react-redux";

import { getProductById } from "../services/productService.js";
import { addToCart } from "../services/cartService.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function ProductDetails() {
  const { id } = useParams();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);

  /*
   * Fetch product details.
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const data = await getProductById(id);

        setProduct(data);
        setSelectedImage(data?.images?.[0] || "");
      } catch (error) {
        console.error("Failed to fetch product:", error);

        toast.error(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /*
   * Check whether the current product is already in the user's wishlist.
   */
  useEffect(() => {
    if (!isAuthenticated || !id) {
      setIsWishlisted(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const data = await getWishlist();

        const wishlistProducts = data.wishlist?.products || [];

        const exists = wishlistProducts.some(
          (wishlistProduct) => wishlistProduct._id === id,
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    };

    fetchWishlist();
  }, [id, isAuthenticated]);

  /*
   * Change product quantity.
   */
  const handleQuantityChange = (nextQuantity) => {
    if (!product) return;

    const safeQuantity = Math.min(Math.max(1, nextQuantity), product.stock);

    setQuantity(safeQuantity);
  };

  /*
   * Add product to cart.
   */
  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    try {
      setAddingToCart(true);

      await addToCart(product._id, quantity);

      toast.success(
        quantity === 1 ? "Added to cart" : `${quantity} items added to cart`,
      );
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to add products to cart");
        return;
      }

      toast.error(
        error.response?.data?.message || "Failed to add product to cart",
      );
    } finally {
      setAddingToCart(false);
    }
  };

  /*
   * Add or remove the product from the wishlist.
   */
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      return;
    }

    if (!product) return;

    try {
      setUpdatingWishlist(true);

      if (isWishlisted) {
        await removeFromWishlist(product._id);

        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product._id);

        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to use wishlist");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setUpdatingWishlist(false);
    }
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <section className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-surface-muted" />

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div className="aspect-square rounded-2xl bg-surface-muted" />

              <div className="space-y-5 py-2">
                <div className="h-3 w-32 rounded bg-surface-muted" />
                <div className="h-10 w-4/5 rounded bg-surface-muted" />
                <div className="h-8 w-32 rounded bg-surface-muted" />
                <div className="h-px w-full bg-surface-muted" />

                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-surface-muted" />
                  <div className="h-4 w-11/12 rounded bg-surface-muted" />
                  <div className="h-4 w-4/5 rounded bg-surface-muted" />
                </div>

                <div className="h-12 w-56 rounded-xl bg-surface-muted" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Product not found.
   */
  if (!product) {
    return (
      <section className="min-h-[75vh] bg-background">
        <div className="mx-auto flex min-h-[75vh] w-full max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
              <FiShoppingBag className="text-muted" size={26} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
              Product not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              This product may no longer be available.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              <FiArrowLeft size={16} />
              Back to Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const images = product.images?.length ? product.images : [];
  const isOutOfStock = product.stock <= 0;

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/products"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <FiArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to Products
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Product Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-square overflow-hidden bg-surface-muted">
                {selectedImage ? (
                  <motion.img
                    key={selectedImage}
                    src={selectedImage}
                    alt={product.name}
                    initial={{ opacity: 0.5, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="h-full w-full object-contain p-5 sm:p-8"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FiShoppingBag className="text-muted" size={42} />
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-danger px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.map((image, index) => {
                  const isSelected = selectedImage === image;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`aspect-square overflow-hidden rounded-xl border bg-surface transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.08,
              ease: "easeOut",
            }}
            className="flex flex-col"
          >
            {/* Category */}
            {product.category?.name && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {product.category.name}
              </p>
            )}

            {/* Product name + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleWishlistToggle}
                disabled={updatingWishlist}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                className={`mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  isWishlisted
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted hover:border-primary hover:text-primary"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <FiHeart
                  size={20}
                  className={isWishlisted ? "fill-current" : ""}
                />
              </motion.button>
            </div>

            {/* Rating + stock */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1.5">
                  <FiStar className="fill-current text-primary" size={14} />

                  <span className="text-sm font-semibold text-foreground">
                    {product.rating.toFixed(1)}
                  </span>

                  <span className="text-xs text-muted">
                    ({product.numReviews || 0})
                  </span>
                </div>
              )}

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isOutOfStock
                    ? "bg-danger/10 text-danger"
                    : "bg-success/10 text-success"
                }`}
              >
                {isOutOfStock ? "Out of stock" : `${product.stock} available`}
              </span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="my-7 h-px bg-border" />

            {/* Description */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">
                About this product
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted sm:text-base">
                {product.description}
              </p>
            </div>

            {/* Product benefits */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FiCheck className="text-primary" size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Quality product
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Carefully selected for our collection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                  <FiCheck className="text-success" size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Secure shopping
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Safe and protected checkout experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Add to cart */}
            {!isOutOfStock && (
              <div className="mt-8">
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Quantity */}
                  <div className="flex h-12 w-fit items-center overflow-hidden rounded-xl border border-border bg-surface">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="flex h-full w-11 items-center justify-center text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={15} />
                    </button>

                    <span className="flex h-full min-w-12 items-center justify-center border-x border-border px-3 text-sm font-semibold text-foreground">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="flex h-full w-11 items-center justify-center text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={15} />
                    </button>
                  </div>

                  {/* Add button */}
                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiShoppingBag size={17} />

                    {addingToCart ? "Adding to cart..." : "Add to Cart"}
                  </motion.button>
                </div>

                <p className="mt-3 text-xs text-muted">
                  Maximum quantity available: {product.stock}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
