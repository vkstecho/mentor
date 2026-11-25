# Mentor 3.0 — Security Phase 1 (staging package)

Baseline: original Mentor 2.6.37-favicon ZIP. Original application files are preserved unchanged. This package adds `security-v3/` only.

## Critical safety notice
Do NOT publish these rules to production yet. The current 2.6.37 browser client writes complete student records and payment mirrors directly. These v3 rules intentionally deny client writes to legacy records, indexes, notifications and payment mirrors. Publishing them before integrating and testing the callable backend will interrupt booking, chat, profile and mentor workflows.

## Verified findings from source
- `database.rules.json` allows any authenticated account to read/write any `mentor_guidance/{mobile}` record.
- The student index, mentor notifications and payment mirror are broadly accessible to any authenticated user.
- `mentor_settings` is publicly readable and writable by any authenticated user.
- `mentor.html` calls `signInAnonymously` when there is no current Firebase user; phone OTP later upgrades/signs in the user. Anonymous identity is not proof of mobile ownership.
- `mg-data.js` writes the full student object and mirrors to the database from the browser. That object includes payments, unlocked topics, chats and other privileged state.
- `mg-mentor.js` performs mentor operations from client JavaScript. Client-side checks cannot authorize privileged writes.
- `storage.rules.json` makes all profile images publicly readable and permits writes based on phone token or a hard-coded admin phone.

## Included artifacts
- `database.rules.v3.json`: fail-closed transitional rules. Verified phone owner/admin can read own legacy record; client writes to legacy sensitive nodes are denied. Admin uses custom claim `admin: true`.
- `storage.rules.v3.txt`: profile images private to verified owner/admin; size/type checks.
- `functions/`: Firebase Functions v2 callable backend examples for verified-phone reads, allow-listed profile updates, admin settings and payment approval.
- `functions/test/`: offline static regression tests.

## Backend setup
1. Create/use a separate Firebase staging project. Never point staging at production.
2. Configure Functions runtime Node 20 and database URL for the staging project.
3. Install dependencies in `functions/` with `npm install`.
4. Run `npm test`.
5. Deploy functions to staging only after reviewing the project ID and environment.
6. Set custom claim `admin: true` for the verified administrator UID using a trusted Admin SDK script run by an authorized operator. Do not expose a public claim-granting callable.

## Migration/integration still required before rules rollout
- Integrate client to call backend for profile updates, chat writes, booking creation, payment status and unlock changes.
- Replace full-record client writes with narrowly scoped server operations.
- Migrate mobile-keyed data to UID-keyed canonical records in a staging copy; preserve old records read-only during transition.
- Define chat ownership and message validation, certificate issuance, recording access and booking schema.
- Implement verified Razorpay webhook signature validation and idempotent payment processing. `approvePayment` is an admin action, not proof that Razorpay payment succeeded.
- Add emulator-based rules tests for owner A, owner B, anonymous, verified student and admin.
- Validate storage upload call sites before applying private profile rules.

## Regression test scope
Offline tests check rule intent and backend authorization guard presence. They do NOT emulate Firebase Rules or prove deployed security. Run Firebase Emulator Suite tests before any production rollout.

## Rollback
No production resources are changed by this ZIP. Keep the original ZIP and production database backup. Rollback of a staging deployment means redeploying the previous staging rules/functions; do not restore an old database dump over production customer data.
