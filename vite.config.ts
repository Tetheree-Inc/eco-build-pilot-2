import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { deriveEnvLabel } from './src/config/envLabel';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.BASE_PATH || '/';

  return {
    base,
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_ENV_LABEL__: JSON.stringify(deriveEnvLabel(env.BASE_PATH, env.APP_ENV)),
    },
  };
});
