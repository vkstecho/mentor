/* FEATURE MODULE: user-profile */
(function (MG) {
'use strict';

MG.getProfile = function (mobile) {
  mobile = mobile || MG.state.mobile;
  try {
    var d = MG.loadUserData(mobile) || {};
    return d.profile || {};
  } catch (e) { return {}; }
};

MG.saveProfileLocal = function (mobile, profile) {
  var d = MG.loadUserData(mobile) || { unlocked: {}, payments: {}, recordings: {}, chat: {} };
  if (!d.payments) d.payments = [];
  d.profile = Object.assign({}, d.profile || {}, profile, { updatedAt: Date.now() });
  MG.saveUserData(mobile, d);
  if (mobile === MG.state.mobile) MG.state.data = d;
  return d.profile;
};

MG.openProfileModal = function () {
  var existing = document.getElementById('profileModal');
  if (existing) existing.remove();
  var mobile = MG.state.mobile;
  if (!mobile) {
    MG.showToast('Login first to edit profile');
    return;
  }
  var p = MG.getProfile(mobile);
  var modal = document.createElement('div');
  modal.id = 'profileModal';
  modal.className = 'fixed inset-0 z-[100000] flex items-end sm:items-center justify-center bg-black/50 p-3';
  modal.innerHTML =
    '<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 border border-slate-200 dark:border-slate-600">' +
    '<div class="flex items-center justify-between mb-4">' +
    '<h3 class="text-base font-bold text-slate-900 dark:text-white">Your profile</h3>' +
    '<button type="button" id="profileModalClose" class="text-slate-400 text-xl px-1">&times;</button></div>' +
    '<p class="text-xs text-slate-500 mb-3">+91 ' + mobile + ' · all fields optional</p>' +
    '<div class="flex flex-col items-center gap-2 mb-4">' +
    '<div id="profileAvatarPreview" class="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-white shadow">' +
    (p.photoURL ? '<img src="' + p.photoURL + '" class="w-full h-full object-cover"/>' : ((p.name || 'U').charAt(0).toUpperCase())) +
    '</div>' +
    '<label class="text-xs font-semibold text-brand-600 cursor-pointer">' +
    '<div class="flex flex-wrap gap-2 justify-center">' +
    '<label class="text-xs font-semibold text-brand-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30">' +
    '<input type="file" id="profilePhotoInput" accept="image/*" class="hidden"/> Gallery</label>' +
    '<label class="text-xs font-semibold text-emerald-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30">' +
    '<input type="file" id="profileCameraInput" accept="image/*" capture="user" class="hidden"/> Camera / Selfie</label></div></div>' +
    '<label class="block text-xs font-semibold mb-1">Name</label>' +
    '<input id="pfName" class="form-input w-full mb-3" value="' + (p.name || '').replace(/"/g, '&quot;') + '" placeholder="Your name"/>' +
    '<label class="block text-xs font-semibold mb-1">Date of birth</label>' +
    '<input id="pfDob" type="date" class="form-input w-full mb-3" value="' + (p.dob || '') + '"/>' +
    '<label class="block text-xs font-semibold mb-1">Education</label>' +
    '<input id="pfEdu" class="form-input w-full mb-3" value="' + (p.education || '').replace(/"/g, '&quot;') + '" placeholder="e.g. B.Tech, Diploma"/>' +
    '<label class="block text-xs font-semibold mb-1">Profession</label>' +
    '<select id="pfProf" class="form-input w-full mb-3">' +
    '<option value="">— Select —</option>' +
    '<option value="Student"' + (p.profession === 'Student' ? ' selected' : '') + '>Student</option>' +
    '<option value="Private"' + (p.profession === 'Private' ? ' selected' : '') + '>Private</option>' +
    '<option value="Government"' + (p.profession === 'Government' ? ' selected' : '') + '>Government</option>' +
    '</select>' +
    '<div id="pfCompanyWrap">' +
    '<label class="block text-xs font-semibold mb-1">Company name</label>' +
    '<input id="pfCompany" class="form-input w-full mb-3" value="' + (p.company || '').replace(/"/g, '&quot;') + '" placeholder="Optional"/>' +
    '</div>' +
    '<label class="block text-xs font-semibold mb-1">Email</label>' +
    '<input id="pfEmail" type="email" class="form-input w-full mb-4" value="' + (p.email || '').replace(/"/g, '&quot;') + '" placeholder="optional@email.com"/>' +
    '<div class="border-t border-slate-200 dark:border-slate-600 pt-4 mt-2 mb-3">' +
    '<h4 class="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wide">Device security</h4>' +
    '<p class="text-[11px] text-slate-500 mb-2">Password &amp; fingerprint work only on this device after first OTP login.</p>' +
    '<label class="block text-xs font-semibold mb-1">Change device password</label>' +
    '<input id="pfNewPass" type="password" class="form-input w-full mb-2" placeholder="New password (min 4)" autocomplete="new-password"/>' +
    '<input id="pfNewPass2" type="password" class="form-input w-full mb-2" placeholder="Confirm new password" autocomplete="new-password"/>' +
    '<button type="button" id="pfSavePassBtn" class="w-full mb-3 py-2 rounded-xl border border-brand-500 text-brand-700 dark:text-brand-300 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/30">Update password</button>' +
    '<div class="flex items-center justify-between gap-2 mb-1">' +
    '<span class="text-xs font-semibold">Fingerprint login</span>' +
    '<span id="pfFpStatus" class="text-[11px] text-slate-500">—</span></div>' +
    '<div class="flex gap-2">' +
    '<button type="button" id="pfEnableFpBtn" class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">Enable</button>' +
    '<button type="button" id="pfDisableFpBtn" class="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-500 text-xs font-semibold">Disable</button>' +
    '</div></div>' +
    '<button type="button" id="profileSaveBtn" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold">Save profile</button>' +
    '</div>';
  document.body.appendChild(modal);
  function close() { try { modal.remove(); } catch (e) {} }
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.getElementById('profileModalClose').onclick = close;
  var prof = document.getElementById('pfProf');
  function toggleCo() {
    var w = document.getElementById('pfCompanyWrap');
    if (!w) return;
    w.style.display = (prof.value === 'Student' || !prof.value) ? 'none' : 'block';
  }
  prof.addEventListener('change', toggleCo);
  toggleCo();
  var pendingDataUrl = null;
  document.getElementById('profilePhotoInput').addEventListener('change', function (ev) {
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (f.size > 2.5 * 1024 * 1024) {
      MG.showToast('Image max 2MB');
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      pendingDataUrl = reader.result;
      var prev = document.getElementById('profileAvatarPreview');
      prev.innerHTML = '<img src="' + pendingDataUrl + '" class="w-full h-full object-cover"/>';
    };
    reader.readAsDataURL(f);
  });

  function refreshFpStatus() {
    var st = document.getElementById('pfFpStatus');
    if (!st) return;
    if (MG.hasDeviceFingerprint(mobile)) st.textContent = 'On';
    else if (!MG.supportsWebAuthn()) st.textContent = 'Not supported';
    else st.textContent = 'Off';
  }
  refreshFpStatus();
  var savePassBtn = document.getElementById('pfSavePassBtn');
  if (savePassBtn) savePassBtn.onclick = async function () {
    var p1 = (document.getElementById('pfNewPass').value || '');
    var p2 = (document.getElementById('pfNewPass2').value || '');
    if (p1.length < 4) { MG.showToast('Password min 4 characters'); return; }
    if (p1 !== p2) { MG.showToast('Passwords do not match'); return; }
    try {
      await MG.setDevicePassword(mobile, p1);
      document.getElementById('pfNewPass').value = '';
      document.getElementById('pfNewPass2').value = '';
      MG.showToast('Device password updated');
    } catch (e) {
      MG.showToast((e && e.message) || 'Could not update password');
    }
  };
  var enFp = document.getElementById('pfEnableFpBtn');
  if (enFp) enFp.onclick = async function () {
    try {
      await MG.registerFingerprint(mobile);
      refreshFpStatus();
      MG.showToast('Fingerprint enabled');
    } catch (e) {
      MG.showToast((e && e.message) || 'Fingerprint setup failed');
    }
  };
  var disFp = document.getElementById('pfDisableFpBtn');
  if (disFp) disFp.onclick = function () {
    MG.disableFingerprint(mobile);
    refreshFpStatus();
    MG.showToast('Fingerprint disabled');
  };

  document.getElementById('profileSaveBtn').onclick = async function () {
    var profile = {
      name: (document.getElementById('pfName').value || '').trim(),
      dob: document.getElementById('pfDob').value || '',
      education: (document.getElementById('pfEdu').value || '').trim(),
      profession: document.getElementById('pfProf').value || '',
      company: (document.getElementById('pfCompany').value || '').trim(),
      email: (document.getElementById('pfEmail').value || '').trim()
    };
    if (pendingDataUrl) {
      profile.photoURL = pendingDataUrl; // local/data URL fallback; Storage upload when configured
      try {
        if (window.MentorFB && window.MentorFB.uploadProfilePhoto) {
          var url = await window.MentorFB.uploadProfilePhoto(mobile, pendingDataUrl);
          if (url) profile.photoURL = url;
        }
      } catch (e) {}
    } else if (p.photoURL) {
      profile.photoURL = p.photoURL;
    }
    MG.saveProfileLocal(mobile, profile);
    MG.refreshProfileButton();
    MG.showToast('Profile saved');
    close();
  };
};

MG.refreshProfileButton = function () {
  var btn = document.getElementById('profileAvatarBtn');
  if (!btn) return;
  var p = MG.getProfile(MG.state.mobile);
  var label = (p.name || MG.state.mobile || '?').toString();
  if (p.photoURL) {
    btn.innerHTML = '<img src="' + p.photoURL + '" alt="" class="w-full h-full object-cover rounded-full"/>';
  } else {
    btn.textContent = label.charAt(0).toUpperCase();
  }
  btn.title = p.name ? p.name + ' · +91 ' + MG.state.mobile : '+91 ' + (MG.state.mobile || '');
};

MG.initProfileUi = function () {
  var btn = document.getElementById('profileAvatarBtn');
  if (btn) btn.addEventListener('click', function () { MG.openProfileModal(); });
  MG.refreshProfileButton();
};

})(window.MG = window.MG || {});
