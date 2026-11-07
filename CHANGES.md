# Mentor updates merged into original package (2026-11-02)

Base: mentor-vkstech-standalone-ai.zip (your full original)

Merged fixes:
1. Career & AI sessions — Digital Marketing, Own Website, First App A–Z; removed Songs AI, CCTV, Buy Correctly
2. Pay Now → Admin unlock without student UTR
3. Approve UI — confirmed rows no longer show Approve again
4. Realtime chat listener + sendChat fixes
5. Desktop PWA install (orientation any, absolute paths)
6. WhatsApp user-facing 8929394920 (admin OTP 8929397949)

Deploy: upload entire mentor-app/ folder to hosting / push to GitHub.

## 2026-11-07 — Device remember + landing polish
- Landing (`index.html`): better mobile/desktop spacing, nav, hero, grids, touch targets
- Login: after OTP, optional device password + fingerprint setup
- Same device after logout: password or fingerprint unlock (no OTP required)
- Profile: change device password; enable/disable fingerprint
- Session still stays logged in until user taps Logout (`vks_site_verified`)
