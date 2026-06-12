import { stepFor } from './onboardingSteps';

describe('stepFor', () => {
  it('numbers the trainer flow (7 steps, no TrainerPreferences)', () => {
    expect(stepFor('WhatsYourName', 'trainer')).toEqual({ step: 1, totalSteps: 7 });
    expect(stepFor('ClientTypes', 'trainer')).toEqual({ step: 4, totalSteps: 7 });
    expect(stepFor('ProfilePhoto', 'trainer')).toEqual({ step: 7, totalSteps: 7 });
  });

  it('numbers the client flow (8 steps, includes TrainerPreferences)', () => {
    expect(stepFor('WhatsYourName', 'client')).toEqual({ step: 1, totalSteps: 8 });
    expect(stepFor('TrainerPreferences', 'client')).toEqual({ step: 7, totalSteps: 8 });
    expect(stepFor('ProfilePhoto', 'client')).toEqual({ step: 8, totalSteps: 8 });
  });

  it('defaults a null role to the trainer flow', () => {
    expect(stepFor('WhatsYourName', null)).toEqual({ step: 1, totalSteps: 7 });
  });

  it('returns an undefined step for screens outside the numbered flow', () => {
    expect(stepFor('Welcome', 'client')).toEqual({ step: undefined, totalSteps: 8 });
    expect(stepFor('PreviewProfile', 'trainer')).toEqual({ step: undefined, totalSteps: 7 });
  });

  it('omits TrainerPreferences from the trainer flow', () => {
    expect(stepFor('TrainerPreferences', 'trainer').step).toBeUndefined();
  });
});
