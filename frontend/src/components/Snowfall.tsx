import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lightweight snowfall overlay:
 * - single <canvas>, pointer-events: none
 * - DPR-aware, pauses on tab blur, respects prefers-reduced-motion
 * - Env toggle: VITE_SNOW = "on" | "off" | "auto" (default "auto")
 *   "auto" shows snow in Nov–Feb.
 */
type Mode = "on" | "off" | "auto";

function getMode(): Mode {
  const raw = (import.meta.env.VITE_SNOW as Mode | undefined) ?? "auto";
  return raw === "on" || raw === "off" || raw === "auto" ? raw : "auto";
}

function autoSeasonEnabled(date = new Date()): boolean {
  const m = date.getMonth(); // 0=Jan
  return m === 10 || m === 11 || m === 0 || m === 1; // Nov, Dec, Jan, Feb
}

export default function Snowfall() {
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );

  // decide enablement once on mount
  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }
    const mode = getMode();
    setEnabled(mode === "on" || (mode === "auto" && autoSeasonEnabled()));
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) return;

    const cvs = canvasRef.current!;
    const ctx = cvs.getContext("2d", { alpha: true })!;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let width = 0;
    let height = 0;

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      width = innerWidth;
      height = innerHeight;
      cvs.style.width = `${width}px`;
      cvs.style.height = `${height}px`;
      cvs.width = Math.floor(width * dpr);
      cvs.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    type Flake = { x: number; y: number; r: number; vy: number; vx: number; a: number; spin: number };
    const FLAKES = Math.round(Math.min(220, Math.max(80, (width * height) / 22000)));
    const flakes: Flake[] = Array.from({ length: FLAKES }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 2.2,
      vy: 0.6 + Math.random() * 1.4,     // fall speed
      vx: -0.3 + Math.random() * 0.6,    // gentle wind
      a: Math.random() * Math.PI * 2,    // phase
      spin: 0.004 + Math.random() * 0.01 // side-to-side wobble
    }));

    const colorLight = "rgba(255,255,255,0.9)";
    const colorDark = "rgba(255,255,255,0.85)";

    const isDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;
    const dot = isDark ? colorDark : colorLight;

    const onVis = () => {
      pausedRef.current = document.hidden;
      if (!pausedRef.current && rafRef.current == null) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      if (pausedRef.current) { rafRef.current = null; return; }
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = dot;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.a += f.spin;
        // gentle horizontal sway
        const sway = Math.sin(f.a) * 0.6;
        f.x += f.vx + sway * 0.2;
        f.y += f.vy;

        if (f.y - f.r > height) {
          f.y = -f.r;
          f.x = Math.random() * width;
        }
        if (f.x < -8) f.x = width + 8;
        if (f.x > width + 8) f.x = -8;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
        mixBlendMode: "normal",
      }}
    />
  );
}
