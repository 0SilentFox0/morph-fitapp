import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MuscleGroup } from '../constants/muscles';
import type { ProgramExercise, Session, TrainingProgram } from '../types';

export type AuthStackParamList = {
  Login: undefined;
};

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
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Schedule: undefined;
  SessionForm: { session?: Session } | undefined;
  RequestSubmitted: { counterpartName?: string } | undefined;
  TrainingLibrary: undefined;
  AddToLibraryForm:
    | { program?: TrainingProgram; selectedExercises?: ProgramExercise[] }
    | undefined;
  Gallery:
    | {
        program?: TrainingProgram;
        draftTitle?: string;
        draftTag?: string;
        draftDescription?: string;
        existingExercises?: ProgramExercise[];
      }
    | undefined;
  CardioClassForm: { program?: TrainingProgram } | undefined;
};

/**
 * Live-training routes shared by the trainer Clients stack and the client Train
 * stack — both mount the same ExerciseDetail/TrainingSummary screens.
 */
export type LiveTrainingParamList = {
  ExerciseDetail: {
    participantId: string;
    programId: string | null;
    exerciseIndex: number;
  };
  TrainingSummary: { participantId?: string };
};

export type ClientsStackParamList = LiveTrainingParamList & {
  ClientsList: undefined;
  Filters: undefined;
  ClientProfile: { clientId?: string } | undefined;
  ProgramDetail: { programId: string };
  ClientsProfileExtended: { clientId?: string } | undefined;
  AddEditClient: { clientId?: string } | undefined;
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
  TrainTab: undefined;
  ChatTab: undefined;
  ProgressTab: undefined;
};

export type TrainStackParamList = LiveTrainingParamList & {
  TrainHome: undefined;
  WorkoutBuilder: undefined;
  WorkoutOverview:
    | { source: 'program'; programId: string }
    | { source: 'assigned'; sessionId: string }
    | { source: 'custom'; exercises: ProgramExercise[] };
};

export type ClientHomeStackParamList = {
  ClientHome: undefined;
  ClientProfile: undefined;
  BookSession: { trainerId?: string } | undefined;
  RequestSubmitted: { counterpartName?: string } | undefined;
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
