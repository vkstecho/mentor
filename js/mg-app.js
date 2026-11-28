/* FEATURE MODULE: app-init-events
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
let appStart = 0;
// ========== Init Flow ==========
MG.isMobileVerified = function(mob) {
  if (!mob) return false;
  if (MG.SECURE_DATA_ENABLED || MG.SECURE_BOOKINGS_ENABLED) {
    return MG.firebasePhone(window.MentorFB?.auth?.currentUser) === mob;
  }
  try {
    if (localStorage.getItem('vks_mentor_verified_' + mob) === '1') return true;
  } catch {}
  try {
    if (localStorage.getItem(SITE_VERIFIED_KEY) === '1' && localStorage.getItem(SITE_PHONE_KEY) === mob) return true;
  } catch {}
  try {
    const u = window.MentorFB && window.MentorFB.auth && window.MentorFB.auth.currentUser;
    if (u && u.phoneNumber) {
      const digits = String(u.phoneNumber).replace(/\D/g, '').slice(-10);
      if (digits === mob) return true;
    }
  } catch {}
  // Inside Man Power app: parent session = verified (no extra OTP)
  try {
    const pm = MG.parentManPowerMobile();
    if (pm && pm === mob) return true;
    if (window.parent && window.parent !== window) {
      const sess = window.parent.localStorage && window.parent.localStorage.getItem('mp_session');
      if (sess && sess.includes(mob)) return true;
    }
  } catch {}
  // Navigated from Man Power (top-level) with ?from=mp&mobile=...
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'mp') {
      const m = String(params.get('mobile') || '').replace(/\D/g, '').slice(-10);
      if (m && m === mob) return true;
    }
  } catch {}
  return false;
}

MG.init = async function() {
  // Theme
  MG.applyTheme(localStorage.getItem(MG.THEME_KEY) || 'light');
  MG.bindEvents();

  // Site logout (website only — hidden inside Man Power iframe)
  try {
    var lo = document.getElementById('siteLogoutBtn');
    if (lo) {
      if (MG.isInsideManPower()) lo.style.display = 'none';
      else lo.addEventListener('click', function () { MG.doSiteLogout(); });
    }
  } catch (e) {}


  // Wait a moment for Firebase module
  for (let i = 0; i < 15 && !(window.MentorFB && window.MentorFB.ready); i++) {
    await new Promise(r => setTimeout(r, 100));
  }

  if (MG.SECURE_DATA_ENABLED || MG.SECURE_BOOKINGS_ENABLED) {
    window.addEventListener('mentor-auth-changed', function () {
      MG.updateGuestUpgrade?.();
      if (!MG.state.mobile || MG.$('#app')?.classList.contains('hidden')) return;
      const current = window.MentorFB?.auth?.currentUser;
      const phone = MG.firebasePhone(current);
      if (!phone) MG.showVerifiedSignIn(MG.state.mobile);
      else if (current.uid !== MG.state.authUid || phone !== MG.state.mobile) void MG.startApp(phone);
    });
  }
  const session = await MG.verifiedFirebaseSession();
  if (session) {
    MG.setSiteAuth(session.mobile);
    await MG.startApp(session.mobile);
    return;
  }

  // Shared sessions can prefill OTP sign-in in secure mode.
  let detected = MG.parentManPowerMobile() || MG.getSiteAuthMobile() || MG.detectMobile();
  if (MG.SECURE_DATA_ENABLED || MG.SECURE_BOOKINGS_ENABLED) {
    MG.showVerifiedSignIn(detected);
    return;
  }
  if (!detected) {
    detected = await MG.requestMobileFromParent();
  }
  // Inside Man Power iframe: always trust parent phone if present
  if (MG.isInsideManPower() && MG.parentManPowerMobile()) {
    detected = MG.parentManPowerMobile();
    MG.setSiteAuth(detected);
    MG.startApp(detected);
    return;
  }
  // Top-level open from Man Power Learn & Grow (?from=mp&mobile=)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'mp') {
      const m = String(params.get('mobile') || detected || '').replace(/\D/g, '').slice(-10);
      if (/^[6-9]\d{9}$/.test(m)) {
        MG.setSiteAuth(m);
        MG.startApp(m);
        return;
      }
    }
  } catch (e) {}

  // Only auto-enter if this mobile was OTP-verified (or Man Power parent session)
  if (detected && MG.isMobileVerified(detected)) {
    MG.startApp(detected);
  } else {
    var _mp = MG.$('#mobilePrompt');
    if (_mp) { _mp.classList.remove('hidden'); _mp.classList.add('flex'); }
    if (detected) {
      const input = MG.$('#mobileInput');
      if (input) input.value = detected;
    }
    MG.$('#mobileInput')?.focus();
  }
}

MG.showVerifiedSignIn = function(mob) {
  appStart++;
  MG.$('#app')?.classList.add('hidden');
  const prompt = MG.$('#mobilePrompt');
  const alreadyShowing = prompt?.classList.contains('flex');
  prompt?.classList.remove('hidden');
  prompt?.classList.add('flex');
  MG.updateGuestUpgrade?.();
  const activeStep = ['#otpStepCode', '#otpStepQuick', '#otpStepSetup'].some(selector => {
    const step = MG.$(selector);
    return step && !step.classList.contains('hidden');
  });
  if (alreadyShowing && activeStep) return;
  MG.showOtpStep?.(false);
  const input = MG.$('#mobileInput');
  if (input && mob) input.value = mob;
  input?.focus();
};

MG.startApp = async function(mob) {
  const run = ++appStart;
  if (MG.SECURE_DATA_ENABLED || MG.SECURE_BOOKINGS_ENABLED) {
    const session = await MG.verifiedFirebaseSession(mob);
    if (run !== appStart) return;
    if (!session) {
      MG.showVerifiedSignIn(mob);
      return;
    }
    if (MG.state.authUid && MG.state.authUid !== session.user.uid) {
      const problem = MG.$('#fbProblemInput');
      if (problem) problem.value = '';
      const focus = MG.$('#bookingTopicCustom');
      if (focus) focus.value = '';
      MG.$('#fastAppointmentPicker')?.appointmentPicker?.clear();
      MG.$('#standardAppointmentPicker')?.appointmentPicker?.clear();
      MG.closeBooking?.();
    }
    mob = session.mobile;
    MG.state.authUid = session.user.uid;
    MG.state.viewingAs = null;
  }
  MG.state.mobile = mob;
  MG.state.isMentor = false;
  MG.state.data = MG.SECURE_DATA_ENABLED ? MG.emptyUserData(mob) : MG.loadUserData(mob);
  try { if (MG.ensureProgressFields) MG.ensureProgressFields(MG.state.data); } catch (e0) {}
  try { MG.refreshProfileButton(); } catch (e) {}
  try { if (typeof MG.updateSignedInLabel === 'function') MG.updateSignedInLabel(); } catch (e2) {}

  
  try {
    var ban = document.getElementById('addNameBanner');
    var _pf = (typeof MG.getProfile === 'function') ? MG.getProfile(MG.state.mobile) : (MG.state.data && MG.state.data.profile) || {};
    var _nm = String((_pf && (_pf.name || _pf.fullName)) || '').trim();
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('mg_name_banner_dismiss') === '1'; } catch (eD) {}
    if (ban) {
      if (!_nm && !dismissed) ban.classList.remove('hidden');
      else ban.classList.add('hidden');
      var btn = document.getElementById('addNameBtn');
      var later = document.getElementById('addNameLater');
      if (btn && !btn._mgBound) {
        btn._mgBound = true;
        btn.addEventListener('click', function () {
          try { if (typeof MG.openProfileModal === 'function') MG.openProfileModal(); } catch (e1) {}
        });
      }
      if (later && !later._mgBound) {
        later._mgBound = true;
        later.addEventListener('click', function () {
          try { sessionStorage.setItem('mg_name_banner_dismiss', '1'); } catch (e2) {}
          ban.classList.add('hidden');
        });
      }
    }
  } catch (eBan) {}


  MG.$('#mentorBadge')?.classList.add('hidden');
  MG.$('#mentorStudentBar')?.classList.add('hidden');
  // Mentor unlock control: only admin number
  try {
    var pinBtn = document.getElementById('mentorPinBtn');
    if (pinBtn) {
      if (String(mob) === MG.MENTOR_MOBILE) {
        pinBtn.style.display = '';
        pinBtn.removeAttribute('hidden');
      } else {
        pinBtn.style.display = 'none';
        pinBtn.setAttribute('hidden', 'true');
      }
    }
  } catch (e) {}
  // Admin mobile: auto Mentor mode (no OTP / no key click) — website or Man Power session
  try {
    if (String(mob) === MG.MENTOR_MOBILE) {
      MG.enableMentorMode({ silent: true });
    }
  } catch (e) {}
  try { MG.loadTrackSettings(); } catch (e) {}
  MG.$('#mobilePrompt').classList.add('hidden');
  MG.$('#mobilePrompt').classList.remove('flex');
  MG.$('#app').classList.remove('hidden');
  MG.renderCatalog();
  try { MG.renderFreePackSection(); } catch (eF) {}
  // Then refresh from Firebase
  try {
    const data = await MG.loadUserDataAsync(mob);
    if (run !== appStart) return;
    MG.state.data = data;
    try { if (MG.ensureProgressFields) MG.ensureProgressFields(MG.state.data); } catch (e1) {}
    MG.startRealtimeFor(MG.state.mobile);
    try { MG.refreshProfileButton(); } catch (ePf) {}
    try { if (typeof MG.updateSignedInLabel === 'function') MG.updateSignedInLabel(); } catch (eLb2) {} /* updateSignedInLabel after async */
    MG.renderCatalog();
    try { MG.renderFreePackSection(); } catch (eF2) {}
  } catch (e) {}
  if (run !== appStart) return;
  try { if (MG.handleMentorDeepLink) MG.handleMentorDeepLink(); } catch (eDL) {}
}

