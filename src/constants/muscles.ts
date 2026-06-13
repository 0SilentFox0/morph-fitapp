/**
 * Canonical muscle-group taxonomy for the client-side progress features.
 *
 * Program exercises are tagged with these groups (see mocks/data.ts), per-muscle
 * stats are aggregated against them (utils/muscleStats.ts), and the anatomical
 * BodyMap renders them via the slug map below. Keeping the set deliberately
 * coarse (11 groups) keeps both the data tagging and the body-map regions
 * manageable.
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
];

/** Human-readable labels (English — the app is English-only). */
export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
};

/** Which body view(s) a group is most visible on, used to pick the default map face. */
export const MUSCLE_VIEW: Record<MuscleGroup, 'front' | 'back' | 'both'> = {
  chest: 'front',
  back: 'back',
  shoulders: 'both',
  biceps: 'front',
  triceps: 'back',
  forearms: 'both',
  core: 'front',
  quads: 'front',
  hamstrings: 'back',
  glutes: 'back',
  calves: 'both',
};

/**
 * Maps each group to the body-part slug(s) used by `react-native-body-highlighter`
 * (v3 slug set). The BodyMap component is the only consumer; if the library is
 * swapped for a hand-built SVG these slugs become the SVG region ids instead.
 */
export const MUSCLE_TO_SLUGS: Record<MuscleGroup, string[]> = {
  chest: ['chest'],
  back: ['upper-back', 'lower-back', 'trapezius'],
  shoulders: ['deltoids'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  core: ['abs', 'obliques'],
  quads: ['quadriceps'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  calves: ['calves'],
};

/** Reverse lookup: body-highlighter slug → our MuscleGroup (for tap handling). */
export const SLUG_TO_MUSCLE: Record<string, MuscleGroup> = Object.entries(
  MUSCLE_TO_SLUGS,
).reduce<Record<string, MuscleGroup>>((acc, [group, slugs]) => {
  for (const slug of slugs) acc[slug] = group as MuscleGroup;
  return acc;
}, {});

/**
 * Best-effort mapping of a remote API muscle name (`Exercise.muscles[].name_en`,
 * e.g. "Pectoralis major") onto a MuscleGroup. Returns null when no group matches
 * so callers can skip unknown muscles. Matching is keyword-based and
 * case-insensitive.
 */
const API_MUSCLE_KEYWORDS: [RegExp, MuscleGroup][] = [
  [/pector/i, 'chest'],
  [/latissimus|trapez|rhomb|teres|erector|spinae|\bback\b/i, 'back'],
  [/deltoid|delt\b/i, 'shoulders'],
  [/biceps brachii|brachialis/i, 'biceps'],
  [/triceps/i, 'triceps'],
  [/brachioradialis|forearm|wrist (flexor|extensor)/i, 'forearms'],
  [/abdomin|obliqu|\bcore\b|rectus abdom/i, 'core'],
  [/quadriceps|quadricep|vastus|rectus femoris/i, 'quads'],
  [/hamstring|biceps femoris|semitendinosus|semimembranosus/i, 'hamstrings'],
  [/glute|gluteus/i, 'glutes'],
  [/gastrocnemius|soleus|calf|calves/i, 'calves'],
];

export function normalizeApiMuscle(nameEn: string): MuscleGroup | null {
  for (const [re, group] of API_MUSCLE_KEYWORDS) {
    if (re.test(nameEn)) return group;
  }
  return null;
}
