# Mentor 3.0 Phase 1B — regression and security test plan

## Offline checks
Run `cd security-v3/functions && npm test`. These checks validate source intent only; they are not an authorization emulator.

## Firebase Emulator tests (required before staging rules deployment)
Create a disposable Firebase project configuration and test at minimum:
- unauthenticated and anonymous users are denied all legacy customer reads;
- verified phone owner A can read only `mentor_guidance/A` and `mentor_payments/A`;
- owner A cannot read owner B, global index, notifications, settings writes or any legacy writes;
- verified non-admin cannot read admin queue or Razorpay event ledger;
- admin custom-claim account can read admin queues/settings and still cannot bypass server input validation;
- UID A can read own `mentor_v3` profile/booking/chat/progress but not UID B;
- all direct client writes to `mentor_v3` are denied; callable functions are tested separately with authenticated emulator contexts.

## Callable backend tests
- phone number absent, unverified, malformed and anonymous sessions are rejected;
- profile allow-list rejects role, payment, unlock, certificate and arbitrary fields;
- booking ignores any caller-supplied UID/mobile and derives identity from verified token;
- only `career_ai` and `packaging` tracks are accepted;
- chat body and topic ID length/format validation works;
- progress writes only under authenticated UID and does not issue certificates;
- non-admin cannot update settings or approve payments;
- payment approval requires an existing pending payment and records admin UID;
- Razorpay webhook rejects wrong/missing signature, accepts valid HMAC, and duplicate event IDs do not process twice.

## Existing product regression (must pass before rules rollout)
- OTP login, logout and session restore; anonymous-to-verified transition;
- device PIN/WebAuthn quick unlock after verified Firebase session;
- Career & AI and Flexible Packaging track selection;
- free modules and calculator links;
- booking creation, optional UTR, Razorpay return/cancel/failure;
- mentor payment queue, approve and reject;
- topic chat send/read and real-time refresh;
- recordings, certificates, profile photo, learning progress;
- multilingual UI, PWA install and offline shell.

## Data migration
- export staging copy and rehearse restore;
- map mobile to UID only after OTP proof; do not infer identity from localStorage;
- report duplicate, malformed and unmatched records; never silently discard;
- compare record counts, payment totals, chats, unlocked topics, certificates and recordings;
- keep legacy mobile-keyed nodes read-only throughout cutover;
- rehearse rollback without restoring any staging dump over production.

## Release gate
Do not deploy these rules to production until every callable integration is complete, Emulator tests pass, all existing product regression tests pass, and a production backup/rollback plan is approved.
