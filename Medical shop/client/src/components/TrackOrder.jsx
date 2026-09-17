/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PackageCheck,
  MapPin,
  Clock3,
  CircleCheck,
  CircleDashed,
  CircleX,
  LoaderCircle,
  CreditCard,
  Truck,
  Home,
  ReceiptText,
  User,
  Navigation,
  Phone,
  Bike,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Pill,
  Building2,
  Check,
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../api/axios";
import { socket } from "../socket";
import { getImageUrl } from "../utils/imageUrl";

// Known city centroids for delivery mapping fallback
const CITY_COORDINATES = {
  virudhunagar: [9.5680, 77.9624],
  madurai: [9.9252, 78.1198],
  chennai: [13.0827, 80.2707],
  coimbatore: [11.0168, 76.9558],
  trichy: [10.7905, 78.7047],
  tiruchirappalli: [10.7905, 78.7047],
  salem: [11.6643, 78.1460],
  tirunelveli: [8.7139, 77.7567],
  thoothukudi: [8.7642, 78.1348],
  tuticorin: [8.7642, 78.1348],
  dindigul: [10.3673, 77.9803],
  thanjavur: [10.7870, 79.1378],
  vellore: [12.9165, 79.1325],
  default: [9.5680, 77.9624],
};

const DISPENSARY_HUB_COORDS = [9.5820, 77.9580]; // Central Virudhunagar Hub

// Custom Leaflet Icons
const pharmacyIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div style="background:#059669;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(5,150,105,0.4);border:3px solid white;font-size:18px;">🏥</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

const riderIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div style="background:#0284c7;color:white;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(2,132,199,0.5);border:3px solid white;font-size:20px;animation:pulse 2s infinite;">🛵</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -22],
});

const destinationIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div style="background:#e11d48;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(225,29,72,0.4);border:3px solid white;font-size:18px;">🏠</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

const STATUS_LABELS = {
  PLACED: "Order Placed",
  CONFIRMED: "Prescription Confirmed",
  PROCESSING: "Preparing Medicines",
  PACKED: "Packed & Sealed",
  SHIPPED: "Dispatched to Courier",
  OUT_FOR_DELIVERY: "Out for Express Delivery",
  DELIVERED: "Successfully Delivered",
  CANCELLED: "Order Cancelled",
  NOT_DELIVERED: "Delivery Attempt Failed",
  FAILED: "Payment Failed",
  PENDING: "Pending",
  PAID: "Payment Confirmed",
  COD: "Cash on Delivery",
  UNKNOWN: "Processing",
};

const isValidCoordinate = (value) =>
  typeof value === "number" && Number.isFinite(value) && Math.abs(value) > 0.5;

const safeUpper = (value, fallback = "UNKNOWN") =>
  String(value || fallback).trim().toUpperCase();

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const resolvePaymentStatus = (order) => {
  const method = safeUpper(
    order?.paymentMethod ||
      order?.payment_method ||
      order?.payment?.method ||
      ""
  );

  if (method === "COD" || method === "CASH_ON_DELIVERY") {
    return "COD";
  }

  if (
    order?.paymentStatus === "PAID" ||
    order?.cashfreePaymentStatus === "PAID" ||
    order?.cashfreeOrderStatus === "PAID" ||
    order?.isPaid === true ||
    order?.paid === true ||
    order?.paymentVerifiedAt
  ) {
    return "PAID";
  }

  const candidates = [
    order?.payment_status,
    order?.paymentStatus,
    order?.payment?.status,
    order?.cashfree?.payment_status,
    order?.cashfreePaymentStatus,
    order?.cashfreeOrderStatus,
    order?.cashfree?.order_status,
    order?.cashfreeOrder?.order_status,
    order?.order_status,
  ]
    .map((value) => safeUpper(value, ""))
    .filter(Boolean);

  if (
    candidates.some((status) =>
      ["PAID", "SUCCESS", "PAYMENT_SUCCESS", "COMPLETED", "CAPTURED"].includes(status)
    )
  ) {
    return "PAID";
  }

  if (
    candidates.some((status) =>
      ["FAILED", "EXPIRED", "TERMINATED", "CANCELLED"].includes(status)
    )
  ) {
    return "FAILED";
  }

  if (
    order?.transactionId ||
    order?.cfTransactionId ||
    order?.cashfreeReferenceId ||
    order?.cfOrderId ||
    ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
      safeUpper(order?.orderStatus)
    )
  ) {
    return "PAID";
  }

  return "PAID";
};

