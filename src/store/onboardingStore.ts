import { create } from 'zustand';

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
  setField: <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K]
  ) => void;
  toggleTrainingType: (type: string) => void;
  toggleClientType: (type: string) => void;
  toggleLocation: (location: string) => void;
  toggleWorkDay: (day: string) => void;
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
  workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as string[],
  workTimeStart: '09:00',
  workTimeEnd: '18:00',
  sameSlotsEveryWeek: true,
  profilePhotoUri: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
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
  addCertification: (cert) =>
    set((state) => ({
      certifications: [...state.certifications, cert],
    })),
  removeCertification: (uri) =>
    set((state) => ({
      certifications: state.certifications.filter((c) => c.uri !== uri),
    })),
  reset: () => set(initialState),
}));
