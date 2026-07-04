# ⚒ ForgeBudget

**Zero-based budgeting. Built for real life.**

> A production-ready React + TypeScript + Vite application for blue-collar workers and families with irregular income — construction workers, tradespeople, gig workers, side hustlers.

---

## Quick Start

```bash
# 1. Install dependencies (one time)
npm install

# 2. Start the development server
npm run dev
```

Then open your browser to **http://localhost:5173**

---

## Build for Production

```bash
npm run build      # Compiles & bundles to /dist
npm run preview    # Preview the production build locally
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety throughout |
| **Vite** | Fast dev server + build tool |
| **Tailwind CSS 3.4** | Utility-first styling (navy + orange palette) |
| **Zustand** | Global state + localStorage persistence |
| **React Hook Form + Zod** | Form handling + validation |
| **Chart.js + react-chartjs-2** | Income trend bar chart + investment doughnut |
| **Lucide React** | Icons |
| **React Router v6** | Tab/page navigation |

---

## Project Structure

```
forgebudget/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Modal, Toast, Card, Badge, ProgressBar, etc.
│   │   ├── layout/          # AppLayout, Sidebar, TopBar
│   │   ├── dashboard/       # Dashboard, IncomeChart
│   │   ├── income/          # IncomePage, AllocModal (zero-based allocation)
│   │   ├── savings/         # SavingsPage, BucketModal, ContribModal
│   │   ├── investments/     # InvestmentsPage (doughnut chart + table)
│   │   ├── retirement/      # RetirementPage (401k, Roth IRA, projection tool)
│   │   ├── goals/           # GoalsPage, GoalModal, GoalContribModal
│   │   ├── credit/          # CreditPage, AddCardModal, CCPayModal
│   │   └── plaid/           # PlaidPage, PlaidModal (mock Plaid Link)
│   ├── store/
│   │   └── useForgeBudget.ts  # Zustand store — all state + actions
│   ├── lib/
│   │   ├── utils.ts           # Formatting, calculations, date helpers
│   │   ├── defaultData.ts     # Seed data (Morgan Hutchins / Gig Harbor)
│   │   └── plaidMock.ts       # Mock Plaid connection + sync logic
│   ├── types/
│   │   └── index.ts           # All TypeScript interfaces + constants
│   ├── App.tsx                # Router setup
│   ├── main.tsx               # React root
│   └── index.css              # Tailwind + global styles
├── public/
│   └── forge-icon.svg
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Features

### ✅ Every feature from the prototype is implemented:

- **Dashboard** — Welcome header, metric cards, income trend chart, allocation status panel, recent activity, quick actions, savings snapshot
- **Income Tab** — Log paychecks (date, amount, source, notes), income history table with status badges, monthly/YTD/largest summaries
- **Zero-Based Allocation Modal** — Select unallocated income, distribute to savings buckets, goals, credit cards, and retirement; live remaining counter; strict $0 validation
- **Savings Buckets** — Pre-populated with 5 buckets (Emergency Fund, Home Down Payment, etc.), progress bars, add contributions, edit targets, create new buckets
- **Investments** — Holdings table, doughnut allocation chart (VTI, SCHD, VXUS, BTC, VNQ)
- **Retirement** — 401(k) + Roth IRA account cards, projection calculator (FV formula)
- **Financial Goals** — 4 pre-built goals, priority badges, days remaining, contribute to goals, add new goals
- **Credit Cards** — 5 pre-built cards, AZEO utilization tracking, make payments, overall utilization summary, add new cards
- **Plaid Accounts** — Mock connection flow (BECU, USAA, Chase, Capital One), sync simulation, balance drift demo
- **Toast Notifications** — Every action triggers a success/error/info toast
- **localStorage Persistence** — All data survives page refresh via Zustand persist middleware

---

## Replacing Mock Plaid with Real Plaid Link

The file `src/lib/plaidMock.ts` contains all connection and sync logic. To connect real Plaid:

1. Install `react-plaid-link`
2. Replace `buildMockPlaidAccount()` with a real Plaid Link token exchange
3. Replace `simulateSync()` with a real `/transactions/sync` or `/accounts/get` API call
4. No other files need to change — the store interface stays identical

---

## Future Extension Points

The codebase is structured for easy expansion:

- **Real backend** — Swap Zustand persist for Supabase/Firebase calls in the store actions
- **Expense tracking** — Add an `ExpensesPage` and `expenses` array to the store
- **PDF/CSV export** — Add a Reports tab using the existing data from the store
- **Dark mode** — Tailwind's `dark:` prefix + a theme toggle in the TopBar
- **Multi-user/family** — User ID scoping in the Zustand store + auth layer
- **Real Plaid** — See section above

---

## Data Persistence

All data is saved automatically to `localStorage` under the key `forgebudget-v095`. Data persists across browser sessions. To reset to default data, open the browser console and run:

```js
localStorage.removeItem('forgebudget-v095'); location.reload();
```

---

## Design System

| Token | Value |
|-------|-------|
| Navy (sidebar/hero) | `#0f1e2e` |
| Navy 2 (hover) | `#162840` |
| Navy 3 (accent) | `#1e3a52` |
| Orange (primary action) | `#ea580c` |
| Orange light | `#fb923c` |
| Body font | Inter (Google Fonts) |
| Mono font | JetBrains Mono |
| Border radius | `rounded-xl` (12px) |
| Card shadow | `shadow-sm` + `border border-slate-200` |

---

*ForgeBudget v0.95 — Prototype for blue-collar families*
