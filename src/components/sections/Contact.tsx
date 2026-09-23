import { FileText, Mail } from "lucide-react";
import { FluidParticlesBackground } from "@/components/ui/fluid-particles-background";
import GradientWaveText from "@/components/ui/gradient-wave-text";
import { LiquidGlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { Reveal } from "@/components/layout";
import { profile } from "@/data/portfolio";
import { WAVE_COLORS } from "./Hero";

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title">
      <FluidParticlesBackground className="h-auto min-h-[640px] py-28" particleCount={1200}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-sm font-semibold text-accent">Contact</p>
            <h2 id="contact-title" className="mt-3 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
              <GradientWaveText as="span" inView repeat={false} customColors={WAVE_COLORS} speed={1.1}>
                Let's build something.
              </GradientWaveText>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-muted">
              Have a role, a project or a question about maps, data or the web? My inbox is open.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <LiquidGlassButton size="lg" tint="var(--accent)" href={`mailto:${profile.email}`}>
              <Mail className="size-4" aria-hidden="true" />
              {profile.email}
            </LiquidGlassButton>
            <LiquidGlassButton size="lg" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              <LinkedInIcon className="size-4" />
              LinkedIn
            </LiquidGlassButton>
            <LiquidGlassButton size="lg" href={profile.links.github} target="_blank" rel="noreferrer">
              <GitHubIcon className="size-4" />
              GitHub
            </LiquidGlassButton>
            <LiquidGlassButton size="lg" href={profile.links.resume} target="_blank" rel="noreferrer">
              <FileText className="size-4" aria-hidden="true" />
              Résumé
            </LiquidGlassButton>
          </Reveal>
        </div>
      </FluidParticlesBackground>
    </section>
  );
}
