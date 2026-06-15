import * as usersApi from '../../services/api/users';
import {
  buildOnboardingProfile,
  profileToUpdateInput,
  submitOnboardingProfile,
} from '../../services/onboardingApi';
import type { OnboardingState } from '../../store/onboardingStore';

afterEach(() => jest.restoreAllMocks());

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
      availability: {
        days: ['Monday', 'Wednesday'],
        from: '09:00',
        to: '18:00',
      },
      trainerPreferences: { gender: 'Any', formats: ['Online'] },
    });
  });

  it('maps trainer state into a trainer profile', () => {
    const profile = buildOnboardingProfile(baseState, 'trainer');

    expect(profile).toMatchObject({
      role: 'trainer',
      name: 'Alex',
      experience: '4-6 years',
      certifications: {
        has: true,
        files: [{ name: 'cert.pdf', uri: 'file://cert.pdf' }],
      },
      trainingTypes: ['Strength', 'Yoga'],
      clientTypes: ['Beginners'],
      schedule: {
        days: ['Monday', 'Wednesday'],
        from: '09:00',
        to: '18:00',
        sameSlotsEveryWeek: true,
      },
    });
  });
});

describe('profileToUpdateInput', () => {
  it('maps a trainer profile to UpdateProfileInput (certs → names)', () => {
    const input = profileToUpdateInput(
      buildOnboardingProfile(baseState, 'trainer')
    );

    expect(input).toMatchObject({
      name: 'Alex',
      experience: '4-6 years',
      certifications: ['cert.pdf'],
      training_types: ['Strength', 'Yoga'],
      client_types: ['Beginners'],
      work_schedule_days: ['Monday', 'Wednesday'],
    });
  });

  it('maps a client level to the backend fitness_level enum', () => {
    const input = profileToUpdateInput(
      buildOnboardingProfile(baseState, 'client')
    );

    expect(input.fitness_level).toBe('intermediate'); // Amateur → intermediate
    expect(input.training_types).toEqual(['Strength', 'Yoga']);
  });
});

describe('submitOnboardingProfile', () => {
  it('PUTs /me with the mapped profile and returns the user id', async () => {
    const spy = jest
      .spyOn(usersApi, 'updateMe')
      .mockResolvedValue({
        data: { id: 'u9', created_at: '2026-06-15T00:00:00Z' },
      } as never);

    const result = await submitOnboardingProfile(
      buildOnboardingProfile(baseState, 'client')
    );

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alex' })
    );
    expect(result.id).toBe('u9');
  });

  it('rejects when the profile has no name', async () => {
    await expect(
      submitOnboardingProfile(
        buildOnboardingProfile({ ...baseState, name: '' }, 'trainer')
      )
    ).rejects.toThrow(/name/i);
  });
});
