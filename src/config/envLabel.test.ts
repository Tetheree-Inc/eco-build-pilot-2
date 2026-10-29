import { describe, expect, it } from 'vitest';
import { deriveEnvLabel } from './envLabel';

describe('deriveEnvLabel', () => {
  it('returns DEV when BASE_PATH ends with /dev', () => {
    expect(deriveEnvLabel('/eco-build-pilot-2/dev/', undefined)).toBe('DEV');
    expect(deriveEnvLabel('/eco-build-pilot-2/dev', undefined)).toBe('DEV');
  });

  it('returns PROD for production base path', () => {
    expect(deriveEnvLabel('/eco-build-pilot-2/', undefined)).toBe('PROD');
  });

  it('prefers explicit APP_ENV when set', () => {
    expect(deriveEnvLabel('/eco-build-pilot-2/dev/', 'PROD')).toBe('PROD');
    expect(deriveEnvLabel('/eco-build-pilot-2/', 'DEV')).toBe('DEV');
  });
});
