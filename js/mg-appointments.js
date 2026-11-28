(function (MG) {
'use strict';
const zone = 'Asia/Kolkata';
const dayMs = 86400000;
const iso = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
const clock = new Intl.DateTimeFormat('en-IN', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const weekday = new Intl.DateTimeFormat('en-IN', { timeZone: zone, weekday: 'short', day: 'numeric', month: 'short' });
const monthName = new Intl.DateTimeFormat('en-IN', { timeZone: zone, month: 'long', year: 'numeric' });
const dateOf = time => iso.format(time);
const midnight = date => Date.parse(date + 'T00:00:00+05:30');
const shift = (date, days) => dateOf(midnight(date) + days * dayMs);
const timeOf = timestamp => clock.format(timestamp);
const range = (start, end) => timeOf(start) + '–' + timeOf(end) + ' IST';
const stamp = (start, end) => weekday.format(start) + ' · ' + range(start, end);
MG.formatAppointment = stamp;

const element = (tag, label, classes) => {
  const node = document.createElement(tag);
  if (label != null) node.textContent = label;
  if (classes) node.className = classes;
  return node;
};
const button = (label, action, classes = 'av-control') => {
  const node = element('button', label, classes);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
};
const live = () => {
  const node = element('p', '', 'av-live');
  node.setAttribute('role', 'status');
  return node;
};
const field = (host, label, type) => {
  const wrapper = element('label', label, 'av-field');
  const input = element('input', null, 'av-input');
  input.type = type;
  wrapper.appendChild(input);
  host.appendChild(wrapper);
  return input;
};
const api = (name, data) => window.MentorFB.callSecure(name, data);
const errorText = (error, fallback) => error?.code?.startsWith('functions/') && error.message ? error.message : fallback;

MG.createAppointmentPicker = function(host, getHours, options = {}) {
  if (!host) return null;
  if (host.appointmentPicker) return host.appointmentPicker;
  host.classList.add('av-picker');
  const dates = element('div', null, 'av-dates');
  const times = element('div', null, 'av-groups');
  const controls = element('div', null, 'av-controls');
  const today = () => dateOf(Date.now());
  const date = field(controls, 'Select Session Date', 'date');
  date.value = today();
  date.min = date.value;
  const previous = button('‹ Week', () => navigate(-7));
  const next = button('Week ›', () => navigate(7));
  controls.append(previous, next);
  const status = live();
  const selection = element('p', 'Choose an available time.', 'av-selection');
  selection.setAttribute('aria-live', 'polite');
  host.append(controls, dates, element('h4', 'Select Available Time Slot', 'av-subtitle'), times, selection, status);
  let chosen, hold, timer, serial = 0, busy = false;

  function renderSelection() {
    times.querySelectorAll('[data-slot]').forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.slot) === chosen?.startsAt)));
    selection.textContent = chosen ? 'Selected · ' + stamp(chosen.startsAt, chosen.endsAt) : 'Choose an available time.';
  }

  function setHold(appointment) {
    clearTimeout(timer);
    hold = appointment;
    if (hold?.status === 'held' && hold.expiresAt > Date.now()) {
      status.textContent = 'Slot held until ' + timeOf(hold.expiresAt) + ' IST.';
      timer = setTimeout(() => {
        hold = null;
        chosen = null;
        refresh('Your slot hold expired. Choose an available time.');
      }, hold.expiresAt - Date.now() + 20);
    } else if (hold?.status === 'payment_pending') {
      status.textContent = 'This slot is reserved while payment is resolved.';
    }
  }

  function navigate(days) {
    const target = shift(date.value || today(), days);
    date.value = target < today() ? today() : target;
    refresh();
  }

  async function refresh(message = '') {
    const request = ++serial;
    date.min = today();
    if (!date.value || date.value < date.min) date.value = date.min;
    const selectedDate = date.value;
    const hours = getHours();
    previous.disabled = busy || selectedDate <= today();
    status.textContent = 'Checking availability…';
    times.setAttribute('aria-busy', 'true');
    try {
      const model = await api('getAppointmentAvailability', { date: selectedDate, hours,
        ...(options.bookingId ? { asAdmin: true, bookingId: options.bookingId } : {}) });
      if (request !== serial) return;
      const old = chosen;
      const isOwn = slot => hold?.startsAt === slot.startsAt && (hold.status === 'payment_pending' || hold.expiresAt > Date.now());
      const allowed = slot => slot.available || isOwn(slot);
      const slots = model.groups.flatMap(group => group.slots);
      chosen = chosen && slots.find(slot => slot.startsAt === chosen.startsAt && allowed(slot));
      if (!chosen && old) setHold(null);
      dates.replaceChildren(...model.days.map(day => {
        const item = button(weekday.format(midnight(day.date)), () => { date.value = day.date; refresh(); });
        item.disabled = busy || (!day.available && day.date !== selectedDate);
        item.setAttribute('aria-pressed', String(day.date === selectedDate));
        item.setAttribute('aria-label', item.textContent + (day.available ? ', available' : ', no available slots'));
        return item;
      }));
      times.replaceChildren(...model.groups.map(group => {
        const section = element('section', null, 'av-group');
        const grid = element('div', null, 'av-time-grid');
        section.append(element('h5', group.label + ' Sessions'), grid);
        group.slots.forEach(slot => {
          const node = button(range(slot.startsAt, slot.endsAt), () => {
            if (chosen?.startsAt !== slot.startsAt) setHold(null);
            chosen = slot;
            renderSelection();
            if (!hold) status.textContent = '';
          });
          node.dataset.slot = slot.startsAt;
          node.disabled = busy || !allowed(slot);
          grid.appendChild(node);
        });
        if (!group.slots.length) grid.appendChild(element('p', 'No times for this duration.', 'av-muted'));
        return section;
      }));
      renderSelection();
      status.textContent = message || (old && !chosen ? 'That time is no longer available. Choose another slot.'
        : !slots.some(allowed) ? 'No slots available on this date.' : '');
      if (hold && chosen && !message) setHold(hold);
    } catch (error) {
      if (request !== serial) return;
      dates.replaceChildren();
      times.replaceChildren(button('Retry availability', () => refresh()));
      status.textContent = errorText(error, 'Availability could not load. Try again.');
    } finally {
      if (request === serial) times.removeAttribute('aria-busy');
    }
  }

  date.addEventListener('change', () => refresh());
  host.appointmentPicker = {
    refresh,
    getSelection: () => chosen?.startsAt > Date.now() ? chosen.startsAt : null,
    busy(value) {
      busy = value;
      date.disabled = next.disabled = value;
      previous.disabled = value || date.value <= today();
      [dates, times].forEach(node => { node.inert = value; });
      if (!value) refresh();
    },
    setHold,
    clear() { chosen = null; setHold(null); renderSelection(); }
  };
  return host.appointmentPicker;
};

