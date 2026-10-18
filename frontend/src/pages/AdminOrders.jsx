import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw, FiEye, FiX, FiPackage } from "react-icons/fi";
import {
  getAllOrders,
  updateOrderStatus,
} from "../services/adminOrderService.js";

const FILTERS = [
  "all",
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_STYLES = {
  placed: "bg-blue-500/10 text-blue-600",
  processing: "bg-amber-500/10 text-amber-600",
  shipped: "bg-violet-500/10 text-violet-600",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

const ALLOWED_TRANSITIONS = {
  placed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderStatus = (order) =>
  String(order?.orderStatus ?? order?.status ?? "placed").toLowerCase();

const getPaymentStatus = (order) =>
  order?.paymentStatus ?? order?.paymentInfo?.status ?? "—";

const getCustomer = (order) => order?.user ?? order?.customer ?? {};

const getOrderTotal = (order) =>
  order?.totalPrice ?? order?.totalAmount ?? order?.total ?? 0;

const getOrderItems = (order) => order?.orderItems ?? order?.items ?? [];

const getOrderId = (order) => order?._id ?? order?.id ?? "";

const getShippingAddress = (order) => {
  const address = order?.shippingAddress ?? order?.shippingInfo;

  if (!address) return "No shipping address available";

  if (typeof address === "string") return address;

  return (
    [
      address.fullName ?? address.name,
      address.address,
      address.addressLine,
      address.city,
      address.state,
      address.postalCode ?? address.zipCode,
      address.country,
      address.phone,
    ]
      .filter(Boolean)
      .join(", ") || "No shipping address available"
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await getAllOrders();

      const data = Array.isArray(response)
        ? response
        : (response?.orders ?? response?.data?.orders ?? []);

      setOrders(data);

      setSelectedOrder((current) => {
        if (!current) return current;

        const currentId = getOrderId(current);

        return data.find((order) => getOrderId(order) === currentId) ?? current;
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchOrders();
    }, 0);

    return () => clearTimeout(timerId);
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders;

    return orders.filter((order) => getOrderStatus(order) === activeFilter);
  }, [orders, activeFilter]);

  const handleStatusUpdate = async (order, nextStatus) => {
    const orderId = getOrderId(order);

    if (!orderId || updatingOrderId) return;

    const currentStatus = getOrderStatus(order);
    const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] ?? [];

    if (!allowedStatuses.includes(nextStatus)) {
      toast.error("This status transition is not allowed.");
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const response = await updateOrderStatus(orderId, nextStatus);

      const updatedOrder = response?.order ?? response?.data?.order ?? null;

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          getOrderId(item) === orderId
            ? updatedOrder
              ? { ...item, ...updatedOrder }
              : { ...item, orderStatus: nextStatus }
            : item,
        ),
      );

      setSelectedOrder((current) =>
        current && getOrderId(current) === orderId
          ? updatedOrder
            ? { ...current, ...updatedOrder }
            : { ...current, orderStatus: nextStatus }
          : current,
      );

      toast.success("Order status updated.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update order status.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const summary = useMemo(() => {
    return {
      total: orders.length,
      placed: orders.filter((order) => getOrderStatus(order) === "placed")
        .length,
      processing: orders.filter(
        (order) => getOrderStatus(order) === "processing",
      ).length,
      delivered: orders.filter((order) => getOrderStatus(order) === "delivered")
        .length,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm text-muted">ShopSphere Admin</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Order Management</h1>
            <p className="mt-2 text-sm text-muted">
              Review customer orders and manage their status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(false)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: summary.total },
            { label: "Placed", value: summary.placed },
            { label: "Processing", value: summary.processing },
            { label: "Delivered", value: summary.delivered },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-4 sm:p-5">
            <h2 className="font-semibold">All Orders</h2>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm capitalize transition ${
                    activeFilter === filter
                      ? "bg-primary text-white"
                      : "border border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {filter === "all" ? "All Orders" : filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <p className="text-muted">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
              <FiPackage className="mb-3 text-3xl text-muted" />
              <p className="font-medium">No orders found</p>
              <p className="mt-1 text-sm text-muted">
                There are no orders matching this filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-surface-muted text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const orderId = getOrderId(order);
                    const customer = getCustomer(order);
                    const status = getOrderStatus(order);

                    return (
                      <tr
                        key={orderId}
                        className="transition hover:bg-surface-muted/50"
                      >
                        <td className="px-5 py-4 font-medium">
                          #{orderId.slice(-8).toUpperCase() || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {customer?.name ?? customer?.fullName ?? "Customer"}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {customer?.email ?? "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-muted">
                          {formatDate(order.createdAt ?? order.orderDate)}
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {formatCurrency(getOrderTotal(order))}
                        </td>

                        <td className="px-5 py-4 capitalize">
                          {String(getPaymentStatus(order))}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                              STATUS_STYLES[status] ??
                              "bg-surface-muted text-muted"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            aria-label="View order details"
                            className="rounded-lg border border-border p-2 transition hover:bg-surface-muted"
                          >
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Order Details</p>
                <h2 id="order-dialog-title" className="mt-1 text-xl font-bold">
                  #{getOrderId(selectedOrder).slice(-8).toUpperCase()}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="rounded-lg p-2 hover:bg-surface-muted"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted">Customer</p>
                <p className="mt-1 font-medium">
                  {getCustomer(selectedOrder)?.name ??
                    getCustomer(selectedOrder)?.fullName ??
                    "Customer"}
                </p>
                <p className="mt-1 break-all text-sm text-muted">
                  {getCustomer(selectedOrder)?.email ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted">Order Date</p>
                <p className="mt-1 font-medium">
                  {formatDate(
                    selectedOrder.createdAt ?? selectedOrder.orderDate,
                  )}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-sm text-muted">Shipping Address</p>
                <p className="mt-1 text-sm leading-6">
                  {getShippingAddress(selectedOrder)}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <h3 className="font-semibold">Items</h3>

              <div className="mt-3 space-y-3">
                {getOrderItems(selectedOrder).length === 0 ? (
                  <p className="text-sm text-muted">
                    No item details available.
                  </p>
                ) : (
                  getOrderItems(selectedOrder).map((item, index) => {
                    const product = item.product ?? item;
                    const quantity = item.quantity ?? 1;

                    return (
                      <div
                        key={
                          item._id ??
                          product._id ??
                          `${product.name ?? product.title ?? "item"}-${index}`
                        }
                        className="flex items-start justify-between gap-4 rounded-lg bg-background p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {product.name ?? product.title ?? "Product"}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            Qty: {quantity}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-medium">
                          {formatCurrency(
                            (item.price ?? product.price ?? 0) * quantity,
                          )}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold">Order Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency(getOrderTotal(selectedOrder))}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 text-sm text-muted">Update Order Status</p>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                    STATUS_STYLES[getOrderStatus(selectedOrder)] ??
                    "bg-surface-muted text-muted"
                  }`}
                >
                  {getOrderStatus(selectedOrder)}
                </span>

                {(ALLOWED_TRANSITIONS[getOrderStatus(selectedOrder)] ?? []).map(
                  (nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      disabled={updatingOrderId === getOrderId(selectedOrder)}
                      onClick={() =>
                        handleStatusUpdate(selectedOrder, nextStatus)
                      }
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-medium capitalize text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingOrderId === getOrderId(selectedOrder)
                        ? "Updating..."
                        : `Mark ${nextStatus}`}
                    </button>
                  ),
                )}

                {(ALLOWED_TRANSITIONS[getOrderStatus(selectedOrder)] ?? [])
                  .length === 0 && (
                  <p className="text-sm text-muted">
                    This order has reached its final status.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;
