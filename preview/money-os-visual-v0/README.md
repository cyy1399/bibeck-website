# Money OS Visual Preview V0 — LOCAL TEST HARNESS ONLY

Run `pnpm preview:money-os`, then open `http://127.0.0.1:4317`.
This is not a Next route, production endpoint, login, onboarding, or persistence service.
The listener binds IPv4 loopback only, rejects production mode, arbitrary hosts,
non-GET methods and unknown scenario inputs. No environment file is loaded.

Each request creates fresh synthetic inputs and invokes the existing S04 service
with the existing **test-only** identity/clock ports. These ports do not authenticate
a person. Only the resulting `WorkspaceDto` is rendered, never the private candidate.
No financial input fields, database, cookies, storage, outbound service, fake save,
mission completion, financial-rule reimplementation, or production imports are added.

Scenarios A–F reuse the source golden fixtures. F changes only the synthetic goal
date to 2026-10-22. B/F retain unsupported producer/policy limitations; B is NOT
a manufactured HIGH_COST action. D/E do not imply universal financial health.
FAILURE uses the existing partial-expenses runtime failure and shows safe diagnostics.
All results remain unpublished. The current S04 copy is deliberately not rewritten.

Verification: `pnpm typecheck:money-os-preview`, `pnpm lint:money-os-preview`,
and `node --experimental-strip-types --test tests/money-os-visual-preview.test.mjs`.
Production regression still uses the unchanged `pnpm test` build/test pipeline.
Generated browser evidence belongs in ignored `.artifacts/money-os-visual-v0/` only.

For actual browser evidence, start the local harness and run:
`node --experimental-strip-types preview/money-os-visual-v0/verify-browser.mjs --url=http://127.0.0.1:4317 --playwright=<installed-module-path> --browser=<installed-browser-executable>`.
Quote arguments containing spaces. This optional script uses an existing reviewer
runtime, adds no project dependency, verifies all seven states at 390/1440px,
and writes PNGs plus `browser-results.json` only to the ignored artifact directory.
It checks expanded content, scenario switching, focus, anchors, console failures,
external requests, browser storage and cookies. It is not a production E2E flow.

Known inherited review limitation: S04 missing-information sentences can read as
confirmed contradictions even when their inputs are unknown; mission WHY/WHAT
copy can repeat the title, and some producer-limit copy is still technical.
The preview shows these DTO strings unchanged rather than hiding uncertainty or
rewriting frozen conclusions. Product copy/policy review remains separate.

Delete this directory, its preview test/config, and preview scripts to remove the
milestone. S00–S04 and production routes remain unchanged. This preview does not
complete or replace S05–S10, and grants no deployment or real-data access.
