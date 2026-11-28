/* FEATURE MODULE: tracks-booking
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== Tracks / pricing (Firebase override) ==========
MG.loadTrackSettings = async function() {
  try {
    if (!window.MentorFB || typeof window.MentorFB.get !== 'function') return;
    const remote = await window.MentorFB.get('mentor_settings/tracks');
    if (remote && typeof remote === 'object') {
      Object.keys(MG.DEFAULT_TRACKS).forEach(function (id) {
        if (remote[id] && typeof remote[id] === 'object') {
          MG.TRACKS[id] = Object.assign({}, MG.DEFAULT_TRACKS[id], remote[id], {
            packageDisc: Object.assign({}, MG.DEFAULT_TRACKS[id].packageDisc, remote[id].packageDisc || {})
          });
        }
      });
      MG.refreshTrackRateLabels();
      try { if (typeof MG.renderCatalog === 'function') MG.renderCatalog(); } catch (e0) {}
    }
  } catch (e) { console.warn('[tracks] load', e); }
}

MG.refreshTrackRateLabels = function() {
  try {
    document.querySelectorAll('[data-track-rate]').forEach(function (el) {
      var id = el.getAttribute('data-track-rate');
      var tr = MG.TRACKS[id];
      if (tr) el.textContent = '₹' + Number(tr.hourlyRate).toLocaleString('en-IN') + ' / hour';
    });
    // catalog price badges
    document.querySelectorAll('[data-catalog-rate]').forEach(function (el) {
      var id = el.getAttribute('data-catalog-rate') || 'career_ai';
      var tr = MG.TRACKS[id] || MG.TRACKS.career_ai;
      el.textContent = '₹' + Number(tr.hourlyRate).toLocaleString('en-IN') + '/Hr';
    });
  } catch (e) {}
}

MG.getSelectedTrack = function() {
  return MG.TRACKS[MG.selectedTrackId] || MG.TRACKS.career_ai;
}

MG.calcBookingAmount = function() {
  var tr = MG.getSelectedTrack();
  var rate = Number(tr.hourlyRate) || MG.RATE_PER_HOUR;
  var hrs = Number(MG.state.selectedHours) || 1;
  var disc = Number(MG.selectedPackageDisc) || 0;
  var raw = rate * hrs;
  return Math.round(raw * (1 - disc / 100));
}

MG.fillSlotPrefOptions = function() {
  var sel = document.getElementById('bookingSlotPref');
  if (!sel) return;
  var opts = (MG.PREFERRED_SLOT_OPTIONS && MG.PREFERRED_SLOT_OPTIONS.length)
    ? MG.PREFERRED_SLOT_OPTIONS
    : ['Flexible — mentor to propose'];
  sel.innerHTML = opts.map(function (x) {
    return '<option value="' + String(x).replace(/"/g, '&quot;') + '">' + x + '</option>';
  }).join('');
}

MG.fillTopicFocusOptions = function() {
  var sel = document.getElementById('bookingTopicFocus');
  if (!sel) return;
  var tr = MG.getSelectedTrack();
  var topics = (tr.topics && tr.topics.length) ? tr.topics : ['General session'];
  sel.innerHTML = topics.map(function (x) {
    return '<option value="' + String(x).replace(/"/g, '&quot;') + '">' + x + '</option>';
  }).join('') + '<option value="__custom__">Other (type below)</option>';
  var custom = document.getElementById('bookingTopicCustom');
  if (custom) { custom.classList.add('hidden'); custom.value = ''; }
}

MG.selectTrack = function(id) {
  if (!MG.TRACKS[id]) id = 'career_ai';
  MG.selectedTrackId = id;
  document.querySelectorAll('.track-card').forEach(function (btn) {
    var on = btn.getAttribute('data-track') === id;
    btn.classList.toggle('border-brand-500', on);
    btn.classList.toggle('bg-brand-50', on);
    btn.classList.toggle('dark:bg-brand-900/20', on);
    btn.classList.toggle('border-slate-200', !on);
    btn.classList.toggle('dark:border-slate-600', !on);
  });
  MG.fillTopicFocusOptions(); try{MG.fillSlotPrefOptions();}catch(e){};
  MG.updateBookingTotal();
}

MG.updatePayLink = function() {
  var a = document.getElementById('payNowBtn');
  if (!a) return;
  if (MG.SECURE_BOOKINGS_ENABLED || MG.state.viewingAs || MG.state.isMentor) {
    a.href = '#';
    a.removeAttribute('target');
    return;
  }
  var tr = MG.getSelectedTrack();
  var link = (tr.paymentLink || MG.RAZORPAY_LINK || '').trim() || MG.RAZORPAY_LINK;
  a.href = link;
  a.target = '_blank';
}

const bookingHours = [0.25, 0.5, 1, 3, 5];
const attempts = new Map();
let sdkLoading;
let checkoutActive = false;
let bookingActive = false;
const verifyingPurchases = new Set();
const paymentAuthErrors = ['functions/unauthenticated', 'auth/user-token-expired', 'auth/invalid-user-token', 'auth/user-disabled'];

MG.formatBookingDuration = function(hours) {
  const duration = Number(hours);
  if (duration === 0.25 || duration === 0.5) return (duration * 60) + ' Minutes';
  return duration + (duration === 1 ? ' Hour' : ' Hours');
};

MG.getBookingTopicId = function(track, preferredId) {
  const topics = MG.TOPICS.filter(topic => topic.track === track);
  return (topics.find(topic => topic.id === preferredId) || topics[0])?.id;
};

function checkoutError(message, code) {
  return Object.assign(new Error(message), { checkoutMessage: message, code: code });
}

function showPaymentError(stage, error, fallback) {
  const code = error?.code || '';
  console.warn('[Mentor payment]', stage, code || 'unavailable');
  const authRequired = paymentAuthErrors.includes(code);
  if (authRequired) MG.showVerifiedSignIn?.(MG.state.mobile);
  const appointmentError = ['appointment_unavailable', 'appointment_expired'].includes(error?.details?.reason);
  MG.showToast(error?.checkoutMessage || (appointmentError ? error.message
    : authRequired ? 'Please verify your phone number before booking.' : fallback));
}

async function bookingStudent() {
  if (MG.state.viewingAs || MG.state.isMentor) throw checkoutError('Use your own verified student account to pay.');
  const fb = window.MentorFB;
  if (!fb?.waitForAuth) throw checkoutError('Secure booking is temporarily unavailable.');
  const user = await fb.waitForAuth();
  const mobile = MG.firebasePhone(user);
  if (!mobile) throw checkoutError('Please verify your phone number before booking.', 'functions/unauthenticated');
  const token = await user.getIdTokenResult();
  if (token.claims.phone_number !== user.phoneNumber ||
      (token.signInProvider !== 'phone' && token.claims.phone_number_verified !== true)) {
    throw checkoutError('Please verify your phone number before booking.', 'functions/unauthenticated');
  }
  if (token.claims.admin === true || mobile === MG.MENTOR_MOBILE) {
    throw checkoutError('Mentor and admin accounts cannot book student sessions.');
  }
  if (mobile !== MG.state.mobile || fb.auth.currentUser?.uid !== user.uid) {
    throw checkoutError('Your sign-in changed. Verify your phone number to continue.', 'functions/unauthenticated');
  }
  return user;
}

function callPayment(user, name, data) {
  if (MG.state.isMentor || MG.state.viewingAs || window.MentorFB.auth.currentUser?.uid !== user.uid) {
    throw checkoutError('Use your own verified student account to pay.');
  }
  return window.MentorFB.callSecure(name, { ...data, expectedUid: user.uid }, user.uid);
}

async function getPaymentAttempt(uid, details) {
  const bytes = new TextEncoder().encode(JSON.stringify([uid, details]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const key = 'mentor-payment-attempt:' + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const readOrCreate = () => {
    let stored;
    try { stored = localStorage.getItem(key); } catch {}
    const attempt = stored || attempts.get(key) || crypto.randomUUID();
    attempts.set(key, attempt);
    try { localStorage.setItem(key, attempt); } catch {}
    return {
      id: attempt,
      clear() {
        attempts.delete(key);
        try { if (localStorage.getItem(key) === attempt) localStorage.removeItem(key); } catch {}
      }
    };
  };
  return navigator.locks ? navigator.locks.request(key, readOrCreate) : readOrCreate();
}

function loadRazorpay() {
  if (typeof window.Razorpay === 'function') return Promise.resolve();
  if (sdkLoading) return sdkLoading;
  sdkLoading = new Promise(function(resolve, reject) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    const timeout = setTimeout(() => failed(), 15000);
    function failed() {
      clearTimeout(timeout);
      script.remove();
      reject(checkoutError('Razorpay Checkout could not load. Please try again.'));
    }
    script.onload = function() {
      if (typeof window.Razorpay !== 'function') return failed();
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = failed;
    document.head.appendChild(script);
  }).finally(() => { sdkLoading = null; });
  return sdkLoading;
}

function openRazorpay(order, user, description, verify) {
  return new Promise(function(resolve, reject) {
    let verifying = false;
    let checkout;
    try {
      checkout = new window.Razorpay({
        key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
        name: 'Mentor by VKS Tech', description, prefill: { contact: user.phoneNumber },
        theme: { color: '#3157d5' }, retry: { enabled: false },
        handler: async function(response) {
          if (verifying) return;
          verifying = true;
          try { resolve(await verify(response)); }
          catch (error) { reject(error); }
        },
        modal: { ondismiss: () => { if (!verifying) resolve({ status: 'cancelled' }); } }
      });
      checkout.on('payment.failed', function() {
        if (verifying) return;
        resolve({ status: 'payment_failed' });
        checkout.close?.();
      });
      checkout.open();
    } catch {
      reject(checkoutError('Razorpay Checkout could not open. Please try again.'));
    }
  });
}

function paymentVerificationMarker(key, pending) {
  const storageKey = 'mentor-verify-payment:' + key;
  if (pending === undefined) {
    try { return verifyingPurchases.has(key) || localStorage.getItem(storageKey) === '1'; }
    catch { return verifyingPurchases.has(key); }
  }
  if (pending) verifyingPurchases.add(key);
  else verifyingPurchases.delete(key);
  try {
    if (pending) localStorage.setItem(storageKey, '1');
    else localStorage.removeItem(storageKey);
  } catch {}
}

async function runCheckout(user, product, options) {
  const open = () => checkoutOnce(user, product, options);
  return navigator.locks
    ? navigator.locks.request('mentor-razorpay-checkout', { ifAvailable: true }, lock => lock ? open() : { status: 'busy' })
    : open();
}

async function checkoutOnce(user, product, options) {
  if (checkoutActive) return { status: 'busy' };
  checkoutActive = true;
  const progress = options.onProgress || (() => {});
  const request = (data) => callPayment(user, 'createRazorpayOrder', { ...product, ...data });
  const reference = product.bookingId || product.planId;
  try {
    const reconcileOnly = options.reconcileOnly || paymentVerificationMarker(product.idempotencyKey);
    progress(reconcileOnly ? 'Verifying payment…' : 'Creating secure payment order…');
    let order;
    try {
      order = await request({ reconcileOnly });
    } catch (error) {
      if (error?.details?.reason !== 'provider_rejected_order' &&
          (!error?.code || ['functions/internal', 'functions/deadline-exceeded', 'functions/unavailable'].includes(error.code))) {
        options.onOrderProtected?.();
      }
      throw error;
    }
    if (order?.orderId || ['verification_pending', 'support_required'].includes(order?.status)) options.onOrderProtected?.();
    if (['paid', 'refunded'].includes(order?.status)) {
      paymentVerificationMarker(product.idempotencyKey, false);
      return order;
    }
    if (order?.status === 'support_required') paymentVerificationMarker(product.idempotencyKey, true);
    if (['verification_pending', 'support_required'].includes(order?.status)) return order;
    if (reconcileOnly && order?.status === 'unpaid' && !paymentVerificationMarker(product.idempotencyKey)) return order;
    if (reconcileOnly) return { status: 'verification_pending', reference };
    if (!order?.orderId || !order.keyId || !Number.isSafeInteger(order.amount) || order.amount < 100 || order.currency !== 'INR') {
      throw checkoutError('Payment service is temporarily unavailable.');
    }
    if (options.amount != null && order.amount !== options.amount * 100) {
      options.onPrice?.(order.amount / 100);
      if (!window.confirm('The price changed to ₹' + (order.amount / 100).toLocaleString('en-IN') + '. Continue to Razorpay?')) return { status: 'price_declined' };
    }
    progress('Opening Razorpay…');
    await loadRazorpay();
    if (window.MentorFB.auth.currentUser?.uid !== user.uid || MG.state.viewingAs || MG.state.isMentor) {
      throw checkoutError('Your sign-in changed. Please verify your phone number.', 'functions/unauthenticated');
    }
    return await openRazorpay(order, user, options.description, async response => {
      progress('Verifying payment…');
      paymentVerificationMarker(product.idempotencyKey, true);
      const paymentId = response.razorpay_payment_id;
      try {
        const result = await callPayment(user, 'verifyRazorpayPayment', {
          orderId: response.razorpay_order_id, paymentId, signature: response.razorpay_signature
        });
        if (['paid', 'refunded'].includes(result?.status)) {
          paymentVerificationMarker(product.idempotencyKey, false);
          return result;
        }
      } catch (error) {
        console.warn('[Mentor payment] verification', error?.code || 'unavailable');
      }
      try {
        const settled = await request({ reconcileOnly: true });
        if (['paid', 'refunded'].includes(settled?.status)) {
          paymentVerificationMarker(product.idempotencyKey, false);
          return settled;
        }
      } catch (error) {
        console.warn('[Mentor payment] reconciliation', error?.code || 'unavailable');
      }
      return { status: 'verification_pending', paymentId, reference };
    });
  } finally {
    checkoutActive = false;
  }
}

async function reportCheckout(result, user, reference, onPaid, subscription) {
  if (result.status === 'paid') {
    onPaid?.();
    MG.showToast(subscription ? 'Subscription payment verified. Access has been extended.' : 'Payment verified. Your booking is awaiting Mentor confirmation.');
    if (window.MentorFB.auth.currentUser?.uid !== user.uid || MG.state.viewingAs) return;
    try {
      await MG.loadUserDataAsync(MG.state.mobile);
      MG.renderCatalog();
      const history = document.getElementById('historyModal');
      if (history && !history.classList.contains('hidden')) await MG.openHistory?.();
    } catch (error) {
      console.warn('[Mentor payment] dashboard refresh', error?.code || 'unavailable');
    }
  } else if (result.status === 'verification_pending') {
    MG.showToast('Payment verification is pending. Please do not pay again. Reference: ' + (result.paymentId || result.orderId || reference || result.reference));
  } else if (result.status === 'support_required') {
    MG.showToast('Payment requires support. Keep reference ' + (result.orderId || reference || result.reference) + ' and do not pay again.');
  } else if (result.status === 'unpaid') {
    MG.showToast('The provider reports no captured payment on this order. Refresh booking history for the latest status.');
  } else if (result.status === 'refunded') {
    MG.showToast('This payment was refunded. Reference: ' + (result.paymentId || reference));
  } else if (result.status === 'cancelled') {
    MG.showToast(subscription ? 'Checkout closed. You can resume this plan.' : 'Checkout closed. Your booking can be resumed.');
  } else if (result.status === 'payment_failed') {
    MG.showToast('Payment did not complete. You can retry the same purchase.');
  } else if (result.status === 'busy') {
    MG.showToast('A checkout is already in progress.');
  }
}

MG.launchSecureCheckout = async function(bookingId, options = {}) {
  try {
    const user = options.user || await bookingStudent();
    const result = await runCheckout(user, { productType: 'booking', bookingId, idempotencyKey: 'booking_' + bookingId }, options);
    await reportCheckout(result, user, bookingId, options.onPaid, false);
    return result;
  } catch (error) {
    if (options.reconcileOnly || paymentVerificationMarker('booking_' + bookingId)) {
      console.warn('[Mentor payment] reconciliation', error?.code || 'unavailable');
      if (paymentAuthErrors.includes(error?.code)) MG.showVerifiedSignIn?.(MG.state.mobile);
      MG.showToast('Payment verification is pending. Please do not pay again. Booking reference: ' + bookingId);
      return { status: 'verification_pending' };
    }
    showPaymentError('order or checkout', error, 'Payment service is temporarily unavailable. You can retry booking ' + bookingId + '.');
    return { status: 'error' };
  }
};

MG.startSecureRazorpayBooking = async function(input, options = {}) {
  if (bookingActive || checkoutActive) return { status: 'busy' };
  const { track, topicId, hours, appointmentStart } = input;
  const topic = typeof input.topic === 'string' ? input.topic.trim() : '';
  const slotPreference = input.slotPreference || '';
  if (!topic || topic.length > 160 || slotPreference.length > 100 || !['career_ai', 'packaging'].includes(track) ||
      !bookingHours.includes(hours) || !topicId || MG.getBookingTopicId(track, topicId) !== topicId) {
    MG.showToast('Choose a valid session and enter a problem description of up to 160 characters.');
    return { status: 'error' };
  }
  if (!Number.isSafeInteger(appointmentStart) || appointmentStart <= Date.now()) {
    MG.showToast('Select an available appointment before payment.');
    return { status: 'error' };
  }
  bookingActive = true;
  try {
    options.onProgress?.('Preparing booking…');
    const user = await bookingStudent();
    const details = { track, topic, topicId, slotPreference, hours, appointmentStart };
    const attempt = await getPaymentAttempt(user.uid, details);
    const booking = await callPayment(user, 'createBooking', { ...details, attemptId: attempt.id });
    if (!booking?.ok || !booking.bookingId || !Number.isSafeInteger(booking.amount) || booking.amount < 1 || booking.currency !== 'INR') {
      throw checkoutError('Could not create your booking. Please try again.');
    }
    options.onAppointment?.(booking.appointment);
    const onPaid = () => { attempt.clear(); options.onPaid?.(); };
    const reconcileOnly = booking.paymentStatus === 'paid' || paymentVerificationMarker('booking_' + booking.bookingId);
    if (booking.paymentStatus === 'refunded' || (booking.status === 'rejected' && !reconcileOnly)) {
      attempt.clear();
      throw checkoutError('This booking is closed. Submit again to start a new booking.');
    }
    if (input.amount !== booking.amount) {
      options.onPrice?.(booking.amount, booking);
      if (!reconcileOnly &&
          !window.confirm('The price changed to ₹' + booking.amount.toLocaleString('en-IN') + '. Continue to Razorpay?')) return { status: 'price_declined' };
    }
    const description = (MG.TRACKS[track]?.name || track) + ' · ' + MG.formatBookingDuration(hours);
    const result = await MG.launchSecureCheckout(booking.bookingId, { ...options, user, description, amount: booking.amount, onPaid, reconcileOnly,
      onOrderProtected: () => options.onAppointment?.(booking.appointment && { ...booking.appointment, status: 'payment_pending' }) });
    if (result.status === 'refunded') attempt.clear();
    return result;
  } catch (error) {
    showPaymentError('create booking', error, 'Could not create your booking. Please try again.');
    return { status: 'error' };
  } finally {
    bookingActive = false;
  }
};

MG.launchSecureSubscriptionCheckout = async function(planId, amount) {
  try {
    const user = await bookingStudent();
    const attempt = await getPaymentAttempt(user.uid, { planId });
    const result = await runCheckout(user, { productType: 'subscription', planId, idempotencyKey: 'sub_' + attempt.id }, {
      description: 'Mentor subscription renewal', amount
    });
    if (result.status === 'refunded') attempt.clear();
    await reportCheckout(result, user, planId, attempt.clear, true);
  } catch (error) {
    showPaymentError('subscription checkout', error, 'Secure subscription payment is temporarily unavailable.');
  }
};


/**
 * Student taps Pay Now → create PENDING unlock request for admin.
 * No UTR / Payment ID required from student. Only Admin can Approve & Unlock.
 */
