/**
 * Centralized mock data for FitConnect.
 * Replace this file or its exports with API calls when backend is ready.
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export type SessionStatus = 'completed' | 'pending' | 'canceled';

export interface Session {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  status: SessionStatus;
  participants: { id: string; name: string; avatar?: string }[];
  programId?: string;
}

export type SetNote = 'regular' | 'failure' | 'dropset' | 'short_rest' | 'long_rest';

export interface ExerciseSet {
  weight: number;
  reps: number;
  note?: SetNote;
}

export interface ProgramExercise {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  sets: ExerciseSet[];
  /** Short duration label shown in exercise lists, e.g. "5m". */
  durationLabel?: string;
  /** Free-text guidance shown on the live Exercise screen. */
  trainerNotes?: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  tag: string;
  videoCount: number;
  views: number;
  likes: number;
  thumbnail?: string;
  /** e.g. "$5/month" */
  price?: string;
  description?: string;
  exercises?: ProgramExercise[];
}

export interface Client {
  id: string;
  name: string;
  avatar?: string;
  lastSession?: string;
  tag: string;
}

export type TransactionStatus = 'completed' | 'pending' | 'canceled';
export type TransactionType = 'Training' | 'Subscription';

export interface Transaction {
  id: string;
  clientName: string;
  date: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  /** Sessions used / total — shown as a progress bar for Subscription transactions. */
  sessionsUsed?: number;
  sessionsTotal?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface IncomeOverTimeData {
  labels: string[];
  datasets: { data: number[] }[];
}

export interface RevenueBySourceData {
  subscriptions: number;
  trainings: number;
}

export interface AnalyticsData {
  totalEarningsPerMonth: number;
  fromSubscriptions: number;
  fromTrainings: number;
  incomeOverTime: IncomeOverTimeData;
  revenueBySource: RevenueBySourceData;
}

// ─── Training placeholder images (fitness/workout themed) ───────────────────

const TRAINING_IMAGES = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=400&fit=crop',
];

// ─── Mock Data ─────────────────────────────────────────────────────────────

export const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Personal Session',
    type: 'HIIT',
    date: 'Today',
    time: '10:00am',
    status: 'completed',
    participants: [{ id: '1', name: 'Darrell Steward' }],
  },
  {
    id: '2',
    title: 'Cardio Class',
    type: 'Cardio',
    date: 'Today',
    time: '11:00am',
    status: 'canceled',
    participants: [
      { id: '2', name: 'Theresa Webb' },
      { id: '3', name: 'Bessie Cooper' },
      { id: '4', name: 'Wade Warren' },
      { id: '5', name: 'Guy Hawkins' },
    ],
  },
  {
    id: '3',
    title: 'Personal Session',
    type: 'HIIT',
    date: 'Today',
    time: '2:00pm',
    status: 'pending',
    participants: [{ id: '5', name: 'Guy Hawkins' }],
    programId: '1',
  },
  {
    id: '7',
    title: 'Personal Session',
    type: 'Strength',
    date: 'Today',
    time: '2:00pm',
    status: 'pending',
    participants: [{ id: '6', name: 'Brooklyn Simmons' }],
    programId: '3',
  },
  {
    id: '8',
    title: 'Personal Session',
    type: 'Cardio',
    date: 'Today',
    time: '2:00pm',
    status: 'pending',
    participants: [{ id: '2', name: 'Darrell Steward' }],
    programId: '2',
  },
  {
    id: '4',
    title: 'Strength Training',
    type: 'Strength',
    date: 'Today',
    time: '4:00pm',
    status: 'completed',
    participants: [{ id: '6', name: 'Brooklyn Simmons' }],
  },
  {
    id: '5',
    title: 'Yoga Flow',
    type: 'Yoga',
    date: 'Tomorrow',
    time: '9:00am',
    status: 'pending',
    participants: [
      { id: '7', name: 'Emma Williams' },
      { id: '8', name: 'Michael Chen' },
    ],
  },
  {
    id: '6',
    title: 'Group HIIT',
    type: 'HIIT',
    date: 'Tomorrow',
    time: '6:00pm',
    status: 'canceled',
    participants: [
      { id: '9', name: 'Sarah Mitchell' },
      { id: '10', name: 'John Peterson' },
      { id: '11', name: 'Lisa Anderson' },
    ],
  },
];

