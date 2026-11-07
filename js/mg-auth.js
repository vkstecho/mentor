/* FEATURE MODULE: auth-mobile
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== Mobile Detection ==========
MG.extractMobileFromString = function(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.replace(/\D/g, '');
  // 10-digit Indian mobile starting 6-9
  if (/^[6-9]\d{9}$/.test(m)) return m;
  // with country code
  if (/^91[6-9]\d{9}$/.test(m)) return m.slice(2);
  return null;
}

MG.scanStorageForMobile = function() {
  const keys = [
    'mp_user_phone', 'userPhone', 'loggedInMobile', 'currentUser',
    'mp_session', 'user_mobile', 'mobile', 'phone', 'user',
    'vks_user', 'authUser', 'sessionUser'
  ];
  const stores = [localStorage, sessionStorage];
  for (const store of stores) {
    for (const key of keys) {
      try {
        const raw = store.getItem(key);
        if (!raw) continue;
        // direct value
        let found = MG.extractMobileFromString(raw);
        if (found) return found;
        // JSON
        try {
          const obj = JSON.parse(raw);
          const candidates = [
            obj.mobile, obj.phone, obj.userPhone, obj.loggedInMobile,
            obj.number, obj.msisdn, obj.user?.mobile, obj.user?.phone,
            obj.data?.mobile, obj.data?.phone
          ];
          for (const c of candidates) {
            found = MG.extractMobileFromString(String(c || ''));
            if (found) return found;
          }
        } catch {}
      } catch {}
    }
    // brute scan all keys for any 10-digit mobile
    try {
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        const v = store.getItem(k);
        const found = MG.extractMobileFromString(v);
        if (found) return found;
      }
    } catch {}
  }
  return null;
}

MG.detectMobile = function() {
  // 1. URL params
  const params = new URLSearchParams(window.location.search);
  for (const key of ['mobile', 'phone', 'user', 'm', 'msisdn']) {
    const found = MG.extractMobileFromString(params.get(key) || '');
    if (found) return found;
  }
  // 2. Storage
  const fromStore = MG.scanStorageForMobile();
  if (fromStore) return fromStore;
  // 3. postMessage (listen once for quick reply)
  return null;
}

MG.requestMobileFromParent = function() {
  return new Promise((resolve) => {
    if (window.parent === window) {
      resolve(null);
      return;
    }
    const handler = (e) => {
      const m = MG.extractMobileFromString(String(e.data?.mobile || e.data?.phone || e.data || ''));
      if (m) {
        window.removeEventListener('message', handler);
        resolve(m);
      }
    };
    window.addEventListener('message', handler);
    try {
      window.parent.postMessage({ type: 'REQUEST_MOBILE', source: 'one_to_one_guidance' }, '*');
    } catch {}
    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(null);
    }, 800);
  });
}


// ========== Shared website auth (Mentor ↔ Resume Builder) ==========
var SITE_PHONE_KEY = 'vks_site_phone';
var SITE_VERIFIED_KEY = 'vks_site_verified';

MG.setSiteAuth = function(mob) {
  if (!mob) return;
  try {
    localStorage.setItem(SITE_PHONE_KEY, mob);
    localStorage.setItem(SITE_VERIFIED_KEY, '1');
    localStorage.setItem('vks_mentor_verified_' + mob, '1');
    localStorage.setItem('mp_user_phone', mob);
    localStorage.setItem('rb_cloud_mobile', mob);
  } catch (e) {}
}

MG.clearSiteAuth = function() {
  try {
    var mob = localStorage.getItem(SITE_PHONE_KEY) || '';
    localStorage.removeItem(SITE_PHONE_KEY);
    localStorage.removeItem(SITE_VERIFIED_KEY);
    localStorage.removeItem('rb_cloud_mobile');
    if (mob) localStorage.removeItem('vks_mentor_verified_' + mob);
    // clear any vks_mentor_verified_* keys
    var toRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('vks_mentor_verified_') === 0) toRemove.push(k);
    }
    toRemove.forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {}
}

MG.getSiteAuthMobile = function() {
  try {
    if (localStorage.getItem(SITE_VERIFIED_KEY) === '1') {
      var m = (localStorage.getItem(SITE_PHONE_KEY) || '').replace(/\D/g, '').slice(-10);
      if (/^[6-9]\d{9}$/.test(m)) return m;
    }
  } catch (e) {}
  return null;
}

MG.isInsideManPower = function() {
  try {
    if (window.parent && window.parent !== window) {
      if (window.parent.MP_CFG || window.parent.SESSION || window.parent._fbAccess) return true;
      var sess = window.parent.localStorage && window.parent.localStorage.getItem('mp_session');
      if (sess) return true;
    }
  } catch (e) {}
  return false;
}

MG.parentManPowerMobile = function() {
  try {
    if (!window.parent || window.parent === window) return null;
    var ph = window.parent.localStorage && (
      window.parent.localStorage.getItem('mp_user_phone') ||
      window.parent.localStorage.getItem('mp_device_phone')
    );
    if (ph) {
      var d = String(ph).replace(/\D/g, '').slice(-10);
      if (/^[6-9]\d{9}$/.test(d)) return d;
    }
    var sess = window.parent.localStorage && window.parent.localStorage.getItem('mp_session');
    if (sess) {
      try {
        var o = JSON.parse(sess);
        var m = String(o.mobile || o.phone || o.userPhone || '').replace(/\D/g, '').slice(-10);
        if (/^[6-9]\d{9}$/.test(m)) return m;
      } catch (e2) {}
    }
  } catch (e) {}
  return null;
}

MG.doSiteLogout = function() {
  MG.clearSiteAuth();
  try {
    if (window.MentorFB && window.MentorFB.auth && window.MentorFB.auth.signOut) {
      window.MentorFB.auth.signOut();
    }
  } catch (e) {}
  try { MG.showToast('Logged out'); } catch (e2) {}
  // Always return to Mentor marketing landing after logout
  setTimeout(function () {
    try { location.href = './index.html'; } catch (e3) { location.href = './'; }
  }, 300);
}




// ========== Device remember: password + fingerprint (WebAuthn) ==========
// Stored per mobile on this browser/device only. Survives logout so same
// device can re-login without OTP (password or biometrics).
var DEVICE_CREDS_PREFIX = 'vks_device_creds_';

MG._bufToB64 = function (buf) {
  var bytes = new Uint8Array(buf);
  var s = '';
  for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

MG._b64ToBuf = function (b64) {
  b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  var s = atob(b64);
  var bytes = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes.buffer;
};

MG._sha256Hex = async function (str) {
  var enc = new TextEncoder();
  var hash = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(hash)).map(function (b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
};

MG.getDeviceCreds = function (mobile) {
  if (!mobile) return null;
  try {
    var raw = localStorage.getItem(DEVICE_CREDS_PREFIX + mobile);
    if (!raw) return null;
    var o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    return o;
  } catch (e) {
    return null;
  }
};

MG.saveDeviceCreds = function (mobile, patch) {
  if (!mobile) return null;
  var cur = MG.getDeviceCreds(mobile) || {};
  var next = Object.assign({}, cur, patch || {}, { updatedAt: Date.now() });
  try {
    localStorage.setItem(DEVICE_CREDS_PREFIX + mobile, JSON.stringify(next));
  } catch (e) {}
  return next;
};

MG.clearDeviceCreds = function (mobile) {
  if (!mobile) return;
  try {
    localStorage.removeItem(DEVICE_CREDS_PREFIX + mobile);
  } catch (e) {}
};

MG.hasDevicePassword = function (mobile) {
  var c = MG.getDeviceCreds(mobile);
  return !!(c && c.passwordHash && c.passwordSalt);
};

MG.hasDeviceFingerprint = function (mobile) {
  var c = MG.getDeviceCreds(mobile);
  return !!(c && c.webauthnEnabled && c.credentialId);
};

MG.supportsWebAuthn = function () {
  try {
    return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
  } catch (e) {
    return false;
  }
};

MG.setDevicePassword = async function (mobile, password) {
  if (!mobile || !password || String(password).length < 4) {
    throw new Error('Password must be at least 4 characters');
  }
  var salt = MG._bufToB64(crypto.getRandomValues(new Uint8Array(16)));
  var hash = await MG._sha256Hex(salt + '::' + String(password));
  return MG.saveDeviceCreds(mobile, {
    passwordHash: hash,
    passwordSalt: salt,
    passwordSetAt: Date.now()
  });
};

MG.verifyDevicePassword = async function (mobile, password) {
  var c = MG.getDeviceCreds(mobile);
  if (!c || !c.passwordHash || !c.passwordSalt) return false;
  var hash = await MG._sha256Hex(c.passwordSalt + '::' + String(password || ''));
  return hash === c.passwordHash;
};

MG.registerFingerprint = async function (mobile) {
  if (!MG.supportsWebAuthn()) throw new Error('Fingerprint / biometrics not supported on this device');
  var challenge = crypto.getRandomValues(new Uint8Array(32));
  var userId = new TextEncoder().encode('mentor-' + mobile);
  var cred = await navigator.credentials.create({
    publicKey: {
      challenge: challenge,
      rp: { name: 'Mentor by VKS Tech', id: location.hostname },
      user: {
        id: userId,
        name: '+91' + mobile,
        displayName: 'Mentor ' + mobile
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred'
      },
      timeout: 60000,
      attestation: 'none'
    }
  });
  if (!cred) throw new Error('Fingerprint registration cancelled');
  var id = MG._bufToB64(cred.rawId);
  MG.saveDeviceCreds(mobile, {
    webauthnEnabled: true,
    credentialId: id,
    webauthnSetAt: Date.now()
  });
  return true;
};

MG.verifyFingerprint = async function (mobile) {
  if (!MG.supportsWebAuthn()) return false;
  var c = MG.getDeviceCreds(mobile);
  if (!c || !c.credentialId || !c.webauthnEnabled) return false;
  var challenge = crypto.getRandomValues(new Uint8Array(32));
  try {
    var assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        allowCredentials: [{
          type: 'public-key',
          id: MG._b64ToBuf(c.credentialId),
          transports: ['internal']
        }],
        userVerification: 'required',
        timeout: 60000
      }
    });
    return !!assertion;
  } catch (e) {
    return false;
  }
};

MG.disableFingerprint = function (mobile) {
  return MG.saveDeviceCreds(mobile, {
    webauthnEnabled: false,
    credentialId: null
  });
};

/** True if this device has a quick-login method for the number (password or fingerprint). */
MG.canQuickLogin = function (mobile) {
  return MG.hasDevicePassword(mobile) || MG.hasDeviceFingerprint(mobile);
};

})(window.MG = window.MG || {});
