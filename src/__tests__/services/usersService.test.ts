import * as usersApi from '../../services/api/users';
import {
  buildProfileInput,
  updateProfile,
} from '../../services/usersService';

afterEach(() => jest.restoreAllMocks());

describe('buildProfileInput', () => {
  it('trims the name and maps comma fields to API arrays', () => {
    expect(
      buildProfileInput({
        name: '  Oleg  ',
        trainingTypes: ['Cardio', 'HIIT'],
        locations: ['Gym'],
      })
    ).toEqual({
      name: 'Oleg',
      training_types: ['Cardio', 'HIIT'],
      locations: ['Gym'],
    });
  });

  it('throws when the name is blank', () => {
    expect(() => buildProfileInput({ name: '  ' })).toThrow();
  });
});

describe('updateProfile', () => {
  it('PUTs /me with the built input and returns the user', async () => {
    const spy = jest
      .spyOn(usersApi, 'updateMe')
      .mockResolvedValue({ data: { id: 'u1', name: 'Oleg' } } as never);

    const user = await updateProfile({ name: 'Oleg' });

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Oleg' }));
    expect(user.name).toBe('Oleg');
  });
});
