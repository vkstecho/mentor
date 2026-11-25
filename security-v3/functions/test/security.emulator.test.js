const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");
const { ref, get, set } = require("firebase/database");
const projectId = process.env.GCLOUD_PROJECT || "mentor-security-staging-test";
let env;

describe("Mentor RTDB rules (requires Firebase Database Emulator)", { skip: !process.env.FIREBASE_DATABASE_EMULATOR_HOST }, () => {
  before(async () => {
    env = await initializeTestEnvironment({
      projectId,
      database: { rules: fs.readFileSync(require("node:path").resolve(__dirname, "../../database.rules.v3.json"), "utf8") }
    });
    await env.withSecurityRulesDisabled(async context => {
      const db = context.database();
      await set(ref(db, "mentor_guidance/9876543210"), { mobile: "9876543210", payments: [] });
      await set(ref(db, "mentor_guidance/9123456789"), { mobile: "9123456789", payments: [] });
      await set(ref(db, "mentor_v3/users/uid-a/profile"), { mobile: "9876543210" });
      await set(ref(db, "mentor_v3/users/uid-b/profile"), { mobile: "9123456789" });
    });
  });
  after(async () => { if (env) await env.cleanup(); });
  it("denies anonymous access", async () => {
    const db = env.unauthenticatedContext().database();
    await assertFails(get(ref(db, "mentor_guidance/9876543210")));
  });
  it("allows verified owner A and denies owner B", async () => {
    const db = env.authenticatedContext("uid-a", { phone_number: "+919876543210", phone_number_verified: true }).database();
    await assertSucceeds(get(ref(db, "mentor_guidance/9876543210")));
    await assertFails(get(ref(db, "mentor_guidance/9123456789")));
  });
  it("denies all direct client writes to legacy and v3 records", async () => {
    const db = env.authenticatedContext("uid-a", { phone_number: "+919876543210", phone_number_verified: true }).database();
    await assertFails(set(ref(db, "mentor_guidance/9876543210/name"), "Tamper"));
    await assertFails(set(ref(db, "mentor_v3/users/uid-a/profile/name"), "Tamper"));
  });
  it("restricts UID records to their owner", async () => {
    const db = env.authenticatedContext("uid-a", { phone_number: "+919876543210", phone_number_verified: true }).database();
    await assertSucceeds(get(ref(db, "mentor_v3/users/uid-a")));
    await assertFails(get(ref(db, "mentor_v3/users/uid-b")));
  });
  it("denies non-admin access to admin queues and settings writes", async () => {
    const db = env.authenticatedContext("uid-a", { phone_number: "+919876543210", phone_number_verified: true }).database();
    await assertFails(get(ref(db, "mentor_v3/adminBookingQueue")));
    await assertFails(set(ref(db, "mentor_settings/app"), { test: true }));
  });
});
