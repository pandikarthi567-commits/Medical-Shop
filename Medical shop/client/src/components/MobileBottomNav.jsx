import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Package,
  User,
} from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const [authToken, setAuthToken] = useState(
    localStorage.getItem("token") || ""
  );

  const updateState = useCallback(() => {
    const token = localStorage.getItem("token") || "";
    setAuthToken(token);

    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cartItems.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    updateState();
    window.addEventListener("storage", updateState);
    window.addEventListener("authChanged", updateState);
    window.addEventListener("cartChanged", updateState);

    return () => {
      window.removeEventListener("storage", updateState);
      window.removeEventListener("authChanged", updateState);
      window.removeEventListener("cartChanged", updateState);
    };
  }, [updateState]);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Categories", path: "/categories", icon: LayoutGrid },
    { label: "Cart", path: "/cart", icon: ShoppingCart, badge: cartCount },
    { label: "Orders", path: "/track-order", icon: Package },
    {
      label: "Profile",
      path: authToken ? "/profile" : "/login",
      icon: User,
    },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl md:hidden"
    >
      <nav className="grid grid-cols-5 w-full items-center pt-2.5 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex flex-col items-center justify-center min-w-0 w-full px-0.5 py-1 group select-none cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    active
                      ? "text-emerald-600 font-bold"
                      : "text-slate-500 group-hover:text-slate-800"
                  }`}
                />

                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-extrabold text-white shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`mt-1 text-[10px] sm:text-xs font-semibold leading-none tracking-tight truncate max-w-full text-center ${
                  active
                    ? "text-emerald-600 font-bold"
                    : "text-slate-500 group-hover:text-slate-800"
                }`}
              >
                {item.label}
              </span>

              {active && (
                <motion.span
                  layoutId="activeBottomTabDot"
                  className="mt-1 h-1 w-1 rounded-full bg-emerald-600"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
