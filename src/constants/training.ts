import type { SetNote } from '../types';

export const TRAINING_TYPES = [
  'Cardio',
  'HIIT',
  'Strength',
  'Yoga',
  'Mobility',
  'Pilates',
] as const;
export type TrainingType = (typeof TRAINING_TYPES)[number];

export const SET_NOTES: { key: SetNote; label: string; icon: string }[] = [
  { key: 'regular', label: 'Regular', icon: 'checkmark-circle-outline' },
  { key: 'failure', label: 'To failure', icon: 'flame-outline' },
  { key: 'dropset', label: 'Drop set', icon: 'trending-down-outline' },
  { key: 'short_rest', label: 'Short rest', icon: 'timer-outline' },
  { key: 'long_rest', label: 'Long rest', icon: 'time-outline' },
];

export const SET_NOTE_CYCLE: SetNote[] = SET_NOTES.map((n) => n.key);
