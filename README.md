# Employee Asset Management System (EAMS)

MERN-stack app for tracking company assets (laptops, monitors, phones, licenses) and their assignment to employees. Built via the BMAD-METHOD planning pipeline — see `_bmad-output/planning-artifacts/` for the product brief, PRD, architecture spine, and epics/stories that drove this implementation.

## Prerequisites

- Node.js LTS
- A MongoDB connection: either install MongoDB Community Server locally, or create a free MongoDB Atlas cluster and get its connection string.

## Setup

```bash
# Backend
cd server
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed               # creates bootstrap admin: admin@eams.local / Admin123!
npm run dev                 # starts API on http://localhost:5000

# Frontend (separate terminal)
cd client
npm install
cp .env.example .env       # points VITE_API_BASE_URL at the backend
npm run dev                  # starts Vite dev server, prints the local URL
```

Log in with `admin@eams.local` / `Admin123!`, then use "New Employee" / "New Asset" to start populating data, and `POST /api/auth/register` (as admin) to create HR/Staff accounts for real use.

**Change `SEED_ADMIN_PASSWORD` (env var) and rotate the bootstrap admin password before any real deployment.**

## What's implemented

All modules from the PRD MVP scope: Auth & Roles (JWT, admin/hr/staff), Employee CRUD, Asset CRUD with warranty tracking, Assign/Return workflow with full history, Maintenance tickets (auto-pulls an asset from circulation while in repair), Dashboard summary + warranty-expiry-soon list, and CSV export of asset allocation. Full endpoint list and schema design: `_bmad-output/planning-artifacts/architecture/architecture-employee-asset-management-2026-07-05/architecture.md`.

## Verification status

Backend was smoke-tested end-to-end against a temporary in-memory MongoDB (login, employee/asset CRUD, assign → dashboard reflects it → maintenance ticket auto-returns and flips status → resolve → CSV export → role-based 403 on a staff token) — all passed. The Vite dev server was started and confirmed serving the SPA and its client-side routes. The interactive UI (clicking through forms in an actual browser) was **not** visually verified in this session — no browser-automation tool was available here. Worth a manual click-through before considering this production-ready.

## Not yet built (deferred per PRD)

PDF export, notifications/alerts, barcode/QR scanning, SSO/password-reset — see PRD §6.2 for the full deferred list.