export const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: '1',
    name: 'HIIT Power',
    tag: 'HIIT',
    videoCount: 10,
    views: 24,
    likes: 340,
    thumbnail: TRAINING_IMAGES[0],
    price: '$5/month',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    exercises: [
      {
        id: 101,
        name: 'Bench press',
        category: 'Chest',
        imageUrl: TRAINING_IMAGES[0]!,
        durationLabel: '5m',
        trainerNotes:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        sets: [
          { weight: 40, reps: 30, note: 'failure' },
          { weight: 45, reps: 25 },
          { weight: 50, reps: 20 },
          { weight: 50, reps: 18 },
          { weight: 55, reps: 15 },
          { weight: 55, reps: 12 },
          { weight: 60, reps: 10 },
          { weight: 60, reps: 8 },
        ],
      },
      {
        id: 102,
        name: 'Incline dumbbell press',
        category: 'Chest',
        imageUrl: TRAINING_IMAGES[1]!,
        durationLabel: '5m',
        sets: [
          { weight: 20, reps: 15 },
          { weight: 22, reps: 12 },
          { weight: 24, reps: 10 },
        ],
      },
      {
        id: 103,
        name: 'Mountain climbers',
        category: 'Core',
        imageUrl: TRAINING_IMAGES[2]!,
        durationLabel: '5m',
        sets: [
          { weight: 0, reps: 40, note: 'short_rest' },
          { weight: 0, reps: 40 },
          { weight: 0, reps: 30 },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Cardio Burn',
    tag: 'Cardio',
    videoCount: 8,
    views: 18,
    likes: 210,
    thumbnail: TRAINING_IMAGES[1],
    price: '$5/month',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    exercises: [
      {
        id: 201,
        name: 'Treadmill run',
        category: 'Cardio',
        imageUrl: TRAINING_IMAGES[3]!,
        durationLabel: '20m',
        sets: [
          { weight: 0, reps: 20, note: 'long_rest' },
          { weight: 0, reps: 20 },
        ],
      },
      {
        id: 202,
        name: 'Rowing',
        category: 'Cardio',
        imageUrl: TRAINING_IMAGES[4]!,
        durationLabel: '10m',
        sets: [
          { weight: 0, reps: 15 },
          { weight: 0, reps: 15 },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Strength Builder',
    tag: 'Strength',
    videoCount: 12,
    views: 45,
    likes: 520,
    thumbnail: TRAINING_IMAGES[2],
    price: '$5/month',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
    exercises: [
      {
        id: 301,
        name: 'Back squat',
        category: 'Legs',
        imageUrl: TRAINING_IMAGES[2]!,
        durationLabel: '8m',
        sets: [
          { weight: 60, reps: 12 },
          { weight: 70, reps: 10 },
          { weight: 80, reps: 8, note: 'failure' },
          { weight: 80, reps: 6 },
        ],
      },
      {
        id: 302,
        name: 'Deadlift',
        category: 'Back',
        imageUrl: TRAINING_IMAGES[0]!,
        durationLabel: '8m',
        sets: [
          { weight: 80, reps: 8 },
          { weight: 90, reps: 6 },
          { weight: 100, reps: 4 },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Yoga Flow',
    tag: 'Yoga',
    videoCount: 15,
    views: 62,
    likes: 380,
    thumbnail: TRAINING_IMAGES[3],
    price: '$5/month',
  },
  {
    id: '5',
    name: 'Core Crush',
    tag: 'HIIT',
    videoCount: 6,
    views: 31,
    likes: 195,
    thumbnail: TRAINING_IMAGES[4],
    price: '$5/month',
  },
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Brooklyn Simmons',
    lastSession: 'Dec 5, 14:00',
    tag: 'Personal',
  },
  {
    id: '2',
    name: 'Darrell Steward',
    lastSession: 'Dec 4, 10:00',
    tag: 'Personal',
  },
  {
    id: '3',
    name: 'Theresa Webb',
    lastSession: 'Dec 3, 15:00',
    tag: 'Group',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    clientName: 'Sarah Mitchell',
    date: 'Dec 7, 2025',
    amount: '$65',
    type: 'Training',
    status: 'completed',
  },
  {
    id: '2',
    clientName: 'John Peterson',
    date: 'Dec 7, 2025',
    amount: '$400',
    type: 'Subscription',
    status: 'completed',
    sessionsUsed: 4,
    sessionsTotal: 9,
  },
  {
    id: '3',
    clientName: 'Emma Williams',
    date: 'Dec 6, 2025',
    amount: '$65',
    type: 'Training',
    status: 'pending',
  },
  {
    id: '4',
    clientName: 'Michael Chen',
    date: 'Dec 6, 2025',
    amount: '$65',
    type: 'Subscription',
    status: 'completed',
    sessionsUsed: 4,
    sessionsTotal: 9,
  },
  {
    id: '5',
    clientName: 'Sarah Mitchell',
    date: 'Dec 5, 2025',
    amount: '$65',
    type: 'Training',
    status: 'canceled',
  },
];

export const mockAnalyticsData: AnalyticsData = {
  totalEarningsPerMonth: 428,
  fromSubscriptions: 180,
  fromTrainings: 248,
  incomeOverTime: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [120, 85, 95, 140, 110, 75, 98] }],
  },
  revenueBySource: {
    subscriptions: 180,
    trainings: 248,
  },
};
