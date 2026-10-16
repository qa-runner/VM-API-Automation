APi doc url : https://apidev.ayushmanager.com/docs/api#/operations/auth.login

credentials:
  Mobile: 9427082251
  password: Ayurveda@1

  Done. Scripts are now short words, and since package.json can't hold comments, the README has a plain table for each:
- npm test — everything
- npm run smoke — fast gate (~8s), run first
- npm run full — all 242 tests
- npm run contract — schema tests only
- npm run one "T0027" — run one test by ID/word/folder (new — replaces the old per-folder commands)
- npm run report — open Playwright report
- npm run allure — build + open Allure report
- npm run clean — wipe old results (new, cross-platform)
- npm run lint / npm run format — code style
Verified live: smoke → 30 passed, one "T0027" → 1 passed, clean → all report dirs removed.