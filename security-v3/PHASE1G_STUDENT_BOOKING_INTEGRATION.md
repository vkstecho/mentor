# Mentor 3.0 — Phase 1G: Student booking integration

## What changed
- Added a student-side secure booking branch in `js/mg-tracks.js`.
- When enabled, it calls the `createBooking` callable rather than writing a pending payment, notification, or student aggregate from the browser.
- The backend receives only track, topic, preferred slot and package hours. It derives the student's phone identity from the verified Firebase token and calculates the price from trusted `mentor_settings/tracks` values.
- Secure booking refuses mentor "view as student" mode; a student must use their own verified Firebase phone sign-in.
- A failed secure call does not silently fall back to the legacy browser-write workflow.

## Rollout safety
`MG.SECURE_BOOKINGS_ENABLED` is deliberately `false` in `js/mg-config.js`. Keep it false until all of the following are completed in a separate staging Firebase project:
1. Deploy the `security-v3` Functions to `asia-south1`.
2. Configure server-side track pricing under `mentor_settings/tracks/career_ai` and `mentor_settings/tracks/packaging`.
3. Confirm Firebase Phone Auth is enabled and test with a verified phone account.
4. Grant the administrator custom claim through a trusted server-side process; do not set it from the browser.
5. Deploy and test the restrictive RTDB rules in staging only.
6. Test student booking, duplicate submissions, queue visibility, approval and rejection.

Do not enable this flag against the live Firebase project before the staging test passes. Do not deploy the restrictive rules to production as part of this phase.

## Compatibility
- The existing legacy booking path remains unchanged while the feature flag is false.
- No customer data is migrated, deleted or rewritten by this phase.
- The secure booking queue and legacy payment queue are separate; legacy requests do not automatically appear in the secure queue.

## Validation
Run `npm test` from `security-v3/functions`. These are static source regression checks, not Firebase Emulator or browser end-to-end tests.
