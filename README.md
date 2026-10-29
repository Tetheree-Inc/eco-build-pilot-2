# eco-build-pilot-2

Vite + React pilot for the ECO request-to-build flow (WO 18, scope 16).

- PROD: `main`, served at https://tetheree-inc.github.io/eco-build-pilot-2/
- DEV: `develop`, served at https://tetheree-inc.github.io/eco-build-pilot-2/dev/
- CI (`.github/workflows/ci.yml`) runs on every push and pull request. If `package.json` exists it runs `npm ci`, then `lint`, `test` and `build` when those scripts exist.
- Deploy (`.github/workflows/pages.yml`) runs on push to `main` or `develop` and publishes both branches as one Pages site. A branch with a `build` script is built and its `dist/` is published; otherwise the files are published as they are.
- Deployments to `github-pages` wait for the Eco Build Gate.

## Local development

```bash
npm ci
npm run dev
```

Build for GitHub Pages sub-paths (same as CI deploy):

```bash
BASE_PATH=/eco-build-pilot-2/dev/ npm run build   # DEV
BASE_PATH=/eco-build-pilot-2/ npm run build       # PROD
```

Output is written to `dist/`. The footer shows `package.json` version and a **DEV** or **PROD** label derived from `BASE_PATH` (paths ending in `/dev`) or `APP_ENV`.
