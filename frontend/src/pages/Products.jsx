import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProducts } from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted">Loading products...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Products</h1>
        <p className="mt-2 text-muted">Explore our collection of products.</p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No products found
          </h2>
          <p className="mt-2 text-muted">
            Products will appear here once they are available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <article
              key={product._id}
              className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
            >
              <div className="flex aspect-square items-center justify-center bg-background">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted">No image available</span>
                )}
              </div>

              <div className="p-4">
                <p className="mb-2 text-sm text-muted">
                  {product.category?.name || "Uncategorized"}
                </p>

                <h2 className="line-clamp-1 font-semibold text-foreground">
                  {product.name}
                </h2>

                <p className="mt-2 font-bold text-primary">
                  {formatPrice(product.price)}
                </p>

                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {product.description}
                </p>

                <p className="mt-3 text-xs text-muted">
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;
