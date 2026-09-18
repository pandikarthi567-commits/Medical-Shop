import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoppingCart, Star, Heart, Pill, ShieldCheck, ShieldAlert } from "lucide-react";
import "./DepthCarousel.css";

const DEFAULT_ITEMS = [
  {
    image: "/images/healthcare.png",
    name: "Paracetamol 500mg Tablet",
    category: "Pain Relief",
    price: 2.5,
    oldPrice: 3.0,
    rating: 4.8,
    stock: 120,
    badge: "20% OFF",
    prescriptionRequired: false,
    description: "Fast-acting relief for mild to moderate pain and fever.",
  },
  {
    image: "/images/healthcare.png",
    name: "Amoxicillin 250mg Capsule",
    category: "Antibiotics",
    price: 45.0,
    oldPrice: 55.0,
    rating: 4.9,
    stock: 80,
    badge: "Doctor Recommended",
    prescriptionRequired: true,
    description: "Broad-spectrum antibiotic for bacterial respiratory infections.",
  },
  {
    image: "/images/healthcare.png",
    name: "Vitamin C + Zinc Chewable",
    category: "Vitamins & Supplements",
    price: 180.0,
    oldPrice: 220.0,
    rating: 4.9,
    stock: 250,
    badge: "Best Seller",
    prescriptionRequired: false,
    description: "Immunity booster with 1000mg active Vitamin C and Zinc.",
  },
  {
    image: "/images/healthcare.png",
    name: "Digital Blood Pressure Monitor",
    category: "Medical Devices",
    price: 1450.0,
    oldPrice: 1899.0,
    rating: 4.7,
    stock: 45,
    badge: "Top Rated",
    prescriptionRequired: false,
    description: "Accurate clinical readings with large LED display and memory recall.",
  },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const normalizeItem = (it) => {
  if (typeof it === "string") return { image: it, name: "Medicine Item", alt: "" };
  return {
    ...it,
    image: it.image || "/images/healthcare.png",
    name: it.name || it.title || it.alt || "Medicine Item",
    category: it.category || "Healthcare",
    price: it.price !== undefined ? it.price : 99,
    oldPrice: it.oldPrice || (it.price ? Math.round(it.price * 1.25) : 0),
    rating: it.rating || 4.8,
    stock: it.stock !== undefined ? it.stock : 50,
    badge: it.badge || "",
    prescriptionRequired: Boolean(it.prescriptionRequired),
    description: it.description || "Authentic healthcare formulation with fast doorstep delivery.",
  };
};

const DepthCarousel = ({
  items = DEFAULT_ITEMS,
  cardWidth = 320,
  cardHeight = 440,
  radius = 24,
  tint = "#059669",
  depth = 220,
  spread = 90,
  tilt = 22,
  tiltDirection = "right",
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  ease = "power3.out",
  autoplay = true,
  autoplayDelay = 3500,
  loop = true,
  showControls = true,
  showIndicators = true,
  onChange,
  onAddToCart,
  onWishlistToggle,
  wishlistIds = [],
  className = "",
}) => {
  const data = useMemo(
    () => (Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEMS).map(normalizeItem),
    [items]
  );
  const count = data.length;

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);

  const posRef = useRef(0);
  const focusRef = useRef(0);
  const tweenRef = useRef(null);
  const scaleRef = useRef(1);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);

  const dragRef = useRef(null);
  const wheelTimerRef = useRef(null);
  const autoTimerRef = useRef(null);
  const reducedRef = useRef(false);

  const [active, setActive] = useState(0);

  onChangeRef.current = onChange;
  cfgRef.current = {
    count,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    duration,
    ease,
    loop,
    cardWidth,
    autoplayDelay,
  };

  const layout = useCallback((pos) => {
    const cfg = cfgRef.current;
    const n = cfg.count;
    if (!n) return;
    const dir = cfg.tiltDirection === "left" ? -1 : 1;
    const sc = scaleRef.current;

    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= cfg.visibleCards + 0.5;

      const tz = -cfg.depth * d;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.18, 1 - back * cfg.falloff);
      const blurPx =
        cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(
        2
      )}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? "auto" : "none";

      const ov = overlayRefs.current[i];
      if (ov) ov.style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
    }
  }, []);

  const notify = useCallback(
    (idx) => {
      setActive(idx);
      onChangeRef.current?.(idx, data[idx]);
    },
    [data]
  );

  // Robust tween runner (using requestAnimationFrame with power3 cubic ease)
  const tweenTo = useCallback(
    (target, animate) => {
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      const cfg = cfgRef.current;
      const startP = posRef.current;
      const dist = target - startP;

      if (!animate || reducedRef.current || Math.abs(dist) < 0.001) {
        posRef.current = target;
        const n = cfg.count;
        if (n > 0) posRef.current = ((posRef.current % n) + n) % n;
        layout(posRef.current);
        return;
      }

      const dur = cfg.duration || 650;
      const startTime = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / dur, 0, 1);
        const eased = easeOutCubic(progress);

        posRef.current = startP + dist * eased;
        layout(posRef.current);

        if (progress < 1) {
          tweenRef.current = requestAnimationFrame(step);
        } else {
          const n = cfg.count;
          if (n > 0) posRef.current = ((posRef.current % n) + n) % n;
          layout(posRef.current);
        }
      };

      tweenRef.current = requestAnimationFrame(step);
    },
    [layout]
  );

  const setFocus = useCallback(
    (rawIndex, animate = true) => {
      const cfg = cfgRef.current;
      const n = cfg.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      let delta = idx - posRef.current;
      if (cfg.loop && n > 1) {
        delta = ((delta % n) + n) % n;
        if (delta > n / 2) delta -= n;
      }
      tweenTo(posRef.current + delta, animate);
      if (idx !== focusRef.current) {
        focusRef.current = idx;
        notify(idx);
      }
    },
    [tweenTo, notify]
  );

  const navigateBy = useCallback((step) => setFocus(focusRef.current + step, true), [setFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      const cfg = cfgRef.current;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 100;
      scaleRef.current = clamp(w / needed, 0.45, 1);
      layout(posRef.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const cfg = cfgRef.current;
      if (cfg.count < 2) return;
      e.preventDefault();
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      posRef.current += step;
      layout(posRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => setFocus(Math.round(posRef.current), true), 130);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [layout, setFocus]);

  const onPointerDown = useCallback((e) => {
    const cfg = cfgRef.current;
    if (cfg.count < 2) return;
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    dragRef.current = {
      x: e.clientX,
      startPos: posRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
      id: e.pointerId,
    };
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const cfg = cfgRef.current;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      posRef.current = drag.startPos - dx / stepPx;
      layout(posRef.current);
    },
    [layout]
  );

  const onPointerEnd = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.moved) return;
    const cfg = cfgRef.current;
    const stepPx = Math.max(cfg.cardWidth * 0.55 * scaleRef.current, 40);
    const projected = posRef.current - (drag.v * 180) / stepPx;
    setFocus(Math.round(projected), true);
  }, [setFocus]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateBy(1);
      }
    },
    [navigateBy]
  );

  const onCardClick = useCallback(
    (index) => {
      if (dragRef.current?.moved) return;
      setFocus(index, true);
    },
    [setFocus]
  );

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!autoplay || reducedRef.current || count < 2) return;
    const root = rootRef.current;
    let hovered = false;
    let focused = false;
    const stop = () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    };
    const start = () => {
      stop();
      autoTimerRef.current = window.setInterval(() => {
        if (!hovered && !focused) navigateBy(1);
      }, Math.max(cfgRef.current.autoplayDelay, 1200));
    };
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    const onFocusIn = () => {
      focused = true;
    };
    const onFocusOut = () => {
      focused = false;
    };
    root?.addEventListener("mouseenter", onEnter);
    root?.addEventListener("mouseleave", onLeave);
    root?.addEventListener("focusin", onFocusIn);
    root?.addEventListener("focusout", onFocusOut);
    start();
    return () => {
      stop();
      root?.removeEventListener("mouseenter", onEnter);
      root?.removeEventListener("mouseleave", onLeave);
      root?.removeEventListener("focusin", onFocusIn);
      root?.removeEventListener("focusout", onFocusOut);
    };
  }, [autoplay, autoplayDelay, count, navigateBy]);

  useEffect(() => {
    layout(posRef.current);
  }, [
    layout,
    depth,
    spread,
    tilt,
    tiltDirection,
    visibleCards,
    falloff,
    blur,
    cardWidth,
    cardHeight,
    radius,
    count,
  ]);

  useEffect(
    () => () => {
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    },
    []
  );

  return (
    <div
      ref={rootRef}
      className={`depth-carousel ${className}`.trim()}
      style={{ "--dc-perspective": `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Medicine Depth carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="depth-carousel__stage" ref={stageRef}>
        {data.map((item, i) => {
          const isWishlisted = wishlistIds.includes(item._id);
          const isOutOfStock = Number(item.stock) === 0;

          return (
            <div
              key={item._id || i}
              className="depth-carousel__card rounded-3xl"
              ref={(el) => (cardRefs.current[i] = el)}
              style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={active !== i}
              onClick={() => onCardClick(i)}
            >
              <div className="depth-carousel__card-inner">
                {/* Image Top Area */}
                <div className="depth-carousel__img-wrap">
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                    {item.badge ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
                        20% OFF
                      </span>
                    )}
                    {item.prescriptionRequired && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
                        <ShieldAlert size={10} /> Rx Required
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWishlistToggle?.(item);
                    }}
                    className={`absolute top-3 right-3 z-20 h-8 w-8 rounded-full flex items-center justify-center shadow-md transition cursor-pointer ${
                      isWishlisted
                        ? "bg-rose-500 text-white"
                        : "bg-white/95 text-slate-400 hover:text-rose-500 hover:bg-white"
                    }`}
                  >
                    <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>

                  <img
                    className="depth-carousel__img"
                    src={item.image}
                    alt={item.name}
                    draggable={false}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/healthcare.png";
                    }}
                  />

                  {/* In-Stock Badge */}
                  <div className="absolute bottom-2.5 left-3 z-20">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        isOutOfStock
                          ? "bg-slate-200 text-slate-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isOutOfStock ? "bg-slate-500" : "bg-emerald-500"
                        }`}
                      />
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </div>
                </div>

                {/* Medicine Content */}
                <div className="depth-carousel__content">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                        {item.category || "Healthcare"}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{item.rating || "4.8"}</span>
                      </div>
                    </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing & Add to Cart */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div>
                        <span className="text-lg font-black text-slate-900">
                          ₹{item.price}
                        </span>
                        {item.oldPrice && Number(item.oldPrice) > Number(item.price) && (
                          <span className="text-xs text-slate-400 line-through ml-1.5">
                            ₹{item.oldPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Save ₹{Math.max(0, Math.round((item.oldPrice || item.price * 1.2) - item.price))}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(item);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingCart size={14} />
                      <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                    </button>
                  </div>
                </div>

                <span
                  className="depth-carousel__tint"
                  ref={(el) => (overlayRefs.current[i] = el)}
                  style={{ background: tint }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--prev"
            aria-label="Previous medicine"
            onClick={(e) => {
              e.stopPropagation();
              navigateBy(-1);
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="depth-carousel__arrow depth-carousel__arrow--next"
            aria-label="Next medicine"
            onClick={(e) => {
              e.stopPropagation();
              navigateBy(1);
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {showIndicators && count > 1 && (
        <div className="depth-carousel__dots" role="tablist" aria-label="Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to medicine ${i + 1}`}
              className={`depth-carousel__dot${active === i ? " is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setFocus(i, true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepthCarousel;
