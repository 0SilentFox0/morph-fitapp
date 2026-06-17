import { z } from 'zod';

const uuid = z.string();

const dt = z.string();

// The backend sends optional collections as `null` (not `[]`) and may omit them
// entirely, so coerce both null and undefined to an empty array before validating.
const arr = <T extends z.ZodTypeAny = z.ZodString>(inner?: T) =>
  z.preprocess(
    (v) => (v == null ? [] : v),
    z.array((inner ?? z.string()) as T)
  );

export const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: dt,
  token_type: z.string(),
});

export const UserSchema = z.object({
  id: uuid,
  email: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
  role: z.enum(['client', 'trainer']),
  timezone: z.string().nullish(),
  locale: z.string().nullish(),
  currency: z.string().nullish(),
  points: z.number().nullish(),
  experience: z.string().nullish(),
  certifications: arr(),
  training_types: arr(),
  client_types: arr(),
  locations: arr(),
  work_schedule_start: z.string().nullish(),
  work_schedule_end: z.string().nullish(),
  work_schedule_days: arr(),
  goals: arr(),
  fitness_level: z
    .enum(['beginner', 'intermediate', 'advanced', 'elite'])
    .nullish(),
  onboarding_completed_at: dt.nullish(),
  created_at: dt,
});

export const UserPublicSchema = z.object({
  id: uuid,
  name: z.string(),
  avatar_url: z.string().nullish(),
  role: z.enum(['client', 'trainer']),
  experience: z.string().nullish(),
  certifications: arr(),
  training_types: arr(),
});

export const ClientSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  user_id: uuid.nullish(),
  name: z.string(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  avatar_url: z.string().nullish(),
  type: z.enum(['personal', 'group', 'online']),
  status: z.string(),
  notes: z.string().nullish(),
  tags: arr(),
  archived_at: dt.nullish(),
  created_at: dt.nullish(),
  updated_at: dt.nullish(),
});

export const ClientInvitationSchema = z.object({
  id: uuid,
  client_id: uuid,
  code: z.string(),
  email: z.string(),
  expires_at: dt.nullish(),
  accepted_at: dt.nullish(),
  revoked_at: dt.nullish(),
  created_at: dt.nullish(),
});

export const PackageTemplateSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  name: z.string(),
  kind: z.enum(['count_based', 'time_based', 'hybrid']),
  sessions_count: z.number(),
  validity_days: z.number(),
  price: z.number(),
  currency: z.string(),
  auto_renew_default: z.boolean(),
  archived_at: dt.nullish(),
  created_at: dt.nullish(),
});

export const ClientPackageSchema = z.object({
  id: uuid,
  client_id: uuid,
  trainer_id: uuid,
  template_id: uuid,
  kind: z.enum(['count_based', 'time_based', 'hybrid']),
  sessions_count: z.number(),
  remaining_sessions: z.number(),
  validity_days: z.number(),
  expires_at: dt.nullish(),
  price: z.number(),
  currency: z.string(),
  status: z.string(),
  assigned_at: dt.nullish(),
  auto_renew: z.boolean(),
  debt_since: dt.nullish(),
  created_at: dt.nullish(),
});

export const ProgramExerciseSchema = z.object({
  id: uuid,
  exercise_id: uuid,
  order: z.number(),
  sets: z.number(),
  reps: z.number(),
  weight_kg: z.number().nullish(),
  rest_seconds: z.number().nullish(),
  notes: z.string().nullish(),
  name_snapshot: z.string(),
});

export const ProgramSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  name: z.string(),
  description: z.string().nullish(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).nullish(),
  estimated_duration_min: z.number().nullish(),
  views_count: z.number().default(0),
  likes_count: z.number().default(0),
  archived_at: dt.nullish(),
  created_at: dt.nullish(),
  exercises: arr(ProgramExerciseSchema),
});

export const ClientProgramSchema = z.object({
  id: uuid,
  client_id: uuid,
  program_id: uuid,
  program_snapshot: z.record(z.string(), z.unknown()).default({}),
  assigned_at: dt.nullish(),
  removed_at: dt.nullish(),
});

export const SessionParticipantSchema = z.object({
  session_id: uuid,
  client_id: uuid,
  // The backend now embeds the full client (name + avatar) on each participant,
  // so session rows can show who they're with instead of a "Client" fallback.
  client: ClientSchema.nullish(),
});

export const SessionSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  title: z.string(),
  type: z.string().nullish(),
  start_at: dt.nullish(),
  end_at: dt.nullish(),
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'canceled',
    'no_show',
  ]),
  status_changed_at: dt.nullish(),
  cancellation_reason: z.string().nullish(),
  notes: z.string().nullish(),
  program_id: uuid.nullish(),
  client_package_id: uuid.nullish(),
  series_id: uuid.nullish(),
  google_event_id: z.string().nullish(),
  created_at: dt.nullish(),
  updated_at: dt.nullish(),
  participants: arr(SessionParticipantSchema),
});