MG.esc = function(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ========== Events ==========
MG.bindEvents = function() {
  // Mobile prompt
  // ---- Firebase Phone OTP login ----
  let _pendingMobile = null;

  MG.hideAllLoginSteps = function() {
    ['#otpStepPhone', '#otpStepCode', '#otpStepQuick', '#otpStepSetup'].forEach(function (sel) {
      var el = MG.$(sel);
      if (el) el.classList.add('hidden');
    });
  };

  MG.showOtpStep = function(showCode) {
    MG.hideAllLoginSteps();
    const phone = MG.$('#otpStepPhone');
    const code = MG.$('#otpStepCode');
    if (showCode) {
      if (code) code.classList.remove('hidden');
      MG.$('#loginTitle').textContent = (MG.t ? MG.t('otpTitle') : 'Enter OTP');
      MG.$('#loginSub').textContent = 'OTP sent to +91 ' + _pendingMobile;
      setTimeout(function () { MG.$('#otpInput') && MG.$('#otpInput').focus(); }, 100);
    } else {
      if (phone) phone.classList.remove('hidden');
      MG.$('#loginTitle').textContent = (MG.t ? MG.t('loginTitle') : 'Login with Mobile OTP');
      MG.$('#loginSub').textContent = 'Enter mobile number to continue';
    }
  };

  MG.showQuickLoginStep = function(mobile) {
    _pendingMobile = mobile;
    MG.hideAllLoginSteps();
    var q = MG.$('#otpStepQuick');
    if (q) q.classList.remove('hidden');
    MG.$('#loginTitle').textContent = (MG.t ? MG.t('welcomeBack') : 'Welcome back');
    MG.$('#loginSub').textContent = 'Unlock +91 ' + mobile + ' on this device';
    var fpBtn = MG.$('#quickFingerprintBtn');
    var pwWrap = MG.$('#quickPasswordWrap');
    if (fpBtn) {
      if (MG.hasDeviceFingerprint(mobile) && MG.supportsWebAuthn()) {
        fpBtn.classList.remove('hidden');
      } else {
        fpBtn.classList.add('hidden');
      }
    }
    if (pwWrap) {
      pwWrap.style.display = MG.hasDevicePassword(mobile) ? '' : 'none';
    }
    setTimeout(function () {
      var inp = MG.$('#quickPasswordInput');
      if (inp && MG.hasDevicePassword(mobile)) inp.focus();
    }, 100);
  };

  MG.showDeviceSetupStep = function(mobile) {
    _pendingMobile = mobile;
    MG.hideAllLoginSteps();
    var s = MG.$('#otpStepSetup');
    if (s) s.classList.remove('hidden');
    MG.$('#loginTitle').textContent = (MG.t ? MG.t('rememberDevice') : 'Remember this device');
    MG.$('#loginSub').textContent = 'Optional local unlock while your Firebase session is active';
    var fpBtn = MG.$('#setupFingerprintBtn');
    if (fpBtn) {
      fpBtn.style.display = MG.supportsWebAuthn() ? '' : 'none';
    }
  };

  let loginBusy = false;
  let accountConflict = false;
  let requiresNewCode = false;
  const numberFromInput = () => MG.extractMobileFromString(MG.$('#mobileInput')?.value || '');
  const phoneError = message => loginError('#mobileError', message);
  const codeError = message => loginError('#otpError', message);
  const loginButtons = ['#mobileSubmit', '#upgradeGuestBtn', '#otpVerifyBtn', '#otpResendBtn', '#otpChangeNumBtn',
    '#continueExistingPhoneAccountBtn', '#quickPasswordBtn', '#quickFingerprintBtn', '#quickUseOtpBtn', '#quickChangeNumBtn'];

  function loginError(selector, message) {
    const node = MG.$(selector);
    if (!node) return;
    node.textContent = message || '';
    node.classList.toggle('hidden', !message);
  }

  function codeActions(conflict = false, expired = false) {
    accountConflict = conflict;
    requiresNewCode = expired;
    MG.$('#phoneAccountConflict')?.classList.toggle('hidden', !conflict);
    MG.$('#otpVerifyBtn')?.classList.toggle('hidden', conflict || expired);
    MG.$('#otpResendBtn')?.classList.toggle('hidden', conflict);
    const input = MG.$('#otpInput');
    if (input) input.disabled = conflict || expired;
  }

  async function runLogin(action) {
    if (loginBusy) return;
    loginBusy = true;
    loginButtons.forEach(selector => { const node = MG.$(selector); if (node) node.disabled = true; });
    try { await action(); }
    finally {
      loginButtons.forEach(selector => { const node = MG.$(selector); if (node) node.disabled = false; });
      loginBusy = false;
    }
  }

  MG.updateGuestUpgrade = function() {
    MG.$('#upgradeGuestBtn')?.classList.toggle('hidden', window.MentorFB?.auth?.currentUser?.isAnonymous !== true);
  };

  MG.finishLogin = async function(mobile) {
    const session = await MG.verifiedFirebaseSession(mobile);
    if (!session) {
      changeNumber(true);
      phoneError('The Firebase session could not be restored. Request a new OTP.');
      return;
    }
    MG.setSiteAuth(mobile);
    if (!MG.canQuickLogin(mobile)) {
      MG.showDeviceSetupStep(mobile);
      return;
    }
    MG.showToast('Login verified');
    await MG.startApp(mobile);
  };

  function enterCode(message) {
    codeActions();
    MG.$('#otpInput').value = '';
    codeError('');
    MG.showOtpStep(true);
    if (message) MG.$('#loginSub').textContent = message;
  }

  async function sendCode(mobile, mode = 'sign-in', message = '') {
    _pendingMobile = mobile;
    phoneError('');
    MG.showOtpStep(false);
    try {
      const bridge = window.MentorFB;
      if (!bridge?.sendPhoneOtp) {
        phoneError('Firebase is still loading. Try again in a moment.');
        return;
      }
      await bridge.sendPhoneOtp(mobile, { mode });
      enterCode(message);
      MG.showToast('OTP sent');
    } catch (error) {
      phoneError(MG.phoneAuthMessage(error, 'Could not send an OTP. Try again.'));
    }
  }

  MG.onMobileContinue = () => runLogin(async () => {
    const mobile = numberFromInput();
    if (!mobile) { phoneError('Enter a valid 10-digit Indian mobile number.'); return; }
    phoneError('');
    _pendingMobile = mobile;
    const remembered = MG.canQuickLogin(mobile);
    if (remembered && await MG.verifiedFirebaseSession(mobile, true)) {
      MG.showQuickLoginStep(mobile);
      return;
    }
    await sendCode(mobile, 'sign-in', remembered ? 'Verify this phone by SMS to restore your Firebase session.' : '');
  });

  MG.verifyMentorOtp = () => runLogin(async () => {
    if (accountConflict || requiresNewCode) return;
    const code = (MG.$('#otpInput').value || '').trim();
    if (!/^[0-9]{6}$/.test(code)) { codeError('Enter the 6-digit OTP from your SMS.'); return; }
    codeError('');
    try {
      const user = await window.MentorFB.verifyPhoneOtp(code);
      MG.$('#otpInput').value = '';
      await MG.finishLogin(MG.firebasePhone(user));
    } catch (error) {
      if (error?.code === 'mentor/account-conflict') {
        codeActions(true);
        MG.$('#otpInput').value = '';
      } else if (['auth/session-expired', 'auth/code-expired', 'auth/invalid-verification-id', 'auth/missing-verification-id',
        'auth/invalid-credential', 'auth/invalid-login-credentials', 'mentor/account-changed'].includes(error?.code)) {
        codeActions(false, true);
        MG.$('#otpInput').value = '';
      }
      codeError(MG.phoneAuthMessage(error, 'Phone verification failed. Try again or request a new OTP.'));
    }
  });

  MG.continueWithExistingPhoneAccount = () => runLogin(async () => {
    codeError('');
    try {
      const result = await window.MentorFB.continueWithExistingPhoneAccount();
      if (result.status === 'code-required') {
        enterCode('A new OTP was sent for your existing account. Use the latest SMS.');
      } else {
        await MG.finishLogin(MG.firebasePhone(result.user));
      }
    } catch (error) {
      codeError(MG.phoneAuthMessage(error, 'Could not continue. Try again to request a new OTP.'));
    }
  });

  function changeNumber(force = false) {
    if ((loginBusy && force !== true) || window.MentorFB?.cancelPhoneOtp?.() === false) return;
    _pendingMobile = null;
    MG.$('#otpInput').value = '';
    const password = MG.$('#quickPasswordInput');
    if (password) password.value = '';
    codeActions();
    phoneError('');
    codeError('');
    MG.showOtpStep(false);
    MG.$('#mobileInput')?.focus();
  }

  MG.$('#mobileSubmit')?.addEventListener('click', MG.onMobileContinue);
  MG.$('#mobileInput')?.addEventListener('keydown', event => { if (event.key === 'Enter') MG.onMobileContinue(); });
  MG.$('#upgradeGuestBtn')?.addEventListener('click', () => runLogin(async () => {
    const mobile = numberFromInput();
    if (!mobile) { phoneError('Enter a valid 10-digit Indian mobile number.'); return; }
    await sendCode(mobile, 'upgrade');
  }));
  MG.$('#otpVerifyBtn')?.addEventListener('click', MG.verifyMentorOtp);
  MG.$('#continueExistingPhoneAccountBtn')?.addEventListener('click', MG.continueWithExistingPhoneAccount);
  MG.$('#otpInput')?.addEventListener('keydown', event => { if (event.key === 'Enter') MG.verifyMentorOtp(); });
  MG.$('#otpResendBtn')?.addEventListener('click', () => runLogin(async () => {
    codeError('');
    try {
      await window.MentorFB.resendPhoneOtp();
      enterCode('A new OTP was sent. Use the latest SMS.');
    } catch (error) {
      codeActions(false, true);
      codeError(MG.phoneAuthMessage(error, 'Could not send a new code. Try again.'));
    }
  }));
  MG.$('#otpChangeNumBtn')?.addEventListener('click', changeNumber);
  MG.$('#quickChangeNumBtn')?.addEventListener('click', changeNumber);
  MG.$('#quickUseOtpBtn')?.addEventListener('click', () => runLogin(() => sendCode(_pendingMobile)));

  async function unlockLocally(check, failed) {
    const mobile = _pendingMobile;
    const session = await MG.verifiedFirebaseSession(mobile, true);
    if (!session) {
      await sendCode(mobile, 'sign-in', 'Verify this phone by SMS to restore your Firebase session.');
      return;
    }
    if (!await check(mobile)) { failed(); return; }
    const restored = await MG.verifiedFirebaseSession(mobile);
    if (restored?.user.uid !== session.user.uid) {
      await sendCode(mobile, 'sign-in', 'Verify this phone by SMS to restore your Firebase session.');
      return;
    }
    MG.setSiteAuth(mobile);
    MG.showToast('Unlocked');
    await MG.startApp(mobile);
  }

  MG.$('#quickPasswordBtn')?.addEventListener('click', () => runLogin(async () => {
    const input = MG.$('#quickPasswordInput');
    const password = input.value;
    input.value = '';
    loginError('#quickPasswordError', '');
    try {
      await unlockLocally(mobile => MG.verifyDevicePassword(mobile, password),
        () => loginError('#quickPasswordError', 'Incorrect device password.'));
    } catch {
      loginError('#quickPasswordError', 'Could not unlock this device. Use an OTP to continue.');
    }
  }));
  MG.$('#quickPasswordInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') MG.$('#quickPasswordBtn')?.click();
  });
  MG.$('#quickFingerprintBtn')?.addEventListener('click', () => runLogin(async () => {
    try {
      await unlockLocally(MG.verifyFingerprint, () => MG.showToast('Fingerprint check failed. Try your password or an OTP.'));
    } catch {
      MG.showToast('Could not use fingerprint. Try your password or an OTP.');
    }
  }));

  // First-login device setup
  MG.$('#setupPasswordBtn')?.addEventListener('click', async function () {
    var p1 = (MG.$('#setupPasswordInput').value || '');
    var p2 = (MG.$('#setupPasswordConfirm').value || '');
    var err = MG.$('#setupPasswordError');
    if (p1.length < 4) {
      if (err) { err.textContent = 'Password must be at least 4 characters'; err.classList.remove('hidden'); }
      return;
    }
    if (p1 !== p2) {
      if (err) { err.textContent = 'Passwords do not match'; err.classList.remove('hidden'); }
      return;
    }
    if (err) err.classList.add('hidden');
    try {
      if (!await MG.verifiedFirebaseSession(_pendingMobile)) { changeNumber(); return; }
      MG.$('#setupPasswordInput').value = MG.$('#setupPasswordConfirm').value = '';
      await MG.setDevicePassword(_pendingMobile, p1);
      MG.showToast('Password saved for this device');
      MG.setSiteAuth(_pendingMobile);
      MG.startApp(_pendingMobile);
    } catch (e) {
      if (err) { err.textContent = (e && e.message) || 'Could not save password'; err.classList.remove('hidden'); }
    }
  });
  MG.$('#setupFingerprintBtn')?.addEventListener('click', async function () {
    var btn = MG.$('#setupFingerprintBtn');
    if (btn) { btn.disabled = true; }
    try {
      if (!await MG.verifiedFirebaseSession(_pendingMobile)) { changeNumber(); return; }
      await MG.registerFingerprint(_pendingMobile);
      MG.showToast('Fingerprint enabled');
      MG.setSiteAuth(_pendingMobile);
      MG.startApp(_pendingMobile);
    } catch (e) {
      MG.showToast((e && e.message) || 'Fingerprint setup failed');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  MG.$('#setupSkipBtn')?.addEventListener('click', function () {
    MG.setSiteAuth(_pendingMobile);
    MG.showToast('Login verified');
    MG.startApp(_pendingMobile);
  });

  // Header
  var _bb = MG.$('#backBtn'); if (_bb) _bb.style.display = 'none'; /* removed website-style back arrow */
if (false && _bb) _bb.addEventListener('click', () => {
    // Prefer in-app navigation; never silently kill the window
    try {
      // If catalog is hidden and a track/workspace is open, go to catalog first
      var catalog = document.getElementById('catalogView');
      var workspace = document.getElementById('workspaceView') || document.getElementById('trackWorkspace');
      if (workspace && !workspace.classList.contains('hidden') && catalog) {
        if (typeof MG.showCatalog === 'function') { MG.showCatalog(); return; }
        workspace.classList.add('hidden');
        catalog.classList.remove('hidden');
        return;
      }
      // Inside Packaging / Career path → back to path picker
      var secP = document.getElementById('sectionPackaging');
      var secC = document.getElementById('sectionCareer');
      var inPath = (secP && !secP.classList.contains('hidden')) || (secC && !secC.classList.contains('hidden'));
      if (inPath && typeof MG.showCategory === 'function') {
        MG.showCategory(null);
        return;
      }
    } catch (e0) {}
    var canBack = false;
    try { canBack = window.history.length > 1; } catch (e1) {}
    // Opened from Man Power / another page with history → go back
    if (canBack) {
      var ref = '';
      try { ref = String(document.referrer || ''); } catch (e2) {}
      if (ref && !/mentor\.vkstech\.com/i.test(ref)) {
        window.history.back();
        return;
      }
      // Same-site history: still try back once
      try {
        var before = location.href;
        window.history.back();
        setTimeout(function () {
          if (location.href === before) {
            if (window.confirm((typeof MG!=='undefined'&&MG.t)?MG.t('closeApp'):'Close Mentor app?')) {
              try { window.close(); } catch (e3) {}
            }
          }
        }, 200);
        return;
      } catch (e4) {}
    }
    // No history / standalone PWA: ask before closing
    if (window.confirm((typeof MG!=='undefined'&&MG.t)?MG.t('closeApp'):'Close Mentor app?')) {
      try { window.close(); } catch (e5) {}
      // If browser blocks window.close, user can use OS close (X)
    }
  });
  var _tt = MG.$('#themeToggle'); if (_tt) _tt.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    MG.applyTheme(isDark ? 'light' : 'dark');
  });
  var _ph = MG.$('#paymentHistoryBtn'); if (_ph) _ph.addEventListener('click', function(){ MG.openHistory(); });
  var _ch=MG.$('#closeHistory'); if(_ch) _ch.addEventListener('click', () => {
    MG.$('#historyModal').classList.add('hidden');
    MG.$('#historyModal').classList.remove('flex');
  });
  var _ex = MG.$('#exportCsvBtn'); if (_ex) _ex.addEventListener('click', function(){ MG.exportCsv(); });

  // Mentor OTP (protected)
  var _mpb=MG.$('#mentorPinBtn'); if(_mpb) _mpb.addEventListener('click', () => {
    if (MG.state.isMentor) {
      MG.showToast('Already in Mentor mode');
      return;
    }
    // Must be logged in as the mentor number
    if (MG.state.mobile !== MG.MENTOR_MOBILE) {
      MG.showToast('Switch to admin number +91 ' + MG.MENTOR_MOBILE + ' to request OTP');
      return;
    }
    MG.requestMentorOTP();
  });
  var _ps=MG.$('#pinSubmit'); if(_ps) _ps.addEventListener('click', () => {
    MG.verifyMentorOTP();
  });
  var _mpi=MG.$('#mentorPinInput'); if(_mpi) _mpi.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') MG.verifyMentorOTP();
  });
  var _pc=MG.$('#pinCancel'); if(_pc) _pc.addEventListener('click', () => {
    MG.$('#pinModal').classList.add('hidden');
    MG.$('#pinModal').classList.remove('flex');
  });

  // Student selector
  var _ss=MG.$('#studentSelect'); if(_ss) _ss.addEventListener('change', (e) => {
    MG.switchStudent(e.target.value || null);
  });
  var _rs = MG.$('#refreshStudentsBtn'); if (_rs) _rs.addEventListener('click', function(){ MG.refreshStudentList(); });

  // Booking
  var _cb = MG.$('#closeBooking'); if (_cb) _cb.addEventListener('click', function(){ MG.closeBooking(); });
  MG.$$('.hrs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      MG.state.selectedHours = Number(btn.dataset.hrs) || 1;
      MG.selectedPackageDisc = parseInt(btn.dataset.disc, 10) || 0;
      MG.$$('.hrs-btn').forEach(b => b.classList.remove('active-hrs'));
      btn.classList.add('active-hrs');
      MG.updateBookingTotal();
      document.getElementById('standardAppointmentPicker')?.appointmentPicker?.refresh();
    });
  });
  document.querySelectorAll('.track-card').forEach(function (btn) {
    btn.addEventListener('click', function () {
      MG.selectTrack(btn.getAttribute('data-track'));
    });
  });
  var focusSel = document.getElementById('bookingTopicFocus');
  if (focusSel) {
    focusSel.addEventListener('change', function () {
      var c = document.getElementById('bookingTopicCustom');
      if (c) c.classList.toggle('hidden', focusSel.value !== '__custom__');
    });
  }
  var _pay = MG.$('#payNowBtn'); if (_pay) _pay.addEventListener('click', function(e){
    if (MG.SECURE_BOOKINGS_ENABLED || MG.state.viewingAs || MG.state.isMentor) e.preventDefault();
    try { if (typeof MG.notifyMentorPayIntent === 'function') MG.notifyMentorPayIntent(); } catch (e) {}
  });
  var _cp = MG.$('#confirmPaidBtn'); if (_cp) _cp.addEventListener('click', function(){ MG.confirmPayment(); });
  var pricingBtn = document.getElementById('pricingAdminBtn');
  if (pricingBtn) {
    pricingBtn.addEventListener('click', function(){ (window.openPricingAdmin||MG.openPricingAdmin)(); });
  }
  var closePr = document.getElementById('closePricingAdmin');
  if (closePr) closePr.addEventListener('click', function () {
    var m = document.getElementById('pricingAdminModal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); m.style.display = 'none'; }
  });
  var pricingModalEl = document.getElementById('pricingAdminModal');
  if (pricingModalEl) {
    pricingModalEl.addEventListener('click', function (e) {
      if (e.target === pricingModalEl) {
        pricingModalEl.classList.add('hidden');
        pricingModalEl.classList.remove('flex');
        pricingModalEl.style.display = 'none';
      }
    });
  }
  var savePr = document.getElementById('savePricingAdmin');
  if (savePr) savePr.addEventListener('click', function(){ (window.savePricingAdmin||MG.savePricingAdmin)(); });

  // Workspace
  var _btc = MG.$('#backToCatalog'); if (_btc) _btc.addEventListener('click', function(){ MG.backToCatalog(); });
  MG.$('#bookMoreBtn').addEventListener('click', () => {
    if (MG.state.currentTopicId) MG.openBooking(MG.state.currentTopicId);
  });
  var _ar = MG.$('#addRecBtn'); if (_ar) _ar.addEventListener('click', function(){ MG.addRecording(); });
  var _sc = MG.$('#sendChatBtn'); if (_sc) _sc.addEventListener('click', function(){ MG.sendChat(); });
  var _ci=MG.$('#chatInput'); if(_ci) _ci.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') MG.sendChat();
  });
}


