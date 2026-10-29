export type AppEnvLabel = 'DEV' | 'PROD';

export function deriveEnvLabel(basePath: string | undefined, explicitEnv: string | undefined): AppEnvLabel {
  if (explicitEnv === 'DEV' || explicitEnv === 'PROD') {
    return explicitEnv;
  }
  const normalized = (basePath ?? '').replace(/\/+$/, '');
  if (normalized.endsWith('/dev')) {
    return 'DEV';
  }
  return 'PROD';
}
