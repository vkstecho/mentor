# Phase 1F — Secure booking review UI

## Included
- The existing mentor payment-history modal now appends a separate **Secure Mentor 3.0 bookings** queue when opened by a mentor outside student-view mode.
- Queue retrieval uses the `listPendingBookings` callable function. It does not read the UID-keyed queue directly from the browser.
- Approve/reject buttons call the admin-only `approveBooking` and `rejectBooking` functions.
- The callable bridge allow-list now includes `approveBooking`.
- Queue records carry their stable booking ID and server-calculated amount/hours for display.
- Legacy payment history and its existing actions are unchanged.

## Preconditions for staging
1. Deploy the Phase 1E/1F Functions to a separate Firebase staging project in `asia-south1`.
2. Configure staging Realtime Database rules and trusted `mentor_settings/tracks/{career_ai|packaging}` pricing.
3. Assign the `admin: true` custom claim to a dedicated staging mentor account using a trusted Admin SDK process.
4. Sign in with a verified phone account. Anonymous sign-in cannot call secure endpoints.
5. Create a booking using a staging client or controlled test harness, then open the mentor payment-history modal.

## Important limitations
- Student booking creation is not switched to `createBooking` yet. The legacy Pay Now/UTR workflow remains active and unchanged.
- This panel only displays bookings stored under `mentor_v3/adminBookingQueue`; it does not migrate legacy payment requests.
- The existing `MG.state.isMentor` flag only decides whether to attempt loading the queue. Authorization is enforced by the callable backend's `admin` custom claim. A UI flag is not a security boundary.
- Rejection is final for the current pending booking; no re-open/retry workflow is added here.
- This phase does not activate paid subscriptions or unlock learning content.
- No production Firebase project, hosting, or customer data was changed.

## Verification
Run `npm test` in `security-v3/functions`. These are static source regression tests, not Emulator or browser end-to-end tests.