// Boot
document.addEventListener('DOMContentLoaded', function () {
  void MG.init().catch(error => console.warn('[Mentor] initialization failed', error?.code || 'unavailable'));
  try {
    var appEl = document.getElementById('app');
    var mp = document.getElementById('mobilePrompt');
    if (mp && appEl && appEl.classList.contains('hidden') && mp.classList.contains('hidden')) {
      mp.classList.remove('hidden'); mp.classList.add('flex');
    }
  } catch (e2) {}
  try { MG.loadTrackSettings(); } catch (e) {}
  try { MG.initMentorPwaUi();
  try { MG.initProfileUi(); } catch (e) {} } catch (e) {}
  try {
    if (MG.state && MG.state.data && MG.ensureProgressFields) MG.ensureProgressFields(MG.state.data);
  } catch (eP) {}
  try { MG.renderFreePackSection(); } catch (e) {}
  try { if (MG.handleMentorDeepLink) MG.handleMentorDeepLink(); } catch (eDL) {}
});

})(window.MG = window.MG || {});

// Re-apply language after UI settles
try {
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ try{ if(MG.applyLang) MG.applyLang(); }catch(e){} }, 300);
    setTimeout(function(){ try{ if(MG.applyLang) MG.applyLang(); }catch(e){} }, 1200);
  });
} catch (e) {}

/* mg_offline_hook */
window.addEventListener('offline', function () {
  try {
    if (window.MG && MG.showToast) {
      MG.showToast(MG.t ? MG.t('offlineRetry') : 'You appear offline. Tap to retry.');
    }
  } catch (e) {}
});

/* mg_escape_modals */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  try {
    ['bookingModal', 'historyModal', 'mentorLangModal', 'pinModal'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.classList.contains('hidden')) {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });
  } catch (err) {}
});
