/* Booking-specific session coordination, separate from the topic workspace. */
(function (MG) {
'use strict';
const ist = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
const platforms = { google_meet: 'Google Meet', microsoft_teams: 'Microsoft Teams', zoom: 'Zoom' };
let panel, content, status, dashboard, tab = 'bookings', activeId = '', seenByActor, scope;
const el = (tag, value, classes) => {
  const node = document.createElement(tag);
  if (value != null) node.textContent = value;
  if (classes) node.className = classes;
  return node;
};
const pad = 'px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm';
const cardClass = 'rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3 space-y-2';
const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
MG.formatSessionIst = value => value ? ist.format(new Date(value)) + ' IST' : 'Awaiting schedule';
MG.sessionStartUtc = (date, time) => Date.parse(date + 'T' + time + ':00+05:30');
const trackLabel = row => MG.TRACKS?.[row.track]?.name || row.track || 'Guidance';

async function identity() {
  if (MG.state.viewingAs || !window.MentorFB?.waitForAuth) return null;
  const user = await window.MentorFB.waitForAuth();
  if (!user || user.isAnonymous) return null;
  let admin = MG.state.isMentor === true;
  if (!admin) admin = (await user.getIdTokenResult()).claims.admin === true;
  return { uid: user.uid, admin };
}

function call(name, payload) {
  if (!scope) throw new Error('Verify your identity to view sessions.');
  return window.MentorFB.callSecure(name, payload || {}, scope.uid);
}
const params = row => ({ bookingId: row.id, ...(scope.admin ? { asAdmin: true, uid: row.uid } : {}) });

function announce(message) {
  status.textContent = message;
}

function action(host, label, handler, classes = pad) {
  const button = el('button', label, classes);
  button.type = 'button';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      announce('');
      await handler();
    } catch (error) {
      announce(error?.code === 'functions/permission-denied' ? 'This action requires the booking owner or a Mentor.'
        : error?.code?.startsWith('functions/') && error.message ? error.message : 'The action could not complete. Refresh and try again.');
    } finally {
      button.disabled = false;
    }
  });
  host.appendChild(button);
  return button;
}

function contact(row) {
  const phone = scope.admin ? '91' + row.mobile : MG.WHATSAPP_NUMBER;
  if (!/^91[6-9]\d{9}$/.test(String(phone || ''))) throw new Error('No verified contact number');
  const message = (scope.admin ? 'Hello, I am the Mentor. Let’s coordinate booking ' : 'Hello Mentor, please help schedule booking ') +
    row.id + ' for ' + trackLabel(row) + ' (' + MG.formatBookingDuration(row.hours) + ').';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
}

function field(form, label, tag, name, value, type) {
  const wrapper = el('label', label, 'block text-sm');
  const input = el(tag, null, 'block w-full mt-1 bg-transparent ' + pad);
  input.name = name;
  if (type) input.type = type;
  if (value != null) input.value = value;
  wrapper.appendChild(input);
  form.appendChild(wrapper);
  return input;
}

