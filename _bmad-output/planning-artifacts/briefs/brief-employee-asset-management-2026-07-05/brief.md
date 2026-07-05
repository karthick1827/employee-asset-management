---
title: Employee Asset Management System (EAMS)
status: draft
created: 2026-07-05
updated: 2026-07-05
---

# Product Brief: Employee Asset Management System (EAMS)

## Executive Summary

EAMS is a web application that lets an organization's IT/admin team track company assets — laptops, monitors, phones, furniture, software licenses — and how they flow to and from employees over time. Today this tracking lives in spreadsheets that drift out of date the moment two people edit them at once: nobody can say with confidence who has which laptop, whether a warranty is about to lapse, or what happened to an asset after the third employee it was assigned to. EAMS replaces the spreadsheet with a single source of truth — employee records, asset inventory, an assignment/return workflow with full history, and maintenance ticket tracking — gated by role (Admin, HR, Staff) so the right people see the right data. A dashboard surfaces the numbers admins actually get asked for: total assets, assigned vs. available, and what's nearing warranty expiry.

## The Problem

IT/admin staff at small-to-mid organizations (50-500 employees) currently track assets in spreadsheets or, worse, in institutional memory. This breaks down in predictable ways: two admins edit the sheet simultaneously and one edit silently overwrites the other; a laptop is "reassigned" but the sheet still shows the previous owner; nobody logs when an asset went into repair, so warranty claims get missed; there's no single view of which departments are hoarding hardware and which are asset-starved. The cost is time (hunting down asset history for audits), money (buying new equipment because the old fleet's whereabouts are unknown), and trust (employees disputing "you never gave that back" without a record to check).

## The Solution

A role-gated MERN web app with four connected data flows:
- **Employee records** — who exists, their department/designation/status.
- **Asset inventory** — what the org owns, its lifecycle state (available / assigned / in-repair / retired).
- **Assignment workflow** — assign an asset to an employee, return it, and every transition is logged with a timestamp and condition notes — this log *is* the audit trail.
- **Maintenance tickets** — repair history tied to the asset, not siloed in email.

Admins get full control; HR manages employee data; Staff see only their own assigned assets. A dashboard and CSV/PDF export turn the underlying data into the reports admins are already asked for at review time.

## What Makes This Different

This is not competing with enterprise ITAM suites (ServiceNow, Snipe-IT) on feature breadth — the differentiator is being scoped exactly to what a 50-500 person single-org IT team needs, with nothing to configure away. No multi-tenancy, no approval-chain workflow engine, no procurement module — just the assign/return/repair loop done well, with an honest audit trail. The "moat," such as it is, is fit and simplicity, not novel technology.

## Who This Serves

- **Admin (IT)** — owns the full asset lifecycle: adds assets, assigns/returns them, tracks repairs, pulls reports. Success = never has to say "I don't know where that is."
- **HR** — manages employee records (onboarding/offboarding, department/designation/status changes) that assets get attached to. Success = an employee's record and their asset trail agree with each other.
- **Staff** — views their own assigned assets only. Success = a single place to confirm what they're accountable for.

## Success Criteria

- Every asset has a current, correct status (available/assigned/in-repair/retired) at all times — no more "we think it's with someone in Sales."
- Assignment/return history is complete enough to answer "who had this asset and when" for any asset, unprompted.
- Dashboard shows total/assigned/available counts and warranty-expiry-soon list without a manual spreadsheet pull.
- Role boundaries hold: Staff cannot see or edit another employee's assignments; only Admin can manage the asset/maintenance lifecycle.
- Admin can produce an asset-allocation report (CSV/PDF) without leaving the app.

## Scope

**In (v1 / MVP):**
- Auth & role-based access (Admin / HR / Staff), JWT-based.
- Employee CRUD (HR + Admin).
- Asset CRUD + status lifecycle (Admin).
- Assign-to-employee / return-from-employee workflow with history log.
- Maintenance ticket CRUD tied to an asset.
- Dashboard: totals, assigned vs. available, warranty-expiry-soon.
- Search & filter on employees and assets.
- CSV export of asset allocation (PDF is a stretch goal within v1 if time allows, else phase 2).

**Out (later phases / explicitly not v1):**
- Multi-tenancy / multi-organization support.
- Approval workflows or procurement/purchase-order tracking.
- Email/Slack notifications (e.g., warranty-expiry alerts as proactive pushes rather than dashboard pulls).
- Mobile app (responsive web only for v1).
- Barcode/QR scanning for asset check-in/out.

## Vision

If EAMS proves out, it becomes the default system of record IT teams reach for before anything touches a spreadsheet again — expanding into proactive notifications (warranty/expiry alerts), barcode-based check-in/out for faster floor operations, and eventually multi-department procurement requests feeding directly into the asset pipeline it already tracks.
