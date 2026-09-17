import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  ShoppingCart,
  UserRound,
  Hash,
  Trash2,
} from "lucide-react";
import API from "../api/axios";

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status, type = "order") => {
  const value = String(status || "N/A").toLowerCase();

  if (type === "payment") {
    if (["paid", "completed", "success"].includes(value)) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (["pending", "processing", "unpaid"].includes(value)) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (["failed", "cancelled"].includes(value)) {
      return "bg-red-50 text-red-700 border-red-200";
    }
  }

  if (["delivered", "completed"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (["pending", "placed"].includes(value)) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (["shipped", "out for delivery", "processing"].includes(value)) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (["cancelled", "failed"].includes(value)) {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};

const getCustomerName = (order) =>
  order?.user?.name || order?.customerName || "N/A";

const getCustomerEmail = (order) =>
  order?.user?.email || order?.customerEmail || "N/A";

const getCustomerPhone = (order) =>
  order?.user?.phone || order?.customerPhone || "N/A";

const getAddressText = (address) => {
  if (!address) return "N/A";

  return [
    address.street,
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.country,
    address.zipCode,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const adminToken = localStorage.getItem("adminToken");

        if (!adminToken) {
          setError("Please login as admin");
          navigate("/admin/login");
          return;
        }

        const { data } = await API.get(`/admin/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        setOrder(data?.order || null);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          setError("Session expired. Please login again.");
          navigate("/admin/login");
        } else {
          setError(err.response?.data?.message || "Failed to load order details");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, navigate]);

  const items = useMemo(() => {
    return order?.items || order?.orderItems || [];
  }, [order]);

  const shippingAddress = order?.shippingAddress || order?.address || {};

  const subtotal = useMemo(() => {
    if (!order) return 0;
    if (order.subtotal !== undefined && order.subtotal !== null) {
      return Number(order.subtotal || 0);
    }

    return items.reduce((sum, item) => {
      const price = Number(
        item?.price || item?.medicine?.price || item?.product?.price || 0
      );
      const quantity = Number(item?.quantity || 0);
      return sum + price * quantity;
    }, 0);
  }, [order, items]);

  const shippingCharge = Number(
    order?.shippingCharge ?? order?.deliveryCharge ?? 0
  );
  const discount = Number(order?.discountAmount ?? 0);
  const total = Number(order?.totalAmount ?? subtotal + shippingCharge - discount);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Order not found.</p>
      </div>
    );
  }

  const handleDeleteOrder = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete order ${order?.orderId || order?._id}?`)) {
      return;
    }
    try {
      setDeleting(true);
      const adminToken = localStorage.getItem("adminToken");
      await API.delete(`/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      navigate("/admin/orders");
    } catch (err) {
      console.error("Delete order error:", err);
      alert(err?.response?.data?.message || "Failed to delete order");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Order Details</p>
            <h1 className="mt-1 break-all text-2xl font-bold text-slate-900 sm:text-3xl">
              {order.orderId || order._id}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(
                order.paymentStatus,
                "payment"
              )}`}
            >
              Payment: {order.paymentStatus || "N/A"}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(
                order.orderStatus
              )}`}
            >
              Order: {order.orderStatus || "N/A"}
            </span>
            <button
              type="button"
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete Order"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
        <div className="space-y-6 2xl:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">
                Customer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Customer Name</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {getCustomerName(order)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={15} />
                  <span>Phone</span>
                </div>
                <p className="mt-1 font-semibold text-slate-900">
                  {getCustomerPhone(order)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail size={15} />
                  <span>Email</span>
                </div>
                <p className="mt-1 break-all font-semibold text-slate-900">
                  {getCustomerEmail(order)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">
                Delivery Address
              </h2>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm leading-7 text-slate-700">
                {getAddressText(shippingAddress)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingCart className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">
                Ordered Items
              </h2>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-slate-500">No items found in this order.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const itemName =
                    item?.name || item?.medicine?.name || item?.product?.name || "Item";
                  const itemImage =
                    item?.image || item?.medicine?.image || item?.product?.image || "";
                  const itemPrice = Number(
                    item?.price || item?.medicine?.price || item?.product?.price || 0
                  );
                  const quantity = Number(item?.quantity || 0);
                  const lineTotal = itemPrice * quantity;

                  return (
                    <div
                      key={item._id || `${itemName}-${index}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={itemName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <Package size={24} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900">{itemName}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Quantity: {quantity}
                          </p>
                          <p className="text-sm text-slate-500">
                            Unit Price: {formatCurrency(itemPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500">Line Total</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 2xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ReceiptText className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">
                Order Summary
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Shipping Charge</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(shippingCharge)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Discount</span>
                <span className="font-medium text-slate-900">
                  - {formatCurrency(discount)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Details
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Payment Method</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Payment Status</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.paymentStatus || "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Transaction ID</p>
                <p className="mt-1 break-all font-semibold text-slate-900">
                  {order.transactionId || order.paymentId || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="text-blue-600" size={18} />
              <h2 className="text-lg font-semibold text-slate-900">
                Meta Details
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Created At</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Updated At</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(order.updatedAt)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Hash size={15} />
                  <span>Order Reference</span>
                </div>
                <p className="mt-1 break-all font-medium text-slate-900">
                  {order._id}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <BadgeIndianRupee size={15} />
                  <span>Total Amount</span>
                </div>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;