function renderSchedule(card, row) {
  const details = el('details', null, 'mt-2');
  details.appendChild(el('summary', row.session?.meetingLink ? 'Update meeting link' : 'Add meeting link', 'cursor-pointer font-semibold text-sm'));
  const form = el('form', null, 'space-y-2 mt-2');
  const fixed = row.appointment?.status === 'booked' ? row.appointment : row.session;
  const slotHost = el('div');
  let picker;
  if (fixed?.startsAt) {
    form.appendChild(el('p', MG.formatAppointment(fixed.startsAt, fixed.endsAt), 'font-semibold text-sm'));
  } else {
    form.appendChild(slotHost);
    picker = MG.createAppointmentPicker(slotHost, () => Number(row.hours), { bookingId: row.id });
    details.addEventListener('toggle', () => { if (details.open) picker.refresh(); });
  }
  const platform = field(form, 'Meeting platform', 'select', 'platform');
  Object.entries(platforms).forEach(([id, text]) => {
    const option = el('option', text);
    option.value = id;
    platform.appendChild(option);
  });
  platform.value = row.session?.platform || 'google_meet';
  const link = field(form, 'Existing meeting link', 'input', 'link', row.session?.meetingLink || '', 'url');
  link.maxLength = 1024;
  const notes = field(form, 'Mentor notes visible to student', 'textarea', 'notes', row.session?.notes || '');
  notes.maxLength = 700;
  action(form, row.status === 'pending' ? 'Approve & save meeting link' : 'Save meeting link', async () => {
    const startsAt = picker?.getSelection();
    if ((!fixed?.startsAt && !startsAt) || !link.value) { announce('Choose an available time and enter the meeting link.'); return; }
    await call('manageBookingSession', { ...params(row), operation: 'schedule', ...(startsAt ? { startsAt } : {}),
      platform: platform.value, meetingLink: link.value, notes: notes.value });
    await openPanel('bookings', row.id);
    announce('Session scheduled. The student can see the confirmation.');
  });
  link.required = true;
  form.addEventListener('submit', event => event.preventDefault());
  details.appendChild(form);
  card.appendChild(details);
}

function renderRescheduling(card, row) {
  const proposal = row.appointment?.proposal;
  if (proposal) {
    card.appendChild(el('p', 'Replacement proposed · ' + MG.formatAppointment(proposal.startsAt, proposal.endsAt), 'font-semibold text-sm'));
    if (scope.admin) action(card, 'Withdraw proposal', async () => {
      await call('manageBookingSession', { ...params(row), operation: 'withdraw', proposalId: proposal.id });
      await openPanel('bookings', row.id);
    });
    else for (const response of ['accept', 'decline']) {
      action(card, response === 'accept' ? 'Accept replacement' : 'Decline replacement', async () => {
        await call('respondToAppointmentProposal', { ...params(row), proposalId: proposal.id, response });
        await openPanel('bookings', row.id);
        announce(response === 'accept' ? 'Appointment updated. The Mentor can add the meeting link.' : 'Replacement declined. Your original booking is unchanged.');
      });
    }
  } else if (scope.admin) {
    const details = el('details', null, 'mt-2');
    const slots = el('div');
    details.append(el('summary', 'Request rescheduling', 'cursor-pointer font-semibold text-sm'), slots);
    const picker = MG.createAppointmentPicker(slots, () => Number(row.hours), { bookingId: row.id });
    details.addEventListener('toggle', () => { if (details.open) picker.refresh(); });
    action(details, 'Propose replacement', async () => {
      const startsAt = picker.getSelection();
      if (!startsAt) { announce('Select an available replacement time.'); return; }
      await call('manageBookingSession', { ...params(row), operation: 'propose', startsAt });
      await openPanel('bookings', row.id);
      announce('Replacement reserved for student confirmation.');
    });
    card.appendChild(details);
  }
  const history = row.appointment?.history || [];
  if (history.length) {
    const details = el('details');
    details.appendChild(el('summary', 'Appointment history', 'cursor-pointer font-semibold text-sm'));
    history.forEach(entry => details.appendChild(el('p',
      (entry.from ? MG.formatAppointment(entry.from, entry.fromEnd) + ' → ' : '') + MG.formatAppointment(entry.to, entry.toEnd) +
      ' · ' + (entry.response === 'accept' ? 'Accepted' : 'Declined'), 'text-sm')));
    card.appendChild(details);
  }
}

