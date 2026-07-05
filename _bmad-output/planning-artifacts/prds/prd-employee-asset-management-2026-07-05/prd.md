---
title: Employee Asset Management System (EAMS)
created: 2026-07-05
updated: 2026-07-05
---

# PRD: Employee Asset Management System (EAMS)
*Working title — confirmed with brief.*

## 0. Document Purpose

This PRD is for the Architect and Dev agents that implement EAMS, and for Sishaath as the product owner reviewing scope. It builds on `brief.md` (same date) and does not repeat its narrative — see that doc for problem framing and vision. This PRD is structured around seven epics (Auth & Roles, Employee Module, Asset Module, Assignment Workflow, Maintenance Module, Dashboard/Reports, Frontend) with functional requirements (FR) nested under each, so the Architect and SM/Dev agents can trace every implementation decision back to a numbered requirement.

## 1. Vision

EAMS gives a single IT/admin team one system of record for "who has what." Every employee, every asset, and every handoff between them lives in one database instead of a spreadsheet that only one person can safely edit at a time. Role-based access means HR can manage employee data without touching asset inventory, Staff can check their own assigned gear without seeing anyone else's, and Admin has full lifecycle control — assign, return, repair, retire — with every transition logged.

## 2. Target User

### 2.1 Jobs To Be Done
- As an Admin, I need to know the current status and holder of every asset without asking around.
- As an Admin, I need a record of what happened to an asset before I approve a warranty claim or write-off.
- As HR, I need employee records to stay accurate as people join, move departments, or leave.
- As Staff, I need to see what I'm accountable for without needing IT to look it up for me.

### 2.2 Non-Users (v1)
Multiple organizations/tenants on one deployment; external vendors/contractors needing their own login; anyone needing a native mobile app (responsive web only).

### 2.3 Key User Journeys

- **UJ-1. Admin assigns a laptop to a new hire.**
  - **Persona + context:** Raj, IT admin, onboarding a new hire this morning.
  - **Entry state:** Authenticated as Admin, on the Assets page.
  - **Path:** Filters assets by status=available and category=laptop → picks one → clicks "Assign" → selects the employee from a searchable list → confirms.
  - **Climax:** Asset status flips to "assigned," the employee's profile now lists the laptop, and an assignment history entry is created with today's date.
  - **Resolution:** Raj moves to the next onboarding task; the laptop is no longer visible in the "available" pool for anyone else to assign.
  - **Edge case:** If the asset was already assigned (race with a second admin), the assign action is rejected with a clear "already assigned to X" error rather than silently double-assigning.

- **UJ-2. Staff checks their own assigned assets.**
  - **Persona + context:** Priya, a staff engineer, wants to confirm she's not still on the hook for a monitor she returned last month.
  - **Entry state:** Authenticated as Staff.
  - **Path:** Logs in → lands on "My Assets" → sees a list of currently assigned items only.
  - **Climax:** The monitor she returned is absent from the list (its return was logged when she handed it back).
  - **Resolution:** She has her answer without emailing IT. **Edge case:** if she tries to hit an API route for another employee's assignments directly, the server returns 403.

- **UJ-3. Admin reports on assets nearing warranty expiry.**
  - **Persona + context:** Raj, preparing for a budget review, wants to know what needs replacing.
  - **Entry state:** Authenticated as Admin, Dashboard page.
  - **Path:** Views the "warranty expiring soon" widget → filters to next 90 days → exports the underlying asset-allocation list as CSV.
  - **Climax:** He has a defensible list with purchase dates and warranty dates to bring to the budget meeting.
  - **Resolution:** CSV is downloaded and attached to the meeting agenda.

- **UJ-4. Admin logs an asset going into repair and back out.**
  - **Persona + context:** Raj, a laptop's screen cracked.
  - **Entry state:** Authenticated as Admin, on the asset's detail page.
  - **Path:** Opens the asset → "Report issue" → creates a maintenance ticket with a description → asset status flips to "in-repair" (auto-returned from its holder if it was assigned) → later, marks the ticket "resolved" → asset status flips back to "available."
  - **Climax:** The asset's full repair history is visible on its detail page.
  - **Resolution:** Asset is available for reassignment again.

## 3. Glossary

