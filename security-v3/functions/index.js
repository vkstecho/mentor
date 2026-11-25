"use strict";
const crypto = require("node:crypto");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
initializeApp();
const db = getDatabase();
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const ten = digits.length > 10 ? digits.slice(-10) : digits;
  if (!/^[6-9]\d{9}$/.test(ten)) throw new HttpsError("permission-denied", "A verified Indian mobile number is required.");
  return ten;
}
function requireVerifiedUser(request) {
  const auth = request.auth;
  const provider = auth && auth.token && auth.token.firebase && auth.token.firebase.sign_in_provider;
  const phoneVerified = provider === "phone" || (auth && auth.token && auth.token.phone_verified === true);
  if (!auth || !auth.uid || provider === "anonymous" || !phoneVerified || !auth.token.phone_number) {
    throw new HttpsError("unauthenticated", "Verify your phone number before continuing.");
  }
  return { uid: auth.uid, phone: normalizePhone(auth.token.phone_number) };
}
function requireAdmin(request) {
  if (!request.auth || request.auth.token.admin !== true) throw new HttpsError("permission-denied", "Administrator access required.");
  return request.auth.uid;
}
function cleanString(value, field, max = 160, required = false) {
  if (value == null && !required) return "";
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  return value.trim();
}
function safeId(value) { return typeof value === "string" && /^[A-Za-z0-9_-]{1,100}$/.test(value); }

