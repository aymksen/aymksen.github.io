import { ArrowDown, MapPin } from "lucide-react";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import GradientWaveText from "@/components/ui/gradient-wave-text";
import { LiquidGlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import type { Theme } from "@/components/ui/apple-liquid-glass-switcher";
import { profile } from "@/data/portfolio";

export const WAVE_COLORS = ["#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f", "#ff9f0a", "#30d158"];

const METAL_TINT: Record<Theme, string> = { light: "#cfd8ea", dark: "#ffffff" };

export function Hero({ ready, theme }: { ready: boolean; theme: Theme }) {
  return (
    <LiquidMetalHero
      id="top"
      play={ready}
      metalTint={METAL_TINT[theme]}
      badge={
        <>
          <MapPin className="size-3.5" aria-hidden="true" />
          {profile.location} · {profile.role}
        </>
      }
      title={
        <GradientWaveText
          key={ready ? "play" : "wait"}
          as="span"
          paused={!ready}
          delay={0.5}
          speed={1.1}
          customColors={WAVE_COLORS}
          className="justify-center"
        >
          {profile.name}
        </GradientWaveText>
      }
      subtitle="Full-stack developer. React and TypeScript on the front, Node, MySQL and Postgres on the back, and whatever gets it shipped in between."
      actions={
        <>
          <LiquidGlassButton size="lg" tint="var(--accent)" href="#experience">
            My experience
            <ArrowDown className="size-4" aria-hidden="true" />
          </LiquidGlassButton>
          <LiquidGlassButton size="lg" href="#contact">
            Get in touch
          </LiquidGlassButton>
        </>
      }
      features={["React · TypeScript · Next.js", "Node.js · MySQL · PostgreSQL", "Git · Docker · CI/CD"]}
    />
  );
}
