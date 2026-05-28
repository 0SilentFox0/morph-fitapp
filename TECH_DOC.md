# FitConnect Platform — Tech Overview

Цей документ дає високорівневий огляд платформи. Деталі бекенду — у [`docs/backend/TECH_TASK.md`](docs/backend/TECH_TASK.md) (umbrella) і [`docs/backend/features/`](docs/backend/features/) (feature-level специфікації).

---

## 1. Technology Stack

### 1.1 Mobile Application

- **Platform:** iOS (primary), Android (secondary).
- **Framework:** React Native (Expo) with TypeScript (strict mode).
- **Language:** TypeScript.
- **State management:** Zustand.
- **Forms / validation:** react-hook-form + zod.
- **Charts:** react-native-chart-kit.
- **Single binary, two roles:** один додаток з role-based навігацією (`trainer` / `client`); deep links для invitations і OAuth callbacks.

### 1.2 Frontend conventions

- ESLint + Prettier + pre-commit hooks.
- Design tokens у `src/theme/`.
- Strict mode TypeScript.

### 1.3 Backend

- **Language:** PHP 8.4
- **Framework:** Laravel 12 (modular monolith з чіткими module boundaries)
- **Database:** PostgreSQL 16+
- **ORM:** Eloquent
- **Auth:** Laravel Sanctum (API tokens) + custom refresh-token rotation + Laravel Socialite (OAuth)
- **Real-time:** Laravel Reverb (WebSocket + Broadcasting)
- **Cache & Queue driver:** Redis 7+
- **Queue management:** Laravel Queue + Laravel Horizon
- **Object storage:** S3-compatible (через Laravel Filesystem)
- **Admin panel:** Filament
- **Observability:** Laravel Telescope (dev) + Laravel Pulse (prod)
- **Testing:** Pest (recommended) або PHPUnit

### 1.4 Infrastructure & DevOps

- **Containerization:** Docker (multi-stage builds; окремі сервіси для PHP-FPM, NGINX, Reverb, queue workers, scheduler).
- **CI/CD:** GitHub Actions (lint + PHPStan + tests + image build + deploy).
- **Hosting:** обраний пізніше — TECH_TASK не зобов'язує конкретного провайдера (Docker+VPS, Laravel Forge, Laravel Cloud або Kubernetes — на вибір).
- **Monitoring:** Pulse + alerting; target uptime 99.5% (MVP) → 99.9% (post-MVP).

### 1.5 Third-party Services

| Категорія | Сервіс | Призначення |
|---|---|---|
| Push notifications | Firebase Cloud Messaging | iOS + Android |
| Calendar | Google Calendar API | bi-directional sync (INT-001) |
| Calendar | Apple Calendar | через ICS feed (INT-002) — read-only one-way |
| OAuth providers | Google + Apple + Facebook | login (через Socialite) |
| Email | SES / Postmark / SendGrid | transactional emails (provider вибирається пізніше) |
| Object storage | S3 / R2 / Spaces / MinIO | files (provider вибирається пізніше) |
| SMS | **не в MVP** | майбутнє: для phone verification |

### 1.6 Security & Compliance

- Secure token storage on mobile: Keychain (iOS) / Keystore (Android).
- **PCI DSS:** не застосовується в MVP (немає прямих оплат — лише облік manual transactions).
- **GDPR-готовність:** right to erasure (soft delete з grace period 30 днів + hard delete з анонімізацією user-row), right to export (data exports у ZIP), encrypted-at-rest credentials.
- **Regular audits and penetration testing** — post-MVP.
- Rate limiting, brute-force lockout, refresh-token rotation, signed S3 URLs.

Деталі — [`TECH_TASK.md`](docs/backend/TECH_TASK.md) §6 (Security).

---

## 2. Scope and Modules

MVP+ скоуп — **16 модулів × 53 фічі**, поділених на 4 фази. Деталі — [`TECH_TASK.md`](docs/backend/TECH_TASK.md) §10 (Index фіч) і [`docs/backend/features/`](docs/backend/features/).

| Phase | Модулі | Що це покриває |
|---|---|---|
| **0 — Foundation** | Auth · Users · Files · Notifications | Registration, login, OAuth, refresh tokens, GDPR account deletion, profile management, S3 uploads, push subsystem |
| **1 — Core CRM** | Onboarding · Clients · Programs · Exercises · Sessions | 13-step trainer onboarding, roster mgmt, invitation flow, program/exercise CRUD, session CRUD with conflict detection і recurring |
| **2 — Real-time** | Chat · Workout Tracking · Integrations | Реал-тайм чат (Reverb), live workout sync, Google Calendar bi-directional, Apple ICS feed |
| **3 — Business** | Packages · Transactions · Progress · Analytics | Пакети з auto-decrement, manual transactions з package linkage, body measurements + auto PR detection (1RM), trainer dashboard |

