import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Reveal, Section } from "@/components/layout";
import { skills } from "@/data/portfolio";
import { cn, prefersReducedMotion } from "@/lib/utils";

// Xcode "Default (Dark)" token colours.
const tok = {
  kw: "text-[#fc5fa3]",
  type: "text-[#5dd8ff]",
  fn: "text-[#67b7a4]",
  str: "text-[#fc6a5d]",
  comment: "text-[#6c7986]",
  plain: "text-[#dfdfe0]",
} as const;

const T = ({ k, children }: { k: keyof typeof tok; children: ReactNode }) => <span className={tok[k]}>{children}</span>;

const tools = [...new Set(skills.flatMap((g) => g.items))];

/**
 * 0 = idle, 1 = component, 2 = route, 3 = query, 4 = response back in the UI.
 * Each keystroke walks the highlight down the stack and back up.
 */
function useTrace(q: string) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timers = [1, 2, 3, 4, 0].map((s, i) => window.setTimeout(() => setStep(s), i * 170));
    return () => timers.forEach(window.clearTimeout);
  }, [q]);
  return step;
}

function Layer({ file, active, children }: { file: string; active: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "border-l-2 px-4 py-3 transition-colors duration-150",
        active ? "border-[#2997ff] bg-white/[0.06]" : "border-transparent",
      )}
    >
      <p className="mb-1 font-sans text-[11px] font-medium text-white/40">{file}</p>
      <pre className="overflow-x-auto [scrollbar-width:none] whitespace-pre font-mono text-[12px] leading-6 sm:text-[13px]">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Stack() {
  const inputId = useId();
  const [q, setQ] = useState("sql");
  const step = useTrace(q);
  const term = q.trim().toLowerCase();
  const rows = useMemo(() => tools.filter((t) => t.toLowerCase().includes(term)), [term]);
  const param = `'%${term.replace(/'/g, "''")}%'`;
  const shown = rows.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-[#1f1f24] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 truncate rounded-md bg-white/[0.06] px-3 py-1 font-mono text-[11px] text-white/50">
          localhost:5173/tools?q={encodeURIComponent(term)}
        </span>
      </div>

      <div className={cn("p-4 transition-colors duration-150", step === 4 && "bg-white/[0.04]")}>
        <label htmlFor={inputId} className="sr-only">
          Search my toolbox
        </label>
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.08] px-3 py-2.5 ring-1 ring-white/10 focus-within:ring-[#2997ff]">
          <Search className="size-4 shrink-0 text-white/40" aria-hidden="true" />
          <input
            id={inputId}
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 24))}
            placeholder="Try “react” or “post”"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>
        <div className="mt-3 flex min-h-[64px] flex-wrap content-start gap-1.5" aria-live="polite">
          {shown.map((t) => (
            <span key={t} className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[12px] font-medium text-white/80">
              {t}
            </span>
          ))}
          {rows.length > shown.length && <span className="px-1 py-1 text-[12px] text-white/40">+{rows.length - shown.length} more</span>}
          {rows.length === 0 && <span className="py-1 text-[13px] text-white/40">Nothing in there yet. Maybe next year.</span>}
        </div>
      </div>

      <div className="border-t border-white/10 py-1">
        <Layer file="components/ToolSearch.tsx" active={step === 1}>
          <T k="kw">const</T> <T k="plain">res = </T>
          <T k="kw">await</T> <T k="fn">fetch</T>
          <T k="plain">(</T>
          <T k="str">{`\`/api/tools?q=${term}\``}</T>
          <T k="plain">);</T>
        </Layer>
        <Layer file="server/routes/tools.ts" active={step === 2}>
          <T k="plain">router.</T>
          <T k="fn">get</T>
          <T k="plain">(</T>
          <T k="str">"/tools"</T>
          <T k="plain">, </T>
          <T k="kw">async</T>
          <T k="plain"> (req, res) =&gt; {"{"}</T>
          {"\n  "}
          <T k="plain">res.</T>
          <T k="fn">json</T>
          <T k="plain">(</T>
          <T k="kw">await</T> <T k="fn">search</T>
          <T k="plain">(req.query.q));</T>
          {"\n"}
          <T k="plain">{"});"}</T>
        </Layer>
        <Layer file="server/db/search.sql" active={step === 3}>
          <T k="kw">SELECT</T> <T k="plain">name </T>
          <T k="kw">FROM</T> <T k="type">tools</T> <T k="kw">WHERE</T> <T k="plain">name </T>
          <T k="kw">LIKE</T> <T k="plain">?;</T>
          {"\n"}
          <T k="comment">{`-- ? = ${param}`}</T>
        </Layer>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/45">
        <span>
          <span className="text-[#28c840]">200</span> GET /api/tools
        </span>
        <span className="tabular-nums">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </span>
      </div>
    </div>
  );
}

export function Craft() {
  return (
    <Section id="craft">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <p className="text-sm font-semibold text-accent">How I work</p>
          <h2 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-fg">
            One keystroke, all the way down.
          </h2>
          <p className="mt-5 text-lg sm:text-xl leading-relaxed text-muted">
            Type something in the box. The search field is the part people see. Most of my time goes into what sits below
            it: the route that answers, and the query behind the route.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            It's searching the same list as the toolbox further down.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0">
          <Stack />
        </Reveal>
      </div>
    </Section>
  );
}
