# Database schema tree (FitConnect)

Візуальна карта сутностей і зв’язків. Деталі колонок — у [DB_STRUCTURE.md](DB_STRUCTURE.md).

---

## 1. Діаграма зв’язків (ER)

```mermaid
erDiagram
  users ||--o{ refresh_tokens : has
  users ||--o{ oauth_identities : has
  users ||--o{ push_tokens : has
  users ||--o{ notifications : receives
  users ||--o{ sessions : trainer_creates
  users ||--o{ programs : owns
  users ||--o{ transactions : trainer
  users ||--o{ messages : sends
  users ||--o{ conversation_reads : read_state
  users ||--o{ profile_view_events : trainer_profile
  users ||--o{ achievements : trainer

  clients }o--|| users : trainer
  clients }o--o| users : client_account

  sessions }o--|| users : trainer
  sessions ||--o{ session_participants : has
  sessions ||--o| session_summaries : has
  sessions ||--o{ transactions : may_link

  clients ||--o{ session_participants : attends
  clients ||--o{ client_programs : assigned
  clients ||--o{ conversations : with_trainer

  programs }o--|| users : trainer
  programs ||--o{ program_videos : contains
  programs ||--o{ program_exercises : contains
  programs ||--o{ client_programs : assigned_to_clients

  exercises ||--o{ program_exercises : in_programs

  conversations }o--|| users : trainer
  conversations }o--|| clients : client_roster
  conversations ||--o{ messages : has

  messages }o--|| conversations : in
  messages }o--|| users : sender

  analytics_cache }o--|| users : trainer
```

---

## 2. Логічні шари (хто від кого залежить)

Окремі блоки — **не** окремі БД-схеми, а зручне групування для читання.

```mermaid
flowchart TB
  subgraph layerIdentity [Identity and access]
    users
    refresh_tokens
    oauth_identities
    push_tokens
    notifications
  end

  subgraph layerCrm [Trainer CRM]
    clients
  end

  subgraph layerSchedule [Schedule]
    sessions
    session_participants
    session_summaries
  end

  subgraph layerContent [Programs and exercises]
    programs
    program_videos
    exercises
    program_exercises
    client_programs
  end

  subgraph layerChat [Chat]
    conversations
    messages
    conversation_reads
  end

  subgraph layerMoney [Money and analytics]
    transactions
    analytics_cache
    profile_view_events
    achievements
  end

  users --> refresh_tokens
  users --> oauth_identities
  users --> push_tokens
  users --> notifications

  users --> clients

  users --> sessions
  clients --> session_participants
  sessions --> session_participants
  sessions --> session_summaries

  users --> programs
  programs --> program_videos
  programs --> program_exercises
  exercises --> program_exercises
  clients --> client_programs
  programs --> client_programs

  users --> conversations
  clients --> conversations
  conversations --> messages
  users --> messages
  users --> conversation_reads
  conversations --> conversation_reads

  users --> transactions
  sessions --> transactions
  clients --> transactions
  users --> analytics_cache
  users --> profile_view_events
  users --> achievements
```

---

## 3. Таблиці по доменах

### Identity and access

| Таблиця | Зв’язок | Кратність |
|---------|---------|-----------|
| `users` | коренева сутність користувача | 1 |
| `refresh_tokens` | `user_id` → `users` | N : 1 |
| `oauth_identities` | `user_id` → `users` | N : 1 |
| `push_tokens` | `user_id` → `users` | N : 1 |
| `notifications` | `user_id` → `users` | N : 1 |

### Trainer CRM

| Таблиця | Зв’язок | Кратність |
|---------|---------|-----------|
| `clients` | `trainer_id` → `users` | N : 1 |
| `clients` | `client_user_id` → `users` (опційно) | N : 1 |

### Schedule

| Таблиця | Зв’язок | Кратність |
|---------|---------|-----------|
| `sessions` | `trainer_id` → `users` | N : 1 |
| `session_participants` | `session_id` + `client_id` | M : N між `sessions` і `clients` |
| `session_summaries` | `session_id` → `sessions` | 0..1 : 1 |

### Programs and library

| Таблиця | Зв’язок | Кратність |
|---------|---------|-----------|
| `programs` | `trainer_id` → `users` | N : 1 |
| `program_videos` | `program_id` → `programs` | N : 1 |
| `exercises` | довідник вправ | 1 |
| `program_exercises` | `program_id` + `exercise_id` | M : N між `programs` і `exercises` |
| `client_programs` | `client_id` + `program_id` | M : N між `clients` і `programs` |

### Chat

| Таблиця | Зв’язок | Кратність |
|---------|---------|-----------|
| `conversations` | `trainer_id` → `users`, `client_id` → `clients` | одна пара trainer–client |
| `messages` | `conversation_id` → `conversations`, `sender_id` → `users` | N : 1 |
| `conversation_reads` | `conversation_id` + `user_id` | стан прочитання |

### Money and analytics

| Таблиця | Зв’язок | Кратність |
|---------|---------|-----------|
| `transactions` | `trainer_id` → `users`; опційно `client_id`, `session_id` | N : 1 |
| `analytics_cache` | `trainer_id` → `users` | N : 1 |
| `profile_view_events` | `trainer_id` → `users` | N : 1 |
| `achievements` | `trainer_id` → `users` | N : 1 |

---

## 4. Легенда (ER-нотація)

| У Mermaid ER | Значення |
|--------------|----------|
| `||--o{` | один до багатьох |
| `}o--o|` | багато до одного, FK опційний |
| `}o--||` | багато до одного, FK обов’язковий |
