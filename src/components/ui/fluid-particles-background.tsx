// Ported from 21st.dev — @bundui/fluid-particles-background
// Changes: sized to its container instead of the window, the animation loop is
// cancelled on unmount and paused while off-screen, and trails fade into the
// page's --bg colour so it blends with every theme.
import { useEffect, useRef, type ReactNode } from "react";
import { cn, prefersReducedMotion } from "@/lib/utils";

type Noise = { simplex3: (x: number, y: number, z: number) => number };

function createNoise(): Noise {
  const permutation = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
    21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
    237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
    111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
    73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
    52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182,
    189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
    39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
    144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204,
    176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66,
    215, 61, 156, 180,
  ];
  const p = new Array<number>(512);
  for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return {
    simplex3(x, y, z) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      const u = fade(x);
      const v = fade(y);
      const w = fade(z);
      const A = p[X] + Y;
      const AA = p[A] + Z;
      const AB = p[A + 1] + Z;
      const B = p[X + 1] + Y;
      const BA = p[B] + Z;
      const BB = p[B + 1] + Z;
      return lerp(
        w,
        lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
        lerp(
          v,
          lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
          lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1)),
        ),
      );
    },
  };
}

const noise = createNoise();

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface FluidParticlesBackgroundProps {
  children?: ReactNode;
  particleCount?: number;
  noiseIntensity?: number;
  particleSize?: { min: number; max: number };
  className?: string;
}

/**
 * The theme's --bg, painted at low alpha each frame to fade particle trails.
 * Passed to the canvas as-is: the production CSS minifier rewrites #000000 as #000,
 * so parsing it by hand broke the dark theme.
 */
function readTrailColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#ffffff";
}

const TRAIL_ALPHA = 0.12;

export function FluidParticlesBackground({
  children,
  particleCount = 2000,
  noiseIntensity = 0.003,
  particleSize = { min: 0.5, max: 2 },
  className,
}: FluidParticlesBackgroundProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { min, max } = particleSize;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    };
    resize();

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * (max - min) + min,
      vx: 0,
      vy: 0,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 50,
    }));

    let isDark = document.documentElement.classList.contains("dark");
    let trail = readTrailColor();
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
      trail = readTrailColor();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    let raf = 0;
    let visible = false;

    const step = () => {
      ctx.globalAlpha = TRAIL_ALPHA;
      ctx.fillStyle = trail;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      const t = Date.now() * 1e-4;
      for (const pt of particles) {
        pt.life += 1;
        if (pt.life > pt.maxLife) {
          pt.life = 0;
          pt.x = Math.random() * canvas.width;
          pt.y = Math.random() * canvas.height;
        }
        const alpha = Math.sin((pt.life / pt.maxLife) * Math.PI) * 0.15;
        const angle = noise.simplex3(pt.x * noiseIntensity, pt.y * noiseIntensity, t) * Math.PI * 4;
        pt.vx = Math.cos(angle) * 2;
        pt.vy = Math.sin(angle) * 2;
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.x < 0) pt.x = canvas.width;
        if (pt.x > canvas.width) pt.x = 0;
        if (pt.y < 0) pt.y = canvas.height;
        if (pt.y > canvas.height) pt.y = 0;
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };

    const reduced = prefersReducedMotion();
    if (reduced) {
      // Draw a still frame instead of animating.
      for (let i = 0; i < 60; i++) step();
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(wrap);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, [particleCount, noiseIntensity, min, max]);

  return (
    <div ref={wrapRef} className={cn("relative w-full h-dvh overflow-hidden bg-bg", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_85%,transparent)]"
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>
    </div>
  );
}
