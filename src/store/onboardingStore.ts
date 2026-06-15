import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandStorage } from '../services/storage';

export type AccessSetting = 'public' | 'subscribers' | 'private';

export interface Certification {
  name: string;
  uri: string;
}

export interface OnboardingState {
  name: string;
  experienceYears: string;
  hasCertifications: boolean;
  certifications: Certification[];
  trainingTypes: string[];
  clientTypes: string[];
  hasPrograms: boolean;
  programTitle: string;
  programDescription: string;
  freePreview: boolean;
  accessSetting: AccessSetting;
  locations: string[];
  workDays: string[];
  workTimeStart: string;
  workTimeEnd: string;
  sameSlotsEveryWeek: boolean;
  profilePhotoUri: string | null;
  // Client-only fields (client onboarding reuses the trainer screens with
  // mirrored questions; the shared fields above double as the client's
  // training duration / interests / preferred locations / availability).
  selfLevel: string;
  hasInjuries: boolean;
  injuriesNote: string;
  preferredTrainerGender: string;
  preferredFormat: string[];
  currentRoute: string | null;
  setCurrentRoute: (route: string | null) => void;
  setField: <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => void;
  toggleTrainingType: (type: string) => void;
  toggleClientType: (type: string) => void;
  toggleLocation: (location: string) => void;
  toggleWorkDay: (day: string) => void;
  togglePreferredFormat: (format: string) => void;
  addCertification: (cert: Certification) => void;
  removeCertification: (uri: string) => void;
  reset: () => void;
}

const initialState = {
  name: '',
  experienceYears: '',
  hasCertifications: false,
  certifications: [] as Certification[],
  trainingTypes: [] as string[],
  clientTypes: [] as string[],
  hasPrograms: false,
  programTitle: '',
  programDescription: '',
  freePreview: true,
  accessSetting: 'public' as AccessSetting,
  locations: [] as string[],
  workDays: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ] as string[],
  workTimeStart: '09:00',
  workTimeEnd: '18:00',
  sameSlotsEveryWeek: true,
  profilePhotoUri: null as string | null,
  selfLevel: '',
  hasInjuries: false,
  injuriesNote: '',
  preferredTrainerGender: '',
  preferredFormat: [] as string[],
  currentRoute: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setField: (key, value) => set({ [key]: value }),
      toggleTrainingType: (type) =>
        set((state) => ({
          trainingTypes: state.trainingTypes.includes(type)
            ? state.trainingTypes.filter((t) => t !== type)
            : [...state.trainingTypes, type],
        })),
      toggleClientType: (type) =>
        set((state) => ({
          clientTypes: state.clientTypes.includes(type)
            ? state.clientTypes.filter((t) => t !== type)
            : [...state.clientTypes, type],
        })),
      toggleLocation: (location) =>
        set((state) => ({
          locations: state.locations.includes(location)
            ? state.locations.filter((l) => l !== location)
            : [...state.locations, location],
        })),
      toggleWorkDay: (day) =>
        set((state) => ({
          workDays: state.workDays.includes(day)
            ? state.workDays.filter((d) => d !== day)
            : [...state.workDays, day],
        })),
      togglePreferredFormat: (format) =>
        set((state) => ({
          preferredFormat: state.preferredFormat.includes(format)
            ? state.preferredFormat.filter((f) => f !== format)
            : [...state.preferredFormat, format],
        })),
      addCertification: (cert) =>
        set((state) => ({
          certifications: [...state.certifications, cert],
        })),
      removeCertification: (uri) =>
        set((state) => ({
          certifications: state.certifications.filter((c) => c.uri !== uri),
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: zustandStorage,
      partialize: (state) => ({
        name: state.name,
        experienceYears: state.experienceYears,
        hasCertifications: state.hasCertifications,
        certifications: state.certifications,
        trainingTypes: state.trainingTypes,
        clientTypes: state.clientTypes,
        hasPrograms: state.hasPrograms,
        programTitle: state.programTitle,
        programDescription: state.programDescription,
        freePreview: state.freePreview,
        accessSetting: state.accessSetting,
        locations: state.locations,
        workDays: state.workDays,
        workTimeStart: state.workTimeStart,
        workTimeEnd: state.workTimeEnd,
        sameSlotsEveryWeek: state.sameSlotsEveryWeek,
        profilePhotoUri: state.profilePhotoUri,
        selfLevel: state.selfLevel,
        hasInjuries: state.hasInjuries,
        injuriesNote: state.injuriesNote,
        preferredTrainerGender: state.preferredTrainerGender,
        preferredFormat: state.preferredFormat,
        currentRoute: state.currentRoute,
      }),
    }
  )
);
