const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "index.js"), "utf8");
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, "../../database.rules.v3.json"), "utf8"));
test("legacy sensitive records deny all client writes", () => {
  for (const key of ["mentor_guidance", "mentor_guidance_index", "mentor_notifications", "mentor_payments"]) {
    assert.equal(rules.rules[key][".write"] ?? rules.rules[key]["$mobile"]?.[".write"] ?? false, false);
  }
});
test("UID v3 records are readable only by owner or admin and never client writable", () => {
  for (const key of ["users", "bookings", "chats", "progress"]) {
    const rule = rules.rules.mentor_v3[key]["$uid"];
    assert.match(rule[".read"], /auth\.uid == \$uid/);
    assert.equal(rule[".write"], false);
  }
});
test("verified phone required and anonymous provider rejected", () => {
  assert.match(source, /phoneVerified/);
  assert.match(source, /provider === "anonymous"/);
});
test("admin endpoints require custom admin claim", () => assert.match(source, /request\.auth\.token\.admin !== true/));
test("profile updates use explicit allow-list", () => assert.match(source, /const allowed = \["name", "email", "city", "company", "designation", "language"\]/));
test("booking identity comes from verified token", () => {
  assert.match(source, /exports\.createBooking/);
  assert.match(source, /mobile: phone/);
  assert.doesNotMatch(source, /mobile: input\.mobile/);
});
test("chat and progress writes are UID scoped", () => {
  assert.match(source, /mentor_v3\/chats\/\$\{uid\}/);
  assert.match(source, /mentor_v3\/progress\/\$\{uid\}/);
});
test("Razorpay webhook verifies HMAC and uses timing-safe comparison", () => {
  assert.match(source, /createHmac\("sha256"/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /x-razorpay-signature/);
});
test("webhook event IDs are recorded idempotently", () => {
  assert.match(source, /razorpayEvents\/\$\{eventId\}/);
  assert.match(source, /Duplicate or previously claimed event/);
});

test("admin booking review endpoints require admin gate", () => {
  assert.match(source, /exports\.listPendingBookings/);
  assert.match(source, /exports\.rejectBooking/);
  assert.match(source, /const adminUid = requireAdmin\(request\)/);
});

test("browser callable bridge is allow-listed and rejects anonymous auth", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../../../mentor.html"), "utf8");
  assert.match(html, /getFunctions\(app, "asia-south1"\)/);
  assert.match(html, /httpsCallable\(functions, name\)/);
  assert.match(html, /auth\.currentUser\.isAnonymous/);
  assert.match(html, /const allowed = \[/);
});

test("booking approval is admin-only, pending-only, and audited", () => {
  assert.match(source, /exports\.approveBooking/);
  assert.match(source, /current\.status !== "pending"/);
  assert.match(source, /booking_approved/);
  assert.match(source, /const adminUid = requireAdmin\(request\)/);
});

test("booking pricing is server-derived and constrained to configured packages", () => {
  assert.match(source, /settingsSnap = await db\.ref\(`mentor_settings\/tracks\/\$\{track\}`\)\.get\(\)/);
  assert.match(source, /\[1, 3, 5\]\.includes\(hours\)/);
  assert.match(source, /amount, currency: "INR"/);
  assert.doesNotMatch(source, /amount: input\.amount/);
});

test("secure booking queue includes stable booking IDs and server-priced summary", () => {
  assert.match(source, /adminBookingQueue\/\$\{id\}`\] = \{ id, uid, mobile: phone, track, topic, hours, amount/);
  assert.match(source, /adminBookingQueue\/\$\{bookingId\}`\] = \{ id: bookingId, uid/);
});
test("mentor history UI uses callable secure queue and secure review actions", () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../../../mentor.html"), "utf8");
  const ui = fs.readFileSync(path.resolve(__dirname, "../../../js/mg-mentor.js"), "utf8");
  assert.match(html, /"approveBooking"/);
  assert.match(ui, /callSecure\('listPendingBookings'/);
  assert.match(ui, /callSecure\('approveBooking'/);
  assert.match(ui, /callSecure\('rejectBooking'/);
});

test("student booking UI has an explicit secure rollout gate and calls backend without legacy fallback", () => {
  const config = fs.readFileSync(path.resolve(__dirname, "../../../js/mg-config.js"), "utf8");
  const tracks = fs.readFileSync(path.resolve(__dirname, "../../../js/mg-tracks.js"), "utf8");
  assert.match(config, /MG\.SECURE_BOOKINGS_ENABLED = false/);
  assert.match(tracks, /callSecure\('createBooking'/);
  assert.match(tracks, /if \(MG\.SECURE_BOOKINGS_ENABLED === true\)/);
  assert.match(tracks, /Secure booking requires the student's own verified sign-in/);
  assert.match(tracks, /secureResult\.bookingId/);
});
