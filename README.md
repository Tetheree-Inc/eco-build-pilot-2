# eco-build-pilot-2

Empty pilot for the ECO request-to-build flow (WO 248, scope 127 E2E).

- PROD: `main`, served at https://tetheree-inc.github.io/eco-build-pilot-2/
- DEV: `develop`, served at https://tetheree-inc.github.io/eco-build-pilot-2/dev/
- CI (`.github/workflows/ci.yml`) runs on every push and pull request. If `package.json` exists it runs `npm ci`, then `lint`, `test` and `build` when those scripts exist.
- Deploy (`.github/workflows/pages.yml`) runs on push to `main` or `develop` and publishes both branches as one Pages site. A branch with a `build` script is built and its `dist/` is published; otherwise the files are published as they are.
- Deployments to `github-pages` wait for the Eco Build Gate.