const getPaymentModeLabel = (method = "") => {
  const m = safeUpper(method, "");
  if (m === "COD" || m === "CASH_ON_DELIVERY") {
    return "Cash on Delivery (COD)";
  }
  if (m.includes("UPI")) {
    return "Cashfree (Instant UPI Pay)";
  }
  if (m.includes("CARD") || m.includes("DEBIT") || m.includes("CREDIT")) {
    return "Cashfree (Debit / Credit Card)";
  }
  if (m.includes("NETBANKING") || m.includes("NET_BANKING")) {
    return "Cashfree (Net Banking)";
  }
  return "Cashfree (UPI / Card / NetBanking)";
};

const RecenterMap = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
    }
  }, [bounds, map]);
  return null;
};

const LiveTrackingMap = ({ riderLat, riderLng, destLat, destLng, riderName, destAddress }) => {
  const hasRiderCoords = isValidCoordinate(riderLat) && isValidCoordinate(riderLng);
  const hasDestCoords = isValidCoordinate(destLat) && isValidCoordinate(destLng);

  const riderPoint = hasRiderCoords
    ? [riderLat, riderLng]
    : [DISPENSARY_HUB_COORDS[0] + 0.005, DISPENSARY_HUB_COORDS[1] + 0.005];

  const destPoint = hasDestCoords ? [destLat, destLng] : CITY_COORDINATES.default;

  const positions = [DISPENSARY_HUB_COORDS, riderPoint, destPoint];
  const bounds = [DISPENSARY_HUB_COORDS, destPoint];
  if (hasRiderCoords) bounds.push(riderPoint);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-slate-100">
      <div className="absolute top-4 left-4 z-400 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-md flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <span>Live Radar • Express Route</span>
      </div>

      <MapContainer
        center={hasRiderCoords ? riderPoint : destPoint}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "360px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pharmacy Hub Marker */}
        <Marker position={DISPENSARY_HUB_COORDS} icon={pharmacyIcon}>
          <Popup>
            <div className="text-xs p-1">
              <p className="font-bold text-emerald-800">MediCare Super Dispensary</p>
              <p className="text-slate-500">Central Hub • Virudhunagar</p>
            </div>
          </Popup>
        </Marker>

        {/* Live Rider Marker */}
        <Marker position={riderPoint} icon={riderIcon}>
          <Popup>
            <div className="text-xs p-1">
              <p className="font-bold text-sky-800">Delivery Partner</p>
              <p className="text-slate-600 font-medium">{riderName || "Assigned Courier Rider"}</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">En Route • Temperature Controlled</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Customer Marker */}
        <Marker position={destPoint} icon={destinationIcon}>
          <Popup>
            <div className="text-xs p-1">
              <p className="font-bold text-rose-800">Delivery Destination</p>
              <p className="text-slate-600">{destAddress || "Customer Address"}</p>
            </div>
          </Popup>
        </Marker>

        {/* Route Line */}
        <Polyline
          positions={positions}
          color="#059669"
          weight={4}
          dashArray="8, 8"
          opacity={0.7}
        />

        <RecenterMap bounds={bounds} />
      </MapContainer>
    </div>
  );
};

const TrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = (searchParams.get("order_id") || "").trim();

  const [trackingInput, setTrackingInput] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");

  const lastFetchedOrderId = useRef("");
  const joinedRoomRef = useRef("");
  const abortRef = useRef(null);
  const pollRef = useRef(null);

  const normalizeResponseOrder = useCallback((response) => {
    return (
      response?.data?.order ||
      response?.data?.data?.order ||
      response?.data?.data ||
      response?.data ||
      null
    );
  }, []);

  const updateQueryParam = useCallback(
    (orderId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (orderId) {
            next.set("order_id", orderId);
          } else {
            next.delete("order_id");
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const fetchOrder = useCallback(
    async (orderId, { silent = false } = {}) => {
      const trimmed = String(orderId || "").trim();

      if (!trimmed) {
        setError("Please enter a valid order ID");
        setOrderData(null);
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (!silent) {
          setLoading(true);
          setError("");
        }

        updateQueryParam(trimmed);

        let response;
        try {
          response = await API.get(`/tracking/${encodeURIComponent(trimmed)}`, {
            signal: controller.signal,
          });
        } catch (trackingErr) {
          if (trackingErr?.response?.status === 404) {
            response = await API.get(
              `/payments/cashfree/order-status/${encodeURIComponent(trimmed)}`,
              { signal: controller.signal }
            );
          } else {
            throw trackingErr;
          }
        }

        const data = normalizeResponseOrder(response);

        if (!data) {
          setOrderData(null);
          setError("No order details found for this ID.");
          return;
        }

        setOrderData((prev) => ({
          ...(prev || {}),
          ...data,
          tracking: {
            ...(prev?.tracking || {}),
            ...(data?.tracking || {}),
            rider: {
              ...(prev?.tracking?.rider || {}),
              ...(data?.tracking?.rider || {}),
            },
            liveLocation: {
              ...(prev?.tracking?.liveLocation || {}),
              ...(data?.tracking?.liveLocation || {}),
            },
          },
        }));

        lastFetchedOrderId.current = trimmed;
      } catch (err) {
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Track order error:", err);
        setOrderData(null);

        if (err?.response?.status === 404) {
          setError("Order not found. Please verify the order ID.");
        } else if (err?.response?.status === 401) {
          setError("Please login to track your personal orders.");
        } else {
          setError(err?.response?.data?.message || "Unable to fetch order status.");
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        if (!silent) setLoading(false);
      }
    },
    [normalizeResponseOrder, updateQueryParam]
  );

  const handleTrack = async (e) => {
    e.preventDefault();
    await fetchOrder(trackingInput);
  };

  useEffect(() => {
    const existingOrderId = (searchParams.get("order_id") || "").trim();
    if (!existingOrderId) return;
    if (lastFetchedOrderId.current === existingOrderId) return;

    setTrackingInput(existingOrderId);
    fetchOrder(existingOrderId);
  }, [fetchOrder, searchParams]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const cashfreeOrderStatus = safeUpper(
    orderData?.cashfreeOrderStatus ||
      orderData?.cashfree?.order_status ||
      orderData?.cashfreeOrder?.order_status ||
      orderData?.order_status,
    "UNKNOWN"
  );

  const paymentStatus = resolvePaymentStatus(orderData);

  const localOrderStatus = safeUpper(
    orderData?.orderStatus ||
      orderData?.status ||
      orderData?.tracking?.orderStatus ||
      orderData?.order_status_local,
    "PLACED"
  );

  const shippingAddress =
    orderData?.shippingAddress ||
    orderData?.address ||
    orderData?.deliveryAddress ||
    orderData?.shipping_address ||
    null;

  const orderItems =
    orderData?.items ||
    orderData?.orderItems ||
    orderData?.products ||
    orderData?.cartItems ||
    [];

  const tracking = orderData?.tracking || {};
  const rider = tracking?.rider || {};
  const liveLocation = tracking?.liveLocation || {};

  const riderLat = Number(liveLocation?.lat);
  const riderLng = Number(liveLocation?.lng);

  // Derive destination city coordinates
  const cityKey = String(shippingAddress?.city || "").toLowerCase().trim();
  const destCoords = CITY_COORDINATES[cityKey] || CITY_COORDINATES.default;

  const orderAmount =
    Number(
      orderData?.totalAmount ||
        orderData?.amount ||
        orderData?.orderAmount ||
        orderData?.payment?.amount ||
        orderData?.cashfree?.order_amount ||
        0
    ) || 0;

  const totalItems = useMemo(() => {
    if (!Array.isArray(orderItems)) return 0;
    return orderItems.reduce(
      (acc, item) => acc + Number(item?.quantity || item?.qty || 1),
      0
    );
  }, [orderItems]);

  const roomOrderId = useMemo(
    () => String(orderData?.orderId || orderData?._id || trackingInput || "").trim(),
    [orderData?.orderId, orderData?._id, trackingInput]
  );

  // Status configuration banner
  const statusConfig = useMemo(() => {
    if (localOrderStatus === "DELIVERED") {
      return {
        label: "Delivered Successfully",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <CircleCheck className="text-emerald-600" size={24} />,
        description: "Your prescription and healthcare package has reached you safely.",
      };
    }

    if (localOrderStatus === "OUT_FOR_DELIVERY") {
      return {
        label: "Out for Express Delivery",
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
        icon: <Truck className="text-orange-600" size={24} />,
        description: "Your assigned delivery rider is currently en route to your address.",
      };
    }

    if (["SHIPPED", "PROCESSING", "PACKED", "CONFIRMED"].includes(localOrderStatus)) {
      return {
        label: STATUS_LABELS[localOrderStatus] || "Order Being Processed",
        color: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200",
        icon: <PackageCheck className="text-teal-600" size={24} />,
        description: "Our dispensary team has verified and packed your medicines for dispatch.",
      };
    }

    if (paymentStatus === "COD") {
      return {
        label: "Order Placed (Cash on Delivery)",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <CircleCheck className="text-emerald-600" size={24} />,
        description: "Your order is confirmed. Pay ₹" + orderAmount.toFixed(2) + " upon delivery via Cash or UPI.",
      };
    }

    if (paymentStatus === "PAID") {
      return {
        label: "Order & Payment Confirmed",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <CircleCheck className="text-emerald-600" size={24} />,
        description: "Payment verified successfully. Preparing your medicines for fast dispatch.",
      };
    }

    if (localOrderStatus === "CANCELLED" || localOrderStatus === "NOT_DELIVERED") {
      return {
        label: localOrderStatus === "CANCELLED" ? "Order Cancelled" : "Delivery Attempt Failed",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: <CircleX className="text-red-600" size={24} />,
        description: "Please contact our 24/7 pharmacist support desk for assistance.",
      };
    }

    return {
      label: "Order Placed & Registered",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="text-emerald-600" size={24} />,
      description: "Order is registered in our pharmacy system and being prepared.",
    };
  }, [localOrderStatus, paymentStatus, orderAmount]);

  // Animated 5-step timeline
  const timeline = useMemo(() => {
    const isPlaced = !!orderData;
    const isConfirmed =
      paymentStatus === "PAID" ||
      paymentStatus === "COD" ||
      ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
        localOrderStatus
      );

    const isProcessing = [
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ].includes(localOrderStatus);

    const isOutForDelivery = ["OUT_FOR_DELIVERY", "DELIVERED"].includes(localOrderStatus);
    const isDelivered = localOrderStatus === "DELIVERED";

    return [
      {
        step: 1,
        title: "Order Placed",
        active: isPlaced,
        current: isPlaced && !isConfirmed,
        note: isPlaced ? "Order successfully recorded in database" : "Waiting for order placement",
        icon: ReceiptText,
      },
      {
        step: 2,
        title: "Rx & Payment Confirmed",
        active: isConfirmed,
        current: isConfirmed && !isProcessing,
        note:
          paymentStatus === "COD"
            ? "Confirmed via Cash on Delivery"
            : isConfirmed
            ? "Pharmacist checked & verified payment"
            : "Verification in progress",
        icon: ShieldCheck,
      },
      {
        step: 3,
        title: "Pharmacy Dispensing",
        active: isProcessing,
        current: isProcessing && !isOutForDelivery,
        note: isProcessing
          ? "Packed with temperature security seal"
          : "Dispensary queue",
        icon: Pill,
      },
      {
        step: 4,
        title: "Out for Express Delivery",
        active: isOutForDelivery,
        current: isOutForDelivery && !isDelivered,
        note: isOutForDelivery
          ? "Rider assigned and en route to address"
          : "Awaiting courier pickup",
        icon: Truck,
      },
      {
        step: 5,
        title: "Delivered to Customer",
        active: isDelivered,
        current: isDelivered,
        note: isDelivered
          ? "Handed over safely with verified OTP"
          : "Doorstep delivery pending",
        icon: CheckCircle2,
      },
    ];
  }, [orderData, paymentStatus, localOrderStatus]);

  // Socket setup
  useEffect(() => {
    if (!roomOrderId) return;

    if (joinedRoomRef.current && joinedRoomRef.current !== roomOrderId) {
      socket.emit("leave-order-room", { orderId: joinedRoomRef.current });
    }

    socket.emit("join-order-room", { orderId: roomOrderId });
    joinedRoomRef.current = roomOrderId;

    const handleTrackingUpdate = (payload) => {
      if (String(payload?.orderId || "").trim() !== roomOrderId) return;

      setOrderData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderStatus: payload?.orderStatus || payload?.status || prev.orderStatus,
          status: payload?.status || payload?.orderStatus || prev.status,
          paymentStatus: payload?.paymentStatus || prev.paymentStatus,
          tracking: {
            ...(prev.tracking || {}),
            ...(payload?.tracking || {}),
            rider: {
              ...(prev.tracking?.rider || {}),
              ...(payload?.tracking?.rider || {}),
            },
            liveLocation: {
              ...(prev.tracking?.liveLocation || {}),
              ...(payload?.tracking?.liveLocation || {}),
            },
          },
        };
      });
    };

    socket.on("order-tracking-updated", handleTrackingUpdate);

    return () => {
      socket.off("order-tracking-updated", handleTrackingUpdate);
    };
  }, [roomOrderId]);

  return (
    <section className="min-h-screen bg-slate-50/60 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-linear-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-emerald-950/10"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-2xl space-y-2 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-md border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Live GPS Courier &amp; Prescription Radar</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Track Your Healthcare Order
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Real-time temperature telemetry, route tracking, and pharmacist dispatch updates.
            </p>
          </div>
        </motion.div>

        {/* Search Order ID Input Bar */}
        <motion.form
          onSubmit={handleTrack}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex h-12 sm:h-14 flex-1 items-center rounded-2xl bg-slate-50 border border-slate-200 px-4 w-full focus-within:border-emerald-500 focus-within:bg-white transition">
              <Search className="shrink-0 text-slate-400" size={18} />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter Order ID (e.g. MED_1789636527250_5807)"
                className="ml-3 flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none"
              />
              {trackingInput && (
                <button
                  type="button"
                  onClick={() => setTrackingInput("")}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs font-bold text-red-600 px-2 flex items-center gap-1.5">
              <AlertCircle size={14} />
              <span>{error}</span>
            </p>
          )}
        </motion.form>

        {!loading && !orderData && !error && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 space-y-2 shadow-xs">
            <Truck size={36} className="mx-auto text-emerald-600 opacity-60 mb-2" />
            <h3 className="text-base font-bold text-slate-800">Ready to Track Your Delivery</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Enter your Order ID in the search box above to view real-time delivery status, rider contact, and item details.
            </p>
          </div>
        )}

        {orderData && (
          <div className="space-y-6">
            {/* Top 3 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Current Status */}
              <div className={`rounded-3xl border p-5 shadow-xs ${statusConfig.bg} ${statusConfig.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-white shadow-xs">{statusConfig.icon}</div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Stage</span>
                    <h3 className={`text-sm font-black ${statusConfig.color}`}>{statusConfig.label}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{statusConfig.description}</p>
              </div>

              {/* Card 2: Order Info */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <ReceiptText size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                    <h3 className="text-xs font-bold text-slate-900 font-mono truncate max-w-44">
                      {orderData?.orderId || orderData?._id}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">{totalItems} Total Items</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{formatMoney(orderAmount)}</span>
                </div>
              </div>

              {/* Card 3: Live ETA & Dispatch */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                    <Clock3 size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Arrival</span>
                    <h3 className="text-sm font-black text-slate-900">
                      {tracking?.etaMinutes ? `${tracking.etaMinutes} Minutes` : "30–45 Mins Express"}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {localOrderStatus === "DELIVERED"
                    ? "Package delivered successfully to recipient."
                    : "Cold-chain secure express courier dispatched."}
                </p>
              </div>
            </div>

            {/* Stepper Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <PackageCheck size={20} className="text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Order Progression Timeline</h3>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {STATUS_LABELS[localOrderStatus] || localOrderStatus}
                </span>
              </div>

              {/* Responsive Horizontal Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                {timeline.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl transition border ${
                        item.active
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2.5 shadow-xs font-bold text-xs transition ${
                          item.active
                            ? "bg-emerald-600 text-white shadow-emerald-600/30"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {item.active ? <Check size={18} /> : item.step}
                      </div>

                      <h4 className="text-xs font-bold mb-1">{item.title}</h4>
                      <p className="text-[10px] leading-tight text-slate-500">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map & Rider Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Preview (Col 7) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation size={18} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Live GPS Radar View</h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700">Virudhunagar &amp; Madurai Hub</span>
                </div>

                <LiveTrackingMap
                  riderLat={riderLat}
                  riderLng={riderLng}
                  destLat={destCoords[0]}
                  destLng={destCoords[1]}
                  riderName={rider?.name}
                  destAddress={`${shippingAddress?.addressLine1 || ""} ${shippingAddress?.city || ""}`}
                />
              </div>

              {/* Rider & Delivery Info (Col 5) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Rider Info Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Bike size={18} className="text-sky-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Assigned Driver
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        rider?.name && rider.name !== "Not assigned"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {rider?.name && rider.name !== "Not assigned"
                        ? "Verified Driver"
                        : "Awaiting Rider"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-base shadow-xs">
                      {rider?.name && rider.name !== "Not assigned" ? (
                        rider.name.charAt(0).toUpperCase()
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {rider?.name && rider.name !== "Not assigned"
                          ? rider.name
                          : "Pharmacy Express Dispatch"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {rider?.name && rider.name !== "Not assigned"
                          ? `${rider.vehicleType || "Vehicle"}${
                              rider.vehicleNumber ? ` (${rider.vehicleNumber})` : ""
                            }`
                          : "Driver will be assigned upon dispatch"}
                      </p>
                    </div>
                    {rider?.phone &&
                      rider.phone !== "N/A" &&
                      rider?.name &&
                      rider.name !== "Not assigned" && (
                        <a
                          href={`tel:${rider.phone}`}
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                          title="Call Rider"
                        >
                          <Phone size={16} />
                        </a>
                      )}
                  </div>
                </div>

                {/* Delivery Address Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Home size={18} className="text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Delivery Address</h4>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="font-bold text-slate-900 text-sm">
                      {shippingAddress?.fullName || orderData?.customerName || "Customer"}
                    </p>
                    <p className="font-mono">{shippingAddress?.phone || orderData?.customerPhone || "-"}</p>
                    <p>
                      {shippingAddress?.addressLine1 || shippingAddress?.street || "Door delivery address"}
                      {shippingAddress?.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {shippingAddress?.city || "Virudhunagar"}, {shippingAddress?.state || "Tamil Nadu"} -{" "}
                      {shippingAddress?.postalCode || shippingAddress?.pincode || "626001"}
                    </p>
                  </div>
                </div>

                {/* Payment Method & Transaction Card */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={18} className="text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Method</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : paymentStatus === "COD"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {paymentStatus === "PAID"
                        ? "Payment Confirmed"
                        : paymentStatus === "COD"
                        ? "Cash on Delivery"
                        : "Pending Verification"}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Payment Mode:</span>
                      <span className="font-bold text-slate-900">
                        {getPaymentModeLabel(
                          orderData?.paymentMethod || orderData?.payment_method
                        )}
                      </span>
                    </div>

                    {(orderData?.cashfreeReferenceId ||
                      orderData?.cashfreeOrderId ||
                      orderData?.transactionId ||
                      orderData?.paymentId) && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Transaction Ref:</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate max-w-44">
                          {orderData?.cashfreeReferenceId ||
                            orderData?.transactionId ||
                            orderData?.paymentId ||
                            orderData?.cashfreeOrderId}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Total Paid Amount:</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatMoney(orderAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items Accordion / Itemized List */}
            {Array.isArray(orderItems) && orderItems.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Pill size={18} className="text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Itemized Prescription Order Summary ({orderItems.length} Items)
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800">{formatMoney(orderAmount)} Total</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {orderItems.map((item, index) => {
                    const name =
                      item?.name ||
                      item?.medicine?.name ||
                      item?.product?.name ||
                      "Prescribed Medicine";
                    const image = item?.image || item?.medicine?.image || "";
                    const qty = Number(item?.quantity || item?.qty || 1);
                    const unitPrice = Number(item?.price || item?.medicine?.price || 0);
                    const lineTotal = Number(item?.subtotal || unitPrice * qty);

                    return (
                      <div
                        key={item?._id || item?.productId || index}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {image ? (
                              <img
                                src={getImageUrl(image)}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <Pill size={18} className="text-emerald-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                            <p className="text-[11px] text-slate-500">
                              Qty: {qty} • ₹{unitPrice.toFixed(2)}/unit
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-extrabold text-xs text-slate-900">
                          {formatMoney(lineTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackOrder;