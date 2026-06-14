/**
 * Centralized mock data for FitConnect.
 * Replace this file or its exports with API calls when backend is ready.
 */

import type { MuscleGroup } from '../constants/muscles';
import type {
  Session,
  ExerciseSet,
  ProgramExercise,
  TrainingProgram,
  ExerciseInfo,
  Client,
  CompletedTraining,
  Transaction,
  AnalyticsData,
  MeasurementEntry,
  Trainer,
} from '../types';

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
        muscles: ['chest', 'triceps', 'shoulders'],
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
        muscles: ['chest', 'shoulders', 'triceps'],
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
        muscles: ['core', 'quads', 'shoulders'],
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
        muscles: ['quads', 'hamstrings', 'calves'],
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
        muscles: ['back', 'biceps', 'core'],
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
        muscles: ['quads', 'glutes', 'hamstrings', 'core'],
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
        muscles: ['back', 'hamstrings', 'glutes', 'core'],
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

/** exercise id → reference info, deduped across all program definitions. */
export const exerciseCatalog: Record<number, ExerciseInfo> =
  mockTrainingPrograms.reduce<Record<number, ExerciseInfo>>((acc, program) => {
    for (const exercise of program.exercises ?? []) {
      if (!acc[exercise.id]) {
        acc[exercise.id] = {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          muscles: exercise.muscles ?? [],
        };
      }
    }
    return acc;
  }, {});

/**
 * exercise id → muscle groups, derived from the program definitions above.
 * Source of truth for the per-muscle progress stats (see utils/muscleStats.ts).
 */
export const exerciseMuscleMap: Record<number, MuscleGroup[]> = Object.fromEntries(
  Object.values(exerciseCatalog)
    .filter((e) => e.muscles.length > 0)
    .map((e) => [e.id, e.muscles]),
);

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

/**
 * Curated past trainings for the headline demo clients. Values are intentionally
 * a little below the program templates so applying +5/10/15% is meaningful.
 * Exercise ids match mockTrainingPrograms (101-103 / 201-202 / 301-302).
 */
const curatedTrainingHistory: CompletedTraining[] = [
  {
    id: 'th1',
    clientName: 'Guy Hawkins',
    programId: '1',
    date: 'Dec 5',
    exercises: [
      {
        exerciseId: 101,
        sets: [
          { weight: 38, reps: 28 },
          { weight: 42, reps: 24 },
          { weight: 46, reps: 20 },
          { weight: 46, reps: 16 },
        ],
      },
      {
        exerciseId: 102,
        sets: [
          { weight: 18, reps: 15 },
          { weight: 20, reps: 12 },
        ],
      },
      {
        exerciseId: 103,
        sets: [
          { weight: 0, reps: 35 },
          { weight: 0, reps: 35 },
        ],
      },
    ],
  },
  // Brooklyn Simmons — several Strength sessions (oldest → newest) so the
  // client-profile progress chart has multiple points.
  {
    id: 'th2a',
    clientName: 'Brooklyn Simmons',
    programId: '3',
    date: 'Nov 22',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 45, reps: 12 }, { weight: 55, reps: 10 }, { weight: 60, reps: 8 }] },
      { exerciseId: 302, sets: [{ weight: 60, reps: 8 }, { weight: 70, reps: 6 }] },
    ],
  },
  {
    id: 'th2b',
    clientName: 'Brooklyn Simmons',
    programId: '3',
    date: 'Nov 29',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 50, reps: 12 }, { weight: 60, reps: 10 }, { weight: 70, reps: 8 }] },
      { exerciseId: 302, sets: [{ weight: 70, reps: 8 }, { weight: 80, reps: 6 }] },
    ],
  },
  {
    id: 'th2',
    clientName: 'Brooklyn Simmons',
    programId: '3',
    date: 'Dec 6',
    exercises: [
      {
        exerciseId: 301,
        sets: [
          { weight: 55, reps: 12 },
          { weight: 65, reps: 10 },
          { weight: 75, reps: 8 },
        ],
      },
      {
        exerciseId: 302,
        sets: [
          { weight: 75, reps: 8 },
          { weight: 85, reps: 6 },
        ],
      },
    ],
  },
  // Darrell Steward — Cardio sessions.
  {
    id: 'th3a',
    clientName: 'Darrell Steward',
    programId: '2',
    date: 'Nov 27',
    exercises: [
      { exerciseId: 201, sets: [{ weight: 0, reps: 15 }] },
      { exerciseId: 202, sets: [{ weight: 0, reps: 12 }] },
    ],
  },
  {
    id: 'th3',
    clientName: 'Darrell Steward',
    programId: '2',
    date: 'Dec 4',
    exercises: [
      {
        exerciseId: 201,
        sets: [{ weight: 0, reps: 18 }],
      },
      {
        exerciseId: 202,
        sets: [{ weight: 0, reps: 14 }],
      },
    ],
  },
];

/**
 * A uniform three-point Strength progression (program 3, exercises 301/302),
 * ascending over time. Used to auto-populate history for every demo client
 * without a curated set, so the progress chart always has data to render.
 */
function seedClientHistory(clientName: string): CompletedTraining[] {
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return [
    {
      id: `th-${slug}-1`,
      clientName,
      programId: '3',
      date: 'Nov 22',
      exercises: [
        { exerciseId: 301, sets: [{ weight: 45, reps: 12 }, { weight: 55, reps: 10 }, { weight: 60, reps: 8 }] },
        { exerciseId: 302, sets: [{ weight: 60, reps: 8 }, { weight: 70, reps: 6 }] },
      ],
    },
    {
      id: `th-${slug}-2`,
      clientName,
      programId: '3',
      date: 'Nov 29',
      exercises: [
        { exerciseId: 301, sets: [{ weight: 50, reps: 12 }, { weight: 60, reps: 10 }, { weight: 70, reps: 8 }] },
        { exerciseId: 302, sets: [{ weight: 70, reps: 8 }, { weight: 80, reps: 6 }] },
      ],
    },
    {
      id: `th-${slug}-3`,
      clientName,
      programId: '3',
      date: 'Dec 6',
      exercises: [
        { exerciseId: 301, sets: [{ weight: 55, reps: 12 }, { weight: 65, reps: 10 }, { weight: 75, reps: 8 }] },
        { exerciseId: 302, sets: [{ weight: 75, reps: 8 }, { weight: 85, reps: 6 }] },
      ],
    },
  ];
}

/**
 * The signed-in client. Their own past trainings are seeded below so the
 * client-side progress features (body-map, PRs, streak) always have data,
 * independent of whatever display name was entered at onboarding.
 */
export const CURRENT_USER_NAME = 'You';

/**
 * Richer, dated history for the current client across several programs so the
 * per-muscle heat-map, trend charts and streak all render meaningfully. Dates
 * are ISO (recent, relative to the demo "today") and ascending oldest → newest.
 */
const currentUserHistory: CompletedTraining[] = [
  {
    id: 'me-1',
    clientName: CURRENT_USER_NAME,
    programId: '3',
    date: '2026-06-01T18:00:00Z',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 50, reps: 12 }, { weight: 60, reps: 10 }, { weight: 70, reps: 8 }] },
      { exerciseId: 302, sets: [{ weight: 70, reps: 8 }, { weight: 80, reps: 6 }] },
    ],
  },
  {
    id: 'me-2',
    clientName: CURRENT_USER_NAME,
    programId: '1',
    date: '2026-06-03T18:00:00Z',
    exercises: [
      { exerciseId: 101, sets: [{ weight: 45, reps: 12 }, { weight: 50, reps: 10 }, { weight: 55, reps: 8 }] },
      { exerciseId: 102, sets: [{ weight: 20, reps: 14 }, { weight: 22, reps: 12 }] },
      { exerciseId: 103, sets: [{ weight: 0, reps: 40 }, { weight: 0, reps: 35 }] },
    ],
  },
  {
    id: 'me-3',
    clientName: CURRENT_USER_NAME,
    programId: '2',
    date: '2026-06-06T08:00:00Z',
    exercises: [
      { exerciseId: 201, sets: [{ weight: 0, reps: 25 }] },
      { exerciseId: 202, sets: [{ weight: 0, reps: 18 }, { weight: 0, reps: 16 }] },
    ],
  },
  {
    id: 'me-4',
    clientName: CURRENT_USER_NAME,
    programId: '3',
    date: '2026-06-08T18:00:00Z',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 55, reps: 12 }, { weight: 65, reps: 10 }, { weight: 75, reps: 8 }] },
      { exerciseId: 302, sets: [{ weight: 75, reps: 8 }, { weight: 85, reps: 6 }, { weight: 95, reps: 4 }] },
    ],
  },
  {
    id: 'me-5',
    clientName: CURRENT_USER_NAME,
    programId: '1',
    date: '2026-06-10T18:00:00Z',
    exercises: [
      { exerciseId: 101, sets: [{ weight: 50, reps: 12 }, { weight: 55, reps: 10 }, { weight: 60, reps: 8 }] },
      { exerciseId: 102, sets: [{ weight: 22, reps: 14 }, { weight: 24, reps: 12 }] },
    ],
  },
  {
    id: 'me-6',
    clientName: CURRENT_USER_NAME,
    programId: '3',
    date: '2026-06-12T18:00:00Z',
    exercises: [
      { exerciseId: 301, sets: [{ weight: 60, reps: 12 }, { weight: 70, reps: 10 }, { weight: 80, reps: 8 }] },
      { exerciseId: 302, sets: [{ weight: 80, reps: 8 }, { weight: 90, reps: 6 }, { weight: 100, reps: 4 }] },
    ],
  },
];

const curatedHistoryNames = new Set(curatedTrainingHistory.map((t) => t.clientName));

/**
 * Past trainings keyed by client display name. The headline demo clients keep
 * their curated, program-specific values; every other client (from mockClients
 * or any session participant) gets a uniform seeded progression so the
 * post-training stats chart is never empty.
 */
