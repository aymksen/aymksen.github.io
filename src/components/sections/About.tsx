import { useEffect, useState, type ReactNode } from "react";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, MapPin, Sun } from "lucide-react";
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import { Globe } from "@/components/ui/globe";
import { GlowField, Reveal, Section, SectionHeading } from "@/components/layout";
import { experience, languages, profile } from "@/data/portfolio";

function GlassTile({
  children,
  className,
  draggable = false,
  distort = false,
}: {
  children: ReactNode;
  className?: string;
  draggable?: boolean;
  distort?: boolean;
}) {
  return (
    <LiquidGlassCard
      draggable={draggable}
      distort={distort}
      blurIntensity="xl"
      borderRadius="28px"
      glowIntensity="xs"
      shadowIntensity="xs"
      className={`h-full bg-white/55 p-6 sm:p-7 dark:bg-white/[0.06] ${className ?? ""}`}
    >
      {children}
    </LiquidGlassCard>
  );
}

type Weather = { temp: number; code: number };

// WMO weather codes → icon + label (Open-Meteo convention).
function describeWeather(code: number): { label: string; Icon: typeof Sun } {
  if (code === 0) return { label: "Clear", Icon: Sun };
  if (code <= 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (code <= 48) return { label: "Fog", Icon: CloudFog };
  if (code <= 57) return { label: "Drizzle", Icon: CloudDrizzle };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: "Rain", Icon: CloudRain };
  if (code <= 77 || code === 85 || code === 86) return { label: "Snow", Icon: CloudSnow };
  return { label: "Thunderstorm", Icon: CloudLightning };
}

function useMuensterNow() {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const { lat, lon } = profile.coords;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Europe%2FBerlin`,
      { signal: ctrl.signal },
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { current?: { temperature_2m?: number; weather_code?: number } }) => {
        if (typeof d.current?.temperature_2m === "number" && typeof d.current.weather_code === "number") {
          setWeather({ temp: d.current.temperature_2m, code: d.current.weather_code });
        }
      })
      // The card still shows time and place without weather.
      .catch(() => undefined);
    return () => ctrl.abort();
  }, []);

  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(now);
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", timeZone: "Europe/Berlin" }).format(now);
  return { time, date, weather };
}

function MuensterCard() {
  const { time, date, weather } = useMuensterNow();
  const w = weather ? describeWeather(weather.code) : null;
  return (
    <GlassTile draggable distort className="flex flex-col justify-between gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">Right now in</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-lg font-semibold text-fg">
            <MapPin className="size-4 text-accent" aria-hidden="true" />
            Münster
          </p>
        </div>
        {w && <w.Icon className="size-8 text-fg" aria-hidden="true" />}
      </div>
      <div>
        <p className="text-6xl font-semibold tabular-nums text-fg">{time}</p>
        <p className="mt-2 text-[15px] text-muted">
          {date}
          {weather && w && (
            <>
              {" · "}
              <span className="tabular-nums">{Math.round(weather.temp)}°C</span> {w.label.toLowerCase()}
            </>
          )}
        </p>
      </div>
    </GlassTile>
  );
}

const route = [
  { city: "El Jadida", what: "Automation" },
  { city: "Kharkiv", what: "B.Sc. CS" },
  { city: "Münster", what: "Software" },
];

export function About() {
  const now = experience[0];
  return (
    <Section id="about" className="overflow-hidden">
      <GlowField />
      <SectionHeading eyebrow="About" title={`Hello, I'm ${profile.firstName}.`} />
      <div className="grid auto-rows-auto gap-4 lg:grid-cols-6">
        <Reveal className="lg:col-span-4">
          <GlassTile>
            <p className="text-xl sm:text-2xl lg:text-[28px] font-medium leading-snug text-fg">{profile.summary}</p>
          </GlassTile>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.05}>
          <MuensterCard />
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.1}>
          <GlassTile className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted">Currently</p>
            <p className="text-xl font-semibold text-fg">{now.company}</p>
            <p className="text-[15px] leading-relaxed text-fg/80">
              {now.kind} in software development, building data tooling in Python and PostgreSQL — alongside an M.Sc. at
              the University of Münster.
            </p>
            <p className="mt-auto text-sm tabular-nums text-muted">{now.period}</p>
          </GlassTile>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.15}>
          <GlassTile>
            <p className="text-sm font-medium text-muted">Languages</p>
            <ul className="mt-4 space-y-3">
              {languages.map((l) => (
                <li key={l.name}>
                  <div className="flex items-baseline justify-between text-[15px]">
                    <span className="font-medium text-fg">{l.name}</span>
                    <span className="text-muted">
                      {l.level} · <span className="tabular-nums">{l.cefr}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fg/10" aria-hidden="true">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${l.value * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </GlassTile>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={0.2}>
          <GlassTile className="flex flex-col">
            <p className="text-sm font-medium text-muted">The route so far</p>
            <Globe size={190} className="mx-auto my-8" />
            <ol className="mt-auto flex items-start justify-between gap-2 text-center text-[13px]">
              {route.map((stop, i) => (
                <li key={stop.city} className="flex flex-1 items-start gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-fg">{stop.city}</p>
                    <p className="text-muted">{stop.what}</p>
                  </div>
                  {i < route.length - 1 && <span className="pt-px text-muted" aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
          </GlassTile>
        </Reveal>
      </div>
    </Section>
  );
}