MG.notifyMentorPayIntent = async function() {
  try {
    if (MG.state.viewingAs || MG.state.isMentor) {
      MG.showToast('Use your own verified student account to pay.');
      return;
    }
    var tr = MG.getSelectedTrack();
    var topic = MG.TOPICS.find(function(t){ return t.id === MG.state.currentTopicId; }) || { title: 'Session', id: MG.state.currentTopicId };
    var amount = typeof MG.calcBookingAmount === 'function' ? MG.calcBookingAmount() : (tr.hourlyRate || 0);
    var focusSel = document.getElementById('bookingTopicFocus');
    var focus = focusSel ? focusSel.value : '';
    if (focus === '__custom__') {
      focus = (document.getElementById('bookingTopicCustom') && document.getElementById('bookingTopicCustom').value) || 'Custom topic';
    }
    var slotSel = document.getElementById('bookingSlotPref');
    var slotPref = slotSel ? (slotSel.value || '') : '';
    var hours = MG.state.selectedHours || 1;

    if (MG.SECURE_BOOKINGS_ENABLED === true) {
      const button = document.getElementById('payNowBtn');
      const picker = document.getElementById('standardAppointmentPicker')?.appointmentPicker;
      const appointmentStart = picker?.getSelection();
      if (!appointmentStart) {
        MG.showToast('Select an available appointment before payment.');
        return;
      }
      if (button?.getAttribute('aria-busy') === 'true') return;
      const label = button?.innerHTML;
      button?.setAttribute('aria-busy', 'true');
      picker.busy(true);
      try {
        const track = MG.selectedTrackId;
        await MG.startSecureRazorpayBooking({
          track, topicId: MG.getBookingTopicId(track, topic.id), topic: focus || topic.title,
          hours: Number(MG.state.selectedHours), amount, appointmentStart
        }, {
          onProgress(message) { if (button) button.textContent = message; },
          onAppointment: appointment => picker.setHold(appointment),
          onPrice(price) { document.getElementById('bookingTotal').textContent = '₹' + price.toLocaleString('en-IN'); },
          onPaid() { picker.clear(); MG.closeBooking(); }
        });
      } finally {
        button?.removeAttribute('aria-busy');
        picker.busy(false);
        if (button) button.innerHTML = label;
      }
      return;
    }

    var targetMobile = String(MG.state.viewingAs || MG.state.mobile || '').replace(/\D/g, '').slice(-10);
    if (!targetMobile) return;
    if (String(targetMobile) === String(MG.MENTOR_MOBILE || '8929397949')) {
      MG.showToast('Mentor account cannot book for itself');
      return;
    }
    var id = 'pay_' + Date.now();

    // Legacy compatibility path. Keep disabled for rollout until staging validation is complete.
    var userData = null;
    try { userData = await MG.loadUserDataAsync(targetMobile); } catch (eL) { userData = MG.loadUserData(targetMobile); }
    if (!userData) userData = MG.emptyUserData(targetMobile);
    userData.payments = userData.payments || [];
    // Avoid stacking identical open requests in the same minute
    var dup = userData.payments.find(function(p) {
      return p && p.status === 'pending' && p.topicId === (topic.id || MG.state.currentTopicId) &&
        Math.abs((p.ts || 0) - Date.now()) < 120000;
    });
    if (dup) {
      id = dup.id;
    } else {
      var payment = {
        id: id,
        topicId: topic.id || MG.state.currentTopicId || '',
        topicTitle: topic.title || 'Session',
        trackId: (tr && tr.id) || '',
        trackName: (tr && tr.name) || '',
        focusTopic: focus,
        preferredSlot: slotPref,
        hours: hours,
        hourlyRate: Number((tr && tr.hourlyRate) || 0),
        packageDiscountPct: MG.selectedPackageDisc || 0,
        amount: amount,
        utr: '',
        status: 'pending',
        source: 'pay_clicked',
        mobile: targetMobile,
        studentMobile: targetMobile,
        ts: Date.now()
      };
      userData.payments.unshift(payment);
      await MG.saveUserData(targetMobile, userData);
      if (String(MG.state.mobile || '').replace(/\D/g, '').slice(-10) === targetMobile ||
          String(MG.state.viewingAs || '') === targetMobile) {
        MG.state.data = userData;
      }
    }

    // 2) Notify admin in-app (Payments badge + toast) — student does nothing else
    var notif = {
      id: id,
      type: 'pay_clicked',
      mobile: targetMobile,
      studentMobile: targetMobile,
      topicTitle: topic.title || 'Session',
      topicId: topic.id || MG.state.currentTopicId || '',
      trackName: (tr && tr.name) || '',
      trackId: (tr && tr.id) || '',
      amount: amount,
      hours: hours,
      utr: '',
      preferredSlot: slotPref,
      focusTopic: focus,
      status: 'pending',
      source: 'pay_clicked',
      ts: Date.now(),
      read: false
    };
    if (window.MentorFB && window.MentorFB.set) {
      await window.MentorFB.set('mentor_notifications/' + (MG.MENTOR_MOBILE || '8929397949') + '/' + id, notif);
      try {
        await window.MentorFB.set((MG.FB_INDEX || 'mentor_guidance_index') + '/' + targetMobile + '/lastPayment', {
          id: id, status: 'pending', amount: amount, ts: Date.now(), topicTitle: topic.title || '', source: 'pay_clicked'
        });
      } catch (eI) {}
    }
    try { if (typeof MG.pulseMentorPaymentBadge === 'function') MG.pulseMentorPaymentBadge(); } catch (e0) {}
    MG.showToast('Request sent to Mentor. Complete Razorpay if needed — no UTR required. Wait for unlock.');
  } catch (e) {
    showPaymentError('booking request', e, 'Could not save your booking request. Please try again.');
  }
};

