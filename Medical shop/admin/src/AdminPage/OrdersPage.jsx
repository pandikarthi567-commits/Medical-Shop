import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  MapPin,
  RefreshCcw,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import API from "../api/axios";

const DELIVERY_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const getStatusBadge = (status) => {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "OUT_FOR_DELIVERY":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "SHIPPED":
    case "PACKED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "CONFIRMED":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/orders");
      const orderList = res.data?.orders || res.data || [];
      setOrders(Array.isArray(orderList) ? orderList : []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await API.put(`/admin/orders/${orderId}/status`, { deliveryStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, deliveryStatus: newStatus, orderStatus: newStatus }
            : o
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const orderId = String(order.orderId || order._id || "").toLowerCase();
      const customer = String(
        order.customerName || order.user?.name || ""
      ).toLowerCase();
      const phone = String(
        order.customerPhone || order.user?.phone || ""
      ).toLowerCase();

      const matchesSearch =
        !term ||
        orderId.includes(term) ||
        customer.includes(term) ||
        phone.includes(term);

      const matchesStatus =
        statusFilter === "ALL" ||
        String(order.deliveryStatus || order.orderStatus || "").toUpperCase() ===
          statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        (paymentFilter === "PAID"
          ? String(order.paymentStatus || "").toUpperCase() === "PAID"
          : String(order.paymentStatus || "").toUpperCase() !== "PAID");

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-sm text-slate-500">
            Monitor, update delivery progress, and view live tracking for customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders/live-tracking"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <MapPin size={16} /> Live Delivery Map
          </Link>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh orders"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-hidden bg-white text-slate-700"
          >
            <option value="ALL">All Delivery Statuses</option>
            {DELIVERY_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:outline-hidden bg-white text-slate-700"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid Orders</option>
            <option value="UNPAID">Pending / Unpaid</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <RefreshCcw size={28} className="animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-medium">Loading orders data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 space-y-3">
            <AlertCircle size={32} className="mx-auto" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <ShoppingBag size={36} className="mx-auto text-slate-300" />
            <p className="text-base font-semibold text-slate-700">No Orders Found</p>
            <p className="text-xs text-slate-400">
              No orders matched your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Delivery Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const currentStatus =
                    order.deliveryStatus || order.orderStatus || "PENDING";
                  const isPaid =
                    String(order.paymentStatus || "").toUpperCase() === "PAID";

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono font-medium text-slate-800">
                        #{order.orderId || order._id.slice(-6)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {order.customerName || order.user?.name || "Anonymous"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {order.customerPhone || order.user?.phone || "No phone"}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {order.paymentStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          disabled={updatingId === order._id}
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border outline-hidden transition ${getStatusBadge(
                            currentStatus
                          )}`}
                        >
                          {DELIVERY_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="View order details"
                          >
                            <Eye size={16} />
                          </Link>
                          {order.liveLocation ||
                          order.orderStatus === "OUT_FOR_DELIVERY" ||
                          order.deliveryStatus === "OUT_FOR_DELIVERY" ? (
                            <Link
                              to="/admin/orders/live-tracking"
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Live Track Rider"
                            >
                              <MapPin size={16} />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
