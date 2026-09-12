/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../api/axios";
import { socket } from "../socket";

const defaultMarkerIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const STATUS_LABELS = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  NOT_DELIVERED: "Not Delivered",
  FAILED: "Failed",
  PENDING: "Pending",
  PAID: "Paid",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  TERMINATED: "Terminated",
  SUCCESS: "Paid",
  PAYMENT_SUCCESS: "Paid",
  PAYMENT_PENDING: "Pending",
  PAYMENT_FAILED: "Failed",
  UNKNOWN: "Unknown",
};

const FINAL_PAYMENT_STATES = new Set(["PAID", "FAILED", "EXPIRED", "TERMINATED", "CANCELLED"]);
const SUCCESS_PAYMENT_STATES = new Set(["PAID", "SUCCESS", "PAYMENT_SUCCESS"]);
const PENDING_PAYMENT_STATES = new Set(["PENDING", "ACTIVE", "NOT_ATTEMPTED"]);
const FAILED_PAYMENT_STATES = new Set(["FAILED", "EXPIRED", "TERMINATED", "CANCELLED"]);

const isValidCoordinate = (value) =>
  typeof value === "number" && Number.isFinite(value);

const safeUpper = (value, fallback = "UNKNOWN") =>
  String(value || fallback).trim().toUpperCase();

const formatMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;

const resolvePaymentStatus = (order) => {
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

  if (candidates.some((status) => SUCCESS_PAYMENT_STATES.has(status) || status === "PAID")) {
    return "PAID";
  }

  if (candidates.some((status) => FAILED_PAYMENT_STATES.has(status))) {
    const failedMatch = candidates.find((status) => FAILED_PAYMENT_STATES.has(status));
    return failedMatch || "FAILED";
  }

  if (candidates.some((status) => PENDING_PAYMENT_STATES.has(status))) {
    const pendingMatch = candidates.find((status) => PENDING_PAYMENT_STATES.has(status));
    return pendingMatch || "PENDING";
  }

  return candidates[0] || "PENDING";
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);

  return null;
};

