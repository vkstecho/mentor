# Mentor 3.0 Security Phase 1B — implementation notes

## What this package adds
- New additive UID-keyed namespace: `mentor_v3/`.
- Callable Functions require Firebase phone verification and reject anonymous sessions.
- Profile updates use a narrow field allow-list.
- Booking creation derives UID/mobile from verified auth, validates track/topic, and atomically writes the customer booking plus admin queue item.
- Topic messages and progress are written under the caller's UID. Progress is not a certificate; certificate issuance remains a separate trusted workflow.
- Admin settings and legacy payment approval require the `admin: true` custom claim.
- Razorpay webhook validates `x-razorpay-signature` using HMAC-SHA256 and timing-safe comparison, then claims provider event IDs to prevent duplicate concurrent processing.
- RTDB rules deny browser writes to all sensitive legacy and v3 records. V3 reads are UID-scoped; admin queues/events are admin-only.
- Emulator test source covers anonymous, owner A/B, direct-write and admin boundary cases.

## Important limitations — do not misrepresent as complete integration
The existing 2.6.37 browser app still uses direct `MentorFB.get/set/listen` calls throughout `mg-data.js`, `mg-tracks.js`, `mg-workspace.js`, and `mg-mentor.js`. This package does not silently rewrite those workflows because their current data model is a single mobile-keyed aggregate and a partial rewrite would break booking, chat, progress and mentor review. The new callable operations are an additive backend foundation and require UI integration adapters before the restrictive rules can be enabled for the existing app.

The Razorpay webhook currently verifies and records events only. It does not activate subscriptions or unlock existing topic payments. Before doing that, create a server-owned order/subscription mapping and implement signature-verified event-specific state transitions, amount/currency checks, replay handling and reconciliation. Do not treat a browser return URL as payment proof.

`approveLegacyPayment` is a manual administrator decision for the legacy UTR workflow; it is not proof of a successful Razorpay payment. Keep those two paths distinct.

## Staging setup
1. Create a completely separate Firebase project (not `mentor-vkstech`).
2. Confirm the staging project ID and database URL before deployment.
3. Copy a production export into staging only after access controls and retention are reviewed. Never import staging data into production.
4. Install Functions dependencies: `cd security-v3/functions && npm install`.
5. Run static tests: `npm test`.
6. Install Firebase CLI and run emulator tests with `npm run test:emulator` after configuring emulator prerequisites.
7. Configure webhook secret in staging: `firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET`.
8. Review `firebase.security-staging.json` and deploy only with the staging project explicitly selected.

## Admin claim provisioning
Set `admin: true` only with a trusted, authenticated Admin SDK script or controlled operator process after independently verifying the administrator identity. Never expose a callable endpoint that lets users grant themselves claims. Revoke stale tokens after claim changes and verify claims on a fresh sign-in.

## Required next integration work
- Add a client adapter using Firebase Functions `httpsCallable` for profile, booking, chat and progress operations.
- Add server-side read/listen strategy for the new UID-keyed namespace; do not retain direct reads where rules deny them.
- Add admin callable endpoints for queue listing, reject/cancel, and safe status transitions.
- Model booking lifecycle and cancellation/reschedule rules.
- Model verified Razorpay order IDs against a booking/subscription before allowing entitlement changes.
- Migrate mobile-keyed records only after OTP proof and staging rehearsal; preserve source records read-only.
- Integrate secure storage upload path and check all current photo upload call sites.
- Add end-to-end browser tests for all preserved 2.6.37 features.

## Release safety
No production Firebase project, production data, live payment settings, or production deployment was accessed or changed while preparing this package. Do not deploy restrictive rules to the live project until UI integration and all regression gates are complete.
