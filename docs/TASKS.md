# FitConnect – Jira-style Task List

**Figma file:** [3O1xAq3BYfYLvYwtlGJ7Bo](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled)

**Platform spec:** [TECH_DOC.md](../TECH_DOC.md) — Core development tasks, stack, phases

**Status legend:** ✅ DONE · 🚧 In progress · 📋 TO DO — see [STATUS_LEGEND.md](STATUS_LEGEND.md)

| ID | Description | Future API | Status |
|----|-------------|------------|--------|
| **HOME** | | | |
| HOME-001 | App background (#0D0D0D + #791A1F radial shadow top-right) | — | ✅ |
| HOME-002 | Tab navigation (Home, Clients, Add, Chat, Stats) with blur, custom icons | — | ✅ |
| HOME-003 | Home header: avatar, Welcome + userName, points badge, notifications | `GET /user/profile` | ✅ |
| HOME-004 | Revenue stat card (wallet icon, label, value, arrow) | `GET /analytics/revenue` | ✅ |
| HOME-005 | Profile view stat card (eye icon, label, value, arrow) | `GET /analytics/profile-views` | ✅ |
| HOME-006 | Training Library section: title, See all, horizontal program cards | `GET /programs` | ✅ |
| HOME-007 | Program card: thumbnail, name, video count, views, likes | `GET /programs/:id` | ✅ |
| HOME-008 | Schedule section: title, badge count, See all, Event cards | `GET /sessions` | ✅ |
| HOME-009 | Navigate to Schedule screen from See all | — | ✅ |
| HOME-010 | Navigate to Training Library screen from See all | — | ✅ |
| **SCHEDULE** | | | |
| SCHED-001 | Schedule header: back, title, add button | — | ✅ |
| SCHED-002 | Month selector (chevrons + month label) | — | ✅ |
| SCHED-003 | Day chips horizontal scroll (Sun 14, Mon 15, …) | — | ✅ |
| SCHED-004 | Day chip: active state (#401F21), inactive (#1D1D1D) | — | ✅ |
| SCHED-005 | Search input (Figma 1-11042: 40px, #141414, #434343 border) | `GET /sessions?q=` | ✅ |
| SCHED-006 | Event/Schedule card: status bar, title, date/time, participant chip, type badge, payment badge | — | ✅ |
| SCHED-007 | Session options menu (Reschedule, Edit, Cancel) | — | ✅ |
| SCHED-008 | Add session flow: SessionForm with title, date, time, participants, type | `POST /sessions` | ✅ |
| SCHED-009 | Edit session flow: prefilled form, save | `PATCH /sessions/:id` | ✅ |
| SCHED-010 | Delete session: confirm dialog, remove from list | `DELETE /sessions/:id` | ✅ |
| **SESSION FORM** | | | |
| SFORM-001 | Form header: back, title, save icon | — | ✅ |
| SFORM-002 | Title input (FormInput, 40px, #141414) | — | ✅ |
| SFORM-003 | Date picker input + Time picker input row | — | ✅ |
| SFORM-004 | Participant chips (avatar + name, selectable) | `GET /clients` | ✅ |
| SFORM-005 | Type dropdown (Cardio, HIIT, etc.) with modal picker | — | ✅ |
| SFORM-006 | Apply button (Accent1, pill shape) | — | ✅ |
| **TRAINING LIBRARY** | | | |
| TLIB-001 | Training Library screen: header, add button | — | ✅ |
| TLIB-002 | Program list/grid with thumbnails | `GET /programs` | ✅ |
| TLIB-003 | Add to Library form flow | `POST /programs` | ✅ |
| TLIB-004 | Gallery screen (video selection) | `GET /programs/:id/videos` | ✅ |
| TLIB-005 | Cardio Class form (session from program) | — | ✅ |
| **ONBOARDING** | | | |
| ONB-001 | Choose role screen (Client / Trainer cards) | — | ✅ |
| ONB-002 | Welcome Trainer screen | — | ✅ |
| ONB-003 | What's your name (input, skip, nav buttons) | — | ✅ |
| ONB-004 | Progress indicator (stepper) | — | ✅ |
| ONB-005 | Experience screen (years, certifications) | — | ✅ |
| ONB-006 | Training types screen (multi-select grid) | — | ✅ |
| ONB-007 | Client types screen (multi-select grid) | — | ✅ |
| ONB-008 | Have programs screen | — | ✅ |
| ONB-009 | Add to Library screen (onboarding flow) | — | ✅ |
| ONB-010 | Where train screen (locations) | — | ✅ |
| ONB-011 | Work schedule screen (days, time, toggle) | — | ✅ |
| ONB-012 | Profile photo screen (upload) | `POST /user/avatar` | ✅ |
| ONB-013 | Preview profile screen | — | ✅ |
| ONB-014 | You're all set screen | — | ✅ |
| **ANALYTICS** | | | |
| ANLY-001 | Business Analytics header | — | ✅ |
| ANLY-002 | Analytics cards row (Total Earnings, Subscriptions, Trainings) | `GET /analytics/summary` | ✅ |
| ANLY-003 | Chart tabs (Income Over Time / By Source) | — | ✅ |
| ANLY-004 | Timeframe selector (Week, Month, Custom) | — | ✅ |
| ANLY-005 | Line chart (Income Over Time) | `GET /analytics/income-over-time` | ✅ |
| ANLY-006 | Bar chart (By Source) | `GET /analytics/revenue-by-source` | ✅ |
| ANLY-007 | Transactions section: title, edit, download, See all | — | ✅ |
| ANLY-008 | Transactions search | `GET /transactions?q=` | ✅ |
| ANLY-009 | Transaction list items (client, date, amount, type, status) | `GET /transactions` | ✅ |
| ANLY-010 | Transactions screen (full list) | `GET /transactions` | ✅ |
| ANLY-011 | You Got Paid screen (achievement) | — | ✅ |
| **CLIENTS** | | | |
| CLNT-001 | Clients list header | — | ✅ |
| CLNT-002 | Clients search input | `GET /clients?q=` | ✅ |
| CLNT-003 | Client card: avatar, name, type tag (Personal), next session | `GET /clients` | ✅ |
| CLNT-004 | Client profile screen | `GET /clients/:id` | ✅ |
| CLNT-005 | Program detail (programs, exercises) | `GET /clients/:id/programs` | ✅ |
| CLNT-006 | Exercise detail screen | `GET /exercises/:id` | ✅ |
| CLNT-007 | Client profile extended | — | ✅ |
| CLNT-008 | Filters screen (Training, Payments) | — | ✅ |
| CLNT-009 | Training summary screen | `GET /sessions/:id/summary` | ✅ |
| **CHAT** | | | |
| CHAT-001 | Chat list screen: header, search, conversation list | `GET /conversations` | ✅ |
| CHAT-002 | Conversation card: avatar, name, last message preview, time, unread badge | — | ✅ |
| CHAT-003 | Chat thread screen: header (back, name, avatar), message list | `GET /conversations/:id/messages` | ✅ |
| CHAT-004 | Message bubble (sent vs received, timestamp) | — | ✅ |
| CHAT-005 | Message input: text field + send button | — | ✅ |
| CHAT-006 | Send message → persists to store, appears in thread | `POST /conversations/:id/messages` | ✅ |
| CHAT-007 | New conversation: start chat with client | `POST /conversations` | ✅ |
| CHAT-008 | Unread count badge on Chat tab | `GET /conversations?unread=true` | ✅ |
| CHAT-009 | Mark conversation as read when opening | `PATCH /conversations/:id/read` | ✅ |
| CHAT-010 | Search conversations by name | `GET /conversations?q=` | ✅ |
| CHAT-011 | Empty state (no conversations yet) | — | ✅ |
| **UI COMPONENTS** | | | |
| UI-001 | Button (primary, secondary, outline) | — | ✅ |
| UI-002 | Input (label, error, icons) | — | ✅ |
| UI-003 | FormInput (session form style) | — | ✅ |
| UI-004 | SearchInput (Figma 1-11042) | — | ✅ |
| UI-005 | DatePickerInput | — | ✅ |
| UI-006 | TimePickerInput | — | ✅ |
| UI-007 | ParticipantChip (avatar + name) | — | ✅ |
| UI-008 | DropdownSelect | — | ✅ |
| UI-009 | Card | — | ✅ |
| UI-010 | Tag | — | ✅ |
| UI-011 | Avatar | — | ✅ |
| UI-012 | ScheduleCard (Event) | — | ✅ |
| UI-013 | SessionOptionsMenu | — | ✅ |
| UI-014 | StatusTag | — | ✅ |
| UI-015 | IconButton | — | ✅ |
| UI-016 | ScreenHeader | — | ✅ |
| UI-017 | ScreenBackground | — | ✅ |
| UI-018 | ProgressIndicator | — | ✅ |
| **APP LOGIC** (full CRUD with mock data, no backend) | | | |
| LOGIC-001 | Sessions: create → persists to store, appears in Schedule | — | 📋 |
| LOGIC-002 | Sessions: edit → update in store, reflects in list | — | 📋 |
| LOGIC-003 | Sessions: delete → remove from store, confirm dialog | — | ✅ |
| LOGIC-004 | Sessions: filter by selected day | — | 📋 |
| LOGIC-005 | Sessions: search by title | — | 📋 |
| LOGIC-006 | Programs: create → add to Training Library | — | ✅ |
| LOGIC-007 | Programs: edit → update in list | — | ✅ |
| LOGIC-008 | Programs: delete → remove from list | — | ✅ |
| LOGIC-009 | Programs: search/filter | — | ✅ |
| LOGIC-010 | Clients: create → add to list | — | 📋 |
| LOGIC-011 | Clients: edit → update profile | — | 📋 |
| LOGIC-012 | Clients: delete → remove from list | — | 📋 |
| LOGIC-013 | Clients: search | — | 📋 |
| LOGIC-014 | Clients: filter by training type / payment | — | 📋 |
| LOGIC-015 | Transactions: search | — | 📋 |
| LOGIC-016 | User profile: persist onboarding data (name, role, etc.) | — | 📋 |
| LOGIC-017 | Add tab: quick add session or program | — | 📋 |
| LOGIC-018 | Chat: list conversations, open thread, send/receive messages (mock) | — | ✅ |
| **DOCUMENTATION** | | | |
| DOC-001 | Create documentation folder structure | — | ✅ |
| DOC-002 | Create TASKS.md (Jira-style task list) | — | ✅ |
| DOC-003 | Create prompts tracking (prompts/ folder) | — | ✅ |
| DOC-004 | Create .gitignore | — | ✅ |
| DOC-005 | Create vercel.json for Expo web deployment | — | ✅ |
| DOC-006 | Initialize git, add remote, push to GitHub | — | ✅ |
| DOC-007 | Add DEPLOYMENT.md documentation | — | ✅ |
| DOC-008 | Add emoji statuses + logic tasks + backend folder | — | ✅ |
| DOC-009 | Align TASKS.md with TECH_DOC.md | — | ✅ |
| **BACKEND** (Chat) | | | |
| BCHAT-001 | GET /conversations — list conversations with last message | — | 📋 |
| BCHAT-002 | GET /conversations/:id/messages — get message thread (paginated) | — | 📋 |
| BCHAT-003 | POST /conversations/:id/messages — send message | — | 📋 |
| BCHAT-004 | POST /conversations — create conversation (with client) | — | 📋 |
| BCHAT-005 | PATCH /conversations/:id/read — mark as read | — | 📋 |
| BCHAT-006 | WebSocket or polling for real-time messages (optional) | — | 📋 |
| **TO DO** | | | |
| TODO-001 | Replace mock data with real API calls | All endpoints | 📋 |
| TODO-002 | Date/time picker native modals (DateTimePicker) | — | 📋 |
| TODO-003 | Profile photo upload (image picker + storage) | `POST /user/avatar` | 📋 |
| TODO-004 | Replace mock chat with real API (see CHAT-*, BCHAT-*) | Chat APIs | 📋 |
| TODO-005 | Add tab placeholder → Add flow (session/program) | — | 📋 |
| TODO-006 | Client filters: apply filters to API | `GET /clients?training=&payment=` | 📋 |
| TODO-007 | Analytics: connect charts to real data | Analytics APIs | 📋 |
| TODO-008 | Training Library: add/edit/delete programs | `POST/PATCH/DELETE /programs` | 📋 |
| TODO-009 | Client profile: edit client | `PATCH /clients/:id` | 📋 |
| TODO-010 | Persist sessions (add/edit/delete) to backend | Sessions CRUD | 📋 |

---

## TECH_DOC Alignment (from [TECH_DOC.md](../TECH_DOC.md))

| TECH_DOC Section | TASKS.md mapping | Status |
|------------------|------------------|--------|
| **2.1 Auth & User Management** | — | 📋 |
| AUTH-001 | JWT auth + refresh tokens | — | 📋 |
| AUTH-002 | Social login (Google, Apple, Facebook OAuth) | — | 📋 |
| AUTH-003 | Email/password + verification | — | 📋 |
| AUTH-004 | Phone verification (SMS) | — | 📋 |
| AUTH-005 | Password reset flow | — | 📋 |
| AUTH-006 | Role-based access (Client, Trainer, Admin) | — | 📋 |
| **2.2 Onboarding & Profile** | ONB-*, ONB-012 | Partial ✅ |
| **2.3 Matching Algorithm** | — | 📋 |
| MATCH-001 | Matching: specialization, schedule, location, budget | — | 📋 |
| MATCH-002 | Search and filter | — | 📋 |
| MATCH-003 | Recommendation engine | — | 📋 |
| **2.4 Calendar & Scheduling** | SCHED-*, SFORM-* | Partial ✅ |
| CAL-001 | Google/Apple Calendar integration | — | 📋 |
| CAL-002 | Availability management | — | 📋 |
| CAL-003 | Recurring sessions, conflict detection | — | 📋 |
| **2.5 Real-time Communication** | CHAT-*, BCHAT-* | 📋 |
| **2.6 Payment Processing** | — | 📋 |
| PAY-001 | Stripe integration | — | 📋 |
| PAY-002 | Subscriptions, one-time payments | — | 📋 |
| PAY-003 | Receipts, trainer payouts | — | 📋 |
| **2.7 Workout Management** | TLIB-*, CLNT-005, CLNT-006 | Partial ✅ |
| WORK-001 | Exercise database, workout plan builder | — | 📋 |
| WORK-002 | Progress tracking, rest timer | — | 📋 |
| **2.8 Analytics & Dashboard** | ANLY-* | Partial ✅ |
| **2.9 Gamification** | — | 📋 |
| GAME-001 | Achievements, badges, streaks | — | 📋 |
| GAME-002 | Leaderboard, challenges | — | 📋 |
| **2.10 Admin Panel** | — | 📋 |
| ADMIN-001 | User/content management, verification | — | 📋 |

---

## Figma References

| Section | Node ID | Figma URL |
|---------|---------|-----------|
| Homepage + Calendar + Library | 1-10846 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-10846](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-10846) |
| Onboarding | 1-10113 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-10113](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-10113) |
| Analytics | 1-12193 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-12193](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-12193) |
| Clients | 1-13052 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-13052](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-13052) |
