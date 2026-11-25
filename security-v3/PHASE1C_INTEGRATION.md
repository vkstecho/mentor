# Mentor 3.0 Phase 1C — callable backend bridge

## Added in this iteration
- Loaded Firebase Functions SDK v10.12.0 in the existing standalone Firebase module.
- Exposed `MentorFB.callSecure(name, payload)` as an allow-listed callable bridge.
- Bound Functions to `asia-south1`, matching the intended India deployment region.
- Bridge refuses anonymous browser sessions before making a call.
- Existing direct-RTDB legacy workflows were deliberately NOT switched. This prevents an incomplete cutover from breaking bookings, mentor review, chat, progress, settings, payment history, or existing users.

## Safe staging smoke test
After deploying Functions to a separate staging Firebase project and updating only the staging Firebase config:

```js
await MentorFB.callSecure('health', {});
```

Expected result: `{ ok: true, service: 'mentor-security-v3' }`.

Then, after a real Firebase Phone Auth sign-in:

```js
await MentorFB.callSecure('getMyV3Profile', {});
```

Expected result: a profile whose mobile is derived from the verified Firebase token. Do not test using anonymous auth.

## Critical configuration note
The existing `mentor.html` currently contains the production Firebase config (`mentor-vkstech`). Do not deploy this modified build to the production hosting target while testing. Create a staging copy and replace its Firebase config with the staging project's values. The Functions region must match deployment region; if Functions are deployed elsewhere, update `getFunctions(app, REGION)` accordingly.

## Remaining before switching any workflow
1. Make app initialization select verified Phone Auth, not silently rely on anonymous auth for protected actions.
2. Replace legacy booking creation with a server-side booking operation that validates plan/topic/price against server-owned catalogue data.
3. Add approveBooking endpoint with explicit permitted state transitions and an audit trail.
4. Complete the Razorpay order/subscription mapping and event-specific webhook processing. Current webhook records verified events but does not activate entitlements.
5. Implement UID-owned reads/listeners for chats, progress and profile.
6. Migrate existing mobile-keyed records only after phone proof and staging rehearsal.
7. Keep legacy data read-only and available to verified owner/admin during transition.
8. Run full browser regression tests and Firebase Emulator rules tests.

## No production changes
No Firebase project, live database, customer record, payment configuration or deployment was changed by this package preparation.

## Phase 1D — booking review hardening
- Added `approveBooking`, an admin-claim-only callable endpoint.
- Approval is a pending-only state transition performed with a Realtime Database transaction; repeated approval/review attempts fail closed.
- The admin queue is updated and an audit record is written with actor UID, subject UID, booking ID and timestamp.
- `rejectBooking` remains available as the matching rejection path.
- This endpoint is backend groundwork only: the current legacy mentor Payments UI is not yet wired to the v3 booking queue, and approval does not itself grant subscription/course entitlements.

### Phase 1D validation
`npm test` passes 12 static source/rules checks. These are not Firebase Emulator, browser end-to-end, penetration, or production tests. Deploy only to an isolated staging Firebase project after reviewing project configuration and indexes.
