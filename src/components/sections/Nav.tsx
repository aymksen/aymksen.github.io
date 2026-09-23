import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher, type Theme } from "@/components/ui/apple-liquid-glass-switcher";
import { LiquidGlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import { profile } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    // The hero (#top) is observed too, so nothing is highlighted back at the top.
    const sections = ["#top", ...links.map((l) => l.href)]
      .map((href) => document.querySelector(href))
      .filter((el): el is Element => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id === "top" ? "" : `#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Nav({ theme, onThemeChange }: { theme: Theme; onThemeChange: (t: Theme) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full border pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled || open
            ? "border-line bg-bg/70 shadow-[0_8px_32px_rgb(0_0_0/0.08)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <a href="#top" className="flex items-center gap-2.5 rounded-full text-[15px] font-semibold text-fg">
          <span className="grid size-8 place-items-center rounded-full bg-fg text-[12px] font-bold text-bg">AM</span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active === l.href ? "bg-fg/[0.07] text-fg" : "text-muted hover:text-fg",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeSwitcher compact value={theme} onValueChange={onThemeChange} />
          <LiquidGlassButton size="sm" href={profile.links.resume} target="_blank" rel="noreferrer" className="hidden sm:inline-flex">
            Résumé
          </LiquidGlassButton>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full text-fg transition-colors hover:bg-fg/[0.06] md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto mt-2 max-w-5xl rounded-[28px] border border-line bg-bg/85 p-3 shadow-[0_16px_48px_rgb(0_0_0/0.12)] backdrop-blur-xl md:hidden"
          >
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-[17px] font-medium text-fg hover:bg-fg/[0.05]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={profile.links.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl px-4 py-3 text-[17px] font-medium text-accent hover:bg-fg/[0.05]"
                >
                  Résumé (PDF)
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
