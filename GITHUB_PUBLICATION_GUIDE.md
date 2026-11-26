# GitHub publication guide

**Package layout:** `Fronend/` is the static site intended for GitHub Pages; `backend/` is kept separately for Firebase staging configuration and backend work.  
**Hosting status:** No GitHub Pages site was deployed or tested.

## Publish the static site

1. Create the GitHub repository with the intended visibility.
2. Copy the contents of `Fronend/` to the repository root so `index.html` is at the root. Or configure a GitHub Pages build workflow to publish the contents of `Fronend/`.
3. Review contact information, testimonials, training assets, manuals, images, trademarks, and third-party content for information and rights you intend to publish.
4. Keep `firebase.staging.js`, service-account files, `.env` files, Razorpay secrets, webhook secrets, and Admin SDK credentials out of Git. The checked-in ignore file excludes the local Firebase config and backend secret patterns.
5. Do not upload or publish `backend/` as part of the static site. It remains separate for staging backend work.

The static references use paths relative to the deployed site directory. They are intended to work at a domain root or a repository path such as `/REPOSITORY/`. Local previews confirmed these layouts without horizontal overflow; this is not a real GitHub Pages hosting test.

## Landing and full-app behavior

`index.html` contains static landing content and renders without Firebase configuration. The optional Firebase rate override is skipped if no valid staging config is present. The file may request the absent `firebase.staging.js`; do not add placeholder configuration to suppress that request.

The full application at `mentor.html` requires `window.MENTOR_FIREBASE_CONFIG`, loaded by the intentionally excluded `firebase.staging.js`. The staging guard checks project ID and matching Auth, Database, and Storage endpoints, and refuses the protected live project. Without this local build-time config, Firebase-backed login and data operations remain unavailable.

Firebase Web config is browser-visible and is not a server credential. Only an isolated staging project belongs in a public web build. Server service-account credentials, Razorpay secrets, and webhook secrets must remain server-side in the backend's approved secret manager.

## Requirements before full-app hosting

- Configure an isolated Firebase staging project, exact Auth domain, Realtime Database, Storage, and Phone/Anonymous providers.
- Provide its staging Web config through an approved build/release process; never use `mentor-vkstech` or commit a real `firebase.staging.js` to a public repository.
- Deploy and validate the staging rules and Functions separately from `backend/`. GitHub Pages serves static files; it does not run Functions.
- Store payment secrets only in Functions Secret Manager and complete Razorpay test checkout, signature, webhook, idempotency, subscription, and entitlement checks.
- Complete Auth/RTDB/Storage Emulator, callable Functions, browser/mobile, PWA, and legacy-data staging rehearsals before relying on full-app behavior.
- Keep both secure rollout flags disabled until their end-to-end staging flows pass. The flags in this package remain false.

Never run a backend deploy against the live project. The included staging deployment guard must remain in place.