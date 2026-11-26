"use strict";

/**
 * Production Firebase config guard.
 * Allows live and staging projects. Requires projectId, Auth domain,
 * Storage bucket, and Database URL to all belong to the same project.
 * Rejects empty/invalid config and mixed-project endpoints.
 */
function isLoopback(hostname) {
  const value = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  return value === "localhost" || value === "127.0.0.1" || value === "::1";
}

function isSafeFirebaseConfig(config) {
  try {
    if (!config || typeof config !== "object" || Array.isArray(config)) return false;
    const projectId = String(config.projectId || "").trim().toLowerCase();
    if (!projectId) return false;

    const authDomain = String(config.authDomain || "").trim().toLowerCase();
    if (authDomain !== `${projectId}.firebaseapp.com`) return false;

    const storageBucket = String(config.storageBucket || "").trim().toLowerCase();
    if (
      storageBucket !== `${projectId}.firebasestorage.app` &&
      storageBucket !== `${projectId}.appspot.com`
    ) {
      return false;
    }

    const database = new URL(String(config.databaseURL || ""));
    const hostname = database.hostname.toLowerCase();
    if (isLoopback(hostname)) {
      return (
        database.protocol === "http:" &&
        (database.searchParams.get("ns") || "").toLowerCase() === projectId
      );
    }
    const matchesProject =
      hostname === `${projectId}.firebaseio.com` ||
      hostname.startsWith(`${projectId}-default-rtdb.`);
    return database.protocol === "https:" && matchesProject;
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") {
  window.mentorFirebaseConfigIsSafe = isSafeFirebaseConfig;
  // Back-compat alias used by older snippets
  window.mentorFirebaseStagingConfigIsSafe = isSafeFirebaseConfig;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = isSafeFirebaseConfig;
}
