/* FEATURE MODULE: app-init-events
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== Init Flow ==========
MG.isMobileVerified = function(mob) {
  if (!mob) return false;
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

  // Detect mobile: Man Power parent first (no OTP), then site shared auth, then URL/storage
  let detected = MG.parentManPowerMobile() || MG.getSiteAuthMobile() || MG.detectMobile();
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

MG.startApp = async function(mob) {
  MG.state.mobile = mob;
  MG.state.isMentor = false;
  MG.state.data = MG.loadUserData(MG.state.mobile); // instant from cache
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
    MG.state.data = await MG.loadUserDataAsync(MG.state.mobile);
    try { if (MG.ensureProgressFields) MG.ensureProgressFields(MG.state.data); } catch (e1) {}
    MG.startRealtimeFor(MG.state.mobile);
    try { MG.refreshProfileButton(); } catch (ePf) {}
    try { if (typeof MG.updateSignedInLabel === 'function') MG.updateSignedInLabel(); } catch (eLb2) {} /* updateSignedInLabel after async */
    MG.renderCatalog();
    try { MG.renderFreePackSection(); } catch (eF2) {}
  } catch (e) {}
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
      MG.$('#loginTitle').textContent = 'Enter OTP';
      MG.$('#loginSub').textContent = 'OTP sent to +91 ' + _pendingMobile;
      setTimeout(function () { MG.$('#otpInput') && MG.$('#otpInput').focus(); }, 100);
    } else {
      if (phone) phone.classList.remove('hidden');
      MG.$('#loginTitle').textContent = 'Login with Mobile OTP';
      MG.$('#loginSub').textContent = 'Enter mobile number to continue';
    }
  };

  MG.showQuickLoginStep = function(mobile) {
    _pendingMobile = mobile;
    MG.hideAllLoginSteps();
    var q = MG.$('#otpStepQuick');
    if (q) q.classList.remove('hidden');
    MG.$('#loginTitle').textContent = 'Welcome back';
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
    MG.$('#loginTitle').textContent = 'Remember this device';
    MG.$('#loginSub').textContent = 'Optional — skip OTP next time on this phone';
    var fpBtn = MG.$('#setupFingerprintBtn');
    if (fpBtn) {
      fpBtn.style.display = MG.supportsWebAuthn() ? '' : 'none';
    }
  };

  MG.finishLogin = function(mobile, opts) {
    opts = opts || {};
    MG.setSiteAuth(mobile);
    var needSetup = !MG.canQuickLogin(mobile);
    if (opts.forceSetup || needSetup) {
      MG.showDeviceSetupStep(mobile);
      return;
    }
    MG.showToast('Login verified');
    MG.startApp(mobile);
  };

  MG.sendMentorOtp = async function() {
    const val = (MG.$('#mobileInput').value || '').trim();
    const m = MG.extractMobileFromString(val) || (/^[6-9]\d{9}$/.test(val) ? val : null);
    if (!m) {
      MG.$('#mobileError')?.classList.remove('hidden');
      return;
    }
    MG.$('#mobileError')?.classList.add('hidden');
    const btn = MG.$('#mobileSubmit');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> Please wait…'; }
    try {
      if (!window.MentorFB || !window.MentorFB.sendPhoneOtp) {
        // Wait briefly for module
        await new Promise(r => setTimeout(r, 800));
      }
      if (!window.MentorFB || !window.MentorFB.sendPhoneOtp) {
        throw new Error('Firebase not ready. Refresh and try again.');
      }
      await window.MentorFB.sendPhoneOtp(m);
      _pendingMobile = m;
      MG.showOtpStep(true);
      MG.showToast('OTP sent to +91 ' + m);
    } catch (e) {
      console.error('[sendMentorOtp]', e);
      var code = (e && e.code) ? String(e.code) : '';
      var msg = (e && e.message) ? String(e.message) : 'Failed to send OTP';
      if (code.indexOf('too-many-requests') >= 0 || /too-many-requests/i.test(msg)) {
        msg = 'Too many OTP attempts. Wait a few minutes and try again.';
      } else if (/invalid-phone/i.test(code + msg)) {
        msg = 'Invalid mobile number.';
      } else if (/captcha|recaptcha|app-credential|invalid-app/i.test(msg + code)) {
        msg = 'Security check failed. Complete reCAPTCHA, and ensure mentor.vkstech.com is in Firebase Authorized domains.';
      } else if (/network|Failed to fetch|offline/i.test(msg)) {
        msg = 'Network error. Check internet and try again.';
      } else if (/Firebase not ready/i.test(msg)) {
        msg = 'App still loading. Wait 2 seconds and tap Send OTP again.';
      }
      MG.showToast(msg);
      var err = MG.$('#mobileError');
      if (err) { err.textContent = msg; err.classList.remove('hidden'); }
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-arrow-right mr-1.5"></i> Continue'; }
    }
  }

  MG.verifyMentorOtp = async function() {
    const code = (MG.$('#otpInput').value || '').trim();
    if (!/^[0-9]{6}$/.test(code)) {
      MG.$('#otpError')?.classList.remove('hidden');
      return;
    }
    MG.$('#otpError')?.classList.add('hidden');
    const btn = MG.$('#otpVerifyBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> Verifying…'; }
    try {
      await window.MentorFB.verifyPhoneOtp(code);
      MG.finishLogin(_pendingMobile, { forceSetup: !MG.canQuickLogin(_pendingMobile) });
    } catch (e) {
      console.error(e);
      MG.$('#otpError').textContent = 'Invalid OTP. Please try again.';
      MG.$('#otpError')?.classList.remove('hidden');
      MG.showToast('OTP verification failed');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check mr-1.5"></i> Verify & Continue'; }
    }
  };

  // After phone entered: if device remembered → quick login, else OTP
  MG.onMobileContinue = async function() {
    const val = (MG.$('#mobileInput').value || '').trim();
    const m = MG.extractMobileFromString(val) || (/^[6-9]\d{9}$/.test(val) ? val : null);
    if (!m) {
      MG.$('#mobileError')?.classList.remove('hidden');
      return;
    }
    MG.$('#mobileError')?.classList.add('hidden');
    _pendingMobile = m;
    if (MG.canQuickLogin(m)) {
      MG.showQuickLoginStep(m);
      return;
    }
    await MG.sendMentorOtp();
  };

  MG.$('#mobileSubmit')?.addEventListener('click', function () { MG.onMobileContinue(); });
  MG.$('#mobileInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') MG.onMobileContinue();
  });
  MG.$('#otpVerifyBtn')?.addEventListener('click', function () { MG.verifyMentorOtp(); });
  MG.$('#otpInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') MG.verifyMentorOtp();
  });
  MG.$('#otpResendBtn')?.addEventListener('click', async () => {
    if (_pendingMobile) {
      MG.$('#mobileInput').value = _pendingMobile;
      MG.showOtpStep(false);
      await MG.sendMentorOtp();
    }
  });
  MG.$('#otpChangeNumBtn')?.addEventListener('click', () => {
    _pendingMobile = null;
    MG.showOtpStep(false);
    MG.$('#otpInput').value = '';
  });

  // Quick login handlers
  MG.$('#quickPasswordBtn')?.addEventListener('click', async function () {
    var pw = (MG.$('#quickPasswordInput').value || '');
    var err = MG.$('#quickPasswordError');
    var btn = MG.$('#quickPasswordBtn');
    if (btn) { btn.disabled = true; }
    try {
      var ok = await MG.verifyDevicePassword(_pendingMobile, pw);
      if (!ok) {
        if (err) { err.classList.remove('hidden'); }
        MG.showToast('Incorrect password');
        return;
      }
      if (err) err.classList.add('hidden');
      MG.setSiteAuth(_pendingMobile);
      MG.showToast('Unlocked');
      MG.startApp(_pendingMobile);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  MG.$('#quickPasswordInput')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') MG.$('#quickPasswordBtn') && MG.$('#quickPasswordBtn').click();
  });
  MG.$('#quickFingerprintBtn')?.addEventListener('click', async function () {
    var btn = MG.$('#quickFingerprintBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> Waiting…'; }
    try {
      var ok = await MG.verifyFingerprint(_pendingMobile);
      if (!ok) {
        MG.showToast('Fingerprint failed — try password or OTP');
        return;
      }
      MG.setSiteAuth(_pendingMobile);
      MG.showToast('Unlocked');
      MG.startApp(_pendingMobile);
    } catch (e) {
      MG.showToast('Fingerprint cancelled');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-fingerprint mr-1.5"></i> Unlock with fingerprint'; }
    }
  });
  MG.$('#quickUseOtpBtn')?.addEventListener('click', async function () {
    if (_pendingMobile) {
      MG.$('#mobileInput').value = _pendingMobile;
      await MG.sendMentorOtp();
    }
  });
  MG.$('#quickChangeNumBtn')?.addEventListener('click', function () {
    _pendingMobile = null;
    MG.showOtpStep(false);
  });

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
      MG.state.selectedHours = parseInt(btn.dataset.hrs, 10) || 1;
      MG.selectedPackageDisc = parseInt(btn.dataset.disc, 10) || 0;
      MG.$$('.hrs-btn').forEach(b => b.classList.remove('active-hrs'));
      btn.classList.add('active-hrs');
      MG.updateBookingTotal();
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
  var _pay = MG.$('#payNowBtn'); if (_pay) _pay.addEventListener('click', function(){
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
  try { MG.init(); } catch (e) { console.error('MG.init', e); }
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
