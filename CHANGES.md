# Mentor updates merged into original package (2026-11-02)

Base: mentor-vkstech-standalone-ai.zip (your full original)

Merged fixes:
1. Career & AI sessions — Digital Marketing, Own Website, First App A–Z; removed Songs AI, CCTV, Buy Correctly
2. Pay Now → Admin unlock without student UTR
3. Approve UI — confirmed rows no longer show Approve again
4. Realtime chat listener + sendChat fixes
5. Desktop PWA install (orientation any, absolute paths)
6. WhatsApp user-facing 8929394920 (admin OTP 8929397949)

Historical note from the original package: the above described static-site hosting. It is superseded for this development copy; do not publish this copy or deploy it to Firebase. See `DEPLOY_FIREBASE_RULES.md`.

## 2026-11-07 — Device remember + landing polish
- Landing (`index.html`): better mobile/desktop spacing, nav, hero, grids, touch targets
- Login: after OTP, optional device password + fingerprint setup
- Same device after logout: password or fingerprint unlock (no OTP required)
- Profile: change device password; enable/disable fingerprint
- Session still stays logged in until user taps Logout (`vks_site_verified`)

## 2026-11-07 — Premium logged-in home
- Header account chip: avatar + verified dot, masked mobile, icon logout (less “website”)
- Path cards: denser app-style gradients, chips, rates
- VKS ecosystem strip under cards: vkstech.com, Man Power, PackLink (external links)
- Horizontal testimonials carousel loaded from GitHub `vkstecho/manpower` testimonials library

## 2026-11-07 — Real ecosystem logos + denser home
- VKS Tech / Man Power / PackLink cards use real icons from vkstech.com assets
- Install row compacted to chip pills; hidden when already installed as PWA
- Catalog title shortened; less marketing copy on home

## 2026-11-07 — Path navigation + logo + testimonials UX
- Opening Flexible Packaging / Career no longer leaves home blocks visible (ecosystem + testimonials hide)
- Fixed duplicate category click listeners; back button returns to path picker
- Header Mentor logo no longer cropped by account chip
- Removed public GitHub "source" link under testimonials; show all quotes

## Mentor 3.0 Security Phase 1B (additive staging work)
- Added UID-scoped `mentor_v3` data namespace and restrictive client rules.
- Added verified-phone callable backend operations for profile, booking, topic chat and learning progress.
- Added admin-claim gated settings, booking queue/rejection and legacy payment approval operations.
- Added Razorpay webhook HMAC verification and provider-event duplicate claiming. It records events only; it does not grant subscriptions or unlock legacy topics.
- Added Firebase Emulator rules test source and expanded offline static tests.
- No production Firebase resources or customer records were changed. Existing app call sites are not yet migrated; do not deploy restrictive rules to production.

## Security Phase 1D
- Added admin-only, pending-only `approveBooking` callable endpoint with transaction-based state transition and audit record.
- Added static regression coverage for approval authorization, state transition, and audit event.
- No production Firebase configuration, data, hosting, or payment settings were changed.

## Security Phase 1E
- Hardened v3 booking creation with server-derived INR pricing from trusted Firebase track settings.
- Restricted package hours to 1, 3 or 5 and rejected missing/invalid server pricing.
- Added UID validation to booking rejection and static regression tests.
- See `security-v3/PHASE1E_BOOKING_PRICING.md` for staging prerequisites and limitations.

## Mentor 3.0 Security Phase 1F
- Added secure UID-keyed booking queue section to mentor payment history, using callable backend functions for listing and review.
- Added `approveBooking` to the browser callable allow-list.
- Added stable booking IDs and server-calculated package summary fields to admin queue records.
- Legacy booking/payment workflows remain unchanged pending staging integration and regression validation.

## Phase 1G — student booking secure integration (staging-gated)
- Added an opt-in secure booking branch for the existing student booking action.
- Secure mode uses the callable backend and does not trust browser-supplied identity or price.
- Secure mode fails closed and does not fall back to legacy client writes.
- Kept the rollout flag disabled pending staging Firebase configuration and end-to-end validation.
