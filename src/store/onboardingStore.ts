import { create } from 'zustand';

export interface OnboardingState {
  name: string;
  experienceYears: string;
  hasCertifications: boolean;
  trainingTypes: string[];
  clientTypes: string[];
  hasPrograms: boolean;
  programTitle: string;
  programDescription: string;
  locations: string[];
  workDays: string;
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
  reset: () => void;
}

const initialState = {
  name: '',
  experienceYears: '',
  hasCertifications: false,
  trainingTypes: [] as string[],
  clientTypes: [] as string[],
  hasPrograms: false,
  programTitle: '',
  programDescription: '',
  locations: [] as string[],
  workDays: 'Monday - Friday',
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
  reset: () => set(initialState),
}));