const LiveTrackingMap = ({ lat, lng, riderName }) => {
  if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom
        style={{ height: "340px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultMarkerIcon}>
          <Popup>
            {riderName ? `${riderName} current location` : "Rider live location"}
          </Popup>
        </Marker>
        <RecenterMap lat={lat} lng={lng} />
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
        setError("Please enter order ID");
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
          setOrderData(null);
        }

        setError("");
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
          setError("No order details found");
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
          payment: {
            ...(prev?.payment || {}),
            ...(data?.payment || {}),
          },
          cashfree: {
            ...(prev?.cashfree || {}),
            ...(data?.cashfree || {}),
          },
          cashfreeOrder: {
            ...(prev?.cashfreeOrder || {}),
            ...(data?.cashfreeOrder || {}),
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
          setError("Order not found for the given order ID");
        } else if (err?.response?.status === 401) {
          setError("Please login to track this order");
        } else {
          setError(err?.response?.data?.message || "Unable to fetch order status");
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

  const lat = Number(liveLocation?.lat);
  const lng = Number(liveLocation?.lng);

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

  const isPaymentFinal = FINAL_PAYMENT_STATES.has(paymentStatus);

  const statusConfig = useMemo(() => {
    if (localOrderStatus === "DELIVERED") {
      return {
        label: "Delivered",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        icon: <CircleCheck className="text-emerald-600" size={22} />,
        description: "Your order has been delivered successfully.",
      };
    }

    if (localOrderStatus === "OUT_FOR_DELIVERY") {
      return {
        label: "Out for Delivery",
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-100",
        icon: <Truck className="text-orange-600" size={22} />,
        description: "Your rider is on the way to your location.",
      };
    }

    if (["SHIPPED", "PROCESSING", "PACKED", "CONFIRMED"].includes(localOrderStatus)) {
      return {
        label: STATUS_LABELS[localOrderStatus] || "Processing",
        color: "text-sky-600",
        bg: "bg-sky-50",
        border: "border-sky-100",
        icon: <PackageCheck className="text-sky-600" size={22} />,
        description: "Your order is being prepared for dispatch.",
      };
    }

    if (paymentStatus === "PAID") {
      return {
        label: "Payment Successful",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        icon: <CircleCheck className="text-emerald-600" size={22} />,
        description: "Payment received successfully.",
      };
    }

    if (PENDING_PAYMENT_STATES.has(paymentStatus) || cashfreeOrderStatus === "ACTIVE") {
      return {
        label: "Payment Pending",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        icon: <LoaderCircle className="text-amber-600 animate-spin" size={22} />,
        description: "Waiting for payment confirmation.",
      };
    }

    if (
      FAILED_PAYMENT_STATES.has(paymentStatus) ||
      localOrderStatus === "CANCELLED" ||
      localOrderStatus === "NOT_DELIVERED"
    ) {
      return {
        label:
          localOrderStatus === "CANCELLED"
            ? "Order Cancelled"
            : localOrderStatus === "NOT_DELIVERED"
            ? "Delivery Failed"
            : "Payment Failed",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-100",
        icon: <CircleX className="text-red-600" size={22} />,
        description: "There was a problem with this order.",
      };
    }

    return {
      label: "Status Unavailable",
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: <CircleDashed className="text-slate-600" size={22} />,
      description: "Track an order ID to see the latest details.",
    };
  }, [cashfreeOrderStatus, paymentStatus, localOrderStatus]);

  const timeline = useMemo(() => {
    const isPlaced = !!orderData;
    const isPaymentConfirmed = paymentStatus === "PAID";
    const isProcessing = [
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ].includes(localOrderStatus);
    const isShipped = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(localOrderStatus);
    const isOutForDelivery = ["OUT_FOR_DELIVERY", "DELIVERED"].includes(localOrderStatus);
    const isDelivered = localOrderStatus === "DELIVERED";

    return [
      {
        title: "Order placed",
        active: isPlaced,
        note: isPlaced ? "Your order has been created successfully" : "Waiting for order lookup",
      },
      {
        title: "Payment confirmed",
        active: isPaymentConfirmed,
        note: isPaymentConfirmed
          ? "Payment received successfully"
          : "Waiting for payment confirmation",
      },
      {
        title: "Order processing",
        active: isProcessing,
        note: isProcessing
          ? "Pharmacy is preparing your order"
          : "Processing starts after payment confirmation",
      },
      {
        title: "Out for delivery",
        active: isOutForDelivery || isShipped,
        note: isOutForDelivery
          ? "Your rider is on the way"
          : isShipped
          ? "Shipment is created"
          : "Waiting for dispatch",
      },
      {
        title: "Delivered",
        active: isDelivered,
        note: isDelivered ? "Order delivered successfully" : "Delivery is pending",
      },
    ];
  }, [orderData, paymentStatus, localOrderStatus]);

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
          orderId: payload?.orderId || prev.orderId,
          orderStatus:
            payload?.orderStatus ||
            payload?.status ||
            prev.orderStatus,
          status:
            payload?.status ||
            payload?.orderStatus ||
            prev.status,
          payment_status:
            payload?.payment_status ||
            payload?.paymentStatus ||
            prev.payment_status,
          paymentStatus:
            payload?.paymentStatus ||
            payload?.payment_status ||
            prev.paymentStatus,
          cashfreeOrderStatus:
            payload?.cashfreeOrderStatus || prev.cashfreeOrderStatus,
          deliveryStatus: payload?.deliveryStatus || prev.deliveryStatus,
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
          payment: {
            ...(prev.payment || {}),
            ...(payload?.payment || {}),
          },
          cashfree: {
            ...(prev.cashfree || {}),
            ...(payload?.cashfree || {}),
          },
          cashfreeOrder: {
            ...(prev.cashfreeOrder || {}),
            ...(payload?.cashfreeOrder || {}),
          },
          updatedAt: payload?.updatedAt || prev.updatedAt,
        };
      });
    };

    socket.on("order-tracking-updated", handleTrackingUpdate);

    return () => {
      socket.off("order-tracking-updated", handleTrackingUpdate);
    };
  }, [roomOrderId]);

  useEffect(() => {
    return () => {
      if (joinedRoomRef.current) {
        socket.emit("leave-order-room", { orderId: joinedRoomRef.current });
        joinedRoomRef.current = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!roomOrderId || !orderData) return;

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (isPaymentFinal || localOrderStatus === "DELIVERED" || localOrderStatus === "CANCELLED") {
      return;
    }

    pollRef.current = setInterval(() => {
      fetchOrder(roomOrderId, { silent: true });
    }, 8000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [roomOrderId, orderData, isPaymentFinal, localOrderStatus, fetchOrder]);

  return (
    <section className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="mb-8 text-center sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
            <Truck size={13} />
            <span>Real-Time GPS Order Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
            Track Your Healthcare Order
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Enter your order ID to check full order details and live rider location.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleTrack}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45 }}
          className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-lg sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-14 flex-1 items-center rounded-2xl bg-slate-100 px-4">
              <Search className="shrink-0 text-slate-500" size={20} />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Enter order ID"
                className="ml-3 flex-1 bg-transparent text-sm outline-none sm:text-base"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 rounded-2xl bg-emerald-500 px-6 font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-emerald-300"
            >
              {loading ? "Tracking..." : "Track Now"}
            </button>
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </motion.form>

        {!loading && !orderData && !error ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Search using your order ID to view order details and live delivery status.
          </div>
        ) : null}

        {orderData ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
              <div className={`rounded-2xl border p-5 shadow-sm ${statusConfig.bg} ${statusConfig.border}`}>
                <div className="mb-4">{statusConfig.icon}</div>
                <h2 className={`text-lg font-semibold ${statusConfig.color}`}>{statusConfig.label}</h2>
                <p className="mt-2 text-sm text-slate-600">{statusConfig.description}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <PackageCheck className="text-emerald-600" size={22} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
                <p className="mt-2 break-all text-sm text-slate-600">
                  Order ID: {orderData?.orderId || orderData?._id || trackingInput}
                </p>
                <p className="mt-1 text-sm text-slate-600">Items: {totalItems}</p>
                <p className="mt-1 text-sm text-slate-600">Amount: {formatMoney(orderAmount)}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <Clock3 className="text-orange-500" size={22} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Delivery Update</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {localOrderStatus === "DELIVERED"
                    ? "Order delivered successfully."
                    : localOrderStatus === "OUT_FOR_DELIVERY"
                    ? "Rider is moving toward your address."
                    : localOrderStatus === "SHIPPED"
                    ? "Order has been shipped."
                    : ["PROCESSING", "CONFIRMED", "PACKED"].includes(localOrderStatus)
                    ? "Order is being prepared."
                    : paymentStatus === "PAID"
                    ? "Payment confirmed. Waiting for order processing update."
                    : "Waiting for the next update."}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <div className="mb-5 flex items-center gap-2">
                <MapPin className="text-emerald-600" size={20} />
                <h3 className="text-xl font-bold text-slate-900">Tracking Details</h3>
              </div>

              <div className="space-y-5">
                {timeline.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        step.active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{step.title}</p>
                      <p className="text-sm text-slate-500">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ReceiptText className="text-slate-700" size={18} />
                    <p className="text-sm font-semibold text-slate-900">Order Info</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Order ID: {orderData?.orderId || orderData?._id || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Order Status: {STATUS_LABELS[localOrderStatus] || localOrderStatus}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Total Amount: {formatMoney(orderAmount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CreditCard className="text-slate-700" size={18} />
                    <p className="text-sm font-semibold text-slate-900">Payment Info</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Payment Status: {STATUS_LABELS[paymentStatus] || paymentStatus}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Cashfree Status: {STATUS_LABELS[cashfreeOrderStatus] || cashfreeOrderStatus}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Amount: {formatMoney(orderAmount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Truck className="text-slate-700" size={18} />
                    <p className="text-sm font-semibold text-slate-900">Delivery Info</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    Current Stage: {STATUS_LABELS[localOrderStatus] || localOrderStatus}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Dispatch: {["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(localOrderStatus) ? "Completed" : "Pending"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Delivery: {localOrderStatus === "DELIVERED" ? "Completed" : "Pending"}
                  </p>
                </div>
              </div>

              {shippingAddress ? (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Home className="text-slate-700" size={18} />
                    <p className="text-sm font-semibold text-slate-900">Shipping Address</p>
                  </div>
                  <p className="text-sm text-slate-600">{shippingAddress?.fullName || "Customer"}</p>
                  <p className="text-sm text-slate-600">{shippingAddress?.phone || "-"}</p>
                  <p className="text-sm text-slate-600">
                    {shippingAddress?.addressLine1 || "-"}
                    {shippingAddress?.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
                  </p>
                  <p className="text-sm text-slate-600">
                    {shippingAddress?.city || "-"}, {shippingAddress?.state || "-"} - {shippingAddress?.postalCode || "-"}
                  </p>
                  <p className="text-sm text-slate-600">{shippingAddress?.country || "India"}</p>
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <User className="text-slate-700" size={18} />
                    <p className="text-sm font-semibold text-slate-900">Rider Details</p>
                  </div>
                  <p className="text-sm text-slate-600">Name: {rider?.name || "Not assigned yet"}</p>
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} /> {rider?.phone || "Not available"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Bike size={14} /> {rider?.vehicleNumber || "Not available"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Navigation className="text-slate-700" size={18} />
                    <p className="text-sm font-semibold text-slate-900">Live Delivery Status</p>
                  </div>

                  <p className="text-sm text-slate-600">
                    ETA: {tracking?.etaMinutes ? `${tracking.etaMinutes} mins` : "Not available"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Latitude: {isValidCoordinate(lat) ? lat : "Not available"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Longitude: {isValidCoordinate(lng) ? lng : "Not available"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Last Updated:{" "}
                    {liveLocation?.updatedAt
                      ? new Date(liveLocation.updatedAt).toLocaleString()
                      : "Not updated yet"}
                  </p>
                </div>
              </div>

              {isValidCoordinate(lat) && isValidCoordinate(lng) ? (
                <LiveTrackingMap lat={lat} lng={lng} riderName={rider?.name || ""} />
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Live location will appear here when the rider starts sharing location.
                </div>
              )}

              {Array.isArray(orderItems) && orderItems.length > 0 ? (
                <div className="mt-6">
                  <h4 className="mb-4 text-lg font-semibold text-slate-900">Ordered Items</h4>
                  <div className="space-y-3">
                    {orderItems.map((item, index) => {
                      const name =
                        item?.name ||
                        item?.medicine?.name ||
                        item?.product?.name ||
                        "Ordered Item";

                      const quantity = Number(item?.quantity || item?.qty || 1);
                      const price = Number(
                        item?.price ||
                          item?.medicine?.price ||
                          item?.product?.price ||
                          0
                      );
                      const lineTotal = Number(item?.subtotal || price * quantity);

                      return (
                        <div
                          key={item?._id || item?.productId || index}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{name}</p>
                            <p className="text-sm text-slate-500">Quantity: {quantity}</p>
                          </div>
                          <p className="whitespace-nowrap font-semibold text-emerald-600">
                            {formatMoney(lineTotal)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default TrackOrder;