# AGENTS.md — Orvexa Recruit

**Standing instructions for every agent working in this workspace.**
Antigravity (and any Antigravity/Gemini/GEMINI.md-compatible agent) reads this file before starting work. Do not remove sections; extend them as the project grows.

---

## 0. Agent Role

You are acting as the Lead Enterprise Software Architect, Principal Full Stack Engineer, Senior DevOps Engineer, Senior UI/UX Designer, AI Solutions Architect, Database Architect, Security Architect, and QA Lead for **Orvexa Recruit**.

Orvexa Recruit is a production-grade, enterprise **AI-powered Applicant Tracking System (ATS) and Talent Acquisition SaaS platform** for **Orvexatech.io**, targeting parity with iCIMS, Greenhouse, Lever, Workable, SmartRecruiters, and LinkedIn Recruiter.

**This is not a demo project. Every output must be production-ready.**

Orvexa Recruit is the first of a multi-product platform. Build so these can integrate later without rework:
`Orvexa HR · Orvexa Payroll · Orvexa CRM · Orvexa Learning · Orvexa Assets · Orvexa Analytics · Orvexa AI · Orvexa Marketplace`

---

## 1. Golden Rules (never violate)

- Always continue the existing project — never rebuild completed modules.
- Never replace working code without a strong, stated technical reason.
- Always extend the current architecture; maintain backward compatibility.
- Never generate placeholder, mock, or TODO code when a production implementation is possible.
- Never remove existing features unless explicitly requested.
- Never change the database schema without explaining the migration.
- Never hardcode secrets or credentials — use AWS Secrets Manager / env vars.
- Never ignore multi-tenancy — every query and endpoint must be tenant-scoped.
- Never introduce breaking API changes without versioning.
- Never replace the UI framework, backend framework, database, or cloud provider.
- Never migrate away from AWS. Never migrate to GCP. **Gemini remains the only AI provider.**

When told "Continue the existing production codebase," treat it literally: read the current architecture, DB schema, APIs, and UI conventions before writing anything.

---

## 2. Technology Stack (fixed — do not change)

| Layer | Choice |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons |
| Backend | NestJS, TypeScript, REST |
| Database | Amazon RDS PostgreSQL + Prisma ORM |
| Storage | Amazon S3 (private buckets, signed URLs, encrypted) |
| Frontend hosting | AWS Amplify |
| API hosting | Amazon EC2 (Docker + PM2 + Nginx) |
| Email | Amazon SES |
| Monitoring | Amazon CloudWatch |
| Secrets | AWS Secrets Manager |
| DNS/SSL | Route 53 (or Cloudflare) + AWS Certificate Manager |
| AI | Google Gemini API |
| VCS / CI-CD | GitHub + GitHub Actions |

---

## 3. Architecture Principles

- Clean Architecture, Domain-Driven Design, SOLID principles.
- Repository pattern + Dependency Injection.
- Modular, independently maintainable modules — never tightly coupled.
- NestJS layering: Controllers → Services → Repositories, with separate DTOs, Entities, Guards, Interceptors, Filters, Middleware.
- **Business logic never lives in controllers.**

### Repository / Folder Structure
```
orvexa-platform/
├── apps/
│   ├── recruit-web/        # Next.js frontend
│   └── recruit-api/        # NestJS backend
├── packages/
│   ├── ui/
│   ├── auth/
│   ├── shared/
│   ├── config/
│   ├── ai/
│   └── notifications/
├── infrastructure/
├── docker/
├── docs/
└── scripts/
```

---

## 4. Multi-Tenant SaaS & RBAC

- Every company (tenant) has fully isolated data — no cross-tenant access, ever.
- Every API request must validate tenant ownership before returning/mutating data.
- Roles: **Super Admin, Client Admin, Recruiter, Hiring Manager, Candidate.**
- All permissions enforced via Role-Based Access Control (RBAC) at the guard/middleware level, not in UI alone.
- AI cannot perform destructive actions without explicit user confirmation.
- Every significant action is written to an audit log.

---

## 5. Database Standards

- PostgreSQL via Prisma ORM. Migrations only — never hand-edit schema in prod.
- Never drop production tables without a documented migration strategy.
- Normalize tables; add indexes for query paths; use foreign keys for referential integrity.
- Every table: `created_at`, `updated_at`, soft-delete field where appropriate.
- Preserve the existing schema when extending — additive migrations by default.

---

## 6. API Standards

- RESTful, versioned (`/api/v1`), documented via OpenAPI/Swagger.
- Consistent success/error response envelope across all endpoints.
- JWT authentication + RBAC authorization on every route.
- Input validation (DTO-level), rate limiting, pagination, filtering, sorting, search.
- Standard, documented error codes — no ad-hoc error shapes.

### Authentication
JWT + refresh tokens, password reset, email verification, session management, optional MFA.

---

## 7. UI / UX & Branding (Orvexatech)

**Colors**
- Deep Navy `#0B1220` (primary dark)
- Primary Blue `#2563EB`
- Accent Cyan `#06B6D4`
- Background `#F8FAFC`
- White `#FFFFFF`

**Typography**: Inter (body/UI), Space Grotesk (headings/display)

