# eco-build-pilot-2

Empty pilot for the ECO request-to-build flow (WO 248, scope 127 E2E).

## content.json

Published at the site root next to `index.html`. The main region loads `./content.json` and renders each entry in `blocks` in order.

Supported block types:

| `type` | Fields |
| --- | --- |
| `status-badge` | `label`, `text`, optional `variant` (`ok`, `warn`, `neutral`), optional `detail` |
| `milestones` | optional `title`, `items[]` with `title` (or `name`), optional `description`, optional `status` (`done`, `current`, `upcoming`) |

Other block types are ignored. If nothing renderable remains, the page shows a friendly error in the main region.

- PROD: `main`, served at https://tetheree-inc.github.io/eco-build-pilot-2/
- DEV: `develop`, served at https://tetheree-inc.github.io/eco-build-pilot-2/dev/
- CI (`.github/workflows/ci.yml`) runs on every push and pull request. If `package.json` exists it runs `npm ci`, then `lint`, `test` and `build` when those scripts exist.
- Deploy (`.github/workflows/pages.yml`) runs on push to `main` or `develop` and publishes both branches as one Pages site. A branch with a `build` script is built and its `dist/` is published; otherwise the files are published as they are.
- Deployments to `github-pages` wait for the Eco Build Gate.
