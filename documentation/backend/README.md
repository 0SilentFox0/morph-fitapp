# Backend API Specifications

Specs for backend implementation. Each file describes routes, request/response shapes, and what the frontend expects.

**Database:** [DB_STRUCTURE.md](DB_STRUCTURE.md) — Tables, columns, relationships, TASKS/Figma mapping  
**Schema tree (diagram):** [DB_SCHEMA_TREE.md](DB_SCHEMA_TREE.md) — Mermaid ER + ASCII hierarchy

**Conventions:**
- Base URL: `{API_BASE}/` (e.g. `https://api.fitconnect.app/v1`)
- Auth: Bearer token in `Authorization` header (when implemented)
- All dates: ISO 8601 (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ssZ`)

## Specs by domain

| File | Domain | Related tasks |
|------|--------|---------------|
| [sessions.md](sessions.md) | Sessions (schedule) | SCHED-*, SFORM-*, LOGIC-001–005 |
| [programs.md](programs.md) | Training programs | TLIB-*, LOGIC-006–009 |
| [clients.md](clients.md) | Clients | CLNT-*, LOGIC-010–014 |
| [transactions.md](transactions.md) | Transactions | ANLY-007–010, LOGIC-015 |
| [analytics.md](analytics.md) | Analytics & stats | ANLY-*, HOME-004–005 |
| [user.md](user.md) | User profile & auth | HOME-003, ONB-012, LOGIC-016 |
| [chat.md](chat.md) | Chat & messaging | CHAT-*, LOGIC-018, BCHAT-* |
| [DB_STRUCTURE.md](DB_STRUCTURE.md) | Database schema | All APIs |
