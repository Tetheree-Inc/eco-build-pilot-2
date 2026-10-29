# eco-build-pilot-2

Team standup pilot for the ECO request-to-build flow (work order 18, scope 16 — DT-2022 team members).

- PROD: `main`, served at https://tetheree-inc.github.io/eco-build-pilot-2/
- DEV: `develop`, served at https://tetheree-inc.github.io/eco-build-pilot-2/dev/
- CI (`.github/workflows/ci.yml`) runs on every push and pull request. If `package.json` exists it runs `npm ci`, then `lint`, `test` and `build` when those scripts exist.
- Deploy (`.github/workflows/pages.yml`) runs on push to `main` or `develop` and publishes both branches as one Pages site. A branch with a `build` script is built and its `dist/` is published; otherwise the files are published as they are.
- Deployments to `github-pages` wait for the Eco Build Gate.

## Features (DT-2022)

- Team members: display name, role, avatar colour
- Add, rename, edit role/colour, drag-or-button reorder, remove (with confirmation when standup notes exist)
- Maximum 15 members
- Standup board columns follow member order; state persists in the browser via the shared client store (`localStorage`)

## Local development

```bash
npm install
npm run dev
```

```bash
npm run lint
npm test
npm run build
```
