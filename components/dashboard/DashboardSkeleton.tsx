export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-5 space-y-5">
        {/* Hero - Aurora Cockpit skeleton */}
        <div className="relative overflow-hidden glass rounded-3xl p-6 md:p-8">
          <div
            aria-hidden
            className="aurora-glow pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full"
            style={{
              background:
                'radial-gradient(circle at center, rgba(251,146,60,0.20) 0%, rgba(251,146,60,0.05) 40%, transparent 70%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-20 h-[22rem] w-[22rem] rounded-full opacity-40"
            style={{
              background:
                'radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, transparent 65%)',
            }}
          />

          <div className="relative">
            {/* Label + pulse dot */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-amber-400/60 animate-pulse" />
              <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
            </div>

            {/* Main amount */}
            <div className="h-12 sm:h-14 md:h-16 w-56 sm:w-64 md:w-80 bg-muted animate-pulse rounded-lg" />

            {/* Day chip */}
            <div className="mt-4 inline-block h-7 w-20 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] animate-pulse rounded-lg" />

            {/* Stats row */}
            <div className="mt-7 pt-5 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 md:h-7 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 md:h-7 w-20 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex">
          <div className="inline-flex bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-1 gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-7 w-16 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Liste des items */}
        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2 py-3 border-b border-[rgba(255,255,255,0.05)]"
            >
              <div className="h-9 w-9 bg-muted animate-pulse rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-3.5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-3 w-6 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Bouton Ajouter */}
        <div className="w-full glass rounded-2xl py-4 flex items-center justify-center">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