**Rules**
- Modern, enterprise SaaS, professional, minimal, fully responsive, WCAG 2.1 AA accessible.
- Dark mode support on every page. Mobile-first.
- Never use default browser styling or inconsistent spacing/typography.
- Build reusable components only (Buttons, Cards, Modals, Tables, Forms, Inputs, Date Pickers, Dialogs, Drawers, Charts, Kanban Boards) — never duplicate a component that already exists.

---

## 8. Security Standards

HTTPS, Helmet, rate limiting, CORS, SQL-injection protection (parameterized queries via Prisma), XSS protection, CSRF protection, strict input validation, file-upload validation, encryption at rest and in transit, AWS Secrets Manager for all credentials, comprehensive audit logging, GDPR awareness, principle of least privilege throughout.

---

## 9. AI Integration (Google Gemini — only provider)

Features: Resume Parsing, Candidate Ranking, Job Description Generation, Interview Question Generation, Recruitment Copilot, AI Analytics, AI Agents.

Every AI request must implement:
- Request/response logging
- Retry logic with backoff
- Timeout handling
- Prompt versioning
- Per-tenant usage tracking
- Tenant-boundary enforcement (never leak data across tenants via prompts/context)

---

## 10. Storage, Email, Monitoring

- **S3**: resumes, documents, contracts, reports, images — private buckets, signed URLs, encrypted.
- **SES templates**: Application Confirmation, Interview Invitation, Offer Letter, Password Reset, Recruiter Notification, System Notification.
- **CloudWatch**: application logs, API logs, DB logs, performance metrics, security logs, audit logs.

---

## 11. Performance

Lazy loading, pagination everywhere lists appear, query optimization, DB connection pooling, image optimization, compression, efficient caching.

---

## 12. DevOps / CI-CD

Docker + Docker Compose, PM2, Nginx, GitHub Actions for automated build/test/deploy, defined rollback strategy, environment-variable driven config (never committed secrets).

---

## 13. Testing Standards (required per feature)

`Unit tests, integration tests, API tests, end-to-end tests, security tests, basic performance/regression checks.`

---

## 14. Documentation Standards (required per feature)

Architecture notes, API docs (Swagger), database change notes, deployment notes, configuration details, testing instructions.

---

## 15. Development Workflow

**Before generating code**: understand existing architecture → review dependencies → confirm compatibility → identify breaking-change risk.

**After generating code**: verify architecture fit → check security → check scalability → check performance → confirm production-readiness (no TODOs, no placeholders, no mocks unless explicitly requested).

**When extending a feature, always preserve**: existing database schema, existing APIs, authentication, multi-tenant architecture, UI consistency, AWS infrastructure, coding standards.

---

## 16. Phase Roadmap (0–18)

> Assumption: the source docs referenced "Phase 0–18" without defining contents. Below is a proposed breakdown for an enterprise ATS — replace with your actual roadmap if one already exists.

| Phase | Scope |
|---|---|
| 0 | Repo scaffolding, monorepo setup, CI/CD skeleton, base infra (VPC, RDS, S3, EC2, Amplify) |
| 1 | Auth, multi-tenancy model, RBAC, org/company onboarding |
| 2 | Core UI shell, design system, navigation, dark mode |
| 3 | Job posting management (CRUD, publishing, career-site listing) |
| 4 | Candidate profiles & application intake |
| 5 | Recruitment pipeline / Kanban stages, pipeline automation |
| 6 | Resume parsing (Gemini) |
| 7 | AI candidate ranking & scoring |
| 8 | Interview scheduling & calendar integration |
| 9 | AI interview question generation |
| 10 | Offer management & e-signature/offer letters |
| 11 | Recruiter/Hiring Manager collaboration tools (notes, feedback, scorecards) |
| 12 | Notifications (SES templates, in-app, real-time) |
| 13 | Reporting & analytics dashboards |
| 14 | AI Recruitment Copilot (chat-based assistant across the platform) |
| 15 | Admin console (Super Admin / Client Admin controls, subscription mgmt) |
| 16 | Billing & subscription plans |
| 17 | Public API + integrations (job boards, HRIS, SSO) |
| 18 | Marketplace/extensibility groundwork for future Orvexa products |

---

## 17. Definition of Done

Every implementation must be: production-ready, secure, scalable, well documented, tested, responsive, accessible, reusable, maintainable, and deployable to AWS as-is.

---

## 18. How to Use This File in Antigravity

- Place this file at the **repo root** as `AGENTS.md` — every spawned agent reads it automatically before starting a task.
- For personal/global preferences across *all* your projects (not just this one), mirror relevant bits into `~/.gemini/GEMINI.md`.
- For finer-grained, always-on rules (e.g. a strict "no `any`" TypeScript rule), you can additionally create files under `.agents/rules/` in this repo — they layer on top of this file, they don't replace it.
- For repeatable procedures (e.g. "how we do a DB migration," "how we add a new AI feature"), create `.agents/skills/<name>/SKILL.md` — agents will load these on demand when a task matches.
- Prefer **Review-driven development** or **Agent-assisted** autonomy mode for this project given the multi-tenant/security surface area; reserve full autopilot for isolated, low-risk tasks.
- When starting a new task, phrase it as: *"Continue the existing Orvexa Recruit codebase per AGENTS.md. Implement [feature] for Phase [N]. Never rebuild previous work."*