async function conversation(host, row) {
  host.replaceChildren(el('h4', 'Booking chat', 'font-semibold'));
  const messages = await call('getBookingConversation', params(row));
  if (!messages.length) host.appendChild(el('p', 'No messages yet. Coordinate a suitable time here.', 'text-sm'));
  const list = el('ul', null, 'space-y-2 max-h-64 overflow-y-auto');
  messages.forEach(message => {
    const item = el('li', null, 'rounded-lg bg-slate-100 dark:bg-slate-800 p-2');
    item.append(el('strong', (message.sender === 'mentor' ? 'Mentor' : 'Student') + ' · ' + MG.formatSessionIst(message.at), 'text-xs'),
      el('p', message.body, 'whitespace-pre-wrap break-words text-sm'));
    list.appendChild(item);
  });
  host.appendChild(list);
  const box = field(host, 'Message about this booking', 'textarea', 'message');
  box.maxLength = 1000;
  action(host, 'Send message', async () => {
    if (!box.value.trim()) return;
    await call('sendBookingMessage', { ...params(row), body: box.value });
    await conversation(host, row);
  });
}

function renderBooking(row) {
  const card = el('article', null, cardClass);
  card.dataset.bookingId = row.id;
  const label = MG.bookingPaymentLabel(row);
  const eligible = row.paymentStatus === 'paid' && row.paymentFinalizedAt && ['pending', 'approved'].includes(row.status);
  card.append(el('h3', trackLabel(row), 'font-bold'), el('p', row.topic, 'break-words'),
    el('p', MG.formatBookingDuration(row.hours) + ' · ' + money(row.amount), 'text-sm'),
    el('p', label + ' · Booking ' + row.status + ' · Session ' + (row.session?.status || 'unscheduled'), 'font-semibold text-sm'),
    el('p', 'Booking reference: ' + row.id + (row.paymentId ? ' · Payment: ' + row.paymentId : ''), 'text-xs break-all'));
  if (scope.admin) card.appendChild(el('p', (row.studentName || 'Student') + ' · +91 ' + row.mobile, 'text-sm'));
  const appointment = row.appointment || row.session;
  if (appointment?.startsAt) card.appendChild(el('p', MG.formatAppointment(appointment.startsAt, appointment.endsAt), 'font-semibold text-sm'));
  if (row.session?.platform) card.appendChild(el('p', platforms[row.session.platform], 'text-sm'));
  if (row.session?.notes) card.appendChild(el('p', row.session.notes, 'whitespace-pre-wrap break-words text-sm'));
  const appointmentStatus = row.appointment?.status;
  if (appointmentStatus === 'needs_reschedule') {
    card.appendChild(el('p', scope.admin ? 'Payment verified. Propose a replacement or use the refund workflow.'
      : 'Payment verified. Contact the Mentor to arrange another time or discuss a refund.', 'font-semibold text-sm'));
  } else if (appointmentStatus === 'expired') {
    card.appendChild(el('p', 'Slot hold expired. Choose a new appointment in Fast Booking or the topic booking form.', 'text-sm'));
  } else if (appointmentStatus === 'held') {
    card.appendChild(el('p', 'Slot reserved until ' + MG.formatSessionIst(row.appointment.expiresAt) + ' · awaiting payment.', 'text-sm'));
  } else if (appointmentStatus === 'booked' && eligible && row.status === 'pending') {
    card.appendChild(el('p', 'Appointment reserved · awaiting Mentor confirmation.', 'text-sm'));
  } else if (!appointment?.startsAt && eligible && !scope.admin) {
    card.appendChild(el('p', 'Your payment is verified. The Mentor will confirm your session date and time.', 'text-sm'));
  }
  const buttons = el('div', null, 'flex flex-wrap gap-2');
  card.appendChild(buttons);
  const extra = el('div', null, 'space-y-2');
  card.appendChild(extra);
  if (scope.admin) {
    if (row.feedback) card.appendChild(el('p', 'Student feedback: ' + row.feedback.rating + '/5' +
      (row.feedback.note ? ' · ' + row.feedback.note : ''), 'text-sm whitespace-pre-wrap break-words'));
    if (eligible && row.status === 'pending' && appointmentStatus !== 'needs_reschedule') action(buttons,
      appointmentStatus === 'booked' ? 'Approve selected appointment' : 'Approve without scheduling', async () => {
      await call('approveBooking', { uid: row.uid, bookingId: row.id });
      await openPanel('bookings', row.id);
    });
    if (eligible && row.session?.status !== 'completed' && appointmentStatus !== 'needs_reschedule') renderSchedule(card, row);
    if (eligible && row.session?.status !== 'completed') renderRescheduling(card, row);
    if (eligible && row.session?.status === 'scheduled') action(buttons, 'Mark session completed', async () => {
      await call('manageBookingSession', { ...params(row), operation: 'complete' });
      await openPanel('bookings', row.id);
    });
    if (!eligible && row.paymentStatus !== 'refunded') action(buttons, 'Reconcile captured payment', async () => {
      if (await MG.reconcileAdminBooking(row.uid, row.id)) await openPanel('bookings', row.id);
    });
    if (row.status === 'pending' && row.paymentStatus === 'unpaid' && ['held', 'expired'].includes(appointmentStatus)) {
      action(buttons, 'Reject unpaid booking', async () => {
        if (!window.confirm('Reject this unpaid booking and release the slot?')) return;
        await call('rejectBooking', { uid: row.uid, bookingId: row.id });
        await openPanel('bookings', row.id);
      });
    }
    if (row.paymentStatus === 'paid') action(buttons, 'Open refund review', () => {
      panel.close();
      return MG.openHistory();
    });
    action(buttons, 'Contact student', () => contact(row));
  } else {
    if (row.joinEligible) action(buttons, 'Join session', async () => {
      const result = await call('getBookingSessionLink', params(row));
      if (result.url) window.location.assign(result.url);
    });
    if (row.confirmation?.unread && eligible) action(buttons, 'Acknowledge session update', async () => {
      await call('markBookingConfirmationRead', { ...params(row), version: row.confirmation.version });
      await openPanel('bookings', row.id);
    });
    if (row.confirmation?.unread && eligible) card.prepend(el('p', 'New Mentor confirmation', 'text-xs font-bold'));
    const resumable = (appointmentStatus === 'payment_pending' && row.appointment.startsAt > Date.now()) ||
      appointmentStatus === 'held' || (!row.appointment && row.existingPaymentOrder);
    const checkOnly = ['verification_pending', 'support_required'].includes(row.paymentState) ||
      (row.paymentState === 'processing' && !resumable);
    if (checkOnly || (resumable && ['unpaid', 'payment_failed', 'processing'].includes(row.paymentState) && row.status === 'pending')) {
      action(buttons, checkOnly ? 'Check payment status' : 'Resume payment', async () => {
        await MG.launchSecureCheckout(row.id, { reconcileOnly: checkOnly, amount: row.amount,
          description: trackLabel(row) + ' · ' + MG.formatBookingDuration(row.hours) });
        await openPanel('bookings', row.id);
      });
    }
    if (eligible) {
      if (row.appointment?.proposal || row.appointment?.history?.length) renderRescheduling(card, row);
      action(buttons, 'View payment receipt', async () => {
        const receipt = await call('getBookingPaymentReceipt', params(row));
        extra.replaceChildren(el('h4', 'Verified payment receipt', 'font-semibold'),
          el('p', money(receipt.amount / 100) + ' ' + receipt.currency + ' · ' + MG.formatSessionIst(receipt.capturedAt), 'text-sm'),
          el('p', 'Booking ' + receipt.bookingId + ' · Payment ' + receipt.paymentId + ' · Order ' + receipt.orderId, 'text-xs break-all'));
      });
      action(buttons, 'Contact Mentor on WhatsApp', () => contact(row));
    } else if (appointmentStatus === 'needs_reschedule') {
      action(buttons, 'Contact Mentor on WhatsApp', () => contact(row));
    }
    if (eligible && row.session?.status === 'completed') action(buttons, 'Session feedback', () => {
      extra.replaceChildren();
      const rating = field(extra, 'Rating (1–5)', 'input', 'rating', row.feedback?.rating || 5, 'number');
      rating.min = 1;
      rating.max = 5;
      const note = field(extra, 'Feedback', 'textarea', 'feedback', row.feedback?.note || '');
      note.maxLength = 500;
      action(extra, 'Save feedback', async () => {
        await call('submitBookingFeedback', { ...params(row), rating: Number(rating.value), note: note.value });
        await openPanel('bookings', row.id);
        announce('Feedback saved.');
      });
    });
  }
  if (eligible) action(buttons, row.unreadMessages ? 'Chat · Unread messages' : 'Booking chat', () => conversation(extra, row));
  return card;
}