const states = {
  available: 'Available', partially_booked: 'Partially booked', fully_booked: 'Fully booked',
  full_off: 'Full day off', partial_off: 'Partial time off', past: 'Past date'
};
const toMinutes = text => {
  if (!text) return NaN;
  const [hours, minutes] = text.split(':').map(Number);
  return hours * 60 + minutes;
};
const toClock = minutes => String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
const offLabel = item => item.startMinute === 0 && item.endMinute === 1440
  ? (item.from === item.to ? item.from + ' · Full day' : item.from + ' to ' + item.to + ' · Inclusive')
  : item.from + ' · ' + toClock(item.startMinute) + '–' + toClock(item.endMinute) + ' IST';

MG.openMentorAvailability = function() {
  const host = document.getElementById('mentorAvailability');
  if (!host) return;
  if (host.loadCalendar) return host.loadCalendar();
  const controls = element('div', null, 'av-calendar-nav');
  const heading = element('h4');
  const grid = element('div', null, 'av-calendar-grid');
  const legend = element('div', null, 'av-legend');
  Object.entries(states).forEach(([state, title]) => legend.appendChild(element('span', title, 'av-state av-' + state)));
  legend.appendChild(element('span', 'Today', 'av-today'));
  const appointments = element('section', null, 'av-admin-list');
  const dayCapacity = element('section', null, 'av-admin-list');
  const upcoming = element('section', null, 'av-admin-list');
  const timeOff = element('section', null, 'av-admin-list');
  const status = live();
  const conflicts = element('div', null, 'av-conflicts');
  const form = element('form', null, 'av-form');
  const formTitle = element('h4', 'Add time off');
  const fields = element('div', null, 'av-form-fields');
  const from = field(fields, 'From date', 'date');
  const to = field(fields, 'Through date', 'date');
  const full = field(fields, 'Full day', 'checkbox');
  const start = field(fields, 'Start time (IST)', 'time');
  const end = field(fields, 'End time (IST)', 'time');
  const reason = field(fields, 'Private reason (optional)', 'text');
  reason.maxLength = 300;
  from.required = to.required = true;
  const save = element('button', 'Save time off', 'av-primary');
  save.type = 'submit';
  const reset = button('Clear form', () => edit());
  form.append(formTitle, fields, save, reset);
  const settings = element('form', null, 'av-controls');
  const hold = field(settings, 'Checkout hold (minutes)', 'number');
  hold.min = 1;
  hold.max = 120;
  hold.required = true;
  const saveHold = element('button', 'Save hold duration', 'av-control');
  saveHold.type = 'submit';
  settings.appendChild(saveHold);
  let current = dateOf(Date.now()), editing, sequence = 0;
  controls.append(button('‹', () => month(-1)), heading, button('›', () => month(1)), button('Today', () => {
    current = dateOf(Date.now());
    load();
  }));
  controls.firstChild.setAttribute('aria-label', 'Previous month');
  controls.children[2].setAttribute('aria-label', 'Next month');
  const title = element('h3', 'Availability & Time Off', 'av-admin-title');
  host.append(title, element('p', 'Monday–Sunday · 07:00–12:00 · 14:00–19:00 · 21:00–23:00 IST · 15-minute gap between sessions', 'av-muted'),
    controls, grid, legend, status, appointments, dayCapacity, upcoming, form, conflicts, timeOff, settings);
  function month(offset) {
    const [year, period] = current.slice(0, 7).split('-').map(Number);
    current = dateOf(Date.UTC(year, period - 1 + offset, 1, 12));
    load();
  }
  function timeFields() {
    start.parentElement.hidden = end.parentElement.hidden = full.checked;
    start.required = end.required = !full.checked;
    to.readOnly = !full.checked;
    if (!full.checked || to.value < from.value) to.value = from.value;
    to.min = from.value;
  }
  full.addEventListener('change', timeFields);
  from.addEventListener('change', timeFields);
  form.addEventListener('input', () => conflicts.replaceChildren());
  function edit(item) {
    editing = item?.id;
    formTitle.textContent = item ? 'Edit time off' : 'Add time off';
    from.min = item?.from < dateOf(Date.now()) ? item.from : dateOf(Date.now());
    from.value = item?.from || (current < from.min ? from.min : current);
    to.value = item?.to || from.value;
    full.checked = !item || (item.startMinute === 0 && item.endMinute === 1440);
    start.value = !full.checked ? toClock(item.startMinute) : '';
    end.value = !full.checked ? toClock(item.endMinute) : '';
    reason.value = item?.reason || '';
    conflicts.replaceChildren();
    timeFields();
  }
  function openBooking(id) {
    document.getElementById('closePricingAdmin')?.click();
    return MG.openSessionBooking?.(id);
  }
  function list(section, title, items, render, empty) {
    section.replaceChildren(element('h4', title));
    if (!items.length) section.appendChild(element('p', empty, 'av-muted'));
    items.forEach(item => section.appendChild(render(item)));
  }
  async function load(message = '') {
    const request = ++sequence;
    status.textContent = 'Loading calendar…';
    try {
      const model = await api('getMentorAvailability', { date: current });
      if (request !== sequence) return;
      heading.textContent = monthName.format(midnight(current));
      hold.value = model.holdMinutes;
      grid.replaceChildren(...['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => element('span', day, 'av-day-head')));
      const first = new Date(model.days[0].date + 'T12:00:00Z').getUTCDay();
      for (let blank = 0; blank < (first + 6) % 7; blank++) grid.appendChild(element('span'));
      model.days.forEach(day => {
        const node = button(Number(day.date.slice(-2)), () => {
          current = day.date;
          if (!editing) edit();
          load();
        }, 'av-day av-state av-' + day.state);
        node.setAttribute('aria-label', day.date + ', ' + states[day.state]);
        node.setAttribute('aria-pressed', String(day.date === current));
        if (day.date === model.today) node.setAttribute('aria-current', 'date');
        grid.appendChild(node);
      });
      list(appointments, 'Appointments · ' + weekday.format(midnight(current)), model.appointments, item => {
        const box = element('article', null, 'av-record');
        const track = MG.TRACKS?.[item.track]?.name || item.track;
        box.append(element('strong', range(item.startsAt, item.endsAt) + ' · ' + item.studentName),
          element('p', [track, item.topic, MG.formatBookingDuration(item.hours)].filter(Boolean).join(' · ')),
          element('p', [item.paymentStatus, item.bookingStatus, item.proposed ? 'Replacement proposed' : item.sessionStatus].join(' · ')),
          element('p', item.id, 'av-muted'), button('Open booking', () => openBooking(item.id)));
        if (item.meetingLink && /^https:\/\//i.test(item.meetingLink)) {
          const link = element('a', 'Open meeting link', 'av-control');
          link.href = item.meetingLink;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          box.appendChild(link);
        }
        return box;
      }, 'No appointments for this date.');
      list(dayCapacity, 'Available working windows', model.workingWindows, item =>
        element('p', item.label + ' · ' + (item.open.length ? item.open.map(slot => range(slot.startsAt, slot.endsAt)).join(', ') : 'Unavailable')),
      'No working windows for this date.');
      if (model.selectedDayTimeOff.length) {
        dayCapacity.appendChild(element('h4', 'Blocked time'));
        model.selectedDayTimeOff.forEach(item => dayCapacity.appendChild(element('p', offLabel(item) + (item.reason ? ' · ' + item.reason : ''))));
      }
      list(upcoming, 'Upcoming appointments', model.upcoming, item => button(stamp(item.startsAt, item.endsAt) +
        ' · ' + item.status.replaceAll('_', ' '), () => openBooking(item.id), 'av-record av-clickable'), 'No upcoming appointments.');
      list(timeOff, 'Upcoming time off', model.timeOff, item => {
        const box = element('article', null, 'av-record');
        box.append(element('strong', offLabel(item)));
        if (item.reason) box.appendChild(element('p', item.reason, 'av-muted'));
        box.append(button('Edit', () => { edit(item); from.focus(); }),
          button('Remove', () => change({ action: 'remove', id: item.id })));
        return box;
      }, 'No upcoming time off.');
      status.textContent = message;
    } catch (error) {
      if (request === sequence) status.textContent = errorText(error, 'The Mentor calendar could not load.');
    }
  }
  async function change(data) {
    save.disabled = saveHold.disabled = true;
    conflicts.replaceChildren();
    try {
      const result = await api('updateMentorAvailability', data);
      if (!result.ok) {
        conflicts.appendChild(element('strong', result.canConfirm
          ? 'These appointments overlap. They will remain booked.'
          : 'An active reservation or rescheduling proposal overlaps this time off.'));
        result.conflicts.forEach(item => conflicts.appendChild(button(stamp(item.startsAt, item.endsAt) + ' · ' + item.id,
          () => openBooking(item.id), 'av-record av-clickable')));
        if (result.canConfirm) conflicts.appendChild(button('Save time off and keep bookings',
          () => change({ ...data, confirmation: result.confirmation }), 'av-primary'));
        return;
      }
      if (data.action !== 'hold') edit();
      await load(data.action === 'remove' ? 'Time off removed.' : data.action === 'hold' ? 'Hold duration saved.' : 'Time off saved.');
    } catch (error) {
      conflicts.appendChild(element('p', errorText(error, 'The calendar change could not be saved.')));
    } finally {
      save.disabled = saveHold.disabled = false;
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    change({ action: 'save', ...(editing ? { id: editing } : {}), from: from.value, to: to.value, fullDay: full.checked,
      ...(full.checked ? {} : { startMinute: toMinutes(start.value), endMinute: toMinutes(end.value) }), reason: reason.value });
  });
  settings.addEventListener('submit', event => {
    event.preventDefault();
    change({ action: 'hold', holdMinutes: Number(hold.value) });
  });
  edit();
  host.loadCalendar = load;
  return load();
};
})(window.MG = window.MG || {});
