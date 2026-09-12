// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from "react";
import { Bike, Phone } from "lucide-react";
import { socket } from "../socket";

const RiderLiveTracker = ({
  orderId,
  riderName = "MediCare Express Rider",
  riderPhone = "+91 98765 43210",
  vehicleNumber = "TN-58-AB-1234",
  etaMinutes = 15,
}) => {
  const watchIdRef = useRef(null);
  const joinedRoomRef = useRef("");
  const [status, setStatus] = useState("Acquiring GPS satellite connection...");
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const trimmedOrderId = String(orderId || "").trim();
    if (!trimmedOrderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("Order ID is required to start live rider tracking.");
      return;
    }

    if (joinedRoomRef.current && joinedRoomRef.current !== trimmedOrderId) {
      socket.emit("leave-order-room", { orderId: joinedRoomRef.current });
    }

    socket.emit("join-order-room", { orderId: trimmedOrderId });
    joinedRoomRef.current = trimmedOrderId;

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported on this browser.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const payload = {
          orderId: trimmedOrderId,
          orderStatus: "OUT_FOR_DELIVERY",
          tracking: {
            etaMinutes,
            rider: {
              name: riderName,
              phone: riderPhone,
              vehicleNumber,
            },
            liveLocation: {
              lat,
              lng,
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date().toISOString(),
        };

        setCoords({ lat, lng });
        setStatus("Real-time GPS telemetry active.");
        socket.emit("rider-location-update", payload);
      },
      (error) => {
        setStatus(error.message || "Unable to acquire GPS coordinates.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (joinedRoomRef.current) {
        socket.emit("leave-order-room", { orderId: joinedRoomRef.current });
        joinedRoomRef.current = "";
      }
    };
  }, [orderId, riderName, riderPhone, vehicleNumber, etaMinutes]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Bike size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {riderName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Vehicle: {vehicleNumber} • Express Courier
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live GPS</span>
        </span>
      </div>

      {/* Telemetry Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-slate-400 font-medium">Tracking Status</p>
          <p className="font-bold text-slate-800 mt-0.5 truncate">{status}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-slate-400 font-medium">Estimated Arrival</p>
          <p className="font-bold text-emerald-600 mt-0.5">{etaMinutes} Minutes</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-slate-400 font-medium">Coordinates</p>
          <p className="font-bold text-slate-800 mt-0.5 font-mono">
            {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Awaiting..."}
          </p>
        </div>
      </div>

      {/* Phone Contact Action */}
      {riderPhone && (
        <a
          href={`tel:${riderPhone}`}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Phone size={14} className="text-emerald-400" />
          <span>Call Delivery Rider ({riderPhone})</span>
        </a>
      )}
    </div>
  );
};

export default RiderLiveTracker;