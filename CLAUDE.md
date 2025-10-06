# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartClaim (智慧請款) - 內部請款與審批管理系統 for small to medium enterprises. Built with Next.js 15 (App Router), Supabase/PostgreSQL, and TailwindCSS v4 + ShadCN UI.

### Core Features

- User authentication and role-based access (`EMPLOYEE`, `MANAGER`, `ADMIN`)
- Invoice claim management with workflow states: `DRAFT` → `PENDING` → `APPROVED`/`REJECTED` → `PAID`
- Multi-invoice image upload (jpg/png/pdf) with Supabase Storage / AWS S3
- Single-layer approval workflow with email notifications (Resend / AWS SES)
- Report generation and export (CSV/Excel) with filtering and visualization
- Admin panel for user and permission management

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS v4 + ShadCN UI
- **Auth**: Supabase Auth (email/password)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Storage**: Supabase Storage or AWS S3
- **Email**: Resend or AWS SES
- **Deployment**: Vercel

## Development Commands

### Supabase Local Development

```bash
# Start local Supabase services
supabase start

# Stop local Supabase services
supabase stop

# View Supabase Studio
# Access at http://127.0.0.1:54323

# View email testing interface (Inbucket)
# Access at http://127.0.0.1:54324
```

### Local Service Ports

- API: `54321`
- Database: `54322`
- Studio: `54323`
- Inbucket (email testing): `54324`

## Authentication Flow

Uses Supabase Auth with email/password. Site URL configured for `http://127.0.0.1:3000` in local development. JWT tokens expire after 3600 seconds (1 hour).

## Database Schema Considerations

### User Roles

Three role types defined: `EMPLOYEE`, `MANAGER`, `ADMIN`

### Invoice Claim States

State machine flow: `DRAFT` → `PENDING` → `APPROVED`/`REJECTED` → `PAID`

### Key Entities

- Users (with role assignment)
- Claims/Invoices (with status, amount, purpose, dates)
- Invoice attachments (stored in Supabase Storage/S3)
- Approval history/audit trail

## Storage Configuration

Supabase Storage configured with:

- Max file size: 50MiB
- Image transformation enabled
- Supports invoice uploads (jpg/png/pdf)
