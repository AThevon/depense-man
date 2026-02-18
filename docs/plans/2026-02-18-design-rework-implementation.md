# Design Rework - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework complet du design de Depense-Man : glassmorphism subtil, font Outfit, bottom tab bar mobile, pages simplifiees, suppression du surplus.

**Architecture:** Rework par page avec design system d'abord. On modifie les fichiers existants et on cree les nouvelles pages (projections, credits). On supprime les composants inutilises a la fin. La logique metier (store Zustand, calculs, Firebase) reste inchangee.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Zustand, Motion, Nivo, Outfit (Google Fonts)

---

### Task 1: Design System - Font Outfit + Couleurs

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Step 1: Install Outfit font**

In `app/layout.tsx`, replace Space_Grotesk and Inter imports with Outfit:

```tsx
import { Outfit } from "next/font/google";

const fontOutfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
```

Update the body className:
```tsx
<body className={`${fontOutfit.variable} antialiased`}>
```

**Step 2: Update CSS variables in `app/globals.css`**

Replace the entire dark mode color scheme with the new glassmorphism palette. Key changes:
- Background: `#0a0a0b` (oklch ~0.07)
- Card/surface: `rgba(255, 255, 255, 0.03)`
- Border: `rgba(255, 255, 255, 0.08)`
- Foreground: `#e4e4e7` (zinc-200)
- Primary/accent: `#6366f1` (indigo-500)
- Success: `#34d399` (emerald-400)
- Destructive: `#f87171` (red-400)
- Add `--warning` color: `#fbbf24` (amber-400)
- Add `--surface` and `--surface-elevated` tokens

Update typography in `@layer base` to use `--font-outfit` for everything (body + headings).

Add `font-variant-numeric: tabular-nums` for `.tabular-nums` utility.

Update radius: `--radius: 1rem` (16px for cards).

