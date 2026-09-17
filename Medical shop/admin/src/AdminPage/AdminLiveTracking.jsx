import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Phone,
  Bike,
  Clock3,
  Navigation,
  RefreshCcw,
  ShieldAlert,
  Truck,
  UserRound,
  PackageCheck,
  MapPinned,
  Eye,
  ShoppingBag,
  ListOrdered,
  CreditCard,
  Trash2,
  AlertTriangle,
  UserPlus,
  X,
  Check,
  CheckCircle2,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../api/axios";
import PageTransition, { fadeUpItem } from "./components/PageTransition";
import { adminSocket, connectAdminSocket } from "../socket/adminSocket";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [19.076, 72.8777];

const ORDER_TABS = {
  ALL: "ALL",
  DELIVERY: "DELIVERY",
  NON_DELIVERY: "NON_DELIVERY",
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString("en-IN");
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const getStatusBadge = (status) => {
  const value = String(status || "").toUpperCase().trim();

  if (value === "DELIVERED") return "bg-emerald-50 text-emerald-700";
  if (value === "OUT_FOR_DELIVERY") return "bg-blue-50 text-blue-700";
  if (value === "SHIPPED" || value === "IN_TRANSIT") {
    return "bg-cyan-50 text-cyan-700";
  }
  if (
    value === "FAILED" ||
    value === "NOT_DELIVERED" ||
    value === "CANCELLED" ||
    value === "REJECTED"
  ) {
    return "bg-red-50 text-red-700";
  }
  if (value === "ASSIGNED") return "bg-violet-50 text-violet-700";
  if (value === "PAID" || value === "CONFIRMED") {
    return "bg-emerald-50 text-emerald-700";
  }
  return "bg-amber-50 text-amber-700";
};

const getDeliveryTypeLabel = (order) => {
  return order?.isDelivery ? "Delivery" : "Non-Delivery";
};

const isPaymentSuccessOrder = (order) => {
  const paymentStatus = String(
    order?.paymentStatus ??
      order?.payment?.status ??
      order?.transaction?.status ??
      order?.checkout?.paymentStatus ??
      order?.cashfreePaymentStatus ??
      order?.cashfreeOrderStatus ??
      ""
  )
    .trim()
    .toUpperCase();

  const paymentMethod = String(
    order?.paymentMethod ?? order?.payment_method ?? ""
  )
    .trim()
    .toUpperCase();

  const paymentVerified =
    order?.paymentVerified === true ||
    order?.paymentSuccess === true ||
    order?.isPaid === true ||
    order?.paid === true ||
    order?.payment?.verified === true ||
    order?.payment?.success === true ||
    order?.transaction?.success === true ||
    Boolean(order?.paymentVerifiedAt);

  const successStatuses = [
    "SUCCESS",
    "PAID",
    "COMPLETED",
    "CAPTURED",
    "VERIFIED",
    "PAYMENT_SUCCESS",
  ];

  // Include COD / Cash on Delivery orders
  if (
    paymentMethod === "COD" ||
    paymentMethod === "CASH_ON_DELIVERY" ||
    paymentMethod === "CASH"
  ) {
    return true;
  }

  // Reject unpaid pending orders
  if (paymentStatus === "PENDING" && !paymentVerified) {
    return false;
  }

  return paymentVerified || successStatuses.includes(paymentStatus);
};

const isDummyOrder = (order) => {
  const id = String(order?.orderId || order?._id || "").toUpperCase().trim();
  const customer = String(
    order?.customerName || order?.user?.name || ""
  ).toLowerCase().trim();
  const rider = String(order?.tracking?.rider?.name || "").toLowerCase().trim();

  if (
    id.includes("INV-000123") ||
    id.startsWith("DUMMY-") ||
    id.startsWith("DEMO-") ||
    id.startsWith("MOCK-")
  ) {
    return true;
  }
  if (
    customer === "walk-in customer" ||
    customer.includes("demo customer") ||
    customer.includes("test customer")
  ) {
    return true;
  }
  if (rider.includes("murugan express")) return true;
  return false;
};

const normalizeOrder = (order) => {
  const lat = toNumber(
    order?.tracking?.liveLocation?.lat ??
      order?.tracking?.liveLocation?.latitude
  );

  const lng = toNumber(
    order?.tracking?.liveLocation?.lng ??
      order?.tracking?.liveLocation?.lon ??
      order?.tracking?.liveLocation?.longitude
  );

  const rawDeliveryType = String(
    order?.deliveryType ??
      order?.orderType ??
      order?.fulfillmentType ??
      order?.serviceType ??
      ""
  )
    .trim()
    .toUpperCase();

  const isDelivery =
    order?.isDelivery === true ||
    rawDeliveryType === "DELIVERY" ||
    rawDeliveryType === "HOME_DELIVERY" ||
    rawDeliveryType === "DOOR_DELIVERY" ||
    Boolean(order?.tracking) ||
    Boolean(order?.deliveryAddress);

  return {
    ...order,
    _id: order?._id || order?.id || order?.orderId || "",
    orderId: order?.orderId || order?._id || order?.id || "N/A",
    totalAmount:
      Number(order?.totalAmount ?? order?.amount ?? order?.grandTotal ?? 0) || 0,
    customerName:
      order?.customerName ||
      order?.user?.name ||
      order?.customer?.name ||
      "N/A",
    customerPhone:
      order?.customerPhone ||
      order?.user?.phone ||
      order?.customer?.phone ||
      order?.phone ||
      "N/A",
    adminPhone:
      order?.adminPhone ||
      order?.admin?.phone ||
      order?.assignedAdmin?.phone ||
      order?.store?.phone ||
      order?.branch?.phone ||
      "N/A",
    orderStatus:
      order?.orderStatus || order?.status || order?.currentStatus || "N/A",
    deliveryStatus:
      order?.deliveryStatus ||
      order?.tracking?.status ||
      order?.shippingStatus ||
      "N/A",
    paymentStatus:
      order?.paymentStatus ||
      order?.payment?.status ||
      order?.transaction?.status ||
      order?.checkout?.paymentStatus ||
      "N/A",
    paymentVerified:
      order?.paymentVerified === true ||
      order?.paymentSuccess === true ||
      order?.isPaid === true ||
      order?.paid === true ||
      order?.payment?.verified === true ||
      order?.payment?.success === true ||
      order?.transaction?.success === true,
    createdAt: order?.createdAt || order?.placedAt || order?.date || null,
    updatedAt: order?.updatedAt || order?.trackingUpdatedAt || null,
    deliveryType: rawDeliveryType || (isDelivery ? "DELIVERY" : "NON_DELIVERY"),
    isDelivery,
    deliveryAddress:
      order?.deliveryAddress ||
      order?.shippingAddress ||
      order?.address ||
      null,
    tracking: {
      ...order?.tracking,
      status: order?.tracking?.status || order?.deliveryStatus || "N/A",
      etaMinutes: order?.tracking?.etaMinutes ?? order?.etaMinutes ?? null,
      rider: {
        ...order?.tracking?.rider,
        name: order?.tracking?.rider?.name || order?.rider?.name || "Not assigned",
        phone: order?.tracking?.rider?.phone || order?.rider?.phone || "N/A",
        vehicleType:
          order?.tracking?.rider?.vehicleType ||
          order?.rider?.vehicleType ||
          "Vehicle",
        vehicleNumber:
          order?.tracking?.rider?.vehicleNumber ||
          order?.rider?.vehicleNumber ||
          "",
      },
      liveLocation: {
        ...order?.tracking?.liveLocation,
        lat,
        lng,
        accuracy: order?.tracking?.liveLocation?.accuracy ?? null,
        speed: order?.tracking?.liveLocation?.speed ?? null,
        heading: order?.tracking?.liveLocation?.heading ?? null,
        updatedAt:
          order?.tracking?.liveLocation?.updatedAt || order?.updatedAt || null,
      },
    },
  };
};

const mergeOrderData = (previous, incoming) => {
  const prev = normalizeOrder(previous || {});
  const next = normalizeOrder(incoming || {});

  return {
    ...prev,
    ...next,
    tracking: {
      ...prev.tracking,
      ...next.tracking,
      rider: {
        ...prev.tracking?.rider,
        ...next.tracking?.rider,
      },
      liveLocation: {
        ...prev.tracking?.liveLocation,
        ...next.tracking?.liveLocation,
      },
    },
  };
};

const getOrderIdentity = (order) => order?._id || order?.orderId || "";

const getStoredAdminToken = () => {
  try {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("adminToken") || "";
  } catch {
    return "";
  }
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      isValidCoordinate(center[0], center[1])
    ) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);

  return null;
};