// ========== Booking Modal ==========
MG.openBooking = function(topicId) {
  MG.state.currentTopicId = topicId;
  const topic = MG.TOPICS.find(t => t.id === topicId) || { title: 'One-to-One Session', id: topicId };
  MG.state.selectedHours = 1;
  MG.selectedPackageDisc = 0;
  // Prefer explicit topic.track; fallback to keyword heuristic
  if (topic.track === 'packaging' || topic.track === 'career_ai') {
    MG.selectedTrackId = topic.track;
  } else if (topicId && /pack|metall|plant|yield|capacity|5s|manpower|sqm/i.test(String(topic.title || '') + topicId)) {
    MG.selectedTrackId = 'packaging';
  } else {
    MG.selectedTrackId = 'career_ai';
  }
  try { MG.loadTrackSettings(); } catch (e) {}
  MG.$('#bookingTopicName').textContent = topic.title;
  MG.$('#bookingMobile').textContent = '+91 ' + (MG.state.viewingAs || MG.state.mobile);
  MG.$$('.hrs-btn').forEach(b => {
    b.classList.toggle('active-hrs', Number(b.dataset.hrs) === 1);
  });
  MG.$('#utrInput').value = '';
  var legacyUtrFlow = document.getElementById('legacyUtrFlow');
  if (legacyUtrFlow) legacyUtrFlow.classList.toggle('hidden', MG.SECURE_BOOKINGS_ENABLED === true);
  const slotHost = document.getElementById('standardAppointmentPicker');
  document.getElementById('legacySlotPreference')?.classList.toggle('hidden', MG.SECURE_BOOKINGS_ENABLED === true);
  if (slotHost && MG.SECURE_BOOKINGS_ENABLED === true) {
    MG.createAppointmentPicker(slotHost, () => Number(MG.state.selectedHours)).refresh();
  }
  var paymentNote = document.getElementById('bookingPaymentNote');
  if (paymentNote && MG.SECURE_BOOKINGS_ENABLED === true) paymentNote.textContent = 'Checkout opens with a server-created Razorpay order. Your booking is paid only after the server verifies the payment with Razorpay.';
  // Highlight only the relevant track in the modal (still allow switching)
  MG.selectTrack(MG.selectedTrackId);
  MG.updateBookingTotal();
  MG.$('#bookingModal').classList.remove('hidden');
  MG.$('#bookingModal').classList.add('flex');
  try { if (typeof MG.applyLang === 'function') MG.applyLang(); } catch (eL) {}
}

