import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function Section({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("relative px-6 py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <Reveal className="mb-12 sm:mb-16 max-w-3xl">
      <p className="text-sm font-semibold text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-fg">{title}</h2>
      {intro && <p className="mt-5 text-lg sm:text-xl text-muted leading-relaxed">{intro}</p>}
    </Reveal>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-fg/[0.04] px-3 py-1 text-[13px] font-medium text-fg/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Soft colour fields behind glass so the refraction has something to bend. */
export function GlowField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]",
        className,
      )}
    >
      <div className="absolute -left-24 top-40 size-[28rem] rounded-full bg-[#5e5ce6]/25 blur-3xl dark:bg-[#5e5ce6]/30" />
      <div className="absolute right-0 top-1/3 size-[26rem] rounded-full bg-[#0a84ff]/20 blur-3xl dark:bg-[#0a84ff]/25" />
      <div className="absolute bottom-32 left-1/3 size-[24rem] rounded-full bg-[#ff9f0a]/15 blur-3xl dark:bg-[#ff375f]/20" />
    </div>
  );
}
