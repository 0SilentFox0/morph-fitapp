import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Session } from '../mocks';

export type OnboardingStackParamList = {
  ChooseRole: undefined;
  WelcomeTrainer: undefined;
  WhatsYourName: undefined;
  Experience: undefined;
  TrainingTypes: undefined;
  ClientTypes: undefined;
  HavePrograms: undefined;
  AddToLibrary: undefined;
  WhereTrain: undefined;
  WorkSchedule: undefined;
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
  AddToLibraryForm: undefined;
  Gallery: undefined;
  CardioClassForm: undefined;
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  Filters: undefined;
  ClientProfile: undefined;
  ProgramDetail: undefined;
  ExerciseDetail: undefined;
  ClientsProfileExtended: undefined;
  TrainingSummary: undefined;
};

export type StatsStackParamList = {
  BusinessAnalytics: undefined;
  Transactions: undefined;
  YouGotPaid: undefined;
};

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;