const StatCard = ({ icon, title, value, subValue, iconClass = "" }) => {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-2xl p-3 ${iconClass}`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      {subValue ? <p className="mt-1 text-sm text-slate-500">{subValue}</p> : null}
    </div>
  );
};

const TabButton = ({ active, label, count, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          active ? "bg-white/15 text-white" : "bg-white text-slate-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
};

const AdminLiveTracking = () => {
  const abortRef = useRef(null);
  const mountedRef = useRef(false);

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(ORDER_TABS.ALL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [error, setError] = useState("");

  // Delivery Boy Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [fleetRiders, setFleetRiders] = useState([]);
  const [selectedFleetRider, setSelectedFleetRider] = useState(null);
  const [assignTab, setAssignTab] = useState("FLEET"); // "FLEET" | "CUSTOM"
  const [customRider, setCustomRider] = useState({
    name: "",
    phone: "",
    vehicleType: "Motorcycle (Express)",
    vehicleNumber: "",
  });
  const [assignEta, setAssignEta] = useState(30);
  const [assignStatus, setAssignStatus] = useState("ASSIGNED");

  const fetchFleetRiders = async () => {
    try {
      const res = await API.get("/riders");
      if (res.data?.success) {
        const list = res.data.riders || [];
        setFleetRiders(list);
        if (list.length > 0) {
          setSelectedFleetRider(list[0]);
          setAssignTab("FLEET");
        } else {
          setAssignTab("CUSTOM");
        }
      }
    } catch (err) {
      console.error("Failed to load riders:", err);
      setAssignTab("CUSTOM");
    }
  };

  const handleOpenAssignModal = () => {
    fetchFleetRiders();
    setShowAssignModal(true);
  };

  const handleAssignRiderSubmit = async (e) => {
    e.preventDefault();
    const orderIdToAssign = selectedOrder?.orderId || selectedOrder?._id;
    if (!orderIdToAssign) return;

    const riderPayload =
      assignTab === "FLEET" && selectedFleetRider
        ? {
            riderId: selectedFleetRider._id,
            name: selectedFleetRider.name,
            phone: selectedFleetRider.phone,
            vehicleNumber: selectedFleetRider.vehicleNumber,
            vehicleType: selectedFleetRider.vehicleType,
            etaMinutes: Number(assignEta) || 30,
          }
        : {
            name: customRider.name,
            phone: customRider.phone,
            vehicleNumber: customRider.vehicleNumber,
            vehicleType: customRider.vehicleType,
            etaMinutes: Number(assignEta) || 30,
          };

    if (!riderPayload.name || !riderPayload.phone) {
      alert("Please provide the delivery driver's name and contact phone number.");
      return;
    }

    try {
      setAssignLoading(true);
      const res = await API.put(`/tracking/${orderIdToAssign}/assign-rider`, riderPayload);

      if (assignStatus === "OUT_FOR_DELIVERY") {
        await API.put(`/tracking/${orderIdToAssign}`, {
          deliveryStatus: "OUT_FOR_DELIVERY",
          orderStatus: "OUT_FOR_DELIVERY",
        });
      }

      const updated = res.data?.order || {
        ...selectedOrder,
        deliveryStatus: assignStatus === "OUT_FOR_DELIVERY" ? "OUT_FOR_DELIVERY" : "ASSIGNED",
        tracking: {
          ...selectedOrder.tracking,
          etaMinutes: Number(assignEta) || 30,
          rider: riderPayload,
        },
      };

      setOrders((prev) =>
        prev.map((o) =>
          getOrderIdentity(o) === getOrderIdentity(selectedOrder)
            ? normalizeOrder({ ...o, ...updated })
            : o
        )
      );

      setShowAssignModal(false);
    } catch (err) {
      console.error("Failed to assign rider:", err);
      alert(err?.response?.data?.message || "Failed to assign delivery boy");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassignRider = async () => {
    const orderIdToUnassign = selectedOrder?.orderId || selectedOrder?._id;
    if (!orderIdToUnassign) return;
    if (!window.confirm("Remove assigned delivery driver from this order?")) return;

    try {
      setAssignLoading(true);
      await API.put(`/tracking/${orderIdToUnassign}`, {
        rider: { name: "Not assigned", phone: "N/A", vehicleNumber: "", vehicleType: "Vehicle", riderId: null },
        deliveryStatus: "PENDING",
      });

      setOrders((prev) =>
        prev.map((o) =>
          getOrderIdentity(o) === getOrderIdentity(selectedOrder)
            ? normalizeOrder({
                ...o,
                deliveryStatus: "PENDING",
                tracking: {
                  ...o.tracking,
                  rider: { name: "Not assigned", phone: "N/A", vehicleType: "Vehicle", vehicleNumber: "" },
                },
              })
            : o
        )
      );
    } catch (err) {
      console.error("Failed to unassign driver:", err);
      alert(err?.response?.data?.message || "Failed to unassign driver");
    } finally {
      setAssignLoading(false);
    }
  };

  const fetchTrackingOrders = useCallback(async (isRefresh = false) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const { data } = await API.get("/admin/orders/live-tracking", {
        signal: controller.signal,
      });

      if (!mountedRef.current) return;

      const rawOrders = Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data)
        ? data
        : [];

      const fetchedOrders = rawOrders
        .map(normalizeOrder)
        .filter((order) => !isDummyOrder(order) && isPaymentSuccessOrder(order));

      setOrders(fetchedOrders);

      setSelectedOrderId((prev) => {
        if (
          prev &&
          fetchedOrders.some((item) => getOrderIdentity(item) === prev)
        ) {
          return prev;
        }
        return getOrderIdentity(fetchedOrders[0]) || "";
      });
    } catch (err) {
      if (
        err?.name === "AbortError" ||
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error("Tracking fetch error:", err);

      if (!mountedRef.current) return;

      setOrders([]);
      setSelectedOrderId("");
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load payment-confirmed order data"
      );
    } finally {
      if (!mountedRef.current) return;

      if (abortRef.current === controller) {
        abortRef.current = null;
      }

      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleClearAllOrders = async () => {
    try {
      setClearing(true);
      await API.delete("/admin/orders/clear-all");
      setOrders([]);
      setSelectedOrderId("");
      setShowClearConfirm(false);
    } catch (err) {
      console.error("Failed to clear orders:", err);
      alert(err?.response?.data?.message || "Failed to clear all orders");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!orderId) return;
    try {
      setDeletingId(orderId);
      await API.delete(`/admin/orders/${orderId}`);
      setOrders((prev) => prev.filter((o) => getOrderIdentity(o) !== orderId));
      setSelectedOrderId((prev) => {
        if (prev === orderId) {
          const remaining = orders.filter((o) => getOrderIdentity(o) !== orderId);
          return getOrderIdentity(remaining[0]) || "";
        }
        return prev;
      });
      setOrderToDelete(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert(err?.response?.data?.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchTrackingOrders();

    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [fetchTrackingOrders]);

  useEffect(() => {
    const token = getStoredAdminToken();
    if (!token) return;

    connectAdminSocket(token);

    const joinRoom = () => {
      adminSocket.emit("join-admin-room");
    };

    const handleTrackingUpdate = (payload) => {
      const incoming = normalizeOrder(payload);

      if (isDummyOrder(incoming) || !isPaymentSuccessOrder(incoming)) return;

      setOrders((prev) => {
        const incomingId = getOrderIdentity(incoming);
        const index = prev.findIndex(
          (item) => getOrderIdentity(item) === incomingId
        );

        if (index === -1) {
          return [incoming, ...prev];
        }

        const merged = mergeOrderData(prev[index], incoming);
        const next = [...prev];
        next[index] = merged;
        return next;
      });

      setSelectedOrderId((prev) => prev || getOrderIdentity(incoming));
    };

    adminSocket.on("connect", joinRoom);
    adminSocket.on("admin-order-updated", handleTrackingUpdate);
    adminSocket.on("delivery-location-updated", handleTrackingUpdate);

    if (adminSocket.connected) {
      joinRoom();
    }

    return () => {
      adminSocket.off("connect", joinRoom);
      adminSocket.off("admin-order-updated", handleTrackingUpdate);
      adminSocket.off("delivery-location-updated", handleTrackingUpdate);
    };
  }, []);

  const orderCounts = useMemo(() => {
    const delivery = orders.filter((item) => item?.isDelivery).length;
    const nonDelivery = orders.filter((item) => !item?.isDelivery).length;

    return {
      all: orders.length,
      delivery,
      nonDelivery,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let nextOrders = orders;

    if (activeTab === ORDER_TABS.DELIVERY) {
      nextOrders = nextOrders.filter((order) => order?.isDelivery);
    } else if (activeTab === ORDER_TABS.NON_DELIVERY) {
      nextOrders = nextOrders.filter((order) => !order?.isDelivery);
    }

    if (!query) return nextOrders;

    return nextOrders.filter((order) => {
      const searchableValues = [
        order?._id,
        order?.orderId,
        order?.customerName,
        order?.customerPhone,
        order?.adminPhone,
        order?.tracking?.rider?.name,
        order?.tracking?.rider?.phone,
        order?.orderStatus,
        order?.deliveryStatus,
        order?.deliveryType,
        order?.paymentStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableValues.includes(query);
    });
  }, [orders, activeTab, searchTerm]);

  const selectedOrder = useMemo(() => {
    const match = filteredOrders.find(
      (item) => getOrderIdentity(item) === selectedOrderId
    );
    return match || filteredOrders[0] || null;
  }, [filteredOrders, selectedOrderId]);

  useEffect(() => {
    if (!filteredOrders.length) {
      setSelectedOrderId("");
      return;
    }

    const exists = filteredOrders.some(
      (item) => getOrderIdentity(item) === selectedOrderId
    );

    if (!exists) {
      setSelectedOrderId(getOrderIdentity(filteredOrders[0]));
    }
  }, [filteredOrders, selectedOrderId]);

  const selectedLocation = useMemo(() => {
    const lat = selectedOrder?.tracking?.liveLocation?.lat;
    const lng = selectedOrder?.tracking?.liveLocation?.lng;

    if (selectedOrder?.isDelivery && isValidCoordinate(lat, lng)) {
      return [lat, lng];
    }

    return null;
  }, [selectedOrder]);

  const mapCenter = selectedLocation || DEFAULT_CENTER;

  if (loading) {
    return (
      <PageTransition className="space-y-6">
        <div className="w-full">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`skeleton-order-${i}`}
                    className="rounded-2xl border border-slate-100 p-4"
                  >
                    <div className="mb-3 h-4 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="mb-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-[520px] rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition className="space-y-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                Failed to load orders page
              </h2>
              <p className="mt-2 font-medium text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => fetchTrackingOrders()}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="w-full">
        <motion.div
          variants={fadeUpItem}
          initial="initial"
          animate="animate"
          className="mb-8 overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-sm backdrop-blur-md"
        >
          <div className="flex flex-col gap-5 px-6 py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                <Truck size={16} />
                Admin Orders & Live Tracking
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Payment success orders, details, and delivery tracking
              </h1>

              <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
                View only payment-confirmed successful orders, switch between
                delivery and non-delivery orders, inspect full order details,
                and track live rider location for active delivery orders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fetchTrackingOrders(true)}
                disabled={refreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh Orders"}
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={clearing || orders.length === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={16} />
                {clearing ? "Clearing..." : "Clear All Orders"}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUpItem}
          initial="initial"
          animate="animate"
          className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4"
        >
          <StatCard
            icon={<ListOrdered size={22} />}
            title="All Orders"
            value={orderCounts.all}
            subValue="Payment success order list"
            iconClass="bg-slate-100 text-slate-700"
          />
          <StatCard
            icon={<Truck size={22} />}
            title="Delivery Orders"
            value={orderCounts.delivery}
            subValue="Successful delivery orders"
            iconClass="bg-cyan-50 text-cyan-700"
          />
          <StatCard
            icon={<ShoppingBag size={22} />}
            title="Non-Delivery Orders"
            value={orderCounts.nonDelivery}
            subValue="Successful pickup or other orders"
            iconClass="bg-amber-50 text-amber-700"
          />
          <StatCard
            icon={<CreditCard size={22} />}
            title="Confirmed Payments"
            value={orders.length}
            subValue="Filtered payment-success orders"
            iconClass="bg-emerald-50 text-emerald-700"
          />
        </motion.div>

        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 inline-flex rounded-3xl bg-cyan-50 p-6 text-cyan-600">
              <Truck size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              No Active Live Orders
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              When users place orders on the medical shop, their order details,
              payment confirmations, and live delivery coordinates will appear
              here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <motion.div
              variants={fadeUpItem}
              initial="initial"
              animate="animate"
              className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <TabButton
                  label="All"
                  count={orderCounts.all}
                  active={activeTab === ORDER_TABS.ALL}
                  onClick={() => setActiveTab(ORDER_TABS.ALL)}
                />
                <TabButton
                  label="Delivery"
                  count={orderCounts.delivery}
                  active={activeTab === ORDER_TABS.DELIVERY}
                  onClick={() => setActiveTab(ORDER_TABS.DELIVERY)}
                />
                <TabButton
                  label="Non-Delivery"
                  count={orderCounts.nonDelivery}
                  active={activeTab === ORDER_TABS.NON_DELIVERY}
                  onClick={() => setActiveTab(ORDER_TABS.NON_DELIVERY)}
                />
              </div>

              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Orders List
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and choose a payment-success order
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {filteredOrders.length}
                </div>
              </div>

              <div className="relative mb-4">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by order ID, customer, rider, phone..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  {searchTerm
                    ? "No successful payment orders match your search."
                    : "No payment-success orders found in this tab."}
                </div>
              ) : (
                <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
                  {filteredOrders.map((order, index) => {
                    const orderKey = getOrderIdentity(order) || `order-${index}`;
                    const active = selectedOrderId === getOrderIdentity(order);
                    const hasLocation =
                      order?.isDelivery &&
                      isValidCoordinate(
                        order?.tracking?.liveLocation?.lat,
                        order?.tracking?.liveLocation?.lng
                      );

                    return (
                      <div
                        key={orderKey}
                        className={`group relative w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-cyan-200 bg-cyan-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrderId(getOrderIdentity(order))
                          }
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {order?.orderId || "N/A"}
                              </p>
                              <p className="mt-1 truncate text-sm text-slate-600">
                                {order?.customerName || "N/A"}
                              </p>
                            </div>

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusBadge(
                                order?.deliveryStatus || order?.orderStatus
                              )}`}
                            >
                              {order?.deliveryStatus ||
                                order?.orderStatus ||
                                "N/A"}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                            <p>Total: {formatCurrency(order?.totalAmount)}</p>
                            <p>Type: {getDeliveryTypeLabel(order)}</p>
                            <p className="truncate">
                              Payment: {order?.paymentStatus || "N/A"}
                            </p>
                            <p>{hasLocation ? "GPS Active" : "No GPS"}</p>
                            <p className="truncate">
                              Rider:{" "}
                              {order?.tracking?.rider?.name || "Not assigned"}
                            </p>
                            <p className="truncate">
                              Customer: {order?.customerPhone || "N/A"}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
                          className="absolute bottom-3 right-3 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          title="Delete this order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <div className="space-y-6">
              <motion.div
                variants={fadeUpItem}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-6 lg:grid-cols-4"
              >
                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <UserRound size={22} />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          selectedOrder?.tracking?.rider?.name &&
                          selectedOrder.tracking.rider.name !== "Not assigned"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {selectedOrder?.tracking?.rider?.name &&
                        selectedOrder.tracking.rider.name !== "Not assigned"
                          ? "Assigned"
                          : "Unassigned"}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">
                      Driver
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <UserRound size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-900">
                          {selectedOrder?.tracking?.rider?.name || "Not assigned"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-slate-400" />
                          <span>
                            {selectedOrder?.tracking?.rider?.phone || "N/A"}
                          </span>
                        </div>
                        {selectedOrder?.tracking?.rider?.phone &&
                          selectedOrder.tracking.rider.phone !== "N/A" && (
                            <a
                              href={`tel:${selectedOrder.tracking.rider.phone}`}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-bold flex items-center gap-1"
                              title="Call Driver"
                            >
                              <Phone size={11} />
                              <span>Call</span>
                            </a>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Bike size={16} className="text-slate-400" />
                        <span>
                          {selectedOrder?.tracking?.rider?.vehicleType ||
                            "Vehicle"}
                          {selectedOrder?.tracking?.rider?.vehicleNumber
                            ? ` • ${selectedOrder.tracking.rider.vehicleNumber}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAssignModal}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Bike size={14} />
                      <span>
                        {selectedOrder?.tracking?.rider?.name &&
                        selectedOrder.tracking.rider.name !== "Not assigned"
                          ? "Change Driver"
                          : "Assign Delivery Boy"}
                      </span>
                    </button>
                    {selectedOrder?.tracking?.rider?.name &&
                      selectedOrder.tracking.rider.name !== "Not assigned" && (
                        <button
                          type="button"
                          onClick={handleUnassignRider}
                          disabled={assignLoading}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition text-xs font-bold"
                          title="Unassign Driver"
                        >
                          <X size={15} />
                        </button>
                      )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700">
                    <Clock3 size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Status
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>
                      Type:{" "}
                      <span className="font-semibold text-slate-800">
                        {getDeliveryTypeLabel(selectedOrder)}
                      </span>
                    </p>
                    <p>
                      ETA:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.isDelivery
                          ? selectedOrder?.tracking?.etaMinutes != null
                            ? `${selectedOrder.tracking.etaMinutes} min`
                            : "N/A"
                          : "Not applicable"}
                      </span>
                    </p>
                    <p>
                      Order:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.orderStatus || "N/A"}
                      </span>
                    </p>
                    <p>
                      Delivery:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.deliveryStatus || "N/A"}
                      </span>
                    </p>
                    <p>
                      Payment:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.paymentStatus || "N/A"}
                      </span>
                    </p>
                    <p>
                      Last updated:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatDateTime(
                          selectedOrder?.tracking?.liveLocation?.updatedAt ||
                            selectedOrder?.updatedAt
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <PackageCheck size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Order
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>
                      Order ID:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.orderId || "N/A"}
                      </span>
                    </p>
                    <p>
                      Customer:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.customerName || "N/A"}
                      </span>
                    </p>
                    <p>
                      Phone:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.customerPhone || "N/A"}
                      </span>
                    </p>
                    <p>
                      Total:{" "}
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(selectedOrder?.totalAmount)}
                      </span>
                    </p>
                    <p>
                      Admin Phone:{" "}
                      <span className="font-semibold text-slate-800">
                        {selectedOrder?.adminPhone || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                    <Eye size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    User Order View
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p>Selected user's placed order details and actions.</p>
                    {selectedOrder?._id ? (
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/admin/orders/${selectedOrder._id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-black"
                        >
                          <Eye size={14} />
                          View Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(selectedOrder)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Delete Order
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-100 px-4 py-2 text-slate-500 text-xs">
                        No order selected
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpItem}
                initial="initial"
                animate="animate"
                className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Live Tracking Map
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Live GPS is available only for delivery orders with rider
                      coordinates
                    </p>
                  </div>

                  {selectedLocation && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedLocation[0]},${selectedLocation[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
                    >
                      <Navigation size={16} />
                      Open in Maps
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="h-[420px] min-h-[420px] w-full">
                    {selectedLocation ? (
                      <MapContainer
                        center={mapCenter}
                        zoom={15}
                        scrollWheelZoom
                        style={{ width: "100%", height: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <RecenterMap center={mapCenter} />
                        <Marker position={selectedLocation}>
                          <Popup>
                            <div className="text-sm">
                              <p className="font-semibold">
                                {selectedOrder?.tracking?.rider?.name ||
                                  "Rider"}
                              </p>
                              <p>Order: {selectedOrder?.orderId || "N/A"}</p>
                              <p>
                                Updated:{" "}
                                {formatDateTime(
                                  selectedOrder?.tracking?.liveLocation
                                    ?.updatedAt
                                )}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-50 p-8 text-center">
                        <div>
                          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-slate-100 p-4 text-slate-500">
                            <MapPinned size={26} />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            {selectedOrder?.isDelivery
                              ? "Live location not available"
                              : "Tracking not available for non-delivery order"}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {selectedOrder?.isDelivery
                              ? "This delivery order does not have valid latitude and longitude yet."
                              : "Only delivery orders with rider GPS data can be shown on the live map."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-l border-slate-100 p-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      GPS Details
                    </h3>

                    <div className="mt-5 space-y-4 text-sm text-slate-600">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 text-cyan-600" />
                        <div>
                          <p className="font-medium text-slate-800">
                            Latitude
                          </p>
                          <p>
                            {selectedOrder?.tracking?.liveLocation?.lat ??
                              "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 text-cyan-600" />
                        <div>
                          <p className="font-medium text-slate-800">
                            Longitude
                          </p>
                          <p>
                            {selectedOrder?.tracking?.liveLocation?.lng ??
                              "N/A"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">Accuracy</p>
                        <p>
                          {selectedOrder?.tracking?.liveLocation?.accuracy ??
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">Speed</p>
                        <p>
                          {selectedOrder?.tracking?.liveLocation?.speed ??
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">Heading</p>
                        <p>
                          {selectedOrder?.tracking?.liveLocation?.heading ??
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">Updated At</p>
                        <p>
                          {formatDateTime(
                            selectedOrder?.tracking?.liveLocation?.updatedAt
                          )}
                        </p>
                      </div>

                      {selectedOrder?.deliveryAddress ? (
                        <div>
                          <p className="font-medium text-slate-800">
                            Delivery Address
                          </p>
                          <p>
                            {typeof selectedOrder.deliveryAddress === "string"
                              ? selectedOrder.deliveryAddress
                              : [
                                  selectedOrder.deliveryAddress?.street,
                                  selectedOrder.deliveryAddress?.area,
                                  selectedOrder.deliveryAddress?.city,
                                  selectedOrder.deliveryAddress?.state,
                                  selectedOrder.deliveryAddress?.pincode,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Clear All Orders Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <div className="rounded-2xl bg-red-50 p-3">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Clear All Orders?
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              This will permanently delete all orders from the database and
              clear the live tracking list. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllOrders}
                disabled={clearing}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {clearing ? "Clearing..." : "Yes, Clear All Orders"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Boy Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-700">
                  <Bike size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assign Delivery Boy
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order #{selectedOrder?.orderId || selectedOrder?._id} • {selectedOrder?.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAssignTab("FLEET")}
                className={`py-2 rounded-xl transition ${
                  assignTab === "FLEET"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Select Fleet Driver ({fleetRiders.length})
              </button>
              <button
                type="button"
                onClick={() => setAssignTab("CUSTOM")}
                className={`py-2 rounded-xl transition ${
                  assignTab === "CUSTOM"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Enter New Driver Details
              </button>
            </div>

            <form onSubmit={handleAssignRiderSubmit} className="space-y-4 text-xs">
              {assignTab === "FLEET" ? (
                <div className="space-y-2.5">
                  <label className="block font-bold text-slate-700">
                    Available Delivery Drivers
                  </label>
                  {fleetRiders.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                      <p>Loading fleet drivers or no drivers registered.</p>
                      <button
                        type="button"
                        onClick={() => setAssignTab("CUSTOM")}
                        className="mt-2 text-emerald-600 font-bold hover:underline"
                      >
                        Enter driver details manually
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {fleetRiders.map((rider) => {
                        const isSelected =
                          selectedFleetRider?._id === rider._id ||
                          selectedFleetRider?.name === rider.name;

                        return (
                          <div
                            key={rider._id || rider.name}
                            onClick={() => setSelectedFleetRider(rider)}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                                  isSelected
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {rider.name ? rider.name.charAt(0).toUpperCase() : "D"}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{rider.name}</h4>
                                <p className="text-[11px] text-slate-500">
                                  {rider.phone} • {rider.vehicleType}
                                  {rider.vehicleNumber ? ` (${rider.vehicleNumber})` : ""}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  rider.status === "AVAILABLE" && rider.active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {rider.status === "AVAILABLE" && rider.active
                                  ? "Available"
                                  : "On Delivery"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Driver Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customRider.name}
                      onChange={(e) =>
                        setCustomRider({ ...customRider, name: e.target.value })
                      }
                      placeholder="e.g. Murugan K."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Driver Phone *
                      </label>
                      <input
                        type="text"
                        required
                        value={customRider.phone}
                        onChange={(e) =>
                          setCustomRider({ ...customRider, phone: e.target.value })
                        }
                        placeholder="e.g. +91 98421 55678"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Vehicle Type
                      </label>
                      <input
                        type="text"
                        value={customRider.vehicleType}
                        onChange={(e) =>
                          setCustomRider({
                            ...customRider,
                            vehicleType: e.target.value,
                          })
                        }
                        placeholder="Motorcycle / Scooter"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Vehicle Registration Plate
                    </label>
                    <input
                      type="text"
                      value={customRider.vehicleNumber}
                      onChange={(e) =>
                        setCustomRider({
                          ...customRider,
                          vehicleNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. TN-67-AX-4092"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estimated Delivery ETA
                  </label>
                  <select
                    value={assignEta}
                    onChange={(e) => setAssignEta(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value={15}>15 Minutes Express</option>
                    <option value={30}>30 Minutes Standard</option>
                    <option value={45}>45 Minutes Express</option>
                    <option value={60}>60 Minutes Doorstep</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dispatch Stage
                  </label>
                  <select
                    value={assignStatus}
                    onChange={(e) => setAssignStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="ASSIGNED">Assign Driver (Confirmed)</option>
                    <option value="OUT_FOR_DELIVERY">
                      Assign &amp; Mark Out for Delivery
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Bike size={16} />
                  <span>{assignLoading ? "Assigning..." : "Confirm & Assign Driver"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Order Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3 text-red-600">
              <div className="rounded-2xl bg-red-50 p-3">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Delete Order?
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to remove order{" "}
              <span className="font-bold text-slate-800">
                {orderToDelete.orderId || orderToDelete._id}
              </span>{" "}
              ({orderToDelete.customerName || "Customer"})? This will remove it
              permanently from the database.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDeleteOrder(
                    orderToDelete._id || orderToDelete.orderId
                  )
                }
                disabled={deletingId === (orderToDelete._id || orderToDelete.orderId)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? "Deleting..." : "Yes, Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default AdminLiveTracking;