async function openPaidBookingNotification(notification) {
  await call('markPaidBookingNotificationRead', { id: notification.id });
  await openPanel('bookings', notification.bookingId);
}
MG.openPaidBookingNotification = openPaidBookingNotification;

function render() {
  content.replaceChildren();
  const controls = el('div', null, 'flex flex-wrap gap-2 mb-3');
  content.appendChild(controls);
  action(controls, scope.admin ? 'Bookings' : 'My sessions', () => openPanel('bookings'));
  if (scope.admin) action(controls, 'Paid booking notifications', () => openPanel('notifications'));
  action(controls, 'Refresh', () => openPanel(tab, activeId));
  if (tab === 'notifications' && scope.admin) {
    if (!dashboard.notifications.length) content.appendChild(el('p', 'No paid booking notifications.'));
    dashboard.notifications.forEach(notification => {
      const card = el('article', null, cardClass);
      card.append(el('h3', (notification.unread ? 'Unread · ' : '') + 'New paid booking', 'font-bold'),
        el('p', notification.studentName + ' · ' + trackLabel(notification) + ' · ' + notification.topic),
        el('p', MG.formatBookingDuration(notification.hours) + ' · ' + money(notification.amount) + ' · Payment verified', 'text-sm'),
        el('p', notification.bookingId + ' · ' + MG.formatSessionIst(notification.bookedAt), 'text-xs break-all'));
      if (notification.appointmentStart) card.appendChild(el('p',
        MG.formatAppointment(notification.appointmentStart, notification.appointmentEnd) +
        (notification.appointmentStatus === 'needs_reschedule' ? ' · Replacement or refund needed' : ''), 'font-semibold text-sm'));
      action(card, 'Open booking', () => MG.openPaidBookingNotification(notification));
      if (notification.unread) action(card, 'Mark as read', async () => {
        await call('markPaidBookingNotificationRead', { id: notification.id });
        await openPanel('notifications');
      });
      content.appendChild(card);
    });
    return;
  }
  const groups = scope.admin ? [
    ['Paid bookings awaiting approval', dashboard.bookings.filter(row => row.status === 'pending' && row.paymentStatus === 'paid' && row.paymentFinalizedAt)],
    ['Unpaid or still verifying', dashboard.bookings.filter(row => row.status === 'pending' && (row.paymentStatus !== 'paid' || !row.paymentFinalizedAt))],
    ['Scheduled and past bookings', dashboard.bookings.filter(row => row.status !== 'pending')]
  ] : [
    ['Upcoming and awaiting confirmation', dashboard.bookings.filter(row => !['completed', 'cancelled'].includes(row.session?.status) && row.status !== 'rejected' && row.paymentStatus !== 'refunded')],
    ['Session history', dashboard.bookings.filter(row => ['completed', 'cancelled'].includes(row.session?.status) || row.status === 'rejected' || row.paymentStatus === 'refunded')]
  ];
  groups.forEach(([title, rows]) => {
    content.appendChild(el('h3', title, 'font-bold mb-2'));
    if (!rows.length) content.appendChild(el('p', 'No bookings here.', 'text-sm opacity-70 mb-3'));
    rows.forEach(row => {
      const card = renderBooking(row);
      content.appendChild(card);
      if (activeId === row.id) card.scrollIntoView?.({ block: 'center' });
    });
  });
}