- **Employee** — a person in the org tracked by EAMS; has a department, designation, and status (active/inactive). Distinct from **User**.
- **User** — an EAMS login account with a role (admin/hr/staff) and credentials; optionally linked to an Employee record (a Staff user *is* an employee looking at their own data).
- **Asset** — a trackable physical or license item owned by the org; has a category, status, purchase/warranty dates.
- **Asset Status** — one of `available`, `assigned`, `in-repair`, `retired`. Exactly one value at a time per Asset.
- **Assignment** — a record linking one Asset to one Employee for a span of time (assignedDate → returnedDate, null while active). The full set of Assignments for an Asset is its history.
- **MaintenanceTicket** — a repair/issue record tied to one Asset, with a status (`open`, `in-progress`, `resolved`).
- **Role** — one of `admin`, `hr`, `staff`; governs what a User can see/do.

## 4. Features

### 4.1 Auth & Roles
**Description:** JWT-based login for Users with three roles. Admin can create HR/Staff accounts; there is no public self-registration in v1 (an org's IT team provisions accounts). Realizes UJ-1, UJ-2 (entry state for both).

**Functional Requirements:**

#### FR-1: User login
A registered User can log in with email + password and receive a JWT.
**Consequences (testable):**
- POST `/api/auth/login` with valid credentials returns 200 + a signed JWT containing `userId` and `role`.
- Invalid credentials return 401 without revealing whether the email exists.
- Passwords are stored only as bcrypt hashes, never plaintext.

#### FR-2: Role-based route protection
Every non-auth API route enforces a role check appropriate to its data.
**Consequences (testable):**
- A Staff JWT hitting an Admin-only route (e.g. create Asset) gets 403.
- A request with no/invalid JWT gets 401 on any protected route.
- HR JWT can access Employee routes but gets 403 on Asset-lifecycle routes (create/delete asset).

#### FR-3: Admin-provisioned accounts
Admin can create new User accounts (HR or Staff role), optionally linked to an Employee record.
**Consequences (testable):**
- POST `/api/auth/register` requires an Admin JWT; non-admin callers get 403.
- Duplicate email returns 409, not a silent overwrite.

**Out of Scope:** Password reset via email, SSO/OAuth, multi-factor auth — all deferred past v1.

### 4.2 Employee Module
**Description:** HR and Admin manage the employee roster that assets get attached to. Realizes UJ-1 (employee lookup during assignment).

**Functional Requirements:**

#### FR-4: Employee CRUD
Admin and HR can create, view, update, and soft-delete (status=inactive) Employee records.
**Consequences (testable):**
- POST/PUT `/api/employees` requires Admin or HR JWT; Staff gets 403.
- GET `/api/employees` supports search by name and filter by department/status.
- Deleting an Employee with active Assignments is blocked with a 409 until those Assignments are returned or reassigned.

### 4.3 Asset Module
**Description:** Admin manages the asset inventory and its lifecycle status. Realizes UJ-1, UJ-3.

**Functional Requirements:**

#### FR-5: Asset CRUD
Admin can create, view, update, and retire Assets.
**Consequences (testable):**
- POST/PUT/DELETE `/api/assets` requires Admin JWT; HR and Staff get 403 (Staff also has read access scoped to FR-7).
- GET `/api/assets` supports search by asset tag/category and filter by status.
- New assets default to `status: available`.

#### FR-6: Warranty tracking
Every Asset carries `purchaseDate` and `warrantyExpiry`; the system can list assets expiring within a given window.
**Consequences (testable):**
- GET `/api/assets?warrantyWithinDays=90` returns only assets whose `warrantyExpiry` falls within the next 90 days.

### 4.4 Assignment Workflow
**Description:** The assign/return loop and its history log — the core value of the product. Realizes UJ-1, UJ-2, UJ-4.

**Functional Requirements:**

#### FR-7: Assign asset to employee
Admin can assign an `available` Asset to an active Employee.
**Consequences (testable):**
- POST `/api/assignments` sets Asset status to `assigned`, creates an Assignment with `assignedDate=now`, `returnedDate=null`.
- Assigning an Asset that is not `available` returns 409 with the asset's current status/holder.
- Assigning to an inactive Employee returns 400.

#### FR-8: Return asset
Admin can mark an active Assignment as returned.
**Consequences (testable):**
- PATCH `/api/assignments/:id/return` sets `returnedDate=now` and flips the Asset status back to `available` (unless it was pulled into repair, see FR-9 interaction).
- Returning an already-returned Assignment returns 409.

#### FR-9: Assignment history
Every Assignment record is retained (never deleted) so full history is queryable per Asset and per Employee.
**Consequences (testable):**
- GET `/api/assets/:id/history` returns all Assignments for that asset, newest first.
- GET `/api/employees/:id/history` returns all Assignments for that employee.
- Staff can only query their own linked Employee's history (403 otherwise).

### 4.5 Maintenance Module
**Description:** Repair/issue tracking tied to an Asset, interacting with Asset status. Realizes UJ-4.

**Functional Requirements:**

#### FR-10: Maintenance ticket CRUD
Admin can open a maintenance ticket against an Asset, which pulls it out of circulation, and later resolve it.
**Consequences (testable):**
- POST `/api/maintenance` sets Asset status to `in-repair` and, if the asset had an active Assignment, auto-returns it (returnedDate=now, conditionNotes="pulled for repair").
- PATCH `/api/maintenance/:id/resolve` sets ticket status `resolved`, `resolvedDate=now`, and Asset status back to `available`.
- GET `/api/assets/:id/maintenance` lists all tickets for that asset.

### 4.6 Dashboard & Reports
**Description:** Aggregate views for Admin (and read-only relevant slices for HR). Realizes UJ-3.

**Functional Requirements:**

#### FR-11: Dashboard summary
A single endpoint returns the counts the dashboard needs in one call.
**Consequences (testable):**
- GET `/api/dashboard/summary` returns `{ totalAssets, assignedCount, availableCount, inRepairCount, retiredCount, warrantyExpiringSoon: [...] }` for an Admin JWT.

#### FR-12: CSV export
Admin can export the current asset-allocation table as CSV.
**Consequences (testable):**
- GET `/api/reports/asset-allocation.csv` streams a CSV with asset tag, category, status, current holder (if any), purchase date, warranty expiry.

**Out of Scope:** PDF export is a stretch goal, not required for v1 acceptance.

### 4.7 Frontend
**Description:** React (Vite) SPA consuming the above API, with role-aware navigation and routing (React Router). Not a separate epic in the backend sense, but tracked as its own implementation epic since every module above needs a corresponding page.

**Functional Requirements:**

#### FR-13: Role-aware navigation
The nav and available routes reflect the logged-in User's role; Staff never see Admin/HR-only screens in the UI (defense in depth on top of FR-2's server-side enforcement).

