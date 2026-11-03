/* FEATURE MODULE: pwa
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== PWA Install + Share + Play Store ==========
let _mentorDeferredPrompt = window.__mentorDeferredPrompt || null;
try {
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _mentorDeferredPrompt = e;
    window.__mentorDeferredPrompt = e;
    try {
      ['mentorInstallDesktopBtn','mentorInstallAndroidBtn','mentorInstallBtn'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) { el.classList.remove('hidden'); el.classList.add('ring-2','ring-offset-1','ring-blue-400'); }
      });
      var bar = document.getElementById('mentorInstallBar');
      if (bar) bar.classList.remove('hidden');
    } catch (err) {}
  });
} catch (e0) {}
// Shared on MG so Rates admin (mg-workspace) can read/write without ReferenceError
MG._playStoreUrl = MG._playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vkstech.mentor';

MG._mentorIsStandalone = function() {
  try {
    var standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || window.navigator.standalone === true;
    if (!standalone) return false;
    // If Chrome still offers install, Mentor is not fully installed as its own app
    if (window.__mentorDeferredPrompt) return false;
    return true;
  } catch (e) { return false; }
}

/** True only when this window is the installed Mentor app (not Man Power shell). */
MG._mentorIsInstalledApp = function() {
  try {
    if (!MG._mentorIsStandalone()) return false;
    var ref = String(document.referrer || '');
    if (/manpower\.vkstech\.com/i.test(ref)) return false;
    return true;
  } catch (e) { return MG._mentorIsStandalone(); }
}

MG._mentorUa = function() {
  var ua = navigator.userAgent || '';
  return {
    android: /android/i.test(ua),
    ios: /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    windows: /windows/i.test(ua),
    mac: /macintosh|mac os x/i.test(ua) && !(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    chrome: /chrome|crios|edg/i.test(ua) && !/opr\//i.test(ua)
  };
}


MG._showSharePlatformSheet = function() {
  var play = String(MG._playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vkstech.mentor');
  var web = 'https://mentor.vkstech.com/';
  var playSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512"><path fill="#00A0FF" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/><path fill="#00F076" d="M325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"/><path fill="#FFD500" d="M104.6 13L325.3 234.3 385.4 174.2 465.3 128 104.6 13z"/><path fill="#FF3A44" d="M104.6 499l360.7-115.2-79.9-46.1-60.1 60.1L104.6 499z"/><path fill="#00D6FF" d="M104.6 13v486L325.3 256 104.6 13z"/></svg>';
  var appleSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#1d1d1f"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 15 2.94 10.53 4.7 7.5c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>';
  var winSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="#0078D4" d="M3 5.1L10.5 4v7.2H3V5.1zm0 13.8v-6.3h7.5V20L3 18.9zM11.4 4L21 2.7v8.5h-9.6V4zM21 21.3L11.4 20v-7.2H21v8.5z"/></svg>';
  function row(bg, icon, label, sub, actionAttr) {
    return '<button type="button" class="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-left mb-2 hover:bg-slate-50 dark:hover:bg-slate-700" ' + actionAttr + '>' +
      '<span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:' + bg + '">' + icon + '</span>' +
      '<span class="min-w-0 flex-1"><span class="block text-sm font-bold text-slate-900 dark:text-white">' + label + '</span>' +
      '<span class="block text-xs text-slate-500 dark:text-slate-400">' + sub + '</span></span><span class="text-slate-400">›</span></button>';
  }
  var existing = document.getElementById('mentorShareSheet');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'mentorShareSheet';
  modal.className = 'fixed inset-0 z-[100000] flex items-end sm:items-center justify-center bg-black/50 p-3';
  modal.innerHTML =
    '<div class="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-600">' +
    '<div class="text-base font-bold text-slate-900 dark:text-white mb-1">📤 ' + ((MG.t&&MG.t('shareTitle'))||'Share App') + '</div>' +
    '<div class="text-xs text-slate-500 mb-4">' + ((MG.t&&MG.t('choosePlatform'))||'Choose platform') + '</div>' +
    row('rgba(0,0,0,.06)', appleSvg, 'iPhone / iPad', 'Apple · Web / Add to Home Screen', 'data-share-kind="ios"') +
    row('rgba(1,135,95,.12)', playSvg, 'Android', 'Google Play Store', 'data-share-kind="android"') +
    row('rgba(0,120,212,.12)', winSvg, 'Windows / Desktop', 'Web app · Install as PWA', 'data-share-kind="desktop"') +
    '<button type="button" id="mentorShareSheetNative" class="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">System share…</button>' +
    '<button type="button" id="mentorShareSheetClose" class="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-sm font-semibold">Cancel</button>' +
    '</div>';
  document.body.appendChild(modal);
  function close() { try { modal.remove(); } catch (e) {} }
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  var closeBtn = document.getElementById('mentorShareSheetClose');
  if (closeBtn) closeBtn.onclick = close;
  modal.querySelectorAll('[data-share-kind]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-share-kind');
      close();
      if (kind === 'android') window.open(play, '_blank', 'noopener');
      else if (kind === 'ios') { if (typeof MG._showInstallGuide === 'function') MG._showInstallGuide('ios'); else window.open(web, '_blank', 'noopener'); }
      else { if (typeof MG._showInstallGuide === 'function') MG._showInstallGuide('desktop'); else window.open(web, '_blank', 'noopener'); }
    });
  });
  var nat = document.getElementById('mentorShareSheetNative');
  if (nat) nat.onclick = async function () {
    close();
    var url = web, title = 'Mentor — One-to-One Guidance', text = 'Book Career & AI or Flexible Packaging mentorship with VKS Tech.';
    try {
      if (navigator.share) { await navigator.share({ title: title, text: text, url: url }); return; }
    } catch (e) {}
    try { await navigator.clipboard.writeText(url); MG.showToast('Link copied: mentor.vkstech.com'); }
    catch (e2) { prompt('Copy this link:', url); }
  };
};


