import { Chip, Reveal, Section, SectionHeading } from "@/components/layout";
import { experience } from "@/data/portfolio";

export function Experience() {
  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="Experience"
        title="Where I've worked."
        intro="Software now, with a few detours through robotics and automation before it."
      />
      <ol className="border-t border-line">
        {experience.map((job, i) => (
          <li key={job.company} className="border-b border-line">
            <Reveal delay={i * 0.04} className="grid gap-4 py-10 md:grid-cols-[220px_1fr] md:gap-10">
              <div className="text-sm text-muted">
                <p className="font-medium tabular-nums text-fg/80">{job.period}</p>
                <p className="mt-1">{job.location}</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-fg">{job.role}</h3>
                <p className="mt-1 text-[15px] text-muted">
                  <span className="font-medium text-fg">{job.company}</span> · {job.kind}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[16px] leading-relaxed text-fg/80">
                      <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