function updateCounts(data) {
  const id = scope.uid + ':' + scope.admin;
  if (seenByActor?.id !== id) seenByActor = { id, ids: null };
  const notifications = scope.admin ? data.notifications.filter(n => n.unread).map(n => n.id)
    : data.bookings.filter(row => row.confirmation?.unread).map(row => row.id + ':' + row.confirmation.version);
  const source = scope.admin ? data.notifications.filter(row => row.unread) : [];
  const latest = Math.max(seenByActor.latest || 0, ...source.map(row => row.finalizedAt || 0));
  if (seenByActor.ids && (scope.admin ? latest > seenByActor.latest || source.some(row => row.finalizedAt === latest &&
    !seenByActor.ids.has(row.id)) : notifications.some(item => !seenByActor.ids.has(item)))) {
    MG.showToast(scope.admin ? 'New paid booking awaiting Mentor review.' : 'You have a new Mentor session confirmation.');
  }
  seenByActor.latest = latest;
  seenByActor.ids = new Set(notifications);
  const bell = document.getElementById('mentorSessionBell');
  const count = document.getElementById('mentorSessionUnread');
  const badge = document.getElementById('mentorSecureBookingsBadge');
  if (bell) bell.classList.toggle('hidden', !scope.admin);
  const title = document.getElementById('mentorSessionsButtonTitle');
  if (title) title.textContent = scope.admin ? 'Bookings' : 'My Sessions';
  if (count) count.textContent = String(data.unreadCount || 0);
  if (badge) badge.textContent = scope.admin ? ' · ' + data.pendingPaidCount + ' paid pending' : notifications.length ? ' · ' + notifications.length + ' new' : '';
}

