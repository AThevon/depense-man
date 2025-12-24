/**
 * Skeleton de chargement pour le Dashboard
 * S'affiche pendant le chargement des données côté serveur
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </header>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 mb-4 sm:mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
              <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="flex bg-muted border border-border rounded-lg p-1 mb-6">
            <div className="h-10 w-40 bg-background animate-pulse rounded"></div>
            <div className="h-10 w-40 bg-muted animate-pulse rounded ml-2"></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-12 flex-1 bg-muted animate-pulse rounded"></div>
            <div className="h-12 flex-1 bg-muted animate-pulse rounded"></div>
          </div>

          {/* View Mode Selector Skeleton */}
          <div className="mb-4">
            <div className="h-10 w-full max-w-2xl bg-muted animate-pulse rounded"></div>
          </div>

          {/* Items Skeleton */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
