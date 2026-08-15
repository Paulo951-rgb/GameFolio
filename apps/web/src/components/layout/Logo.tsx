import Link from "next/link";

/**
 * GameFolio wordmark + mark. A compact geometric "G" tile with the accent
 * gradient, paired with the wordmark. `href` makes it a link on most surfaces;
 * pass undefined to render a static mark (e.g. inside the export page).
 */
export function Logo({
  href = "/",
  className = "",
}: {
  href?: string | null;
  className?: string;
}) {
  const mark = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-base font-black text-white shadow-[0_4px_14px_-4px_var(--accent-glow)]"
      >
        G
      </span>
      <span className="text-[15px] font-bold tracking-tight text-content-primary">
        Game<span className="text-accent">Folio</span>
      </span>
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} className="transition hover:opacity-90" aria-label="GameFolio — accueil">
      {mark}
    </Link>
  );
}
