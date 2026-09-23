// Ported from 21st.dev — @jahed/apple-tahoe-liquid-glass-button
//
// LiquidGlassViewport refracts a background image through the button's
// displacement map (SVG filter in Chromium, WebGL on Safari/iOS, blur fallback).
// Pass mode="webgl" to use the GPU renderer everywhere: the SVG path re-rasterises
// a full-size filter every frame, which is too heavy for large viewports.
// LiquidGlassButton works inside a viewport as in the original, and additionally
// works on its own anywhere on the page: it then lights its rim from a light
// source at the top-centre of the window, updating as the page scrolls.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import "./apple-tahoe-liquid-glass-button.css";

type Mode = "svg" | "webgl" | "blur";

interface ViewportContextValue {
  registerButton: (id: string, el: HTMLElement) => void;
  unregisterButton: (id: string) => void;
  mode: Mode;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

const PROFILE_BINS = 24;
const DISPLACEMENT_SCALE = 35;
const LIGHT_ORIGIN = { x: 0.5, y: 0 };

interface DisplacementMap {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  url: string;
}

/** Superellipse lens: R/G encode the refraction offset, 128 is neutral. */
function generateDisplacementMap(width: number, height: number, mode: Mode): DisplacementMap | null {
  const w = Math.max(1, Math.round(width) || 0);
  const h = Math.max(1, Math.round(height) || 0);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const n = 3.5;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x / w) * 2 - 1;
      const ny = (y / h) * 2 - 1;
      const r = Math.pow(Math.abs(nx), n) + Math.pow(Math.abs(ny), n);
      let red = 128;
      let green = 128;
      let alpha = 0;
      if (r <= 1) {
        const k = Math.sin(Math.pow(r, 0.8) * Math.PI);
        red = Math.round(128 + -nx * k * 127);
        green = Math.round(128 + -ny * k * 127);
        alpha = 255;
      }
      const i = (y * w + x) * 4;
      d[i] = red;
      d[i + 1] = green;
      d[i + 2] = 128;
      d[i + 3] = mode === "webgl" ? alpha : 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return { width: w, height: h, data: d, url: canvas.toDataURL("image/png") };
}

/** How strongly each rim direction faces a light arriving from `angle`. */
function analyzeProfile(map: DisplacementMap, angle: number) {
  const { width, height, data } = map;
  const profile = new Array<number>(PROFILE_BINS).fill(0);
  const counts = new Array<number>(PROFILE_BINS).fill(0);
  let sx = 0;
  let sy = 0;
  let total = 0;
  const stride = 2;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const dx = (data[i] - 128) / 127;
      const dy = (data[i + 1] - 128) / 127;
      const mag = Math.hypot(dx, dy);
      if (mag < 0.02) continue;
      const a = Math.atan2(dy, dx);
      const facing = Math.max(0, Math.cos(a - angle));
      const weight = mag * (0.35 + 0.65 * facing);
      sx += Math.cos(a) * weight;
      sy += Math.sin(a) * weight;
      total += weight;
      let bin = Math.floor(((a + Math.PI) / (2 * Math.PI)) * PROFILE_BINS) % PROFILE_BINS;
      if (bin < 0) bin += PROFILE_BINS;
      profile[bin] += weight;
      counts[bin]++;
    }
  }
  let peak = 0;
  for (let b = 0; b < PROFILE_BINS; b++) {
    if (counts[b]) profile[b] /= counts[b];
    if (profile[b] > peak) peak = profile[b];
  }
  if (peak > 0) for (let b = 0; b < PROFILE_BINS; b++) profile[b] /= peak;
  const samples = Math.max(1, (width * height) / (stride * stride));
  return { profile, domAngle: Math.atan2(sy, sx), magnitude: Math.min(1, (total / samples) * 6) };
}

function buildRimGradient(profile: number[], fromDeg: number) {
  const stops: string[] = [];
  for (let i = 0; i <= PROFILE_BINS; i++) {
    const v = profile[i % PROFILE_BINS];
    stops.push(`rgba(255,255,255,${(0.07 + v * 0.63).toFixed(3)}) ${((i / PROFILE_BINS) * 360).toFixed(1)}deg`);
  }
  return `conic-gradient(from ${fromDeg.toFixed(1)}deg at 50% 50%, ${stops.join(", ")})`;
}