### Out of scope (post-MVP)

- Nutrition (раціони, KCAL/БЖВ, foods catalog).
- Фото-прогрес (before/after).
- Live video / відеодзвінки.
- Прямі онлайн-оплати (Stripe/Paddle).
- SMS verification.
- Multi-tenancy / team accounts для гімів.
- AI-генерація програм.
- Intelligent matching algorithm (trainer ↔ client matchmaking).
- Gamification beyond існуючого "You got paid" achievement.

---

## 3. Non-functional requirements

Повний набір — [`TECH_TASK.md`](docs/backend/TECH_TASK.md) §7. Коротко:

| Метрика | MVP target | Post-MVP target |
|---|---|---|
| API p50 / p95 / p99 | 100 ms / 300 ms / 800 ms | 80 / 200 / 500 ms |
| WS message latency | < 500 ms | < 200 ms |
| Concurrent WS connections | 1 000 | 10 000 |
| Active monthly users | 5 000 | 50 000 |
| Uptime SLO | 99.5% | 99.9% |
| RPO (data loss budget) | ≤ 15 min | ≤ 5 min |
| RTO (recovery time) | ≤ 4 hours | ≤ 1 hour |

### Backups

- PostgreSQL: PITR (continuous WAL archiving) + daily snapshot з retention 30 днів.
- S3: versioning enabled; cross-region replication (post-MVP).
- Restore drill: щомісяця.

### Test coverage

- Unit + feature tests through Pest/PHPUnit.
- Coverage target: 60% (MVP) → 80% (post-MVP).
- Critical flows (auth, payment, workout sync): integration tests must hit real DB.

---

## 4. Development phases (≈ 15 weeks solo dev)

Узгоджено з [`TECH_TASK.md`](docs/backend/TECH_TASK.md) §9.

### Phase 0 — Foundation (тиждень 1-3)

Auth, Users, Files, Notifications. Laravel-проєкт ініціалізовано, Docker compose, PostgreSQL migrations для core tables, Sanctum + Socialite + custom refresh, S3 upload pipeline, FCM integration, CI/CD pipeline.

### Phase 1 — Core CRM (тиждень 4-7)

Clients CRM з invitation flow, Programs/Exercises бібліотеки, Sessions CRUD без real-time, Onboarding (13 кроків).

### Phase 2 — Real-time (тиждень 8-11)

Reverb setup, Chat (text + media + read receipts + typing), Workout Tracking з real-time sync і conflict resolution, Google Calendar bi-directional, Apple ICS feed.

### Phase 3 — Business (тиждень 12-15)

Packages templates + assignment + auto-decrement, Transactions з прив'язкою до пакетів, Body measurements + auto PR detection (Epley 1RM), Analytics endpoints + cached views, Filament admin panel.

---

## 5. Technical deliverables

### Documentation

- ✅ [`docs/backend/TECH_TASK.md`](docs/backend/TECH_TASK.md) — umbrella tech task (architecture, NFR, security, real-time, devops, roadmap).
- ✅ [`docs/backend/features/`](docs/backend/features/) — feature-level specifications (16 файлів, 53 фічі) з user stories, acceptance criteria, edge cases, permissions.
- ✅ [`docs/backend/DB_STRUCTURE.md`](docs/backend/DB_STRUCTURE.md) — повна DB схема (40 таблиць).
- ✅ [`docs/backend/DB_SCHEMA_TREE.md`](docs/backend/DB_SCHEMA_TREE.md) — Mermaid ER diagram + ASCII tree.
- ✅ [`docs/PROGRESS.md`](docs/PROGRESS.md), [`docs/TASKS.md`](docs/TASKS.md) — frontend progress і tasks.
- 📅 OpenAPI/Swagger — генерується автоматично з Laravel route definitions (через scribe або similar; tooling вибирається пізніше).

### Code quality standards

- PHP: PHPStan level 6+, Laravel Pint code style.
- TypeScript: strict mode, ESLint, Prettier.
- Pre-commit hooks для обох sides.
- Git workflow: branch per feature, PR review.
- CI must pass: lint + static analysis + tests + image build.

### Deployment requirements

