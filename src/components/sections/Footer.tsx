import { profile } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <nav aria-label="Social" className="flex gap-5">
          <a className="hover:text-fg" href={`mailto:${profile.email}`}>
            Email
          </a>
          <a className="hover:text-fg" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="hover:text-fg" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-fg" href={profile.links.resume} target="_blank" rel="noreferrer">
            Résumé
          </a>
        </nav>
      </div>
    </footer>
  );
}