function applyLighting(el: HTMLElement, map: DisplacementMap, angle: number) {
  const p = analyzeProfile(map, angle);
  const strength = 0.4 + p.magnitude * 0.6;
  const lightDeg = (p.domAngle * 180) / Math.PI + 90;
  el.style.setProperty("--cos", String(-Math.cos(p.domAngle) * strength));
  el.style.setProperty("--sin", String(-Math.sin(p.domAngle) * strength));
  el.style.setProperty("--light-angle", `${lightDeg}deg`);
  el.style.setProperty("--rim-intensity", String(p.magnitude));
  el.style.setProperty("--rim-gradient", buildRimGradient(p.profile, lightDeg));
}

function isAppleWebKit() {
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  return iOS || safari;
}

/* ------------------------------------------------------------------------ */
/* Viewport                                                                  */
/* ------------------------------------------------------------------------ */

export interface LiquidGlassViewportProps extends HTMLAttributes<HTMLDivElement> {
  bgImage: string;
  fallbackMode?: "webgl" | "blur";
  /** "auto" keeps the original choice: SVG in Chromium, fallbackMode on Safari/iOS. */
  mode?: "auto" | Mode;
  children?: ReactNode;
}

export function LiquidGlassViewport({
  bgImage,
  fallbackMode = "webgl",
  mode: modeProp = "auto",
  className,
  children,
  ...props
}: LiquidGlassViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const feImageARef = useRef<SVGFEImageElement>(null);
  const feImageBRef = useRef<SVGFEImageElement>(null);
  const baseId = useId().replace(/:/g, "-");
  const filterA = `${baseId}0`;
  const filterB = `${baseId}1`;
  const [mode, setMode] = useState<Mode>("svg");
  const buttonsRef = useRef<Record<string, HTMLElement>>({});
  const flipRef = useRef(0);
  const lastAngleRef = useRef("");
  const mapRef = useRef<DisplacementMap | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<{ bg?: WebGLTexture; disp?: WebGLTexture }>({});
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const bgReadyRef = useRef(false);
  const imgSizeRef = useRef({ w: 1, h: 1 });

  const bindTexture = (gl: WebGLRenderingContext, tex: WebGLTexture, img: HTMLImageElement, unit: number, flipY = false) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };

  const fallbackToBlur = useCallback(() => setMode("blur"), []);

  const initWebGL = useCallback(
    (canvas: HTMLCanvasElement) => {
      try {
        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
        if (!gl) return false;
        const vs = "attribute vec2 p; varying vec2 uv; void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
        const fs = `
          precision highp float; varying vec2 uv; uniform sampler2D bg; uniform sampler2D disp;
          uniform vec2 res; uniform vec4 rect; uniform float scale; uniform vec2 imgRes;
          // Map canvas UVs (origin bottom-left) to image UVs with background-size: cover.
          vec2 cover(vec2 p) {
            float rs = res.x / res.y;
            float ri = imgRes.x / imgRes.y;
            vec2 k = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
            return (p - 0.5) * k + 0.5;
          }
          void main() {
            vec2 frag = vec2(uv.x * res.x, (1.0 - uv.y) * res.y);
            vec2 local = (frag - rect.xy) / rect.zw;
            vec3 outc = texture2D(bg, cover(uv)).rgb;
            if (local.x >= 0.0 && local.x <= 1.0 && local.y >= 0.0 && local.y <= 1.0) {
              vec4 dm = texture2D(disp, vec2(local.x, local.y));
              if (dm.a > 0.01) {
                vec2 d = (dm.rg - 0.5) * 2.0 * scale;
                vec2 s = (frag + d) / res;
                outc = texture2D(bg, cover(vec2(s.x, 1.0 - s.y))).rgb;
              }
            }
            gl_FragColor = vec4(outc, 1.0);
          }
        `;
        const compile = (type: number, src: string) => {
          const s = gl.createShader(type);
          if (!s) throw new Error("Could not create shader");
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };
        const program = gl.createProgram();
        if (!program) return false;
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(program);
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        glRef.current = gl;
        programRef.current = program;
        uniformsRef.current = {
          bg: gl.getUniformLocation(program, "bg"),
          disp: gl.getUniformLocation(program, "disp"),
          res: gl.getUniformLocation(program, "res"),
          imgRes: gl.getUniformLocation(program, "imgRes"),
          rect: gl.getUniformLocation(program, "rect"),
          scale: gl.getUniformLocation(program, "scale"),
        };
        texturesRef.current = { bg: gl.createTexture() ?? undefined, disp: gl.createTexture() ?? undefined };
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!glRef.current || !texturesRef.current.bg) return;
          bindTexture(gl, texturesRef.current.bg, img, 0, true);
          imgSizeRef.current = { w: img.naturalWidth, h: img.naturalHeight };
          bgReadyRef.current = true;
        };
        img.onerror = () => {
          bgReadyRef.current = false;
          fallbackToBlur();
        };
        img.src = bgImage;
        return true;
      } catch {
        return false;
      }
    },
    [bgImage, fallbackToBlur],
  );

  const uploadDisplacement = useCallback((url: string) => {
    const gl = glRef.current;
    const tex = texturesRef.current.disp;
    if (!gl || !tex) return;
    const img = new Image();
    img.onload = () => bindTexture(gl, tex, img, 1);
    img.src = url;
  }, []);

  const registerButton = useCallback(
    (id: string, el: HTMLElement) => {
      buttonsRef.current[id] = el;
      const w = el.offsetWidth || 180;
      const h = el.offsetHeight || 60;
      el.style.borderRadius = `${h / 2}px`;
      const map = generateDisplacementMap(w, h, mode);
      if (!map) return;
      mapRef.current = map;
      lastAngleRef.current = "";
      if (mode === "svg") {
        feImageARef.current?.setAttribute("href", map.url);
        feImageBRef.current?.setAttribute("href", map.url);
      } else if (mode === "webgl") {
        uploadDisplacement(map.url);
      }
    },
    [mode, uploadDisplacement],
  );

  const unregisterButton = useCallback((id: string) => {
    delete buttonsRef.current[id];
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const bgLayer = bgLayerRef.current;
    const canvas = canvasRef.current;
    if (!container) return;

    let nextMode: Mode = "svg";
    if (modeProp !== "auto") nextMode = modeProp;
    else if (isAppleWebKit()) nextMode = fallbackMode === "webgl" ? "webgl" : "blur";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    setMode(nextMode);
    if (nextMode === "webgl" && canvas) {
      canvas.width = Math.round(container.clientWidth * dpr);
      canvas.height = Math.round(container.clientHeight * dpr);
      if (!initWebGL(canvas)) {
        nextMode = "blur";
        setMode("blur");
      }
    }

    let raf = 0;
    let visible = false;
    const loop = () => {
      const buttons = Object.values(buttonsRef.current);
      const map = mapRef.current;
      if (buttons.length === 0 || !map) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const btn = buttons[0];
      const b = btn.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      if (c.width > 0 && c.height > 0) {
        const nx = (b.left + b.width / 2 - c.left) / c.width;
        const ny = (b.top + b.height / 2 - c.top) / c.height;
        const angle = Math.atan2(LIGHT_ORIGIN.y - ny, LIGHT_ORIGIN.x - nx);
        const key = angle.toFixed(2);
        if (key !== lastAngleRef.current) {
          lastAngleRef.current = key;
          applyLighting(btn, map, angle);
        }
      }
      if (nextMode === "svg" && bgLayer) {
        // Alternate between two identical filters so Chromium re-rasterises.
        const fe = flipRef.current === 0 ? feImageARef.current : feImageBRef.current;
        if (fe) {
          fe.setAttribute("x", String(b.left - c.left));
          fe.setAttribute("y", String(b.top - c.top));
          fe.setAttribute("width", String(b.width));
          fe.setAttribute("height", String(b.height));
        }
        bgLayer.style.filter = `url(#${flipRef.current === 0 ? filterA : filterB})`;
        flipRef.current = 1 - flipRef.current;
      } else if (nextMode === "webgl" && bgReadyRef.current && canvas) {
        const gl = glRef.current;
        const program = programRef.current;
        const u = uniformsRef.current;
        if (gl && program) {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.useProgram(program);
          gl.uniform1i(u.bg, 0);
          gl.uniform1i(u.disp, 1);
          gl.uniform2f(u.res, canvas.width, canvas.height);
          gl.uniform2f(u.imgRes, imgSizeRef.current.w, imgSizeRef.current.h);
          gl.uniform4f(u.rect, (b.left - c.left) * dpr, (b.top - c.top) * dpr, b.width * dpr, b.height * dpr);
          gl.uniform1f(u.scale, DISPLACEMENT_SCALE * dpr);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    // Only run the refraction loop while the viewport is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(container);

    const onResize = () => {
      if (containerRef.current && canvas) {
        canvas.width = Math.round(containerRef.current.clientWidth * dpr);
        canvas.height = Math.round(containerRef.current.clientHeight * dpr);
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      const gl = glRef.current;
      if (gl) {
        if (texturesRef.current.bg) gl.deleteTexture(texturesRef.current.bg);
        if (texturesRef.current.disp) gl.deleteTexture(texturesRef.current.disp);
        if (programRef.current) gl.deleteProgram(programRef.current);
      }
    };
  }, [initWebGL, fallbackMode, modeProp, filterA, filterB]);

  const ctx = useMemo<ViewportContextValue>(() => ({ registerButton, unregisterButton, mode }), [registerButton, unregisterButton, mode]);

  return (
    <ViewportContext.Provider value={ctx}>
      <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden bg-black select-none", className)} {...props}>
        <canvas
          ref={canvasRef}
          className={cn("absolute inset-0 w-full h-full pointer-events-none z-0", mode === "webgl" ? "block" : "hidden")}
        />
        <div
          ref={bgLayerRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden will-change-[filter] [transform:translateZ(0)]"
          style={{ filter: mode === "svg" ? `url(#${filterA})` : "none" }}
        >
          <div
            className="absolute inset-0 w-[102%] h-[102%] -left-[1%] -top-[1%] bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        </div>
        <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            {[
              { id: filterA, ref: feImageARef },
              { id: filterB, ref: feImageBRef },
            ].map(({ id, ref }) => (
              <filter
                key={id}
                id={id}
                x="0"
                y="0"
                width="100%"
                height="100%"
                filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                {/* href is set imperatively once the button registers its displacement map. */}
                <feImage ref={ref} x="0" y="0" width="200" height="80" result="lens" preserveAspectRatio="none" />
                <feFlood floodColor="rgb(128,128,128)" result="neutral" />
                <feComposite in="lens" in2="neutral" operator="over" result="dispMap" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="dispMap"
                  scale={DISPLACEMENT_SCALE}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            ))}
          </defs>
        </svg>
        {children}
      </div>
    </ViewportContext.Provider>
  );
}

/* ------------------------------------------------------------------------ */
/* Button                                                                    */
/* ------------------------------------------------------------------------ */

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[15px]",
  xl: "px-12 py-5 text-sm",
} as const;

interface BaseProps {
  children: ReactNode;
  className?: string;
  size?: keyof typeof sizes;
  /** Tints the glass with a colour, e.g. "var(--accent)" for a primary action. */
  tint?: string;
}

type AsButton = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined };
type AsLink = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string };
export type LiquidGlassButtonProps = AsButton | AsLink;

/** Rim lighting for buttons that are not inside a LiquidGlassViewport. */
function useStandaloneLighting(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let map: DisplacementMap | null = null;
    let lastKey = "";
    let raf = 0;
    let visible = false;

    const build = () => {
      map = generateDisplacementMap(el.offsetWidth || 160, el.offsetHeight || 44, "svg");
      lastKey = "";
      schedule();
    };
    const update = () => {
      raf = 0;
      if (!map) return;
      const r = el.getBoundingClientRect();
      const nx = (r.left + r.width / 2) / window.innerWidth;
      const ny = (r.top + r.height / 2) / window.innerHeight;
      const angle = Math.atan2(LIGHT_ORIGIN.y - ny, LIGHT_ORIGIN.x - nx);
      const key = angle.toFixed(2);
      if (key === lastKey) return;
      lastKey = key;
      applyLighting(el, map, angle);
    };
    function schedule() {
      if (visible && !raf) raf = requestAnimationFrame(update);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    const ro = new ResizeObserver(build);
    io.observe(el);
    ro.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, enabled]);
}

