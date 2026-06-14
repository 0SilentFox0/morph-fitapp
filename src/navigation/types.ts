import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Session, TrainingProgram, ProgramExercise } from '../types';
import type { MuscleGroup } from '../constants/muscles';

export type OnboardingStackParamList = {
  ChooseRole: undefined;
  Welcome: undefined;
  WhatsYourName: undefined;
  Experience: undefined;
  TrainingTypes: undefined;
  ClientTypes: undefined;
  WhereTrain: undefined;
  WorkSchedule: undefined;
  TrainerPreferences: undefined;
  ProfilePhoto: undefined;
  PreviewProfile: undefined;
  YoureAllSet: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ClientsTab: undefined;
  AddTab: undefined;
  ChatTab: undefined;
  StatsTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  SessionForm: { session?: Session } | undefined;
  RequestSubmitted: undefined;
  TrainingLibrary: undefined;
  AddToLibraryForm: { program?: TrainingProgram; selectedExercises?: ProgramExercise[] } | undefined;
  Gallery: {
    program?: TrainingProgram;
    draftTitle?: string;
    draftTag?: string;
    draftDescription?: string;
    existingExercises?: ProgramExercise[];
  } | undefined;
  CardioClassForm: { program?: TrainingProgram } | undefined;
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  Filters: undefined;
  ClientProfile: { clientId?: string } | undefined;
  ProgramDetail: { programId: string };
  ExerciseDetail: { clientId: string; programId: string; exerciseIndex: number };
  ClientsProfileExtended: { clientId?: string } | undefined;
  TrainingSummary: { clientId?: string } | undefined;
};

export type StatsStackParamList = {
  BusinessAnalytics: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
  YouGotPaid: undefined;
  TrainerLeague: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatThread: { conversationId: string };
  NewChat: undefined;
};

// ─── Client-side navigation ──────────────────────────────────────────────────

export type ClientTabParamList = {
  ClientHomeTab: undefined;
  TrainersTab: undefined;
  ClientAddTab: undefined;
  ChatTab: undefined;
  ProgressTab: undefined;
};

export type ClientHomeStackParamList = {
  ClientHome: undefined;
  ClientProfile: undefined;
  BookSession: { trainerId?: string } | undefined;
  RequestSubmitted: undefined;
};

export type TrainersStackParamList = {
  TrainersList: undefined;
  TrainerFilters: undefined;
  TrainerProfile: { trainerId: string };
};

export type ProgressStackParamList = {
  ProgressOverview: undefined;
  MuscleDetail: { muscle: MuscleGroup };
  ExerciseProgress: undefined;
  ExerciseProgressDetail: { exerciseId: number };
  TrainingHistory: undefined;
  TrainingHistoryDetail: { trainingId: string };
  PersonalRecords: undefined;
  Measurements: undefined;
  Achievements: undefined;
  League: undefined;
  Leaderboard: undefined;
};

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