MG.refreshPlayStoreButton = function() {
  const a = document.getElementById('mentorPlayStoreBtn');
  if (!a) return;
  const url = String(MG._playStoreUrl || '').trim();
  if (/^https?:\/\//i.test(url)) {
    a.href = url;
    a.classList.remove('hidden');
  } else {
    a.classList.add('hidden');
    a.removeAttribute('href');
  }
}

MG.loadAppPublicSettings = async function() {
  try {
    if (!window.MentorFB || typeof window.MentorFB.get !== 'function') return;
    const remote = await window.MentorFB.get('mentor_settings/app');
    if (remote && typeof remote === 'object') {
      if (remote.playStoreUrl) MG._playStoreUrl = String(remote.playStoreUrl);
      MG.refreshPlayStoreButton();
    }
  } catch (e) {}
}

MG._showInstallGuide = function(kind) {
  var title, body;
  if (kind === 'android') {
    title = 'Install on Android';
    body = '1. Open this page in <b>Chrome</b><br>2. Tap the menu (⋮) → <b>Install app</b> or <b>Add to Home screen</b><br>3. Confirm Install<br><br>Or wait for the Chrome install banner and tap Install.';
  } else if (kind === 'ios') {
    title = 'Install on iPhone / iPad';
    body = '1. Open in <b>Safari</b> (required)<br>2. Tap the <b>Share</b> button <span style="font-size:1.1em">⎋</span><br>3. Scroll and tap <b>Add to Home Screen</b><br>4. Tap <b>Add</b><br><br>Mentor will appear like a normal app icon.';
  } else {
    title = 'Install on Windows / Mac (Desktop)';
    body = '1. Open <b>https://mentor.vkstech.com/mentor.html</b> in <b>Chrome</b> or <b>Edge</b> (not inside the Man Power app window)<br>2. Click the <b>install icon</b> in the address bar (monitor / ⊕ icon)<br>3. Or menu ⋮ → <b>Cast, save and share</b> → <b>Install page as app</b><br>4. Confirm — Mentor appears in Start menu as its own app<br><br>Tip: If Install is missing, hard-refresh (Ctrl+Shift+R) on mentor.html first.';
  }
  var existing = document.getElementById('mentorInstallGuideModal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'mentorInstallGuideModal';
  modal.className = 'fixed inset-0 z-[100000] flex items-end sm:items-center justify-center bg-black/50 p-3';
  modal.innerHTML =
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-600">' +
    '<div class="flex items-start justify-between gap-3 mb-3">' +
    '<h3 class="text-base font-bold text-slate-900 dark:text-white">' + title + '</h3>' +
    '<button type="button" id="mentorInstallGuideClose" class="text-slate-400 hover:text-slate-700 text-xl leading-none px-1">&times;</button>' +
    '</div>' +
    '<div class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">' + body + '</div>' +
    '<button type="button" id="mentorInstallGuideOk" class="mt-4 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold">Got it</button>' +
    '</div>';
  document.body.appendChild(modal);
  function close() { try { modal.remove(); } catch (e) {} }
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  var c1 = document.getElementById('mentorInstallGuideClose');
  var c2 = document.getElementById('mentorInstallGuideOk');
  if (c1) c1.addEventListener('click', close);
  if (c2) c2.addEventListener('click', close);
}

MG._tryNativeInstall = async function(preferLabel) {
  var promptEvent = _mentorDeferredPrompt || window.__mentorDeferredPrompt || null;
  if (promptEvent) {
    try {
      promptEvent.prompt();
      var choice = await promptEvent.userChoice;
      if (choice && choice.outcome === 'accepted') {
        MG.showToast('Installing Mentor as desktop app…');
        try {
          var hint = document.getElementById('mentorInstallHint');
          if (hint) hint.textContent = 'Installed — open Mentor from Start menu / desktop.';
        } catch (eH) {}
      } else {
        MG.showToast('Install cancelled — use Chrome menu ⋮ → Install Mentor…');
      }
    } catch (e) {
      console.warn('[Mentor PWA] prompt failed', e);
      return false;
    }
    _mentorDeferredPrompt = null;
    window.__mentorDeferredPrompt = null;
    return true;
  }
  if (typeof MG._mentorIsInstalledApp === 'function' ? MG._mentorIsInstalledApp() : MG._mentorIsStandalone()) {
    MG.showToast('Mentor is already installed — open it from Start menu or desktop shortcut');
    return true;
  }
  return false;
}

MG.initMentorPwaUi = function() {
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    _mentorDeferredPrompt = e;
    try {
      var a = document.getElementById('mentorInstallAndroidBtn');
      var d = document.getElementById('mentorInstallDesktopBtn');
      if (a) a.classList.add('ring-2', 'ring-offset-1', 'ring-emerald-400');
      if (d) d.classList.add('ring-2', 'ring-offset-1', 'ring-blue-400');
    } catch (err) {}
  });
  window.addEventListener('appinstalled', function () {
    _mentorDeferredPrompt = null;
    MG.showToast('Mentor installed — check your home screen / app list');
    var hint = document.getElementById('mentorInstallHint');
    if (hint) hint.textContent = 'App installed on this device.';
  });

  var androidBtn = document.getElementById('mentorInstallAndroidBtn');
  if (androidBtn) {
    androidBtn.addEventListener('click', async function () {
      var ua = MG._mentorUa();
      var used = await MG._tryNativeInstall('Android');
      if (used) return;
      if (ua.ios) {
        MG.showToast('This is iPhone — use “Install · iOS / Desktop”');
        MG._showInstallGuide('ios');
        return;
      }
      MG._showInstallGuide('android');
    });
  }

  var iosBtn = document.getElementById('mentorInstallIosBtn');
  if (iosBtn) {
    iosBtn.addEventListener('click', function () {
      if (MG._mentorIsStandalone() && MG._mentorUa().ios) {
        MG.showToast('Already on Home Screen');
        return;
      }
      MG._showInstallGuide('ios');
    });
  }

  var desktopBtn = document.getElementById('mentorInstallDesktopBtn');
  if (desktopBtn) {
    desktopBtn.addEventListener('click', async function () {
      var used = await MG._tryNativeInstall('Desktop');
      if (used) return;
      MG._showInstallGuide('desktop');
    });
  }

  // Legacy single button (hidden) still works if referenced
  var installBtn = document.getElementById('mentorInstallBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async function () {
      var ua = MG._mentorUa();
      if (ua.ios) { MG._showInstallGuide('ios'); return; }
      var used = await MG._tryNativeInstall('App');
      if (!used) MG._showInstallGuide(ua.android ? 'android' : 'desktop');
    });
  }

  var shareBtn = document.getElementById('mentorShareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      if (typeof MG._showSharePlatformSheet === 'function') MG._showSharePlatformSheet();
      else {
        var url = 'https://mentor.vkstech.com/';
        try { navigator.clipboard.writeText(url); MG.showToast('Link copied'); } catch (e) { prompt('Copy:', url); }
      }
    });
  }

  var hasPrompt = !!( _mentorDeferredPrompt || window.__mentorDeferredPrompt );
  var isInstalled = (typeof MG._mentorIsInstalledApp === 'function' ? MG._mentorIsInstalledApp() : MG._mentorIsStandalone()) && !hasPrompt;
  if (isInstalled) {
    var hint = document.getElementById('mentorInstallHint');
    if (hint) hint.textContent = 'Running as installed Mentor app.';
    ['mentorInstallDesktopBtn','mentorInstallAndroidBtn'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  } else {
    var desk = document.getElementById('mentorInstallDesktopBtn');
    if (desk) desk.classList.remove('hidden');
    var bar = document.getElementById('mentorInstallBar');
    if (bar) bar.classList.remove('hidden');
    var hint2 = document.getElementById('mentorInstallHint');
    if (hint2) {
      hint2.textContent = hasPrompt
        ? 'Chrome is ready — click Install · iOS / Windows to add Mentor as a desktop app.'
        : 'Open mentor.vkstech.com/mentor.html in Chrome/Edge (not inside Man Power), then Install or use the address-bar install icon.';
    }
  }
  // Always expose Play Store link (when not hidden above)
  try {
    var a = document.getElementById('mentorPlayStoreBtn');
    if (a && !MG._mentorIsStandalone()) {
      a.href = MG._playStoreUrl || 'https://play.google.com/store/apps/details?id=com.vkstech.mentor';
      a.classList.remove('hidden');
    }
  } catch (e) {}
  MG.loadAppPublicSettings();
}

})(window.MG = window.MG || {});


