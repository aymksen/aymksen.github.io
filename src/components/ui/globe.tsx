// Ported from 21st.dev — @ruixen.ui/globe
// Changed: sized by prop, seamless loop (scrolls exactly one texture width), texture served locally,
// stars moved outside the sphere so they aren't clipped, and it stops for reduced motion.
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const TEXTURE = "/globe/earth.jpg";
const TEXTURE_RATIO = 500 / 313;

// The original shadows are tuned for a 250px globe; scale them so smaller globes keep their lit side.
function shading(size: number) {
  const k = size / 250;
  const px = (n: number) => `${Math.round(n * k)}px`;
  return [
    "0 0 20px rgb(255 255 255 / 0.2)",
    `${px(-5)} 0 ${px(8)} #c3f4ff inset`,
    `${px(15)} ${px(2)} ${px(25)} #000 inset`,
    `${px(-24)} ${px(-2)} ${px(34)} #c3f4ff99 inset`,
    `${px(250)} 0 ${px(44)} #00000066 inset`,
    `${px(150)} 0 ${px(38)} #000000aa inset`,
  ].join(", ");
}

const stars = [
  { left: "-14%", top: "8%", duration: "3s" },
  { left: "-22%", top: "46%", duration: "2s" },
  { left: "108%", top: "22%", duration: "4s" },
  { left: "118%", top: "64%", duration: "3s" },
  { left: "6%", top: "104%", duration: "1.5s" },
  { left: "86%", top: "-12%", duration: "4s" },
  { left: "94%", top: "108%", duration: "2s" },
];

export function Globe({ size = 220, className }: { size?: number; className?: string }) {
  const style = {
    width: size,
    height: size,
    "--globe-w": `${size * TEXTURE_RATIO}px`,
  } as CSSProperties;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full bg-fg/70 motion-safe:animate-[globe-twinkle_var(--d)_ease-in-out_infinite]"
          style={{ left: s.left, top: s.top, "--d": s.duration } as CSSProperties}
        />
      ))}
      <div
        className="relative overflow-hidden rounded-full bg-[length:auto_100%] bg-repeat-x motion-safe:animate-[globe-spin_30s_linear_infinite]"
        style={{ ...style, backgroundImage: `url(${TEXTURE})`, boxShadow: shading(size) }}
      />
    </div>
  );
}