export const mockTrainingHistory: CompletedTraining[] = [
  ...currentUserHistory,
  ...curatedTrainingHistory,
  ...Array.from(
    new Set([
      ...mockClients.map((c) => c.name),
      ...mockSessions.flatMap((s) => s.participants.map((p) => p.name)),
    ]),
  )
    .filter((name) => !curatedHistoryNames.has(name))
    .flatMap(seedClientHistory),
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

// ─── Body measurements (client progress) ────────────────────────────────────

/** Seed bodyweight/measurement history for the current client, oldest → newest. */
export const mockMeasurements: MeasurementEntry[] = [
  { id: 'm1', date: '2026-05-16T08:00:00Z', weightKg: 82.4, chestCm: 102, waistCm: 88, armCm: 36 },
  { id: 'm2', date: '2026-05-23T08:00:00Z', weightKg: 81.8, chestCm: 102, waistCm: 87, armCm: 36 },
  { id: 'm3', date: '2026-05-30T08:00:00Z', weightKg: 81.1, chestCm: 103, waistCm: 86, armCm: 37 },
  { id: 'm4', date: '2026-06-06T08:00:00Z', weightKg: 80.5, chestCm: 103, waistCm: 85, armCm: 37 },
  { id: 'm5', date: '2026-06-12T08:00:00Z', weightKg: 79.9, chestCm: 104, waistCm: 84, armCm: 38 },
];

// ─── Trainers (client-side discovery) ───────────────────────────────────────

export const mockTrainers: Trainer[] = [
  {
    id: 't1',
    name: 'Marcus Reed',
    headline: 'Strength & Conditioning Coach',
    bio: 'Former competitive powerlifter helping clients build strength safely and progressively. 10+ years coaching all levels.',
    specialties: ['Strength', 'Powerlifting', 'Mobility'],
    location: 'Kyiv · In-person & Online',
    rating: 4.9,
    reviews: 128,
    pricePerSession: '$45/session',
    experienceYears: 11,
    certifications: ['NASM-CPT', 'CSCS'],
    online: true,
    connection: 'none',
  },
  {
    id: 't2',
    name: 'Sofia Marenko',
    headline: 'HIIT & Fat-loss Specialist',
    bio: 'High-energy sessions focused on conditioning and sustainable fat loss. I make hard work fun.',
    specialties: ['HIIT', 'Cardio', 'Nutrition'],
    location: 'Lviv · In-person',
    rating: 4.8,
    reviews: 94,
    pricePerSession: '$38/session',
    experienceYears: 7,
    certifications: ['ACE-CPT'],
    online: false,
    connection: 'none',
  },
  {
    id: 't3',
    name: 'Daniel Cho',
    headline: 'Mobility & Rehab Coach',
    bio: 'Physiotherapy background. Specialise in injury recovery, posture and pain-free movement.',
    specialties: ['Mobility', 'Rehab', 'Yoga'],
    location: 'Online only',
    rating: 5.0,
    reviews: 61,
    pricePerSession: '$50/session',
    experienceYears: 9,
    certifications: ['DPT', 'FRC'],
    online: true,
    connection: 'none',
  },
  {
    id: 't4',
    name: 'Amina Yusuf',
    headline: 'Bodybuilding & Physique Coach',
    bio: 'Helping clients build muscle and prep for stage. Detailed programming and accountability.',
    specialties: ['Bodybuilding', 'Strength', 'Nutrition'],
    location: 'Odesa · In-person & Online',
    rating: 4.7,
    reviews: 73,
    pricePerSession: '$42/session',
    experienceYears: 8,
    certifications: ['ISSA-CPT'],
    online: true,
    connection: 'none',
  },
  {
    id: 't5',
    name: 'Liam O’Brien',
    headline: 'Running & Endurance Coach',
    bio: 'From 5k to marathon. Structured endurance plans tailored to your race calendar.',
    specialties: ['Cardio', 'Endurance', 'Running'],
    location: 'Kyiv · Outdoor & Online',
    rating: 4.6,
    reviews: 52,
    pricePerSession: '$35/session',
    experienceYears: 6,
    certifications: ['UESCA Run'],
    online: true,
    connection: 'none',
  },
  {
    id: 't6',
    name: 'Yulia Tkachenko',
    headline: 'Yoga & Flexibility Instructor',
    bio: 'Vinyasa and restorative yoga for strength, balance and stress relief. All levels welcome.',
    specialties: ['Yoga', 'Mobility', 'Wellness'],
    location: 'Lviv · In-person & Online',
    rating: 4.9,
    reviews: 110,
    pricePerSession: '$30/session',
    experienceYears: 12,
    certifications: ['RYT-500'],
    online: true,
    connection: 'none',
  },
];

/** Distinct specialties across all trainers, for the filter screen. */
export const trainerSpecialties: string[] = Array.from(
  new Set(mockTrainers.flatMap((t) => t.specialties)),
).sort();