/* Login-screen install / share row */
(function () {
  function isStandalone() {
    try {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    } catch (e) { return false; }
  }
  function refreshLoginInstallUI() {
    var row = document.getElementById('mentorLoginInstallRow');
    if (!row) return;
    var shareOnly = document.getElementById('loginShareOnly');
    var grid = row.querySelector('.grid');
    var hint = document.getElementById('loginInstallHint');
    if (isStandalone()) {
      if (grid) grid.style.display = 'none';
      if (shareOnly) shareOnly.classList.remove('hidden');
      if (hint) hint.textContent = 'App installed on this device — share with teammates.';
      var title = row.querySelector('p.font-semibold, p.text-xs.font-semibold');
      if (title) title.textContent = 'Share Mentor app';
    } else {
      if (grid) grid.style.display = '';
      if (shareOnly) shareOnly.classList.add('hidden');
    }
  }
  function bindLoginInstall() {
    var a = document.getElementById('loginInstallAndroid');
    var i = document.getElementById('loginInstallIos');
    var w = document.getElementById('loginInstallWin');
    var s = document.getElementById('loginShareOnly');
    if (a) a.onclick = function () {
      window.open('https://play.google.com/store/apps/details?id=com.vkstech.mentor', '_blank', 'noopener');
    };
    if (i) i.onclick = function () {
      if (window.MG && typeof MG.showIosInstallHelp === 'function') MG.showIosInstallHelp();
      else alert('iPhone: Open in Safari → Share → Add to Home Screen');
    };
    if (w) w.onclick = function () {
      try {
        var p = window.__mentorDeferredPrompt || (window.MG && MG._deferredPrompt);
        if (p && p.prompt) {
          p.prompt();
          return;
        }
      } catch (e) {}
      alert('Windows: In Chrome/Edge use the install icon in the address bar, or menu → Install app.');
    };
    if (s) s.onclick = function () {
      if (window.MG && typeof MG.shareApp === 'function') MG.shareApp();
      else if (navigator.share) {
        navigator.share({ title: 'Mentor', url: location.origin + location.pathname }).catch(function () {});
      }
    };
    refreshLoginInstallUI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindLoginInstall);
  else bindLoginInstall();
  window.addEventListener('appinstalled', refreshLoginInstallUI);
})();
