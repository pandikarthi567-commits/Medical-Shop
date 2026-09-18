import React, { useEffect, useRef, useState } from 'react';
import './GlowCursor.css';

const GlowCursor = ({
  primaryColor = '#059669',     // Medical Emerald Green
  secondaryColor = '#0284C7',   // Electric Cyan Blue
  ringSize = 28,                // Medium balanced ring size
  hoverRingSize = 46,           // Medium hover expansion
  dotSize = 5,                  // Medium precision center dot
  showTrail = true,             // Smooth connected light trail
  className = '',
  enabled = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const trailPoints = useRef([]);
  const rafId = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
        if (ctx) {
          ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handlePointerMove = (e) => {
      const { clientX, clientY } = e;
      mousePos.current = { x: clientX, y: clientY };

      if (!isVisible) {
        setIsVisible(true);
        ringPos.current = { x: clientX, y: clientY };
      }

      if (showTrail) {
        trailPoints.current.unshift({
          x: clientX,
          y: clientY,
          alpha: 0.65,
          age: 0,
        });

        if (trailPoints.current.length > 14) {
          trailPoints.current.pop();
        }
      }
    };

    const handlePointerDown = () => setIsClicking(true);
    const handlePointerUp = () => setIsClicking(false);

    const handlePointerLeave = () => {
      setIsVisible(false);
      trailPoints.current = [];
    };

    const handlePointerEnter = () => setIsVisible(true);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isInteractive = target.closest(
        'a, button, input, select, textarea, [role="button"], .cursor-pointer, .interactive-hover'
      );
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('mouseenter', handlePointerEnter);
    document.addEventListener('mouseover', handleMouseOver);

    const animate = () => {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }

      const ease = 0.24;
      ringPos.current.x += (mx - ringPos.current.x) * ease;
      ringPos.current.y += (my - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      if (ctx && canvas && showTrail) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const pts = trailPoints.current;
        if (pts.length > 1) {
          ctx.beginPath();
          ctx.moveTo(mx, my);

          for (let i = 0; i < pts.length - 1; i++) {
            const p = pts[i];
            const next = pts[i + 1];
            const xc = (p.x + next.x) / 2;
            const yc = (p.y + next.y) / 2;
            ctx.quadraticCurveTo(p.x, p.y, xc, yc);
          }

          const last = pts[pts.length - 1];
          const gradient = ctx.createLinearGradient(last.x, last.y, mx, my);
          gradient.addColorStop(0, 'rgba(2, 132, 199, 0)');
          gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
          gradient.addColorStop(1, 'rgba(5, 150, 105, 0.7)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 3.2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          for (let i = pts.length - 1; i >= 0; i--) {
            pts[i].age += 1;
            pts[i].alpha -= 0.045;
            if (pts[i].alpha <= 0 || pts[i].age > 12) {
              pts.splice(i, 1);
            }
          }
        }
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('mouseenter', handlePointerEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [enabled, showTrail]);

  if (!enabled) return null;

  return (
    <div
      className={`pro-cursor-wrapper ${isVisible ? 'visible' : ''} ${className}`}
      aria-hidden="true"
    >
      {showTrail && <canvas ref={canvasRef} className="pro-cursor-trail-canvas" />}

      <div
        ref={ringRef}
        className={`pro-cursor-ring ${isHovered ? 'hovered' : ''} ${
          isClicking ? 'clicking' : ''
        }`}
        style={{
          '--ring-size': `${ringSize}px`,
          '--hover-ring-size': `${hoverRingSize}px`,
          '--primary-color': primaryColor,
          '--secondary-color': secondaryColor,
        }}
      />

      <div
        ref={dotRef}
        className={`pro-cursor-dot ${isHovered ? 'hovered' : ''} ${
          isClicking ? 'clicking' : ''
        }`}
        style={{
          '--dot-size': `${dotSize}px`,
          '--primary-color': primaryColor,
        }}
      />
    </div>
  );
};

export default GlowCursor;
