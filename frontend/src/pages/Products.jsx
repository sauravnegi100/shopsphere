import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiShoppingCart,
  FiSliders,
  FiX,
} from "react-icons/fi";

import { getProducts } from "../services/productService.js";
import { getCategories } from "../services/categoryService.js";
import { addToCart } from "../services/cartService.js";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);

  const [showFilters, setShowFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  /*
   * Fetch categories once when the page loads.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load categories",
        );
      }
    };

    fetchCategories();
  }, []);

  /*
   * Fetch products whenever search/filter/page changes.
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = {
          page: filters.page,
          limit: 12,
          sort: filters.sort,
        };

        if (searchParams.get("search")) {
          params.search = searchParams.get("search");
        }

        if (filters.category) {
          params.category = filters.category;
        }

        if (filters.minPrice !== "") {
          params.minPrice = filters.minPrice;
        }

        if (filters.maxPrice !== "") {
          params.maxPrice = filters.maxPrice;
        }

        const data = await getProducts(params);

        setProducts(data.products || []);

        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalProducts: data.totalProducts || 0,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load products");

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchParams]);

  /*
   * Search submit.
   */
  const handleSearch = (event) => {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams);

    if (searchInput.trim()) {
      nextParams.set("search", searchInput.trim());
    } else {
      nextParams.delete("search");
    }

    nextParams.set("page", "1");

    setFilters((current) => ({
      ...current,
      page: 1,
    }));

    setSearchParams(nextParams);
  };

  /*
   * Category filter.
   */
  const handleCategoryChange = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);

    if (categoryId) {
      nextParams.set("category", categoryId);
    } else {
      nextParams.delete("category");
    }

    nextParams.set("page", "1");

    setFilters((current) => ({
      ...current,
      category: categoryId,
      page: 1,
    }));

    setSearchParams(nextParams);
  };

  /*
   * Price filter.
   */
  const handlePriceFilter = () => {
    const nextParams = new URLSearchParams(searchParams);

    if (filters.minPrice !== "") {
      nextParams.set("minPrice", filters.minPrice);
    } else {
      nextParams.delete("minPrice");
    }

    if (filters.maxPrice !== "") {
      nextParams.set("maxPrice", filters.maxPrice);
    } else {
      nextParams.delete("maxPrice");
    }

    nextParams.set("page", "1");

    setFilters((current) => ({
      ...current,
      page: 1,
    }));

    setSearchParams(nextParams);
  };

  /*
   * Sorting.
   */
  const handleSortChange = (sort) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("sort", sort);
    nextParams.set("page", "1");

    setFilters((current) => ({
      ...current,
      sort,
      page: 1,
    }));

    setSearchParams(nextParams);
  };

  /*
   * Pagination.
   */
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;

    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("page", String(page));

    setFilters((current) => ({
      ...current,
      page,
    }));

    setSearchParams(nextParams);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Reset every filter.
   */
  const clearFilters = () => {
    setSearchInput("");

    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      page: 1,
    });

    setSearchParams({
      sort: "newest",
      page: "1",
    });
  };

  /*
   * Add product to cart.
   */
  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;

    try {
      setAddingProductId(product._id);

      await addToCart(product._id, 1);

      toast.success("Added to cart");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to add products to cart");
        return;
      }

      toast.error(
        error.response?.data?.message || "Failed to add product to cart",
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const hasActiveFilters =
    searchParams.get("search") ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                ShopSphere Collection
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                All Products
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Explore our collection and find something you'll love.
              </p>
            </div>

            <div className="text-sm text-muted">
              {pagination.totalProducts}{" "}
              {pagination.totalProducts === 1 ? "product" : "products"}
            </div>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <form
            onSubmit={handleSearch}
            className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-border bg-surface transition-colors focus-within:border-primary"
          >
            <FiSearch className="ml-4 shrink-0 text-muted" size={19} />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search products..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-foreground outline-none placeholder:text-muted"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="mr-1 rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
                aria-label="Clear search"
              >
                <FiX size={17} />
              </button>
            )}

            <button
              type="submit"
              className="m-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Search
            </button>
          </form>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors lg:hidden ${
                showFilters
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-foreground hover:bg-background"
              }`}
            >
              <FiFilter size={17} />
              Filters
            </button>

            <div className="relative flex flex-1 items-center rounded-xl border border-border bg-surface lg:flex-none">
              <FiSliders className="ml-3 text-muted" size={17} />

              <select
                value={filters.sort}
                onChange={(event) => handleSortChange(event.target.value)}
                className="w-full appearance-none bg-transparent px-3 py-3 pr-8 text-sm font-medium text-foreground outline-none lg:w-52"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Filters */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } h-fit rounded-2xl border border-border bg-surface p-5 lg:block`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Filters</h2>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground">
                Category
              </h3>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("")}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    !filters.category
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  All categories
                </button>

                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => handleCategoryChange(category._id)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      filters.category === category._id
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mt-7 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground">
                Price range
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      minPrice: event.target.value,
                    }))
                  }
                  placeholder="Min"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />

                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      maxPrice: event.target.value,
                    }))
                  }
                  placeholder="Max"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handlePriceFilter}
                className="mt-3 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background"
              >
                Apply price
              </button>
            </div>
          </aside>

          {/* Products */}
          <div className="min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-border bg-surface"
                  >
                    <div className="aspect-square animate-pulse bg-surface-muted" />

                    <div className="space-y-3 p-4">
                      <div className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
                      <div className="h-5 w-24 animate-pulse rounded bg-surface-muted" />
                      <div className="h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background">
                  <FiSearch className="text-muted" size={25} />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-foreground">
                  No products found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  We couldn't find any products matching your current search or
                  filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => {
                    const isAdding = addingProductId === product._id;
                    const isOutOfStock = product.stock <= 0;

                    return (
                      <article
                        key={product._id}
                        className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
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
                            <div className="flex h-full items-center justify-center text-sm text-muted">
                              No image
                            </div>
                          )}

                          {/* Stock badge */}
                          <div className="absolute left-3 top-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                isOutOfStock
                                  ? "bg-danger/10 text-danger"
                                  : "bg-surface/90 text-foreground backdrop-blur"
                              }`}
                            >
                              {isOutOfStock
                                ? "Out of stock"
                                : `${product.stock} left`}
                            </span>
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                            {product.category?.name || "Uncategorized"}
                          </p>

                          <Link
                            to={`/products/${product._id}`}
                            className="mt-1 block"
                          >
                            <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary sm:text-base">
                              {product.name}
                            </h2>
                          </Link>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <p className="text-base font-bold text-foreground sm:text-lg">
                              {formatPrice(product.price)}
                            </p>

                            {product.rating > 0 && (
                              <span className="text-xs text-muted">
                                ★ {product.rating.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock || isAdding}
                            onClick={() => handleAddToCart(product)}
                            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                              isOutOfStock
                                ? "cursor-not-allowed bg-background text-muted"
                                : "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                            }`}
                          >
                            <FiShoppingCart size={16} />

                            {isAdding
                              ? "Adding..."
                              : isOutOfStock
                                ? "Out of stock"
                                : "Add to cart"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={pagination.currentPage === 1}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <FiChevronLeft size={18} />
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors ${
                          pagination.currentPage === page
                            ? "bg-primary text-white"
                            : "border border-border bg-surface text-foreground hover:bg-background"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