// Additive UID-keyed namespace: no existing mobile-keyed data is moved or deleted.
exports.getMyStudentRecord = onCall(async request => {
  const { phone } = requireVerifiedUser(request);
  const snap = await db.ref(`mentor_guidance/${phone}`).get();
  return snap.exists() ? snap.val() : null;
});
exports.getMyV3Profile = onCall(async request => {
  const { uid, phone } = requireVerifiedUser(request);
  const ref = db.ref(`mentor_v3/users/${uid}`);
  const snap = await ref.get();
  if (!snap.exists()) {
    const initial = { profile: { mobile: phone, createdAt: Date.now() } };
    await ref.set(initial);
    return initial;
  }
  const value = snap.val() || {};
  if (value.profile?.mobile && value.profile.mobile !== phone) throw new HttpsError("permission-denied", "Account phone does not match this profile.");
  return value;
});
exports.updateMyProfile = onCall(async request => {
  const { uid, phone } = requireVerifiedUser(request);
  const input = request.data || {};
  const allowed = ["name", "email", "city", "company", "designation", "language"];
  const patch = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(input, key)) patch[key] = cleanString(input[key], key, key === "email" ? 254 : 160);
  if (!Object.keys(patch).length) throw new HttpsError("invalid-argument", "No permitted profile fields supplied.");
  patch.mobile = phone; patch.updatedAt = Date.now();
  await db.ref(`mentor_v3/users/${uid}/profile`).update(patch);
  return { ok: true };
});
exports.createBooking = onCall(async request => {
  const { uid, phone } = requireVerifiedUser(request);
  const input = request.data || {};
  const track = cleanString(input.track, "track", 40, true);
  if (!["career_ai", "packaging"].includes(track)) throw new HttpsError("invalid-argument", "Unsupported track.");
  const topic = cleanString(input.topic, "topic", 160, true);
  const slotPreference = cleanString(input.slotPreference, "slotPreference", 100);
  const utr = cleanString(input.utr, "utr", 80);
  // Price is always derived from trusted mentor settings, never from browser input.
  const hours = Number(input.hours);
  if (![1, 3, 5].includes(hours)) throw new HttpsError("invalid-argument", "Choose a supported session package (1, 3 or 5 hours).");
  const settingsSnap = await db.ref(`mentor_settings/tracks/${track}`).get();
  const pricing = settingsSnap.val();
  const hourlyRate = Number(pricing && pricing.hourlyRate);
  const discount = Number(pricing && pricing.packageDisc && pricing.packageDisc[String(hours)]);
  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0 || !Number.isFinite(discount) || discount < 0 || discount > 50) {
    throw new HttpsError("failed-precondition", "Track pricing is not configured safely. Please contact the mentor.");
  }
  const amount = Math.round(hourlyRate * hours * (1 - discount / 100));
  const id = crypto.randomUUID(), now = Date.now();
  const booking = { id, uid, mobile: phone, track, topic, slotPreference, hours, hourlyRate, discountPct: discount, amount, currency: "INR", utr: utr || null, status: "pending", createdAt: now, updatedAt: now };
  const updates = {};
  updates[`mentor_v3/bookings/${uid}/${id}`] = booking;
  updates[`mentor_v3/adminBookingQueue/${id}`] = { id, uid, mobile: phone, track, topic, hours, amount, currency: "INR", status: "pending", createdAt: now };
  await db.ref().update(updates);
  return { ok: true, bookingId: id, status: "pending" };
});
exports.sendTopicMessage = onCall(async request => {
  const { uid, phone } = requireVerifiedUser(request);
  const input = request.data || {};
  const topicId = cleanString(input.topicId, "topicId", 100, true);
  if (!safeId(topicId)) throw new HttpsError("invalid-argument", "Invalid topic identifier.");
  const body = cleanString(input.body, "body", 4000, true);
  const id = crypto.randomUUID();
  await db.ref(`mentor_v3/chats/${uid}/${topicId}/${id}`).set({ id, uid, mobile: phone, body, ts: Date.now() });
  return { ok: true, messageId: id };
});
exports.updateLearningProgress = onCall(async request => {
  const { uid } = requireVerifiedUser(request);
  const input = request.data || {}, moduleId = cleanString(input.moduleId, "moduleId", 100, true);
  if (!safeId(moduleId)) throw new HttpsError("invalid-argument", "Invalid module identifier.");
  await db.ref(`mentor_v3/progress/${uid}/${moduleId}`).update({ completed: input.completed === true, updatedAt: Date.now() });
  return { ok: true };
});
exports.listPendingBookings = onCall(async request => {
  requireAdmin(request);
  const snap = await db.ref("mentor_v3/adminBookingQueue").orderByChild("status").equalTo("pending").limitToLast(200).get();
  return snap.exists() ? snap.val() : {};
});
exports.approveBooking = onCall(async request => {
  const adminUid = requireAdmin(request);
  const input = request.data || {};
  const uid = cleanString(input.uid, "uid", 128, true);
  const bookingId = cleanString(input.bookingId, "bookingId", 100, true);
  if (!safeId(bookingId) || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new HttpsError("invalid-argument", "Invalid booking reference.");
  const bookingRef = db.ref(`mentor_v3/bookings/${uid}/${bookingId}`);
  const now = Date.now();
  const result = await bookingRef.transaction(current => {
    if (!current || current.status !== "pending") return;
    current.status = "approved";
    current.reviewedBy = adminUid;
    current.reviewedAt = now;
    current.updatedAt = now;
    return current;
  });
  if (!result.committed) throw new HttpsError("failed-precondition", "Booking is missing or is no longer pending.");
  const booking = result.snapshot.val();
  const updates = {};
  updates[`mentor_v3/adminBookingQueue/${bookingId}`] = { id: bookingId, uid, mobile: booking.mobile, track: booking.track, topic: booking.topic, hours: booking.hours, amount: booking.amount, currency: booking.currency, status: "approved", reviewedBy: adminUid, reviewedAt: now };
  updates[`mentor_v3/audit/${now}_${bookingId}`] = { action: "booking_approved", actorUid: adminUid, subjectUid: uid, bookingId, at: now };
  await db.ref().update(updates);
  return { ok: true, status: "approved" };
});
exports.rejectBooking = onCall(async request => {
  const adminUid = requireAdmin(request);
  const input = request.data || {};
  const uid = cleanString(input.uid, "uid", 128, true);
  const bookingId = cleanString(input.bookingId, "bookingId", 100, true);
  const reason = cleanString(input.reason, "reason", 300);
  if (!safeId(bookingId) || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new HttpsError("invalid-argument", "Invalid booking reference.");
  const bookingRef = db.ref(`mentor_v3/bookings/${uid}/${bookingId}`);
  const result = await bookingRef.transaction(current => {
    if (!current || current.status !== "pending") return;
    current.status = "rejected"; current.rejectionReason = reason || null;
    current.reviewedBy = adminUid; current.reviewedAt = Date.now(); current.updatedAt = Date.now();
    return current;
  });
  if (!result.committed) throw new HttpsError("failed-precondition", "Booking is missing or is no longer pending.");
  await db.ref(`mentor_v3/adminBookingQueue/${bookingId}`).update({ id: bookingId, status: "rejected", reviewedBy: adminUid, reviewedAt: Date.now(), rejectionReason: reason || null });
  return { ok: true };
});
exports.setMentorSettings = onCall(async request => {
  requireAdmin(request);
  const input = request.data || {};
  if (!["app", "tracks"].includes(input.key) || !input.value || typeof input.value !== "object" || Array.isArray(input.value)) throw new HttpsError("invalid-argument", "Unsupported settings payload.");
  await db.ref(`mentor_settings/${input.key}`).set(input.value);
  return { ok: true };
});
exports.approveLegacyPayment = onCall(async request => {
  requireAdmin(request);
  const { mobile, paymentId, evidenceNote } = request.data || {};
  const normalized = normalizePhone(mobile);
  cleanString(paymentId, "paymentId", 120, true);
  const ref = db.ref(`mentor_guidance/${normalized}`);
  let found = false;
  const result = await ref.transaction(record => {
    if (!record || !Array.isArray(record.payments)) return;
    const index = record.payments.findIndex(p => p && String(p.id) === paymentId);
    if (index < 0) return;
    found = true;
    const payment = record.payments[index];
    if (payment.status === "approved") return record;
    if (payment.status !== "pending") return;
    payment.status = "approved"; payment.approvedAt = Date.now(); payment.approvedBy = request.auth.uid;
    if (evidenceNote) payment.approvalNote = cleanString(evidenceNote, "evidenceNote", 300);
    if (payment.topicId) { record.unlocked = record.unlocked || {}; record.unlocked[payment.topicId] = true; }
    record.updatedAt = Date.now(); return record;
  });
  if (!result.committed || !found) throw new HttpsError("failed-precondition", "Pending payment was not found or could not be approved.");
  return { ok: true };
});
exports.health = onCall(async () => ({ ok: true, service: "mentor-security-v3" }));

// Signature-verified staging webhook. Events are recorded idempotently. It does
// not unlock legacy topics until order-to-booking mapping is explicitly migrated.
exports.razorpayWebhook = onRequest({ secrets: [RAZORPAY_WEBHOOK_SECRET] }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  const signature = req.get("x-razorpay-signature"), secret = RAZORPAY_WEBHOOK_SECRET.value();
  if (!signature || !secret || !Buffer.isBuffer(req.rawBody)) return res.status(400).send("Missing signature/configuration");
  const expected = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).send("Invalid signature");
  let event;
  try { event = JSON.parse(req.rawBody.toString("utf8")); } catch { return res.status(400).send("Invalid JSON"); }
  const eventId = req.get("x-razorpay-event-id") || event.id;
  if (typeof eventId !== "string" || !/^[A-Za-z0-9_.:-]{1,180}$/.test(eventId)) return res.status(400).send("Missing event ID");
  const ref = db.ref(`mentor_v3/razorpayEvents/${eventId}`);
  const claim = await ref.transaction(current => current ? undefined : {
    event: event.event || "unknown", receivedAt: Date.now(), processing: true, processed: false
  });
  if (!claim.committed) return res.status(200).send("Duplicate or previously claimed event");
  const payload = event.payload || {}, payment = payload.payment?.entity || {};
  await ref.update({ orderId: payment.order_id || payload.order?.entity?.id || null, paymentId: payment.id || null, event: event.event || "unknown", processed: true, processedAt: Date.now() });
  return res.status(200).send("Accepted");
});
