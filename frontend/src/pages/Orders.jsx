import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBox,
  FiCalendar,
  FiMapPin,
  FiShoppingBag,
} from "react-icons/fi";

import { getMyOrders, getOrderById } from "../services/orderService.js";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price ?? 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatLabel = (value) => {
  if (!value) return "Unknown";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getStatusClasses = (status) => {
  switch (status) {
    case "delivered":
    case "paid":
      return "bg-success/10 text-success";

    case "cancelled":
    case "failed":
      return "bg-danger/10 text-danger";

    case "shipped":
    case "processing":
      return "bg-primary/10 text-primary";

    default:
      return "bg-surface-muted text-muted";
  }
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(status)}`}
    >
      {formatLabel(status)}
    </span>
  );
}

function OrderItems({ items = [] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((item, index) => {
        const product = item.product;
        const productId = product?._id;
        const productName = product?.name || "Product no longer available";

        return (
          <div
            key={`${productId || "unavailable"}-${index}`}
            className="flex gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
              {product?.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiShoppingBag className="text-muted" size={25} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {productId ? (
                <Link
                  to={`/products/${productId}`}
                  className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {productName}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-foreground">
                  {productName}
                </p>
              )}

              <p className="mt-1 text-xs text-muted">
                Quantity: {item.quantity}
              </p>

              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatPrice(item.price)} each
              </p>
            </div>

            <p className="shrink-0 text-sm font-bold text-foreground">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function OrderDetails({ order }) {
  const address = order.shippingAddress || {};

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
              Order details
            </p>

            <h1 className="mt-2 break-all text-xl font-bold text-foreground sm:text-2xl">
              Order #{order._id}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-muted">
              <FiCalendar size={15} />
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
          <FiBox className="text-primary" size={19} />
          Items ordered
        </h2>

        <OrderItems items={order.items} />

        <div className="mt-5 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-foreground">Order total</span>

            <span className="text-xl font-bold text-foreground">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-muted">
            Payment method and transaction details will be shown when payment
            integration is completed.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
          <FiMapPin className="text-primary" size={19} />
          Shipping address
        </h2>

        <div className="space-y-1 text-sm leading-6 text-muted">
          <p className="font-semibold text-foreground">{address.name}</p>
          <p>{address.phone}</p>
          <p>{address.address}</p>
          <p>
            {[address.city, address.state].filter(Boolean).join(", ")}
            {address.pincode ? ` - ${address.pincode}` : ""}
          </p>
        </div>
      </div>

      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:opacity-80"
      >
        <FiArrowLeft size={16} />
        Back to my orders
      </Link>
    </div>
  );
}

function Orders() {
  const { id } = useParams();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchOrders = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        if (id) {
          const data = await getOrderById(id);

          if (isActive) {
            setSelectedOrder(data.order);
          }
        } else {
          const data = await getMyOrders();

          if (isActive) {
            setOrders(data.orders || []);
          }
        }
      } catch (error) {
        if (isActive) {
          const message =
            error.response?.data?.message ||
            (id
              ? "Failed to load order details"
              : "Failed to load your orders");

          setErrorMessage(message);
          toast.error(message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-surface-muted" />
            <div className="h-4 w-64 rounded bg-surface-muted" />

            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-40 rounded-2xl bg-surface-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="min-h-[70vh] bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
          <FiBox className="text-danger" size={36} />

          <h1 className="mt-5 text-2xl font-bold text-foreground">
            {id ? "Unable to load this order" : "Unable to load orders"}
          </h1>

          <p className="mt-2 text-sm text-muted">{errorMessage}</p>

          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            View my orders
            <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    );
  }

  if (id) {
    if (!selectedOrder) return null;

    return (
      <section className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <OrderDetails order={selectedOrder} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            YOUR SHOPSPHERE ACCOUNT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-muted">
            Track your purchases and review your order details.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FiShoppingBag className="text-primary" size={28} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-foreground">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Your orders will appear here after you place your first order.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Explore products
              <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const previewItems = order.items || [];
              const itemCount = previewItems.reduce(
                (total, item) => total + item.quantity,
                0,
              );

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-border bg-surface"
                >
                  <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">Order ID</p>

                      <p className="mt-1 break-all text-sm font-semibold text-foreground">
                        #{order._id}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                        <FiCalendar size={14} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={order.orderStatus} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>

                        <div className="space-y-3">
                          {previewItems.slice(0, 2).map((item, index) => (
                            <div
                              key={`${item.product?._id || "item"}-${index}`}
                              className="flex items-center gap-3"
                            >
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted">
                                {item.product?.images?.[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name || "Product"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <FiShoppingBag
                                    className="text-muted"
                                    size={18}
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-medium text-foreground">
                                  {item.product?.name ||
                                    "Product no longer available"}
                                </p>

                                <p className="mt-1 text-xs text-muted">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}

                          {previewItems.length > 2 && (
                            <p className="text-xs text-muted">
                              +{previewItems.length - 2} more{" "}
                              {previewItems.length - 2 === 1 ? "item" : "items"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-4 sm:min-w-44 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <div>
                          <p className="text-xs text-muted">Order total</p>

                          <p className="mt-1 text-xl font-bold text-foreground">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>

                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          View details
                          <FiArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          <FiArrowLeft size={16} />
          Continue shopping
        </Link>
      </div>
    </section>
  );
}

export default Orders;
