/**
 * Domain models for FitConnect. Pure types only — no runtime data.
 * Mock data and data-access live in src/mocks (and, later, src/services).
 */

export type {
  AnalyticsData,
  ChartDataPoint,
  IncomeOverTimeData,
  RevenueBySourceData,
} from './analytics';
export type { Client } from './client';
export type { MeasurementEntry } from './measurement';
export type { Session, SessionStatus } from './session';
export type { ConnectionStatus, Trainer } from './trainer';
export type {
  CompletedTraining,
  ExerciseInfo,
  ExerciseSet,
  LoggedExercise,
  ProgramExercise,
  SetNote,
  TrainingProgram,
} from './training';
export type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './transaction';
