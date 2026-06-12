import { buildOnboardingProfile, submitOnboardingProfile } from './onboardingApi';
import type { OnboardingState } from '../store/onboardingStore';

const baseState = {
  name: '  Alex  ',
  experienceYears: '4-6 years',
  hasCertifications: true,
  certifications: [{ name: 'cert.pdf', uri: 'file://cert.pdf' }],
  trainingTypes: ['Strength', 'Yoga'],
  clientTypes: ['Beginners'],
  hasPrograms: false,
  programTitle: '',
  programDescription: '',
  freePreview: true,
  accessSetting: 'public',
  locations: ['Online'],
  workDays: ['Monday', 'Wednesday'],
  workTimeStart: '09:00',
  workTimeEnd: '18:00',
  sameSlotsEveryWeek: true,
  profilePhotoUri: null,
  selfLevel: 'Amateur',
  hasInjuries: true,
  injuriesNote: '  knee  ',
  preferredTrainerGender: '',
  preferredFormat: ['Online'],
  currentRoute: null,
} as unknown as OnboardingState;

describe('buildOnboardingProfile', () => {
  it('maps client state into a client profile', () => {
    const profile = buildOnboardingProfile(baseState, 'client');
    expect(profile).toMatchObject({
      role: 'client',
      name: 'Alex',
      trainingDuration: '4-6 years',
      level: 'Amateur',
      interests: ['Strength', 'Yoga'],
      injuries: { has: true, note: 'knee' },
      preferredLocations: ['Online'],
      availability: { days: ['Monday', 'Wednesday'], from: '09:00', to: '18:00' },
      trainerPreferences: { gender: 'Any', formats: ['Online'] },
    });
  });

  it('maps trainer state into a trainer profile', () => {
    const profile = buildOnboardingProfile(baseState, 'trainer');
    expect(profile).toMatchObject({
      role: 'trainer',
      name: 'Alex',
      experience: '4-6 years',
      certifications: { has: true, files: [{ name: 'cert.pdf', uri: 'file://cert.pdf' }] },
      trainingTypes: ['Strength', 'Yoga'],
      clientTypes: ['Beginners'],
      schedule: { days: ['Monday', 'Wednesday'], from: '09:00', to: '18:00', sameSlotsEveryWeek: true },
    });
  });
});

describe('submitOnboardingProfile', () => {
  it('resolves with a created id for a valid profile', async () => {
    const result = await submitOnboardingProfile(buildOnboardingProfile(baseState, 'client'));
    expect(result.id).toMatch(/^mock-client-/);
    expect(typeof result.createdAt).toBe('string');
  });

  it('rejects when the profile has no name', async () => {
    await expect(
      submitOnboardingProfile(buildOnboardingProfile({ ...baseState, name: '' }, 'trainer'))
    ).rejects.toThrow(/name/i);
  });
});
