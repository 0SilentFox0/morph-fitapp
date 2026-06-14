/**
 * Domain models for FitConnect. Pure types only — no runtime data.
 * Mock data and data-access live in src/mocks (and, later, src/services).
 */

export type { SessionStatus, Session } from './session';
export type {
  SetNote,
  ExerciseSet,
  ProgramExercise,
  TrainingProgram,
  ExerciseInfo,
  LoggedExercise,
  CompletedTraining,
} from './training';
export type { Client } from './client';
export type { ConnectionStatus, Trainer } from './trainer';
export type { TransactionStatus, TransactionType, Transaction } from './transaction';
export type {
  ChartDataPoint,
  IncomeOverTimeData,
  RevenueBySourceData,
  AnalyticsData,
} from './analytics';
export type { MeasurementEntry } from './measurement';
