---
title: EAMS Epics and Stories
created: 2026-07-05
sources: [prd.md, architecture.md]
---

# EAMS Epics and Stories

Traces PRD FRs -> architecture.md components. Implementation order below is a dependency chain: Auth first (everything needs it), Employee/Asset next (Assignment/Maintenance depend on both existing), then Assignment, Maintenance, Dashboard/Reports, then Frontend pages per module.

## Epic 1 — Auth & Roles (FR-1, FR-2, FR-3)
- Story 1.1: User model + bcrypt password hashing.
- Story 1.2: POST /api/auth/login issuing JWT {userId, role, employeeId}.
- Story 1.3: `authenticate` + `requireRole` middleware.
- Story 1.4: POST /api/auth/register (admin-only account provisioning).
- Story 1.5: seed script creating one bootstrap admin account.

Files: `server/models/User.js`, `server/controllers/authController.js`, `server/routes/authRoutes.js`, `server/middleware/authenticate.js`, `server/middleware/requireRole.js`, `server/seed.js`.

## Epic 2 — Employee Module (FR-4)
- Story 2.1: Employee model.
- Story 2.2: CRUD controller + routes (admin/hr write, admin/hr/staff-self read), search/filter by name/department/status.
- Story 2.3: block delete when active assignments exist (409).

Files: `server/models/Employee.js`, `server/controllers/employeeController.js`, `server/routes/employeeRoutes.js`.

## Epic 3 — Asset Module (FR-5, FR-6)
- Story 3.1: Asset model with status enum, default `available`.
- Story 3.2: CRUD controller + routes (admin write, admin/hr/staff read), search/filter by tag/category/status, `warrantyWithinDays` query.
- Story 3.3: `updateAsset` strips `status` from body per AD-2.

Files: `server/models/Asset.js`, `server/controllers/assetController.js`, `server/routes/assetRoutes.js`.

## Epic 4 — Assignment Workflow (FR-7, FR-8, FR-9)
- Story 4.1: Assignment model.
- Story 4.2: POST /api/assignments (assign) — guards: asset must be `available`, employee must be `active`.
- Story 4.3: PATCH /api/assignments/:id/return.
- Story 4.4: GET /api/assets/:id/history, GET /api/employees/:id/history, GET /api/assignments/my (staff-scoped per AD-4).

Files: `server/models/Assignment.js`, `server/controllers/assignmentController.js`, `server/routes/assignmentRoutes.js`.

## Epic 5 — Maintenance Module (FR-10)
- Story 5.1: MaintenanceTicket model.
- Story 5.2: POST /api/maintenance (opens ticket, sets asset in-repair, auto-returns active assignment).
- Story 5.3: PATCH /api/maintenance/:id/resolve (resolves ticket, asset back to available).
- Story 5.4: GET /api/assets/:id/maintenance.

Files: `server/models/MaintenanceTicket.js`, `server/controllers/maintenanceController.js`, `server/routes/maintenanceRoutes.js`.

## Epic 6 — Dashboard & Reports (FR-11, FR-12)
- Story 6.1: GET /api/dashboard/summary (aggregation).
- Story 6.2: GET /api/reports/asset-allocation.csv (streamed CSV).

Files: `server/controllers/dashboardController.js`, `server/routes/dashboardRoutes.js`, `server/routes/reportRoutes.js`.

## Epic 7 — Frontend (FR-13, all modules)
- Story 7.1: `api/client.js` axios instance + `AuthContext` + `LoginPage`.
- Story 7.2: `NavBar` + `RequireRole` + router wiring in `App.jsx`.
- Story 7.3: `EmployeesPage`.
- Story 7.4: `AssetsPage` + `AssetDetailPage` (history + maintenance tabs).
- Story 7.5: assign/return actions wired into Assets pages.
- Story 7.6: `MaintenancePage`.
- Story 7.7: `MyAssetsPage` (staff).
- Story 7.8: `DashboardPage` with CSV export link.

Files: everything under `client/src/`.

## Cross-cutting (all epics)
- `server/config/db.js`, `server/middleware/errorHandler.js`, `server/app.js`, `server/server.js`, `.env`/`.env.example`.
