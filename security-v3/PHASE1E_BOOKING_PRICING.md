# Phase 1E — server-side booking price validation

## What changed
- `createBooking` now accepts only the supported 1, 3 or 5 hour packages.
- The callable reads the selected track's `hourlyRate` and `packageDisc` from `mentor_settings/tracks/{track}` using the Admin SDK.
- It calculates and stores the INR amount and pricing snapshot on the booking. Browser-supplied amount/rate/discount are not used.
- Booking creation fails closed when trusted pricing is absent or invalid.
- `rejectBooking` now validates the UID path segment as well as the booking ID.
- Added static regression checks for these constraints.

## Required staging setup
Before testing `createBooking`, populate `mentor_settings/tracks/career_ai` and `mentor_settings/tracks/packaging` with trusted `hourlyRate` and `packageDisc` values. The structure should match the existing app's track settings. Do not rely on browser values for pricing.

## Important limitations
- This phase does not connect the existing Pay Now UI or legacy admin payment screen to the v3 booking endpoints.
- A booking's calculated amount is a server-side price snapshot, not proof of payment. Do not grant paid access from booking creation or the amount field.
- Razorpay webhook still only verifies and records events; subscription activation and order-to-user mapping remain unimplemented.
- Existing legacy Firebase reads/writes remain in place to avoid disrupting current customers. Do not deploy restrictive v3 rules to the live database before a complete staged migration and regression test.

## Tests
Run `npm test` from `security-v3/functions`. Phase 1E static suite: 13/13 passed. These are source-level tests, not Firebase Emulator or end-to-end tests.