async function load(selected = '', countsOnly = false) {
  const owner = await identity();
  if (!owner) return null;
  const result = await window.MentorFB.callSecure('getBookingSessionDashboard',
    { asAdmin: owner.admin, countsOnly, ...(owner.admin && selected ? { bookingId: selected } : {}) }, owner.uid);
  if (window.MentorFB.auth.currentUser?.uid !== owner.uid || MG.state.viewingAs) return null;
  scope = owner;
  updateCounts(result);
  return result;
}

async function openPanel(next = 'bookings', selected = '') {
  if (!panel.open) panel.showModal();
  if (tab !== next || activeId !== selected) content.replaceChildren();
  tab = next;
  activeId = selected;
  dashboard = await load(selected);
  announce(dashboard ? '' : 'Verify your phone to view sessions.');
  if (dashboard) render();
}
MG.openSessionBooking = id => openPanel('bookings', id);

function init() {
  const button = document.getElementById('mentorSessionsButton');
  const bell = document.getElementById('mentorSessionBell');
  panel = document.getElementById('mentorSessionsDialog');
  if (!button || !panel) return;
  content = panel.querySelector('[data-session-content]');
  status = panel.querySelector('[data-session-status]');
  panel.querySelector('[data-session-close]').addEventListener('click', () => panel.close());
  button.addEventListener('click', () => openPanel().catch(() => announce('Sessions are temporarily unavailable.')));
  bell?.addEventListener('click', () => openPanel('notifications').catch(() => announce('Notifications are temporarily unavailable.')));
  const refreshCounts = () => {
    if (!document.hidden) void load('', true).catch(() => {});
  };
  MG.refreshSessionBadge = refreshCounts;
  window.addEventListener('mentor-auth-changed', () => {
    seenByActor = null;
    scope = null;
    content.replaceChildren();
    bell?.classList.add('hidden');
    panel.close();
    refreshCounts();
  });
  refreshCounts();
  setInterval(refreshCounts, 45000);
}
document.addEventListener('DOMContentLoaded', init);
})(window.MG);