MG.updateBookingTotal = function() {
  var tr = MG.getSelectedTrack();
  var amt = MG.calcBookingAmount();
  var el = document.getElementById('bookingTotal');
  if (el) el.textContent = '₹' + amt.toLocaleString('en-IN');
  var st = document.getElementById('sumTrack');
  if (st) st.textContent = tr.name;
  var sr = document.getElementById('sumRate');
  if (sr) sr.textContent = '₹' + Number(tr.hourlyRate).toLocaleString('en-IN') + '/hr';
  var sh = document.getElementById('sumHours');
  if (sh) sh.textContent = String(MG.state.selectedHours) + (MG.selectedPackageDisc ? ' (−' + MG.selectedPackageDisc + '%)' : '');
  MG.updatePayLink();
  MG.refreshTrackRateLabels();
}

MG.confirmPayment = async function() {
  if (MG.state.viewingAs || MG.state.isMentor) {
    MG.showToast('Use your own verified student account to pay.');
    return;
  }
  if (MG.SECURE_BOOKINGS_ENABLED === true) {
    MG.showToast('Use the secure Razorpay checkout above. Manual payment IDs are not accepted in this flow.');
    return;
  }
  const topic = MG.TOPICS.find(t => t.id === MG.state.currentTopicId) || { title: 'Session', id: MG.state.currentTopicId };
  const utr = (MG.$('#utrInput').value || '').trim();
  // UTR is OPTIONAL — Pay Now already creates pending request for Admin unlock
  if (!utr) {
    MG.showToast('UTR not required. Use Pay Now — Mentor will unlock after checking payment.');
    return;
  }
  const targetMobile = String(MG.state.viewingAs || MG.state.mobile || '').replace(/\D/g, '').slice(-10);
  let userData = null;
  try { userData = await MG.loadUserDataAsync(targetMobile); } catch (e) { userData = MG.loadUserData(targetMobile); }
  if (!userData.payments) userData.payments = [];
  const tr = MG.getSelectedTrack();
  const focusSel = document.getElementById('bookingTopicFocus');
  let focus = focusSel ? focusSel.value : '';
  if (focus === '__custom__') {
    focus = (document.getElementById('bookingTopicCustom') && document.getElementById('bookingTopicCustom').value) || 'Custom topic';
  }
  const slotSel = document.getElementById('bookingSlotPref');
  const slotPref = slotSel ? (slotSel.value || '') : '';

  // Always attribute payment to student mobile (never mentor admin number for unlock path)
  if (String(targetMobile) === String(MG.MENTOR_MOBILE || '8929397949') && !MG.state.viewingAs) {
    MG.showToast('You are logged in as Mentor. Use View as Student or a student login to book.');
    return;
  }
  // Prefer attaching optional UTR to an existing pending for this topic (from Pay Now)
  var payment = (userData.payments || []).find(function(p) {
    return p && p.status === 'pending' && String(p.topicId || '') === String(MG.state.currentTopicId || '');
  });
  if (payment) {
    payment.utr = utr;
    payment.ts = payment.ts || Date.now();
  } else {
    payment = {
      id: 'pay_' + Date.now(),
      topicId: MG.state.currentTopicId,
      topicTitle: topic.title,
      trackId: tr.id,
      trackName: tr.name,
      focusTopic: focus,
      preferredSlot: slotPref,
      hours: MG.state.selectedHours,
      hourlyRate: Number(tr.hourlyRate),
      packageDiscountPct: MG.selectedPackageDisc,
      amount: MG.calcBookingAmount(),
      utr: utr,
      status: 'pending',
      source: 'utr_optional',
      mobile: targetMobile,
      studentMobile: targetMobile,
      ts: Date.now()
    };
    userData.payments.unshift(payment);
  }
  var okSave = await MG.saveUserData(targetMobile, userData);
  if (okSave === false) {
    MG.showToast('Saved on device but cloud sync failed — stay online and retry once');
  }

  if (targetMobile === (MG.state.viewingAs || MG.state.mobile)) {
    MG.state.data = userData;
  }

  // Notify mentor in-app (Firebase) so Payments badge / toast fire without relying only on WhatsApp
  try {
    var notif = {
      id: payment.id,
      type: 'payment_pending',
      mobile: targetMobile,
      studentMobile: targetMobile,
      topicTitle: payment.topicTitle,
      trackName: payment.trackName,
      amount: payment.amount,
      utr: payment.utr,
      hours: payment.hours,
      topicId: payment.topicId,
      preferredSlot: payment.preferredSlot || '',
      status: 'pending',
      ts: payment.ts,
      read: false
    };
    if (window.MentorFB && window.MentorFB.set) {
      window.MentorFB.set('mentor_notifications/' + (MG.MENTOR_MOBILE || '8929397949') + '/' + payment.id, notif).catch(function(){});
      // also mirror under index for mentor list
      window.MentorFB.set('mentor_guidance_index/' + targetMobile + '/lastPayment', {
        id: payment.id, status: 'pending', amount: payment.amount, ts: payment.ts, topicTitle: payment.topicTitle
      }).catch(function(){});
    }
    try { if (typeof MG.pulseMentorPaymentBadge === 'function') MG.pulseMentorPaymentBadge(); } catch (e0) {}
  } catch (eN) {}

  // Admin is notified via mentor_notifications (in-app toast + Payments badge).
  // Student does NOT need to message WhatsApp manually.

  MG.closeBooking();
  MG.renderCatalog();
  MG.showToast('Payment submitted — Mentor notified automatically. Waiting for approval.');
}

MG.closeBooking = function() {
  MG.$('#bookingModal').classList.add('hidden');
  MG.$('#bookingModal').classList.remove('flex');
}


})(window.MG = window.MG || {});