/** Feeds the pointer position to the hover highlight and leans the glass toward it. */
function usePointerGlass(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--glass-mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--glass-my", `${(y * 100).toFixed(1)}%`);
      el.style.setProperty("--glass-tx", `${((x - 0.5) * 6).toFixed(2)}px`);
      el.style.setProperty("--glass-ty", `${((y - 0.5) * 4).toFixed(2)}px`);
    };
    const leave = () => {
      el.style.setProperty("--glass-tx", "0px");
      el.style.setProperty("--glass-ty", "0px");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
}

export function LiquidGlassButton(props: LiquidGlassButtonProps) {
  const { className, children, size = "xl", tint, ...rest } = props;
  const viewport = useContext(ViewportContext);
  const ref = useRef<HTMLElement>(null);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!viewport || !el) return;
    viewport.registerButton(id, el);
    return () => viewport.unregisterButton(id);
  }, [viewport, id]);

  useStandaloneLighting(ref, !viewport);
  usePointerGlass(ref);

  const mode: Mode = viewport ? viewport.mode : "svg";
  const glassFill = tint
    ? `color-mix(in srgb, ${tint} 88%, transparent)`
    : "color-mix(in srgb, white var(--glass-fill, 25%), transparent)";

  const style = {
    "--cos": "0",
    "--sin": "-0.6",
    "--light-angle": "0deg",
    "--rim-intensity": "0.6",
    "--rim-gradient": "none",
    ...(rest.style ?? {}),
  } as CSSProperties;

  const classes = cn(
    "liquid-glass-btn relative isolate select-none pointer-events-auto inline-flex items-center justify-center rounded-full border-0 bg-transparent cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
    sizes[size],
    className,
  );

  const inner = (
    <>
      <span aria-hidden="true" className="liquid-glass-btn__lift" />
      <span
        aria-hidden="true"
        className="liquid-glass-btn__fill absolute inset-0 rounded-[inherit] pointer-events-none z-0"
        style={{
          // In WebGL mode the refraction is drawn on the canvas below; a light frost keeps the label legible.
          background: mode === "webgl" ? "color-mix(in srgb, white 34%, transparent)" : glassFill,
          backdropFilter: mode === "webgl" ? "none" : "blur(2px) saturate(180%) brightness(1.05)",
          WebkitBackdropFilter: mode === "webgl" ? "none" : "blur(1px) saturate(180%) brightness(1.05)",
          backgroundImage:
            "radial-gradient(circle at calc(50% - var(--cos) * 50%) calc(50% - var(--sin) * 50%), rgba(255,255,255,0.2) 0%, transparent 60%)",
          boxShadow: `
              inset 0 0 0 1px color-mix(in srgb, white calc(var(--rim-intensity) * 20%), transparent),
              inset calc(var(--cos) * 1.8px) calc(var(--sin) * 3px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 90%), transparent),
              inset calc(var(--cos) * -2px) calc(var(--sin) * -2px) 0px -2px color-mix(in srgb, white calc(var(--rim-intensity) * 80%), transparent),
              inset calc(var(--cos) * -3px) calc(var(--sin) * -8px) 1px -6px color-mix(in srgb, white calc(var(--rim-intensity) * 60%), transparent),
              inset calc(var(--cos) * -0.3px) calc(var(--sin) * -1px) 4px 0px color-mix(in srgb, black 12%, transparent),
              inset calc(var(--cos) * -1.5px) calc(var(--sin) * 2.5px) 0px -2px color-mix(in srgb, black 20%, transparent),
              inset calc(var(--cos) * 0px) calc(var(--sin) * 3px) 4px -2px color-mix(in srgb, black 20%, transparent),
              inset calc(var(--cos) * 2px) calc(var(--sin) * -6.5px) 1px -4px color-mix(in srgb, black 10%, transparent),
              calc(var(--cos) * 4px) calc(var(--sin) * 4px) 10px 0px color-mix(in srgb, black 15%, transparent),
              calc(var(--cos) * 9px) calc(var(--sin) * 9px) 18px 0px color-mix(in srgb, black 10%, transparent)
            `,
        }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 z-10 rounded-[inherit] p-[1px] pointer-events-none"
        style={{
          background: "var(--rim-gradient)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          opacity: "calc(0.62 + var(--rim-intensity) * 0.24 + var(--glass-hover) * 0.3)",
        }}
      />
      <span aria-hidden="true" className="liquid-glass-btn__shine" />
      <span
        className="relative z-20 font-semibold select-none pointer-events-none flex items-center justify-center gap-2 whitespace-nowrap"
        style={{ color: tint ? "var(--accent-fg)" : viewport ? "rgb(0 0 0 / 0.85)" : "var(--glass-fg)" }}
      >
        {children}
      </span>
    </>
  );

  if (rest.href !== undefined) {
    const { style: _s, ...anchorProps } = rest as Omit<AsLink, keyof BaseProps>;
    return (
      <a ref={ref as RefObject<HTMLAnchorElement>} className={classes} style={style} {...anchorProps}>
        {inner}
      </a>
    );
  }
  const { style: _s, type = "button", ...buttonProps } = rest as Omit<AsButton, keyof BaseProps>;
  return (
    <button ref={ref as RefObject<HTMLButtonElement>} type={type} className={classes} style={style} {...buttonProps}>
      {inner}
    </button>
  );
}