Remove `--font-display` and `--font-body` references, replace with single `--font-outfit`.

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build passes (may have warnings about unused components, that's ok)

**Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: design system - outfit font + glassmorphism colors"
```

---

### Task 2: Layout - Bottom Tab Bar + New Header

**Files:**
- Modify: `components/layout/AppLayout.tsx`
- Modify: `components/layout/AppHeader.tsx`
- Create: `components/layout/BottomTabBar.tsx`

**Step 1: Create BottomTabBar component**

Create `components/layout/BottomTabBar.tsx`:

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { List, BarChart3, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

const tabs = [
  { id: 'list', label: 'Liste', icon: List, href: '/' },
  { id: 'stats', label: 'Stats', icon: BarChart3, href: '/stats' },
  { id: 'projections', label: 'Proj', icon: TrendingUp, href: '/projections' },
  { id: 'credits', label: 'Credits', icon: CreditCard, href: '/credits' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find(tab => tab.href === pathname)?.id
    || (pathname === '/' ? 'list' : 'list');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-xl border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[64px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-3 right-3 h-0.5 bg-[#6366f1] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-[#6366f1]' : 'text-[#71717a]'}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#6366f1]' : 'text-[#71717a]'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

**Step 2: Rewrite AppHeader**

Rewrite `components/layout/AppHeader.tsx`:
- Mobile: just logo "D-Man" left + settings gear icon right
- Desktop (md+): logo "D-Man" left + 4 tabs (Liste/Stats/Proj/Credits) center + settings icon right
- Tabs use `motion.div layoutId` for active pill
- Glassmorphism background: `bg-background/80 backdrop-blur-xl`
- Remove: user dropdown menu, dark/light toggle from header, copy JSON, logout
- Settings icon navigates to `/settings`
- Keep the theme logic in AppHeader but expose only settings gear

**Step 3: Rewrite AppLayout**

Rewrite `components/layout/AppLayout.tsx`:
- Remove Footer import and usage
- Add BottomTabBar (shown on all pages except /login)
- Determine active tab from pathname (/, /stats, /projections, /credits)
- Remove the old `handleTabChange` / `currentTab` logic (navigation is now via links)
- Add `pb-20 md:pb-0` to content area to account for bottom tab bar on mobile

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { BottomTabBar } from './BottomTabBar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = !pathname.startsWith('/login');

  return (
    <>
      {showChrome && <AppHeader />}
      <main className={showChrome ? 'pb-20 md:pb-0' : ''}>
        {children}
      </main>
      {showChrome && <BottomTabBar />}
    </>
  );
}
```

**Step 4: Verify build**

Run: `pnpm build`

**Step 5: Commit**

```bash
git add components/layout/BottomTabBar.tsx components/layout/AppHeader.tsx components/layout/AppLayout.tsx
git commit -m "feat: bottom tab bar mobile + new minimal header"
```

---

### Task 3: Page Liste - Hero Card + Items en lignes

**Files:**
- Modify: `components/dashboard/DashboardClient.tsx`
- Modify: `components/dashboard/MonthlyItemCard.tsx`
- Modify: `components/dashboard/TimeIndicator.tsx`

**Step 1: Rewrite DashboardClient**

Complete rewrite of `components/dashboard/DashboardClient.tsx`:

Remove:
- All 7 view mode buttons and state (viewMode)
- All view imports (TimelineView, CompactView, HeatmapView, KanbanView, TreemapView, Calendar)
- "non-credit" filter (simplify to: all, expense, credit, income)
- Footer import

Add:
- **Hero card "Reste a payer"** at the top:
  - Uses `calculation.remainingThisMonth` from store
  - Day simulator: `useState` for `simulatedDay` (default: today's day)
  - Select/dropdown to pick a day (1-31), resets on component mount
  - When simulatedDay changes, recalculate remainingThisMonth locally by filtering items where `getPayCyclePosition(item.dayOfMonth) > getPayCyclePosition(simulatedDay)`
  - Glassmorphism card: `bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl rounded-2xl`
  - Large amount display: `text-3xl font-bold tabular-nums`

- **Filters**: horizontal scrollable pills (Tout, Depenses, Credits, Revenus)
  - Use motion.div layoutId for active pill
  - Glassmorphism pill container

- **Items list**: render items as simple rows (not cards)
  - Items before simulatedDay position: opacity-60
  - TimeIndicator between past and future items
  - Items after: full opacity
  - Each item row: icon + name left, amount + day right
  - Swipe still works on mobile for edit/delete

- **Add button** at the bottom of the list

Structure:
```
<div className="min-h-screen bg-background">
  <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4">
    <HeroCard ... />
    <Filters ... />
    <ItemsList ... />
    <AddButton ... />
  </div>
  {/* Form Modals (keep existing) */}
</div>
```

**Step 2: Rewrite MonthlyItemCard as a simple row**

Rewrite `components/dashboard/MonthlyItemCard.tsx`:

Instead of a full Card with borders, make it a simple row:
- No Card wrapper, just a `div` with subtle bottom border
- Layout: `flex items-center` with icon, name, amount, day
- Keep swipe-to-reveal for mobile edit/delete
- Keep delete confirmation modal
- Accept new prop `isPast?: boolean` for opacity control
- Credit items show a small badge "Credit" instead of the full progress bar
- Remove the router.push to `/expense/[id]` on click (simplify - edit via swipe/hover)

```tsx
interface MonthlyItemCardProps {
  item: MonthlyItem;
  onEdit: (item: MonthlyItem) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  isPast?: boolean;
}
```

Row layout:
```
[Icon] [Name]                    [Amount] [J15]
       [Credit: 8 restants]              (muted)
```

**Step 3: Update TimeIndicator for new design**

Rewrite `components/dashboard/TimeIndicator.tsx`:
- Accept `simulatedDay` prop to show the simulated or real day
- Accent color line with "Aujourd'hui - J{day}" text
- Use `--accent` color (#6366f1)
- Simpler: just a horizontal line with label, no Calendar icon

```tsx
interface TimeIndicatorProps {
  day?: number;
  className?: string;
}
```

**Step 4: Verify build**

Run: `pnpm build`

**Step 5: Commit**

```bash
git add components/dashboard/DashboardClient.tsx components/dashboard/MonthlyItemCard.tsx components/dashboard/TimeIndicator.tsx
git commit -m "feat: page liste - hero card reste a payer + items en lignes + simulateur jour"
```

---

### Task 4: Page Stats - Simplifiee

**Files:**
- Modify: `components/stats/StatsPageWithWorker.tsx`
- Modify: `app/stats/page.tsx`

**Step 1: Rewrite StatsPageWithWorker**

Complete rewrite of `components/stats/StatsPageWithWorker.tsx`:

Remove:
- Web Worker usage (overkill for 2 cards + a list)
- All 10 metric cards
- All charts (Nivo imports, PredictionsChart, CashFlowChart, ExpensesPieChart)
- Jours critiques, petites depenses, credit timeline sections
- Staggered animations

Replace with a simple client component `StatsPage`:
```tsx
'use client';

import { useExpensesStore } from '@/lib/store/expenses';
import { useMemo } from 'react';
import { MonthlyExpense } from '@/lib/types';
import { calculateCreditInfo } from '@/lib/types';

export function StatsPage() {
  const { items, calculation } = useExpensesStore();

  // Calculate expense breakdown
  const expenseBreakdown = useMemo(() => {
    const expenses = items.filter((i): i is MonthlyExpense => i.type === 'expense');
    let creditTotal = 0;
    let nonCreditTotal = 0;
    expenses.forEach(e => {
      if (e.isCredit) {
        const info = calculateCreditInfo(e);
        if (info?.isActive) creditTotal += info.monthlyAmount;
      } else {
        nonCreditTotal += e.amount;
      }
    });
    return { creditTotal, nonCreditTotal, total: creditTotal + nonCreditTotal };
  }, [items]);

  // Top 5 expenses
  const top5 = useMemo(() => {
    return items
      .filter((i): i is MonthlyExpense => i.type === 'expense')
      .map(e => {
        const info = e.isCredit ? calculateCreditInfo(e) : null;
        const amount = info?.isActive ? info.monthlyAmount : (!e.isCredit ? e.amount : 0);
        return { ...e, displayAmount: amount };
      })
      .filter(e => e.displayAmount > 0)
      .sort((a, b) => b.displayAmount - a.displayAmount)
      .slice(0, 5);
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 md:px-6 py-4">
        <h2 className="text-lg font-semibold mb-4">Resume du mois</h2>

        {/* 2 cards side by side */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* Depenses card */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
            <p className="text-sm text-[#71717a] mb-1">Depenses</p>
            <p className="text-2xl font-bold tabular-nums text-[#f87171]">
              {formatEuro(expenseBreakdown.total)}
            </p>
            <div className="mt-2 space-y-1 text-xs text-[#71717a]">
              <p>Credits: {formatEuro(expenseBreakdown.creditTotal)}</p>
              <p>Hors credits: {formatEuro(expenseBreakdown.nonCreditTotal)}</p>
            </div>
          </div>

          {/* Revenus card */}
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
            <p className="text-sm text-[#71717a] mb-1">Revenus</p>
            <p className="text-2xl font-bold tabular-nums text-[#34d399]">
              {formatEuro(calculation.totalIncome)}
            </p>
          </div>
        </div>

        {/* Top 5 */}
        <h2 className="text-lg font-semibold mb-4">Top 5 depenses</h2>
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl divide-y divide-[rgba(255,255,255,0.05)]">
          {top5.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#71717a] w-5">{index + 1}.</span>
                <Icon name={item.icon} className="h-4 w-4 text-[#71717a]" />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium tabular-nums">{formatEuro(item.displayAmount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update `app/stats/page.tsx`**

Simplify to just render StatsPage (remove Web Worker dynamic import if it was there).

**Step 3: Verify build**

Run: `pnpm build`

**Step 4: Commit**

```bash
git add components/stats/StatsPageWithWorker.tsx app/stats/page.tsx
git commit -m "feat: page stats simplifiee - 2 cards + top 5"
```

---

### Task 5: Page Projections (Nouvelle)

**Files:**
- Create: `app/projections/page.tsx`
- Create: `components/projections/ProjectionsPage.tsx`

**Step 1: Create route `app/projections/page.tsx`**

Simple server component that renders ProjectionsPage:
```tsx
import { ProjectionsPage } from '@/components/projections/ProjectionsPage';
export default function Page() {
  return <ProjectionsPage />;
}
```

Note: this page requires auth. Check how `app/page.tsx` and `app/stats/page.tsx` handle auth - copy the same pattern.

**Step 2: Create `components/projections/ProjectionsPage.tsx`**

Client component that:
1. Reads items from Zustand store
2. Uses `generateExpensePredictions()` from `lib/creditCalculations.ts` for the 12-month forecast
3. Calculates total income (assumed stable) vs total expenses per month
4. Renders:

**Section 1: Line chart (12 months)**
- Use Nivo ResponsiveLine (already a dependency)
- 3 lines: Revenus (flat), Depenses (decreasing as credits end), Reste (increasing)
- Dark theme compatible colors
- Lazy-loaded with `dynamic(() => import(...), { ssr: false })`

**Section 2: Forecast table**
- For each of 12 months: month name, total depenses, total revenus, reste
- Highlight months where a credit ends (show which credit and how much is freed)
- Simple rows with glassmorphism container

**Section 3: Upcoming credit endings**
- List of active credits sorted by end date
- Each: icon, name, end date, monthly amount freed
- Use `calculateCreditInfoAtDate()` from `lib/creditCalculations.ts`

Use existing `generateExpensePredictions()` from `lib/creditCalculations.ts` which already does the heavy lifting.

For the income projection, calculate total monthly income from store items where `type === 'income'`.

**Step 3: Verify build**

Run: `pnpm build`

**Step 4: Commit**

```bash
git add app/projections/page.tsx components/projections/ProjectionsPage.tsx
git commit -m "feat: page projections - graphique 12 mois + tableau previsionnel"
```

---

### Task 6: Page Credits (Nouvelle)

**Files:**
- Create: `app/credits/page.tsx`
- Create: `components/credits/CreditsPage.tsx`

**Step 1: Create route `app/credits/page.tsx`**

Same pattern as projections page.

**Step 2: Create `components/credits/CreditsPage.tsx`**

Client component that:
1. Reads items from store
2. Filters active credits using `getActiveCreditsFromItems()` from `lib/utils/calculations.ts`
3. For each credit, calculates info with `calculateCreditInfoAtDate()` from `lib/creditCalculations.ts`
4. Renders:

**Section 1: Active credits list**
Each credit card (glassmorphism):
- Icon + name
- Monthly amount (e.g. "285,00 EUR/mois")
- Progress bar (percentage done)
- "Reste: X EUR sur Y EUR"
- "Fin: Oct 2026 (8 mois)"
- Use `--warning` color (#fbbf24) for credit accent

**Section 2: Summary card**
- Total mensuel: sum of all credit monthly amounts
- Total restant: sum of all credit remaining amounts
- Use `calculation.activeCredits` from store which already has { count, totalRemaining, totalMonthly }

**Step 3: Verify build**

Run: `pnpm build`

**Step 4: Commit**

```bash
git add app/credits/page.tsx components/credits/CreditsPage.tsx
git commit -m "feat: page credits - liste credits actifs + resume"
```

---

### Task 7: Page Login - Adaptation

**Files:**
- Modify: `components/auth/LoginForm.tsx`

**Step 1: Update LoginForm**

Adapt to new design system:
- Background: `bg-background` (new #0a0a0b)
- Card: glassmorphism style (`bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl rounded-2xl`)
- Keep the logo centered
- Update button to use accent color
- Input fields: `bg-[rgba(255,255,255,0.05)]` with subtle borders
- Font is now Outfit (inherited from layout)
- Remove Space Grotesk references if any

This is a light touch - mostly updating card/input styles to match glassmorphism.

**Step 2: Verify build**

Run: `pnpm build`

**Step 3: Commit**

```bash
git add components/auth/LoginForm.tsx
git commit -m "feat: page login - glassmorphism design"
```

---

### Task 8: Page Settings - Simplifiee

**Files:**
- Modify: `components/settings/SettingsClient.tsx`
- Modify: `app/settings/page.tsx`

**Step 1: Rewrite SettingsClient**

Simplify significantly. Remove:
- Section navigation (account/appearance/data/about tabs)
- "Vue par defaut" dropdown (only one view now)
- Animations checkbox
- Password change modal
- Delete all data button (dangerous, keep simple)

Replace with a single-page list:
- **Theme toggle** (dark/light/auto) - keep existing logic
- **Export JSON** button - copies items to clipboard
- **App version** display
- **GitHub link**
- **Logout** button at the bottom

All in a single scrollable page with glassmorphism cards.

No more section-based navigation. Just a clean list of settings.

Note: SettingsClient receives `user` as prop. Keep that interface. The page.tsx passes user from session.

**Step 2: Verify build**

Run: `pnpm build`

**Step 3: Commit**

```bash
git add components/settings/SettingsClient.tsx app/settings/page.tsx
git commit -m "feat: page settings simplifiee - glassmorphism"
```

---

### Task 9: Card component - Update to glassmorphism

**Files:**
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`

**Step 1: Update Card component**

Update default Card styles in `components/ui/card.tsx`:
- Replace `bg-card` with glassmorphism background
- Update border to subtle white-alpha
- Add backdrop-blur
- Update border-radius to 16px (rounded-2xl)

```tsx
className={cn(
  "bg-[rgba(255,255,255,0.03)] text-card-foreground flex flex-col gap-2 sm:gap-6 rounded-2xl border border-[rgba(255,255,255,0.08)] backdrop-blur-xl py-4 shadow-sm",
  className
)}
```

**Step 2: Update Button variants**

In `components/ui/button.tsx`:
- Default variant: use accent color `bg-[#6366f1] hover:bg-[#6366f1]/90 text-white`
- Update rounded to `rounded-xl` (12px)
- Ghost variant: `hover:bg-[rgba(255,255,255,0.05)]`

**Step 3: Update Input**

If `components/ui/input.tsx` exists, update:
- Background: `bg-[rgba(255,255,255,0.05)]`
- Border: `border-[rgba(255,255,255,0.08)]`
- Rounded: `rounded-lg` (8px)

**Step 4: Verify build**

Run: `pnpm build`

**Step 5: Commit**

```bash
git add components/ui/card.tsx components/ui/button.tsx components/ui/input.tsx
git commit -m "feat: ui components glassmorphism - card, button, input"
```

---

### Task 10: Cleanup - Supprimer le code mort

**Files:**
- Delete: `components/views/TimelineView.tsx`
- Delete: `components/views/CompactView.tsx`
- Delete: `components/views/HeatmapView.tsx`
- Delete: `components/views/KanbanView.tsx`
- Delete: `components/views/TreemapView.tsx`
- Delete: `components/calendar/Calendar.tsx`
- Delete: `components/calendar/PredictionCard.tsx`
- Delete: `components/ui/Footer.tsx`
- Delete: `lib/workers/stats.worker.ts` (if not used anymore by StatsPage)
- Modify: `app/expense/[id]/page.tsx` - check if still needed, simplify or remove
- Delete: `components/views/` directory entirely

**Step 1: Delete unused view components**

Remove all files in `components/views/` directory.

**Step 2: Delete calendar components**

Remove `components/calendar/Calendar.tsx` and `components/calendar/PredictionCard.tsx`.

**Step 3: Delete Footer**

Remove `components/ui/Footer.tsx`.

**Step 4: Delete stats worker**

Remove `lib/workers/stats.worker.ts` if StatsPage no longer uses it.

**Step 5: Check for broken imports**

Run: `pnpm build`

Fix any broken imports. DashboardClient should no longer import any of the deleted files. AppLayout should no longer import Footer.

**Step 6: Verify build passes cleanly**

Run: `pnpm build`
Expected: Clean build with no errors

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: cleanup - remove unused views, calendar, footer, stats worker"
```

---

### Task 11: Final Polish - Mobile Optimization

**Files:**
- Modify: `app/globals.css`
- Modify: various components as needed

**Step 1: Mobile safe areas**

In `app/globals.css`, ensure:
- Content doesn't overlap with bottom tab bar
- iPhone safe area is handled: `padding-bottom: env(safe-area-inset-bottom)`
- Touch targets are at least 44px

**Step 2: Reduce spacing for mobile**

Review all pages and ensure:
- Page padding: 16px mobile, 24px desktop
- Gap between items: 8px (was 8px space-y-2)
- Cards have compact padding on mobile
- No unnecessary vertical spacing eating screen space

**Step 3: Typography check**

Ensure Outfit font is rendering correctly everywhere:
- Body text, headings, buttons, inputs all use Outfit
- Amounts use `tabular-nums` for alignment
- Sizes are appropriate for mobile (not too large)

**Step 4: Test bottom tab bar doesn't overlap content**

Ensure `pb-20 md:pb-0` on main content area gives enough room.

**Step 5: Verify build**

Run: `pnpm build`

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: mobile polish - safe areas, spacing, typography"
```

---

## Notes for Implementer

### Things to preserve:
- Zustand store (`lib/store/expenses.ts`) - untouched
- Firebase integration - untouched
- Credit calculations (`lib/creditCalculations.ts`) - untouched
- Utility calculations (`lib/utils/calculations.ts`) - untouched
- Auth flow (hooks/useAuth, lib/auth/) - untouched
- Form components (SimpleExpenseForm, CreditExpenseForm, SimpleIncomeForm, ItemTypeSelector) - keep as-is, they open as modals
- PWA manifest and service worker - untouched
- Types (`lib/types.ts`) - untouched

### Format amounts helper:
```tsx
function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
```
This already exists in MonthlyItemCard. Extract to a shared util if needed.

### Day simulator logic:
The key calculation for "reste a payer" with a simulated day:
```tsx
const simulatedPosition = getPayCyclePosition(simulatedDay);
const remainingAfterSimDay = items
  .filter((item): item is MonthlyExpense => item.type === 'expense')
  .filter(item => getPayCyclePosition(item.dayOfMonth) > simulatedPosition)
  .reduce((sum, item) => {
    if (item.isCredit) {
      const creditInfo = calculateCreditInfo(item);
      if (creditInfo?.isActive) return sum + creditInfo.monthlyAmount;
      return sum;
    }
    return sum + item.amount;
  }, 0);
```

### Auth pattern for new pages:
Check `app/page.tsx` and `app/stats/page.tsx` to see how they handle auth. The new pages (projections, credits) need the same pattern. Likely they need to check session/auth and redirect to /login if not authenticated. If the app uses middleware for auth, the new routes may be automatically protected.

### Glassmorphism CSS utility class:
Consider adding a utility class in globals.css to avoid repeating the glassmorphism pattern:
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 16px;
}

.glass-elevated {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 16px;
}
```
