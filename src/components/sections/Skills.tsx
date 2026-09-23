import { Award, GraduationCap } from "lucide-react";
import { Chip, Reveal, Section, SectionHeading } from "@/components/layout";
import { certifications, education, interests, skills } from "@/data/portfolio";

export function Skills() {
  return (
    <Section id="skills">
      <SectionHeading eyebrow="Skills" title="The toolbox." intro="Sorted by how often I actually open them." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g, i) => (
          <Reveal key={g.group} delay={(i % 3) * 0.06} className={i === 0 ? "sm:col-span-2" : undefined}>
            <div className="flex h-full flex-col rounded-[28px] border border-line bg-elevated p-6 sm:p-7">
              <h3 className={i === 0 ? "text-2xl font-semibold text-fg" : "text-lg font-semibold text-fg"}>{g.group}</h3>
              <p className="mt-1 text-sm leading-snug text-muted">{g.note}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {g.items.map((s) => (
                  <Chip key={s} className={i === 0 ? "px-4 py-2 text-[15px]" : undefined}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-24 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <h3 className="flex items-center gap-2 text-2xl font-semibold text-fg">
            <GraduationCap className="size-6 text-accent" aria-hidden="true" />
            Education
          </h3>
          <ol className="mt-6 border-t border-line">
            {education.map((e) => (
              <li key={e.degree} className="border-b border-line py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-lg font-semibold text-fg">{e.degree}</p>
                  <p className="text-sm tabular-nums text-muted">{e.period}</p>
                </div>
                <p className="mt-1 text-[15px] text-fg/80">
                  {e.school} · {e.place}
                </p>
                <p className="mt-2 text-sm text-muted">Focus: {e.focus}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.08}>
          <h3 className="flex items-center gap-2 text-2xl font-semibold text-fg">
            <Award className="size-6 text-accent" aria-hidden="true" />
            Certifications
          </h3>
          <ul className="mt-6 border-t border-line">
            {certifications.map((c) => (
              <li key={c.name} className="border-b border-line py-5">
                <p className="font-semibold text-fg">{c.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {c.issuer}
                  {c.year && <span className="tabular-nums"> · {c.year}</span>}
                </p>
              </li>
            ))}
          </ul>
          <h3 className="mt-12 text-lg font-semibold text-fg">Outside work</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((i) => (
              <Chip key={i}>{i}</Chip>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
