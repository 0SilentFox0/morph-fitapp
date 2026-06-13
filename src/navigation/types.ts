import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Session, TrainingProgram, ProgramExercise } from '../mocks';

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
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatThread: { conversationId: string };
  NewChat: undefined;
};

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
