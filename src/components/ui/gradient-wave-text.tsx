// Ported from 21st.dev — @tom_ui/gradient-wave-text
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_COLORS = ["#8d6869", "#5a8ea6", "#b9c96e", "#c7c571", "#cb706f", "#7e5e5f"];
const WAVE_END = 200;

export interface GradientWaveTextProps {
  children: ReactNode;
  /** Root element; use "span" inside headings and other phrasing content. */
  as?: "div" | "span";
  align?: "left" | "center" | "right";
  className?: string;
  /** Multiplier for the wave speed. */
  speed?: number;
  paused?: boolean;
  /** Delay before the wave starts, in seconds. */
  delay?: number;
  /** Loop the wave forever instead of playing once. */
  repeat?: boolean;
  /** Only start once the text scrolls into view. */
  inView?: boolean;
  once?: boolean;
  radial?: boolean;
  bottomOffset?: number;
  bandGap?: number;
  bandCount?: number;
  customColors?: string[];
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
  ariaLabel?: string;
}

export default function GradientWaveText({
  children,
  as: Root = "div",
  align = "center",
  className,
  speed = 1,
  paused = false,
  delay = 0,
  repeat = false,
  inView = false,
  once = true,
  radial = true,
  bottomOffset = 20,
  bandGap = 4,
  bandCount = 8,
  customColors,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaLabel,
}: GradientWaveTextProps) {
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef(0);
  const posRef = useRef(0);
  const loopsRef = useRef(0);
  const doneRef = useRef(false);
  const startedRef = useRef(false);
  const startAtRef = useRef(0);
  const seenRef = useRef(false);
  const [active, setActive] = useState(!inView);
  const maxLoops = repeat ? 0 : 1;

  useEffect(() => {
    if (!inView) {
      setActive(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (once && seenRef.current) return;
            setActive(true);
            seenRef.current = true;
          } else if (!once) {
            setActive(false);
          }
        });
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, once]);

  const colors = useMemo(() => (customColors?.length ? customColors : DEFAULT_COLORS), [customColors]);

  const stops = useMemo(() => {
    const out: string[] = [];
    const base = "var(--gradient-wave-base, rgb(29,29,31))";
    out.push(`${base} calc((var(--gi) + 0) * 1%)`);
    for (let i = 0; i < bandCount && i < colors.length * 2; i++) {
      const color = colors[i % colors.length];
      out.push(`${color} calc((var(--gi) + ${(i + 2) * bandGap}) * 1%)`);
    }
    out.push(`${base} calc((var(--gi) + ${(bandCount + 2) * bandGap}) * 1%)`);
    return out.join(", ");
  }, [colors, bandGap, bandCount]);

  const backgroundImage = useMemo(
    () => (radial ? `radial-gradient(circle at 50% bottom, ${stops})` : `linear-gradient(0deg, ${stops})`),
    [radial, stops],
  );

  useEffect(() => {
    ref.current?.style.setProperty("--gi", "-25");
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    posRef.current = -25;
    loopsRef.current = 0;
    doneRef.current = false;
    startedRef.current = false;
    startAtRef.current = performance.now() + Math.max(0, delay * 1000);
    el.style.setProperty("--gi", "-25");
  }, [active, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let last = performance.now();
    const tick = (now: number) => {
      if (doneRef.current) return;
      if (!startedRef.current) {
        if (now >= startAtRef.current) {
          startedRef.current = true;
          last = now;
        } else {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
      }
      const dt = Math.min(64, now - last);
      last = now;
      if (!paused) {
        let next = posRef.current + (dt * speed) / 16.6667;
        if (maxLoops === 0) {
          if (next >= WAVE_END) next %= WAVE_END;
          posRef.current = next;
          el.style.setProperty("--gi", String(next));
        } else {
          while (next >= WAVE_END && loopsRef.current < maxLoops) {
            next -= WAVE_END;
            loopsRef.current += 1;
          }
          if (loopsRef.current >= maxLoops) {
            posRef.current = WAVE_END;
            el.style.setProperty("--gi", String(WAVE_END));
            doneRef.current = true;
            return;
          }
          posRef.current = next;
          el.style.setProperty("--gi", String(next));
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, paused, maxLoops, active]);

  const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  const handleClick = useCallback((e: MouseEvent<HTMLElement>) => onClick?.(e), [onClick]);
  const handleEnter = useCallback((e: MouseEvent<HTMLElement>) => onMouseEnter?.(e), [onMouseEnter]);
  const handleLeave = useCallback((e: MouseEvent<HTMLElement>) => onMouseLeave?.(e), [onMouseLeave]);

  return (
    <Root
      ref={ref as never}
      className={cn(
        "flex w-full h-full items-center [--gradient-wave-base:rgb(29,29,31)] dark:[--gradient-wave-base:rgb(255,255,255)]",
        className,
      )}
      style={{ justifyContent, "--gi": -25 } as CSSProperties}
      aria-label={ariaLabel || undefined}
      role={ariaLabel ? "img" : undefined}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        style={{
          textAlign: align,
          backgroundImage,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          display: "inline-block",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
          paddingBottom: `${bottomOffset}%`,
          marginBottom: `-${bottomOffset}%`,
          paddingInline: 2,
        }}
      >
        {children}
      </span>
    </Root>
  );
}