## 5. Non-Goals (Explicit)

- EAMS is not a multi-tenant SaaS product in v1 — single organization only.
- EAMS does not include a procurement/purchase-order workflow.
- EAMS does not send proactive notifications (email/Slack) in v1 — the dashboard is pull, not push.
- EAMS is not a native mobile app.

## 6. MVP Scope

### 6.1 In Scope
Epics 4.1–4.7 as specified above: Auth & Roles, Employee CRUD, Asset CRUD, Assignment workflow with history, Maintenance tickets, Dashboard summary, CSV export, and the React frontend covering all of it.

### 6.2 Out of Scope for MVP
- PDF export (CSV only for v1; `[NOTE FOR PM]` revisit if timeline allows).
- Barcode/QR scanning.
- Notifications/alerts.
- SSO/OAuth/password-reset flows.

## 7. Success Metrics

**Primary**
- **SM-1**: 100% of Assets have a status that matches reality at any audit spot-check. Validates FR-5, FR-7, FR-8, FR-10.
- **SM-2**: Every asset's assignment history can be reconstructed with zero gaps. Validates FR-9.

**Secondary**
- **SM-3**: Dashboard summary loads in a single request (no client-side aggregation of raw collections). Validates FR-11.

**Counter-metrics (do not optimize)**
- **SM-C1**: Do not optimize assignment speed by skipping the `available`-status guard (FR-7) — a fast but incorrect double-assignment is worse than a slightly slower correct one.

## 8. Open Questions

1. Should Staff accounts always map 1:1 to an Employee record, or can a User exist without a linked Employee? (Assumed: Staff User always links to exactly one Employee — see FR-9 Staff-scoping consequence.)
2. Is CSV the acceptable final export format for v1, or does PDF need to make the cut? (Assumed: CSV only, per brief scope.)

## 9. Assumptions Index

- [ASSUMPTION §4.1] No public self-registration; Admin provisions all accounts.
- [ASSUMPTION §4.4] Assigning to an inactive Employee is rejected rather than allowed with a warning.
- [ASSUMPTION §4.5] Opening a maintenance ticket auto-returns an active assignment rather than blocking the ticket creation.
- [ASSUMPTION §8.1] Staff User accounts always link 1:1 to an Employee record.
