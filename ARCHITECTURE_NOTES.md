# Architecture - Data Sharing Strategy

## Current Solution: Shared Component with URL Detection

### What we did:
- Both `/` and `/stats` use the same `DashboardClient` component
- Component detects current page via `usePathname()`
- Data loaded once on server, shared across "views"
- Navigation is instant (no reload)

### Benefits:
✅ Zero loading between dashboard/stats
✅ Single source of truth for data
✅ Separate URLs for SEO/bookmarks
✅ Simple implementation

### Trade-offs:
❌ Both pages load the same component (slightly larger initial bundle)
❌ Can't lazy-load stats-specific code
❌ Data not cached if you navigate away and come back

---

## Alternative: True Separate Pages with SWR

If we wanted truly separate pages with shared cache:

```typescript
// lib/hooks/useItems.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useItems() {
  const { data, error, isLoading } = useSWR('/api/items', fetcher, {
    revalidateOnFocus: false,    // Don't refetch on tab focus
    dedupingInterval: 60000,     // Cache for 1 minute
    suspense: false,              // Use loading state
  });

  return {
    items: data?.items ?? [],
    calculation: data?.calculation,
    isLoading,
    error,
  };
}
```

```typescript
// app/page.tsx
'use client';
import { useItems } from '@/lib/hooks/useItems';

export default function Dashboard() {
  const { items, calculation, isLoading } = useItems();

  if (isLoading) return <Spinner />;

  return <DashboardView items={items} calculation={calculation} />;
}
```

```typescript
// app/stats/page.tsx
'use client';
import { useItems } from '@/lib/hooks/useItems';

export default function Stats() {
  const { items, calculation, isLoading } = useItems();

  // ✅ SWR cache - instant load if coming from dashboard
  if (isLoading) return <Spinner />;

  return <StatsView items={items} calculation={calculation} />;
}
```

### Benefits of SWR approach:
✅ True code splitting (stats code only loads when needed)
✅ Automatic cache management
✅ Background revalidation
✅ Cross-tab synchronization
✅ Optimistic updates built-in

### Trade-offs:
❌ More complex setup
❌ Need to convert to Client Components (lose SSR benefits)
❌ Another dependency to manage

---

## Why LocalStorage is BAD for this:

```typescript
// ❌ DON'T DO THIS
localStorage.setItem('items', JSON.stringify(items));
```

**Problems:**
1. **Stale data**: No way to know if data is outdated
2. **No SSR**: Can't access on server, slow first paint
3. **Size limits**: 5-10MB max
4. **No type safety**: Serialization issues
5. **Security**: Vulnerable to XSS attacks
6. **No invalidation**: Manual cache clearing needed
7. **Sync issues**: Race conditions between writes

---

## Final Recommendation

**For Depense-Man:**
Current solution (shared component) is optimal because:
- It's a personal PWA (not public SEO-critical site)
- Fast navigation > code splitting priority
- Simple to understand and maintain
- No external dependencies

**If you needed separate pages in the future:**
Use SWR or React Query for client-side caching.

**Never use LocalStorage for dynamic data.**
