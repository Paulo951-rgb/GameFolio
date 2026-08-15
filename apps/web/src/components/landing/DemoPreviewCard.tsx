"use client";

/**
 * DemoPreviewCard — a static, clearly-labelled visual mockup of a GameFolio
 * profile used on the landing hero/templates sections. It is NOT a real
 * profile: the values are obvious placeholders ("Exemple") so nothing here is
 * ever presented as real player data. It exists only to show what the product
 * looks like.
 */
export function DemoPreviewCard() {
  return (
    <div className="surface-elevated glow-accent w-full overflow-hidden p-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-xl font-black text-white">
          E
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold text-content-primary">Exemple</h3>
            <span className="chip text-[10px] text-success">● En ligne</span>
          </div>
          <p className="truncate text-xs text-content-secondary">
            Compétiteur · FPS · Multi-jeux
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["COMPETITIVE", "FPS MAIN", "MULTIGAME"].map((b) => (
          <span
            key={b}
            className="rounded-md border border-accent-soft bg-accent-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent"
          >
            {b}
          </span>
        ))}
      </div>

      {/* Stat tiles */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { l: "Heures", v: "2 430" },
          { l: "Peak", v: "Diamant" },
          { l: "K/D", v: "1.28" },
        ].map((s) => (
          <div key={s.l} className="surface-2 p-2.5">
            <div className="text-[9px] uppercase tracking-wider text-content-muted">{s.l}</div>
            <div className="mt-0.5 text-base font-bold text-content-primary">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Game rows */}
      <div className="mt-4 space-y-2">
        {[
          { n: "Valorant", g: "FPS · Tactique", h: "800 h" },
          { n: "Minecraft", g: "Sandbox · Survival", h: "1 200 h" },
        ].map((g) => (
          <div
            key={g.n}
            className="flex items-center justify-between rounded-lg border border-line-subtle bg-surface p-2.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-surface-2 to-surface-elevated" />
              <div>
                <div className="text-xs font-semibold text-content-primary">{g.n}</div>
                <div className="text-[10px] text-content-muted">{g.g}</div>
              </div>
            </div>
            <span className="text-[10px] font-medium text-content-secondary">{g.h}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-content-muted">
        Aperçu — maquette illustrative
      </p>
    </div>
  );
}
