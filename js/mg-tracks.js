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
  var tr = MG.getSelectedTrack();
  var link = (tr.paymentLink || MG.RAZORPAY_LINK || '').trim() || MG.RAZORPAY_LINK;
  a.href = link;
}

MG.launchSecureCheckout = async function(bookingId) {
  if (!window.MentorFB || typeof window.MentorFB.callSecure !== 'function') throw new Error('Secure payment service is unavailable.');
  if (typeof window.Razorpay !== 'function') {
    await new Promise(function(resolve, reject) {
      var existing = document.querySelector('script[data-mentor-razorpay]');
      if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); return; }
      var script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.mentorRazorpay = '1';
      script.onload = resolve;
      script.onerror = function(){ reject(new Error('Could not load Razorpay Checkout.')); };
      document.head.appendChild(script);
    });
  }
  if (typeof window.Razorpay !== 'function') throw new Error('Razorpay Checkout did not load.');
  var created = await window.MentorFB.callSecure('createRazorpayOrder', {
    productType: 'booking', bookingId: bookingId, idempotencyKey: 'booking_' + bookingId
  });
  if (!created || !created.orderId || !created.keyId || !Number.isSafeInteger(Number(created.amount))) throw new Error('Payment order was not confirmed by the server.');
  var options = {
    key: created.keyId,
    order_id: created.orderId,
    amount: Number(created.amount),
    currency: created.currency,
    name: 'Mentor by VKS Tech',
    description: 'Mentor session booking',
    handler: async function(response) {
      try {
        var verified = await window.MentorFB.callSecure('verifyRazorpayPayment', {
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature
        });
        if (verified && verified.ok && verified.status === 'paid') {
          MG.closeBooking();
          await MG.loadUserDataAsync(MG.state.mobile);
          MG.renderCatalog();
          MG.showToast('Payment verified. Your booking is awaiting mentor confirmation.');
        } else {
          MG.showToast('Payment was received but is not yet verified. Keep the payment reference and contact the mentor.');
        }
      } catch (e) {
        console.error('[secure payment verification]', e);
        MG.showToast('Payment verification could not finish. Keep your Razorpay payment reference and contact support.');
      }
    },
    prefill: { contact: window.MentorFB.auth && window.MentorFB.auth.currentUser && window.MentorFB.auth.currentUser.phoneNumber || '' },
    theme: { color: '#3157d5' },
    modal: { ondismiss: function(){ MG.showToast('Checkout closed. Your booking remains pending; you can retry payment.'); } }
  };
  var checkout = new window.Razorpay(options);
  checkout.on('payment.failed', function(){ MG.showToast('Payment did not complete. Your booking was kept for retry.'); });
  checkout.open();
};

MG.launchSecureSubscriptionCheckout = async function(planId) {
  if (!window.MentorFB || typeof window.MentorFB.callSecure !== 'function') throw new Error('Secure subscription service is unavailable.');
  if (typeof window.Razorpay !== 'function') {
    await new Promise(function(resolve, reject) {
      var existing = document.querySelector('script[data-mentor-razorpay]');
      if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); return; }
      var script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true; script.dataset.mentorRazorpay = '1';
      script.onload = resolve; script.onerror = function(){ reject(new Error('Could not load Razorpay Checkout.')); };
      document.head.appendChild(script);
    });
  }
  if (typeof window.Razorpay !== 'function') throw new Error('Razorpay Checkout did not load.');
  MG._subscriptionCheckoutKeys = MG._subscriptionCheckoutKeys || {};
  var key = MG._subscriptionCheckoutKeys[planId] || ('sub_' + planId + '_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2)));
  MG._subscriptionCheckoutKeys[planId] = key;
  var order = await window.MentorFB.callSecure('createRazorpayOrder', { productType: 'subscription', planId: planId, idempotencyKey: key });
  var options = {
    key: order.keyId, order_id: order.orderId, amount: Number(order.amount), currency: order.currency,
    name: 'Mentor by VKS Tech', description: 'Mentor subscription renewal', theme: { color: '#3157d5' },
    handler: async function(response) {
      try {
        var result = await window.MentorFB.callSecure('verifyRazorpayPayment', { orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature });
        if (!result || result.status !== 'paid') throw new Error('Subscription payment is not yet verified.');
        delete MG._subscriptionCheckoutKeys[planId];
        await MG.loadUserDataAsync(MG.state.mobile);
        if (typeof MG.openHistory === 'function') await MG.openHistory();
        MG.showToast('Subscription payment verified. Access has been extended.');
      } catch (error) { MG.showToast((error && error.message) || 'Payment verification is pending.'); }
    },
    prefill: { contact: window.MentorFB.auth && window.MentorFB.auth.currentUser && window.MentorFB.auth.currentUser.phoneNumber || '' },
    modal: { ondismiss: function(){ MG.showToast('Checkout closed. You can retry this plan.'); } }
  };
  var checkout = new window.Razorpay(options);
  checkout.on('payment.failed', function(){ MG.showToast('Payment did not complete. You can retry this plan.'); });
  checkout.open();
};


/**
 * Student taps Pay Now → create PENDING unlock request for admin.
 * No UTR / Payment ID required from student. Only Admin can Approve & Unlock.
 */
MG.notifyMentorPayIntent = async function() {
  try {
    var targetMobile = String(MG.state.viewingAs || MG.state.mobile || '').replace(/\D/g, '').slice(-10);
    if (!targetMobile) return;
    if (String(targetMobile) === String(MG.MENTOR_MOBILE || '8929397949')) {
      MG.showToast('Mentor account cannot book for itself');
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

    // Mentor 3.0 secure path: never fall back to legacy browser writes when enabled.
    // The backend derives identity from the verified Firebase phone token and price from settings.
    if (MG.SECURE_BOOKINGS_ENABLED === true) {
      if (MG.state.viewingAs) {
        MG.showToast("Secure booking requires the student's own verified sign-in.");
        return;
      }
      if (!window.MentorFB || typeof window.MentorFB.callSecure !== 'function') {
        MG.showToast('Secure booking is unavailable. Please try again later.');
        return;
      }
      var secureTrack = String((tr && tr.id) || MG.selectedTrackId || '');
      if (secureTrack === 'career') secureTrack = 'career_ai';
      if (!['career_ai', 'packaging'].includes(secureTrack)) {
        MG.showToast('Please select a valid learning track.');
        return;
      }
      var secureTopic = String(focus || topic.title || 'Session').trim().slice(0, 160);
      var secureResult = await window.MentorFB.callSecure('createBooking', {
        track: secureTrack,
        topicId: String(topic.id || MG.state.currentTopicId || '').slice(0, 100),
        topic: secureTopic,
        slotPreference: String(slotPref || '').slice(0, 100),
        hours: Number(hours)
      });
      if (!secureResult || secureResult.ok !== true || !secureResult.bookingId) {
        throw new Error('The secure booking service did not confirm this request.');
      }
      await MG.launchSecureCheckout(secureResult.bookingId);
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
    console.warn('[pay intent]', e);
    MG.showToast('Could not notify Mentor — check connection and try Pay again');
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
    b.classList.toggle('active-hrs', parseInt(b.dataset.hrs, 10) === 1);
  });
  MG.$('#utrInput').value = '';
  var legacyUtrFlow = document.getElementById('legacyUtrFlow');
  if (legacyUtrFlow) legacyUtrFlow.classList.toggle('hidden', MG.SECURE_BOOKINGS_ENABLED === true);
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
