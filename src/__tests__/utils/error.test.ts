import { toErrorMessage } from '../../utils/error';

describe('toErrorMessage', () => {
  it('returns the message of an Error instance', () => {
    expect(toErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('stringifies non-Error values', () => {
    expect(toErrorMessage('plain string')).toBe('plain string');
    expect(toErrorMessage(42)).toBe('42');
    expect(toErrorMessage(null)).toBe('null');
  });
});