- Containerized application (Docker з multi-stage builds).
- Окремі сервіси у compose: app (PHP-FPM), nginx, reverb, queue (Horizon), scheduler.
- Database migrations: forward-only; breaking changes — у дві фази з backward-compatible релізом.
- Health checks: `/health` (app), `/health` (reverb).
- Monitoring і alerting: Pulse + (optional) Grafana/Loki.

Деталі — [`TECH_TASK.md`](docs/backend/TECH_TASK.md) §8 (DevOps).

---

## 6. Success metrics

### Technical KPIs

- System uptime: 99.5% (MVP) → 99.9% (post-MVP).
- API p95 latency: < 300 ms (MVP) → < 200 ms (post-MVP).
- Mobile app crash rate: < 0.5% (MVP) → < 0.1% (post-MVP).
- Backend test coverage: 60% (MVP) → 80% (post-MVP).
- Zero high/critical security vulnerabilities (regular audits).

### Business KPIs

- Trainer retention (post-onboarding 30d): > 70%.
- Session completion rate: > 90%.
- Average sessions per active trainer per month: > 30.
- Time to first session after onboarding: < 7 days.

---

## 7. Resource requirements (current)

### Team

- **Backend developer:** 1 (solo PHP/Laravel) — pragmatic-mode TZ під цю конфігурацію.
- **Frontend developer:** existing React Native team / silentfox.
- **Designer:** Figma — [Fitness-app](https://www.figma.com/design/nWHcYBqsCKqkBh5WUnghye/Fitness-app--Copy-).
- **DevOps:** TBD — initially handled by backend dev або external (Forge-style managed hosting).
- **QA:** TBD; manual testing на MVP, далі — automated через Pest.

### External dependencies (must obtain)

- Google Cloud project credentials (OAuth + Calendar API).
- Apple Developer account (Sign in with Apple, ICS publishing).
- Facebook Developer project (OAuth).
- Firebase project (FCM credentials).
- S3-compatible storage account.
- Email provider account (SES / Postmark / SendGrid).
- Production domain і SSL cert.

---

## 8. Risk management

| Ризик | Impact | Запобігання |
|---|---|---|
| Real-time scaling (Reverb load) | Високий | Pulse-monitoring з самого початку; load-test з 1000 connections перед prod |
| Calendar sync конфлікти і delays | Середній | Async-tasks з retry; UI показує `last_synced_at`; degraded mode (тільки локальні events) |
| File storage costs ростуть | Низький | Lifecycle policies (старі media → cold storage); video size limits |
| Workout sync inconsistency під concurrent log | Середній | Версіонування подій через `last_version`; periodic full-sync як fallback; UI shows "out of sync" warning |
| Apple Calendar API без write API | Високий (known) | Pull-only через ICS feed; не обіцяти write-back |
| Solo dev burnout / bus-factor 1 | Високий | Документація як first-class (TECH_TASK + features specs + DB); pragmatic-mode TZ |
| Vendor lock-in (S3, FCM, OAuth providers) | Низький | Через Laravel abstractions (Filesystem, Notification channels, Socialite); switching cost low |
| GDPR compliance gaps | Високий | Implemented from Phase 0 (AUTH-005 — deletion + export); audit_logs from start |

---

## 9. Reference documents

| Документ | Призначення |
|---|---|
| [`docs/backend/TECH_TASK.md`](docs/backend/TECH_TASK.md) | Umbrella tech task для backend (architecture, conventions, NFR, security, real-time, devops, roadmap) |
| [`docs/backend/features/README.md`](docs/backend/features/README.md) | Index feature-specs + шаблони (full / compact) |
| [`docs/backend/features/{module}.md`](docs/backend/features/) | Feature-level бізнес-логіка (user stories, AC, edge cases, permissions, technical hints) |
| [`docs/backend/DB_STRUCTURE.md`](docs/backend/DB_STRUCTURE.md) | Full PostgreSQL schema |
| [`docs/backend/DB_SCHEMA_TREE.md`](docs/backend/DB_SCHEMA_TREE.md) | Mermaid ER + ASCII tree |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Frontend implementation progress |
| [`docs/TASKS.md`](docs/TASKS.md) | Jira-style frontend tasks + API mapping |
| [`docs/flows/`](docs/flows/) | UI flows (home-dashboard, onboarding) |

---

_Document Version: 2.0 — Last Updated: 2026-05-28._
_Major revision: backend stack PHP/Laravel; scope unified with [`docs/backend/`](docs/backend/) feature specs._
