# Firebase deployment safety — Mentor 3.0

**Production project `mentor-vkstech` must not receive the v3 rules yet.** The current browser application still uses direct Firebase writes in its legacy data layer. Deploying restrictive rules before client integration will interrupt existing booking, chat, profile, payment and mentor workflows.

## Staging only
1. Create a separate Firebase project dedicated to Mentor security staging.
2. Verify the active project with `firebase projects:list` and `firebase use <STAGING_PROJECT_ID>`.
3. Configure the staging database URL and Razorpay webhook secret.
4. From this app root, use `firebase --config firebase.security-staging.json --project <STAGING_PROJECT_ID> emulators:start --only auth,database,functions` for local emulator work.
5. Run static tests in `security-v3/functions` using `npm install` then `npm test`.
6. Run emulator tests only after Firebase CLI and Java/emulator prerequisites are installed: `npm run test:emulator`.
7. Deploy to staging only after reviewing the resolved project ID and backup/export.

## Production release gate
Do not publish `security-v3/database.rules.v3.json` or `security-v3/storage.rules.v3.txt` to production until all legacy browser writes are migrated to callable functions, all required read/listen adapters exist, emulator authorization tests pass, and full product regression tests pass.

The root `database.rules.json` and `storage.rules.json` are retained as the original baseline for comparison. They are not recommended production rules; they contain the broad permissions documented in `security-v3/SECURITY_AUDIT.md`.
