# Mentor 3.0 GitHub deployment audit — separated package

**Input:** `Mentor-3.0-GitHub-Ready.zip`  
**Prepared layout:** `Fronend/` for the static site; `backend/` for Firebase staging files.  
**Status:** Reorganized and statically checked. No GitHub Pages or Firebase deployment was performed.

## Folder assignment

- `Fronend/` contains the landing page, full app UI, CSS, JavaScript, images/assets, standalone training modules, manifest, service worker, safe Firebase web-config example, and publication/UI docs. Copy the contents of this folder to a Pages repository root, or use a build that publishes its contents.
- `backend/` contains root RTDB and Storage rules, `firebase.security-staging.json`, Cloud Functions, migration tools, Emulator/static tests, deploy guard, and backend/security/payment documentation. Firebase CLI config paths continue to resolve relative to `backend/`.
- The package root has a map README and ignore patterns. `backend/README.md` and `Fronend/README.md` explain their separate handling.

## File/reference checks

All 172 files from the source release were assigned: 133 to `Fronend/` and 39 to `backend/` after adding the backend README. Three package instructions/ignore files were added (root README, backend README, root `.gitignore`); the Frontend README and GitHub guide/audit are included with frontend documentation. The staging integration test was adjusted to locate the sibling `Fronend/` files while retaining compatibility with the unseparated source layout.

Frontend-relative HTML, CSS, image, manifest, and service-worker paths are preserved by moving the app tree as one unit. The manifest and service-worker path audit found 13 manifest URL entries and 28 service-worker precache entries, with no missing local targets. The static tag scan found no root-absolute local resource paths; the two `firebase.staging.js` script references are intentionally absent because the actual config is excluded and ignored. No credentials were added.

## Tests and visual checks

- Offline Node tests from `backend/security-v3/functions`: **39 passed, 0 failed, 0 skipped** after separating the directories.
- JavaScript syntax checks: **37 files**, and **17 inline scripts** passed.
- Strict JSON parsing: **5 files** passed.
- Local-only browser preview previously checked landing desktop and mobile layouts and the app at mobile size under a simulated repository prefix, with no horizontal overflow. This was not a GitHub Pages deployment test.
- Actual service-worker installation/update, PWA installability, Firebase Emulator tests, credentialed staging integration, and real GitHub Pages behavior remain unverified.

## Security state preserved

- RTDB and Storage rules, Functions implementation, Firebase staging CLI config, payment code, and browser staging guard are preserved. The backend deploy helper still rejects `mentor-vkstech` and requires a staging project ID.
- `MG.SECURE_DATA_ENABLED = false` and `MG.SECURE_BOOKINGS_ENABLED = false` remain false.
- `Fronend/firebase.staging.js` is not present. Only the existing example template is included; it contains placeholders and must not be replaced with real credentials in public source.
- No live Firebase project was accessed or changed. Nothing was deployed.