export const ExerciseSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  name: z.string(),
  description: z.string().nullish(),
  muscle_groups: arr(),
  equipment: arr(),
  video_file_id: uuid.nullish(),
  archived_at: dt.nullish(),
  created_at: dt.nullish(),
});

export const WorkoutLogSetSchema = z.object({
  id: uuid,
  workout_log_exercise_id: uuid,
  exercise_id: uuid,
  set_index: z.number(),
  reps: z.number(),
  weight_kg: z.number(),
  rest_seconds: z.number().nullish(),
  performed_at: dt.nullish(),
  actor_user_id: uuid,
  is_pr: z.boolean().default(false),
  client_uuid: uuid,
  version: z.number(),
});

export const WorkoutLogExerciseSchema = z.object({
  id: uuid,
  exercise_id: uuid,
  order: z.number(),
  name_snapshot: z.string(),
  planned_sets: z.number().nullish(),
  planned_reps: z.number().nullish(),
  planned_weight_kg: z.number().nullish(),
  sets: arr(WorkoutLogSetSchema),
});

export const WorkoutLogSchema = z.object({
  id: uuid,
  session_id: uuid,
  started_at: dt.nullish(),
  started_by_user_id: uuid.nullish(),
  finished_at: dt.nullish(),
  finished_by_user_id: uuid.nullish(),
  last_version: z.number().nullish(),
  created_at: dt.nullish(),
  exercises: arr(WorkoutLogExerciseSchema),
});

export const BodyMeasurementSchema = z.object({
  id: uuid,
  client_id: uuid,
  metric_type: z.enum([
    'weight',
    'height',
    'body_fat_percent',
    'chest',
    'waist',
    'hips',
    'biceps',
    'thigh',
  ]),
  value: z.number(),
  unit: z.string(),
  measured_at: dt.nullish(),
  recorded_by_user_id: uuid,
  created_at: dt.nullish(),
});

export const PersonalRecordSchema = z.object({
  id: uuid,
  client_id: uuid,
  exercise_id: uuid,
  weight_kg: z.number(),
  reps: z.number(),
  estimated_1rm: z.number(),
  achieved_at: dt.nullish(),
  created_at: dt.nullish(),
});

export const MessageSchema = z.object({
  id: uuid,
  conversation_id: uuid,
  sender_id: uuid,
  body: z.string().nullish(),
  media_file_ids: arr(),
  sent_at: dt.nullish(),
  deleted_at: dt.nullish(),
});

export const ConversationParticipantSchema = z.object({
  user_id: uuid,
  last_read_at: dt.nullish(),
});

export const ConversationSchema = z.object({
  id: uuid,
  last_message_at: dt.nullish(),
  participants: arr(ConversationParticipantSchema),
  last_message: MessageSchema.nullish(),
  unread_count: z.number().default(0),
});

export const TransactionSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  client_id: uuid.nullish(),
  client_package_id: uuid.nullish(),
  amount: z.number(),
  currency: z.string(),
  method: z.enum(['cash', 'transfer', 'card', 'other']),
  status: z.enum(['paid', 'pending', 'canceled']),
  paid_at: dt.nullish(),
  note: z.string().nullish(),
  created_at: dt.nullish(),
});

export const WithdrawalSchema = z.object({
  id: uuid,
  trainer_id: uuid,
  amount: z.number(),
  currency: z.string(),
  withdrawn_at: dt.nullish(),
  note: z.string().nullish(),
  created_at: dt.nullish(),
});

export const NotificationSchema = z.object({
  id: uuid,
  type: z.string(),
  title: z.string(),
  body: z.string(),
  payload: z.record(z.string(), z.unknown()).default({}),
  source_type: z.string(),
  source_id: uuid,
  read_at: dt.nullish(),
  created_at: dt,
});

export type User = z.infer<typeof UserSchema>;
export type UserPublic = z.infer<typeof UserPublicSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type ClientInvitation = z.infer<typeof ClientInvitationSchema>;
export type PackageTemplate = z.infer<typeof PackageTemplateSchema>;
export type ClientPackage = z.infer<typeof ClientPackageSchema>;
export type Program = z.infer<typeof ProgramSchema>;
export type ProgramExercise = z.infer<typeof ProgramExerciseSchema>;
export type ClientProgram = z.infer<typeof ClientProgramSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type SessionParticipant = z.infer<typeof SessionParticipantSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutLog = z.infer<typeof WorkoutLogSchema>;
export type WorkoutLogExercise = z.infer<typeof WorkoutLogExerciseSchema>;
export type WorkoutLogSet = z.infer<typeof WorkoutLogSetSchema>;
export type BodyMeasurement = z.infer<typeof BodyMeasurementSchema>;
export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Withdrawal = z.infer<typeof WithdrawalSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
