import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Star, Quote, CheckCircle2, MapPin, Heart, ShieldCheck, Sparkles, User } from "lucide-react";
import "./ReviewDepthCarousel.css";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const normalizeReview = (r, idx) => {
  const name = r.name || "Verified Patient";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const colors = [
    "from-emerald-600 to-teal-500",
    "from-blue-600 to-cyan-500",
    "from-teal-600 to-emerald-700",
    "from-indigo-600 to-violet-500",
    "from-pink-600 to-rose-500",
  ];

  return {
    ...r,
    name,
    initials: initials || "VP",
    role: r.role || "Verified Patient Buyer",
    location: r.location || "Tamil Nadu, India",
    content: r.content || "",
    rating: Number(r.rating) || 5,
    verifiedBadge: r.verifiedBadge || "Verified Patient",
    medicineTag: r.medicineTag || r.category || "Healthcare Order",
    avatarColor: r.avatarColor || colors[idx % colors.length],
  };
};

const ReviewDepthCarousel = ({
  reviews = [],
  cardWidth = 330,
  cardHeight = 440,
  radius = 26,
  tint = "#059669",
  depth = 220,
  spread = 95,
  tilt = 22,
  tiltDirection = "right",
  perspective = 1400,
  visibleCards = 4,
  falloff = 0.2,
  blur = 6,
  duration = 700,
  autoplay = true,
  autoplayDelay = 3800,
  loop = true,
  showControls = true,
  showIndicators = true,
  className = "",
}) => {
  const data = useMemo(() => {
    return (Array.isArray(reviews) ? reviews : []).map(normalizeReview);
  }, [reviews]);

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

  const dragRef = useRef(null);
  const wheelTimerRef = useRef(null);
  const autoTimerRef = useRef(null);
  const reducedRef = useRef(false);

  const [active, setActive] = useState(0);

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
        setActive(idx);
      }
    },
    [tweenTo]
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

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className={`review-depth-carousel ${className}`.trim()}
      style={{ "--rdc-perspective": `${perspective}px` }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Patient Reviews Depth Carousel"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <div className="review-depth-carousel__stage" ref={stageRef}>
        {data.map((review, i) => (
          <div
            key={review._id || i}
            className="review-depth-carousel__card rounded-3xl"
            ref={(el) => (cardRefs.current[i] = el)}
            style={{ width: cardWidth, height: cardHeight, borderRadius: radius }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={active !== i}
            onClick={() => setFocus(i, true)}
          >
            <div className="review-depth-carousel__card-inner">
              {/* Header: Author + Star rating */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating || 5)].map((_, s) => (
                      <Star key={s} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      {review.rating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                  <Quote className="h-6 w-6 text-emerald-600/40" />
                </div>

                {/* Medicine Tag Pill */}
                {review.medicineTag && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800 mb-3.5">
                    <Sparkles size={11} className="text-emerald-600" />
                    <span>{review.medicineTag}</span>
                  </div>
                )}

                {/* Testimonial Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic line-clamp-5">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-2xl bg-linear-to-tr ${review.avatarColor} text-white flex items-center justify-center font-extrabold text-sm shadow-md shrink-0`}
                  >
                    {review.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {review.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{review.role}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin size={10} className="text-emerald-600" />
                        {review.location}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 shrink-0 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <span
                className="review-depth-carousel__tint"
                ref={(el) => (overlayRefs.current[i] = el)}
                style={{ background: tint }}
              />
            </div>
          </div>
        ))}
      </div>

      {showControls && count > 1 && (
        <>
          <button
            type="button"
            className="review-depth-carousel__arrow review-depth-carousel__arrow--prev"
            aria-label="Previous review"
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
            className="review-depth-carousel__arrow review-depth-carousel__arrow--next"
            aria-label="Next review"
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
        <div className="review-depth-carousel__dots" role="tablist" aria-label="Slides">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Go to review ${i + 1}`}
              className={`review-depth-carousel__dot${active === i ? " is-active" : ""}`}
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

export default ReviewDepthCarousel;
