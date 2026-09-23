// Ported from 21st.dev — @chowlol202/liquid-metal-hero
// Changes: the shader fills the hero section instead of the whole window, the
// title and actions accept any content (so the site's glass buttons can be
// used), and the shader follows the active theme.
import { useEffect, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { LiquidMetal } from "@paper-design/shaders-react";
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import { cn, prefersReducedMotion } from "@/lib/utils";

export interface LiquidMetalHeroProps {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  features?: ReactNode[];
  /** Tint colour for the metal, e.g. to match the theme. */
  metalTint?: string;
  /** Start the entrance animation (e.g. once an intro overlay has gone). */
  play?: boolean;
  className?: string;
  id?: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};
const pop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function LiquidMetalHero({
  badge,
  title,
  subtitle,
  actions,
  features = [],
  metalTint = "#ffffff",
  play = true,
  className,
  id,
}: LiquidMetalHeroProps) {
  const [speed, setSpeed] = useState(1);
  // On tall, narrow screens the metal sits lower so it stays clear of the text.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (prefersReducedMotion()) setSpeed(0);
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section id={id} className={cn("relative isolate min-h-dvh flex items-center justify-center overflow-hidden", className)}>
      {/* "Drops" preset from the original component: chrome metaballs on a transparent back. */}
      <LiquidMetal
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          position: "absolute",
          inset: 0,
          // Fade the metal out before the section edge so it never ends in a hard line.
          maskImage: "linear-gradient(to bottom, black 55%, transparent 96%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 96%)",
        }}
        speed={speed}
        // Cap the drawing buffer; full 2x retina at 1900px wide is ~6.5 MP per frame.
        maxPixelCount={1920 * 1080 * 1.5}
        colorBack="#ffffff00"
        colorTint={metalTint}
        repetition={3}
        softness={0.3}
        shiftRed={0.3}
        shiftBlue={0.3}
        distortion={0.3}
        contour={0.88}
        shape="metaballs"
        scale={narrow ? 1.1 : 0.9}
        offsetY={narrow ? 0.62 : 0.3}
        fit="cover"
      />
      {/* Keeps the headline legible where the metal passes behind it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 38%, color-mix(in srgb, var(--bg) 78%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl pt-24 pb-16">
        <motion.div className="text-center space-y-8" variants={container} initial="hidden" animate={play ? "visible" : "hidden"}>
          {badge && (
            <motion.div className="flex justify-center" variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-fg/8 px-3 py-1 text-xs font-medium text-fg backdrop-blur-sm transition-colors duration-300 hover:bg-fg/15">
                {badge}
              </span>
            </motion.div>
          )}
          <motion.div className="space-y-6" variants={item}>
            <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-fg leading-[1.05]" variants={item}>
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p className="max-w-3xl mx-auto text-lg sm:text-2xl text-fg/80 leading-relaxed" variants={item}>
                {subtitle}
              </motion.p>
            )}
          </motion.div>
          {actions && (
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={pop}>
              {actions}
            </motion.div>
          )}
          {features.length > 0 && (
            <motion.div className="pt-10" variants={item}>
              <LiquidGlassCard
                draggable={false}
                distort={false}
                blurIntensity="md"
                borderRadius="28px"
                glowIntensity="xs"
                shadowIntensity="xs"
                className="mx-auto max-w-4xl bg-fg/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-6 md:p-8">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-center text-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={play ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                    >
                      <div className="text-fg/90 font-medium text-base md:text-lg">{feature}</div>
                    </motion.div>
                  ))}
                </div>
              </LiquidGlassCard>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
