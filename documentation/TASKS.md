# FitConnect – Jira-style Task List

**Figma file:** [3O1xAq3BYfYLvYwtlGJ7Bo](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled)

| ID | Description | Future API | Status |
|----|-------------|------------|--------|
| **HOME** | | | |
| HOME-001 | App background (#0D0D0D + #791A1F radial shadow top-right) | — | DONE |
| HOME-002 | Tab navigation (Home, Clients, Add, Chat, Stats) with blur, custom icons | — | DONE |
| HOME-003 | Home header: avatar, Welcome + userName, points badge, notifications | `GET /user/profile` | DONE |
| HOME-004 | Revenue stat card (wallet icon, label, value, arrow) | `GET /analytics/revenue` | DONE |
| HOME-005 | Profile view stat card (eye icon, label, value, arrow) | `GET /analytics/profile-views` | DONE |
| HOME-006 | Training Library section: title, See all, horizontal program cards | `GET /programs` | DONE |
| HOME-007 | Program card: thumbnail, name, video count, views, likes | `GET /programs/:id` | DONE |
| HOME-008 | Schedule section: title, badge count, See all, Event cards | `GET /sessions` | DONE |
| HOME-009 | Navigate to Schedule screen from See all | — | DONE |
| HOME-010 | Navigate to Training Library screen from See all | — | DONE |
| **SCHEDULE** | | | |
| SCHED-001 | Schedule header: back, title, add button | — | DONE |
| SCHED-002 | Month selector (chevrons + month label) | — | DONE |
| SCHED-003 | Day chips horizontal scroll (Sun 14, Mon 15, …) | — | DONE |
| SCHED-004 | Day chip: active state (#401F21), inactive (#1D1D1D) | — | DONE |
| SCHED-005 | Search input (Figma 1-11042: 40px, #141414, #434343 border) | `GET /sessions?q=` | DONE |
| SCHED-006 | Event/Schedule card: status bar, title, date/time, participant chip, type badge, payment badge | — | DONE |
| SCHED-007 | Session options menu (Reschedule, Edit, Cancel) | — | DONE |
| SCHED-008 | Add session flow: SessionForm with title, date, time, participants, type | `POST /sessions` | DONE |
| SCHED-009 | Edit session flow: prefilled form, save | `PATCH /sessions/:id` | DONE |
| SCHED-010 | Delete session: confirm dialog, remove from list | `DELETE /sessions/:id` | DONE |
| **SESSION FORM** | | | |
| SFORM-001 | Form header: back, title, save icon | — | DONE |
| SFORM-002 | Title input (FormInput, 40px, #141414) | — | DONE |
| SFORM-003 | Date picker input + Time picker input row | — | DONE |
| SFORM-004 | Participant chips (avatar + name, selectable) | `GET /clients` | DONE |
| SFORM-005 | Type dropdown (Cardio, HIIT, etc.) with modal picker | — | DONE |
| SFORM-006 | Apply button (Accent1, pill shape) | — | DONE |
| **TRAINING LIBRARY** | | | |
| TLIB-001 | Training Library screen: header, add button | — | DONE |
| TLIB-002 | Program list/grid with thumbnails | `GET /programs` | DONE |
| TLIB-003 | Add to Library form flow | `POST /programs` | DONE |
| TLIB-004 | Gallery screen (video selection) | `GET /programs/:id/videos` | DONE |
| TLIB-005 | Cardio Class form (session from program) | — | DONE |
| **ONBOARDING** | | | |
| ONB-001 | Choose role screen (Client / Trainer cards) | — | DONE |
| ONB-002 | Welcome Trainer screen | — | DONE |
| ONB-003 | What's your name (input, skip, nav buttons) | — | DONE |
| ONB-004 | Progress indicator (stepper) | — | DONE |
| ONB-005 | Experience screen (years, certifications) | — | DONE |
| ONB-006 | Training types screen (multi-select grid) | — | DONE |
| ONB-007 | Client types screen (multi-select grid) | — | DONE |
| ONB-008 | Have programs screen | — | DONE |
| ONB-009 | Add to Library screen (onboarding flow) | — | DONE |
| ONB-010 | Where train screen (locations) | — | DONE |
| ONB-011 | Work schedule screen (days, time, toggle) | — | DONE |
| ONB-012 | Profile photo screen (upload) | `POST /user/avatar` | DONE |
| ONB-013 | Preview profile screen | — | DONE |
| ONB-014 | You're all set screen | — | DONE |
| **ANALYTICS** | | | |
| ANLY-001 | Business Analytics header | — | DONE |
| ANLY-002 | Analytics cards row (Total Earnings, Subscriptions, Trainings) | `GET /analytics/summary` | DONE |
| ANLY-003 | Chart tabs (Income Over Time / By Source) | — | DONE |
| ANLY-004 | Timeframe selector (Week, Month, Custom) | — | DONE |
| ANLY-005 | Line chart (Income Over Time) | `GET /analytics/income-over-time` | DONE |
| ANLY-006 | Bar chart (By Source) | `GET /analytics/revenue-by-source` | DONE |
| ANLY-007 | Transactions section: title, edit, download, See all | — | DONE |
| ANLY-008 | Transactions search | `GET /transactions?q=` | DONE |
| ANLY-009 | Transaction list items (client, date, amount, type, status) | `GET /transactions` | DONE |
| ANLY-010 | Transactions screen (full list) | `GET /transactions` | DONE |
| ANLY-011 | You Got Paid screen (achievement) | — | DONE |
| **CLIENTS** | | | |
| CLNT-001 | Clients list header | — | DONE |
| CLNT-002 | Clients search input | `GET /clients?q=` | DONE |
| CLNT-003 | Client card: avatar, name, type tag (Personal), next session | `GET /clients` | DONE |
| CLNT-004 | Client profile screen | `GET /clients/:id` | DONE |
| CLNT-005 | Program detail (programs, exercises) | `GET /clients/:id/programs` | DONE |
| CLNT-006 | Exercise detail screen | `GET /exercises/:id` | DONE |
| CLNT-007 | Client profile extended | — | DONE |
| CLNT-008 | Filters screen (Training, Payments) | — | DONE |
| CLNT-009 | Training summary screen | `GET /sessions/:id/summary` | DONE |
| **UI COMPONENTS** | | | |
| UI-001 | Button (primary, secondary, outline) | — | DONE |
| UI-002 | Input (label, error, icons) | — | DONE |
| UI-003 | FormInput (session form style) | — | DONE |
| UI-004 | SearchInput (Figma 1-11042) | — | DONE |
| UI-005 | DatePickerInput | — | DONE |
| UI-006 | TimePickerInput | — | DONE |
| UI-007 | ParticipantChip (avatar + name) | — | DONE |
| UI-008 | DropdownSelect | — | DONE |
| UI-009 | Card | — | DONE |
| UI-010 | Tag | — | DONE |
| UI-011 | Avatar | — | DONE |
| UI-012 | ScheduleCard (Event) | — | DONE |
| UI-013 | SessionOptionsMenu | — | DONE |
| UI-014 | StatusTag | — | DONE |
| UI-015 | IconButton | — | DONE |
| UI-016 | ScreenHeader | — | DONE |
| UI-017 | ScreenBackground | — | DONE |
| UI-018 | ProgressIndicator | — | DONE |
| **DOCUMENTATION** | | | |
| DOC-001 | Create documentation folder structure | — | DONE |
| DOC-002 | Create TASKS.md (Jira-style task list) | — | DONE |
| DOC-003 | Create prompts tracking (prompts/ folder) | — | DONE |
| DOC-004 | Create .gitignore | — | DONE |
| DOC-005 | Create vercel.json for Expo web deployment | — | DONE |
| DOC-006 | Initialize git, add remote, push to GitHub | — | DONE |
| DOC-007 | Add DEPLOYMENT.md documentation | — | DONE |
| **TO DO** | | | |
| TODO-001 | Replace mock data with real API calls | All endpoints | TO DO |
| TODO-002 | Date/time picker native modals (DateTimePicker) | — | TO DO |
| TODO-003 | Profile photo upload (image picker + storage) | `POST /user/avatar` | TO DO |
| TODO-004 | Chat tab placeholder → Chat screen | `GET /messages` | TO DO |
| TODO-005 | Add tab placeholder → Add flow (session/program) | — | TO DO |
| TODO-006 | Client filters: apply filters to API | `GET /clients?training=&payment=` | TO DO |
| TODO-007 | Analytics: connect charts to real data | Analytics APIs | TO DO |
| TODO-008 | Training Library: add/edit/delete programs | `POST/PATCH/DELETE /programs` | TO DO |
| TODO-009 | Client profile: edit client | `PATCH /clients/:id` | TO DO |
| TODO-010 | Persist sessions (add/edit/delete) to backend | Sessions CRUD | TO DO |

---

## Figma References

| Section | Node ID | Figma URL |
|---------|---------|-----------|
| Homepage + Calendar + Library | 1-10846 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-10846](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-10846) |
| Onboarding | 1-10113 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-10113](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-10113) |
| Analytics | 1-12193 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-12193](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-12193) |
| Clients | 1-13052 | [figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo?node-id=1-13052](https://www.figma.com/design/3O1xAq3BYfYLvYwtlGJ7Bo/Untitled?node-id=1-13052) |
