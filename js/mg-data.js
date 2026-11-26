/* FEATURE MODULE: data
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== Data Layer (Firebase primary + localStorage cache) ==========
MG.FB_ROOT = 'mentor_guidance';
MG.FB_INDEX = 'mentor_guidance_index';

MG.storageKey = function(mob) {
  return MG.STORAGE_PREFIX + mob;
}

MG.emptyUserData = function(mob) {
  return {
    mobile: mob,
    unlocked: {},
    payments: [],
    recordings: {},
    chats: {},
    moduleProgress: {},   // { moduleId: { completedAt, source } }
    pathProgress: {},     // { pathId: { completedAt, modules: [...] } }
    certificates: [],     // [{ id, type:'module'|'path', refId, title, issuedAt, name }]
    updatedAt: Date.now()
  };
}

/** Ensure progress fields exist on any loaded user blob */
MG.ensureProgressFields = function(data) {
  if (!data || typeof data !== 'object') return data;
  if (!data.moduleProgress || typeof data.moduleProgress !== 'object') data.moduleProgress = {};
  if (!data.pathProgress || typeof data.pathProgress !== 'object') data.pathProgress = {};
  if (!Array.isArray(data.certificates)) data.certificates = [];
  return data;
}

MG.isModuleComplete = function(moduleId) {
  var d = MG.ensureProgressFields(MG.state.data || {});
  return !!(d.moduleProgress[moduleId] && d.moduleProgress[moduleId].completedAt);
}

MG.getPathProgress = function(path) {
  if (!path || !path.moduleIds) return { done: 0, total: 0, pct: 0, complete: false };
  var done = 0;
  path.moduleIds.forEach(function(id){ if (MG.isModuleComplete(id)) done++; });
  var total = path.moduleIds.length;
  return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0, complete: done >= total && total > 0 };
}

/**
 * Mark a free module complete. Optionally issue module certificate.
 * Returns { ok, pathJustCompleted: pathId|null, cert }
 */
MG.markModuleComplete = function(moduleId, opts) {
  opts = opts || {};
  var mob = String((MG.state.mobile || (MG.state.data && MG.state.data.mobile) || '')).replace(/\D/g, '').slice(-10);
  if (!mob) {
    if (typeof MG.showToast === 'function') MG.showToast('Login first to track progress & certificates');
    return { ok: false };
  }
  var mod = (MG.FREE_PACK_MODULES || []).find(function(m){ return m.id === moduleId; });
  if (!mod) return { ok: false };

  MG.state.data = MG.ensureProgressFields(MG.state.data || MG.emptyUserData(mob));
  var already = MG.isModuleComplete(moduleId);
  if (!already) {
    MG.state.data.moduleProgress[moduleId] = {
      completedAt: Date.now(),
      source: opts.source || 'self',
      title: mod.title
    };
  }

  // Module certificate (once)
  var certId = 'mod_' + moduleId;
  var hasModCert = (MG.state.data.certificates || []).some(function(c){ return c.id === certId; });
  var cert = null;
  if (!hasModCert) {
    var displayName = (MG.state.data.profile && (MG.state.data.profile.name || MG.state.data.profile.fullName)) || ('Learner ' + mob.slice(-4));
    cert = {
      id: certId,
      type: 'module',
      refId: moduleId,
      title: mod.title,
      issuedAt: Date.now(),
      name: displayName
    };
    MG.state.data.certificates.push(cert);
  }

  // Check learning paths
  var pathJustCompleted = null;
  (MG.LEARNING_PATHS || []).forEach(function(path) {
    var prog = MG.getPathProgress(path);
    if (prog.complete) {
      if (!MG.state.data.pathProgress[path.id] || !MG.state.data.pathProgress[path.id].completedAt) {
        MG.state.data.pathProgress[path.id] = {
          completedAt: Date.now(),
          modules: path.moduleIds.slice()
        };
        pathJustCompleted = path.id;
        var pCertId = 'path_' + path.id;
        if (!(MG.state.data.certificates || []).some(function(c){ return c.id === pCertId; })) {
          var dn = (MG.state.data.profile && (MG.state.data.profile.name || MG.state.data.profile.fullName)) || ('Learner ' + mob.slice(-4));
          MG.state.data.certificates.push({
            id: pCertId,
            type: 'path',
            refId: path.id,
            title: path.title,
            issuedAt: Date.now(),
            name: dn
          });
        }
      }
    }
  });

  MG.saveUserData(mob, MG.state.data);
  return { ok: true, already: already, pathJustCompleted: pathJustCompleted, cert: cert };
}

MG.loadUserData = function(mob) {
  // Sync cache from localStorage first (instant UI)
  try {
    const raw = localStorage.getItem(MG.storageKey(mob));
    if (raw) return JSON.parse(raw);
  } catch {}
  return MG.emptyUserData(mob);
}

MG.loadUserDataAsync = async function(mob) {
  // Local cache for instant UI — do NOT invent updatedAt until we know Firebase state
  var local = null;
  try {
    var raw = localStorage.getItem(MG.storageKey(mob));
    if (raw) local = JSON.parse(raw);
  } catch (e0) {}
  if (!local || typeof local !== 'object') {
    local = { mobile: mob, unlocked: {}, payments: [], recordings: {}, chats: {}, updatedAt: 0 };
  }
  MG.state.data = local;
  try {
    if (window.MentorFB && window.MentorFB.get) {
      // Prefer full user node; also try mentor_payments mirror
      var remote = await window.MentorFB.get(MG.FB_ROOT + '/' + mob);
      var remotePays = null;
      try { remotePays = await window.MentorFB.get('mentor_payments/' + mob); } catch (eP) {}
      if (remote && typeof remote === 'object') {
        var localTs = Number(local.updatedAt || 0);
        var remoteTs = Number(remote.updatedAt || 0);
        var localPayN = (local.payments && local.payments.length) || 0;
        var remotePayN = (remote.payments && remote.payments.length) || 0;
        // Prefer Firebase when: no local ts, remote is newer, OR local has fewer payments (admin device)
        var takeRemote = !localTs || remoteTs >= localTs || (remotePayN > localPayN);
        if (takeRemote) {
          MG.state.data = Object.assign({}, { mobile: mob, unlocked: {}, payments: [], recordings: {}, chats: {} }, remote, { mobile: mob });
          try { localStorage.setItem(MG.storageKey(mob), JSON.stringify(MG.state.data)); } catch (eS) {}
        }
      } else if (Array.isArray(remotePays) && remotePays.length) {
        // Recovery: payments mirror exists but full node missing
        MG.state.data.payments = remotePays;
        MG.state.data.updatedAt = Date.now();
        try { localStorage.setItem(MG.storageKey(mob), JSON.stringify(MG.state.data)); } catch (eS2) {}
      }
    }
  } catch (e) {
    console.warn('[Mentor] Firebase load failed', e.message || e);
  }
  return MG.state.data;
}

MG.saveUserData = function(mob, userData) {
  userData.updatedAt = Date.now();
  userData.mobile = mob;
  MG.state._lastLocalChatWrite = userData.updatedAt;
  try {
    localStorage.setItem(MG.storageKey(mob), JSON.stringify(userData));
  } catch (eL) {}
  // Returns a Promise so Approve/Reject can await Firebase write
  return (async function() {
    try {
      if (!window.MentorFB || !window.MentorFB.set) return false;
      await window.MentorFB.set(MG.FB_ROOT + '/' + mob, userData);
      if (mob !== MG.MENTOR_MOBILE) {
        await window.MentorFB.set(MG.FB_INDEX + '/' + mob, {
          mobile: mob,
          updatedAt: userData.updatedAt,
          paymentCount: (userData.payments || []).length,
          pendingCount: (userData.payments || []).filter(function(p){ return p && p.status === 'pending'; }).length
        });
        await window.MentorFB.set('mentor_payments/' + mob, userData.payments || []);
      }
      console.info('[Mentor] Firebase saved', mob);
      return true;
    } catch (e) {
      console.warn('[Mentor] Firebase save failed', e.message || e);
      return false;
    }
  })();
}

MG.mergeChatMaps = function(localChats, remoteChats) {
  const out = Object.assign({}, localChats || {});
  const remote = remoteChats || {};
  Object.keys(remote).forEach((topicId) => {
    const rem = Array.isArray(remote[topicId]) ? remote[topicId] : [];
    const loc = Array.isArray(out[topicId]) ? out[topicId] : [];
    const byId = new Map();
    loc.forEach((m) => { if (m && m.id) byId.set(m.id, m); });
    rem.forEach((m) => { if (m && m.id) byId.set(m.id, m); });
    const merged = Array.from(byId.values());
    merged.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    out[topicId] = merged;
  });
  return out;
}

MG.stopRealtime = function() {
  try { if (typeof MG.state._dataUnsub === 'function') MG.state._dataUnsub(); } catch (e) {}
  MG.state._dataUnsub = null;
}

/**
 * Realtime: listen to student's guidance node so mentor <-> student
 * messages appear without refresh.
 */
MG.startRealtimeFor = function(mob) {
  MG.stopRealtime();
  mob = String(mob || '').replace(/\D/g, '').slice(-10);
  if (!mob || !window.MentorFB || typeof window.MentorFB.listen !== 'function') {
    console.warn('[Mentor] Realtime unavailable — messages need refresh');
    return;
  }
  const path = MG.FB_ROOT + '/' + mob;
  MG.state._rtMobile = mob;
  MG.state._dataUnsub = window.MentorFB.listen(path, (remote) => {
    try {
      if (!remote || typeof remote !== 'object') return;
      const target = String(MG.state.viewingAs || MG.state.mobile || '').replace(/\D/g, '').slice(-10);
      // Only apply if we are still looking at this student
      if (String(mob) !== target && String(mob) !== String(MG.state.mobile || '').replace(/\D/g, '').slice(-10)) return;

      // Merge chats so concurrent mentor/student writes don't wipe each other
      const prevChats = (MG.state.data && MG.state.data.chats) || {};
      const mergedChats = MG.mergeChatMaps(prevChats, remote.chats || {});
      const prevSnap = JSON.stringify(prevChats);
      const nextSnap = JSON.stringify(mergedChats);

      // Pure echo of our own write with identical chats — skip UI churn
      if (prevSnap === nextSnap && remote.updatedAt && MG.state._lastLocalChatWrite &&
          Math.abs(Number(remote.updatedAt) - Number(MG.state._lastLocalChatWrite)) < 1200) {
        return;
      }

      // CRITICAL: use MG.emptyUserData (bare emptyUserData throws ReferenceError and kills the listener)
      var prevUnlocked = JSON.stringify((MG.state.data && MG.state.data.unlocked) || {});
      var prevPayN = ((MG.state.data && MG.state.data.payments) || []).length;

      MG.state.data = Object.assign({}, MG.emptyUserData(mob), remote, { mobile: mob, chats: mergedChats });
      try {
        localStorage.setItem(MG.storageKey(mob), JSON.stringify(MG.state.data));
      } catch (e) {}

      if (prevSnap !== nextSnap) {
        try {
          if (MG.state.currentTopicId && typeof MG.renderChat === 'function') {
            MG.renderChat();
            const box = document.getElementById('chatMessages');
            if (box) box.scrollTop = box.scrollHeight;
          }
        } catch (eR) { console.warn('[Mentor] renderChat', eR); }
      }
      // Refresh recordings if mentor added one
      try { if (MG.state.currentTopicId && typeof MG.renderRecordings === 'function') MG.renderRecordings(); } catch (e) {}

      // Unlock / payment status changed (admin approved) → refresh catalog badges without app restart
      try {
        var nextUnlocked = JSON.stringify((MG.state.data && MG.state.data.unlocked) || {});
        var nextPayN = ((MG.state.data && MG.state.data.payments) || []).length;
        if (prevUnlocked !== nextUnlocked || prevPayN !== nextPayN) {
          if (typeof MG.renderCatalog === 'function') MG.renderCatalog();
          try { if (typeof MG.renderFreePackSection === 'function') MG.renderFreePackSection(); } catch (eF) {}
          // If student is sitting on a locked topic that just unlocked, allow workspace entry
          if (MG.state.currentTopicId && MG.state.data.unlocked && MG.state.data.unlocked[MG.state.currentTopicId]) {
            try {
              if (typeof MG.openWorkspace === 'function') MG.openWorkspace(MG.state.currentTopicId);
            } catch (eW) {}
          }
          try {
            if (typeof MG.showToast === 'function' && prevUnlocked !== nextUnlocked) {
              MG.showToast(MG.t ? MG.t('sessionUnlocked') : 'Session unlocked — you can open your topic now');
            }
          } catch (eT) {}
        }
      } catch (eUnlockUi) {}
    } catch (eCb) {
      console.warn('[Mentor] realtime cb error', eCb && eCb.message);
    }
  });
  console.info('[Mentor] Realtime listening', path);
}

MG.getAllStudentMobiles = function() {
  // Sync from local cache first
  const list = new Set();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(MG.STORAGE_PREFIX)) {
        const m = k.replace(MG.STORAGE_PREFIX, '');
        if (/^[6-9]\d{9}$/.test(m) && m !== MG.MENTOR_MOBILE) list.add(m);
      }
    }
  } catch {}
  return Array.from(list).sort();
}

MG.getAllStudentMobilesAsync = async function() {
  const list = new Set(MG.getAllStudentMobiles());
  let fbOk = false;
  let fbError = null;
  try {
    if (window.MentorFB && window.MentorFB.get) {
      // 1) Dedicated index
      try {
        const index = await window.MentorFB.get(MG.FB_INDEX);
        fbOk = true;
        if (index && typeof index === 'object') {
          Object.keys(index).forEach(m => {
            if (/^[6-9]\d{9}$/.test(m) && m !== MG.MENTOR_MOBILE) list.add(m);
          });
        }
      } catch (e) {
        fbError = e;
        console.warn('[Mentor] index load failed', e.message || e);
      }
      // 2) Fallback: scan all mentor_guidance children
      try {
        const all = await window.MentorFB.get(MG.FB_ROOT);
        fbOk = true;
        if (all && typeof all === 'object') {
          Object.keys(all).forEach(m => {
            if (/^[6-9]\d{9}$/.test(m) && m !== MG.MENTOR_MOBILE) list.add(m);
          });
        }
      } catch (e) {
        fbError = e;
        console.warn('[Mentor] guidance root load failed', e.message || e);
      }
    } else {
      fbError = new Error('MentorFB not ready');
    }
  } catch (e) {
    fbError = e;
    console.warn('[Mentor] student list failed', e.message || e);
  }
  // stash status for UI toast
  window._mentorFbStatus = { ok: fbOk, error: fbError ? (fbError.message || String(fbError)) : null, count: list.size };
  return Array.from(list).sort();
}


})(window.MG = window.MG || {});

MG.listStoredMobiles = function() {
  var out = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k) continue;
      var m = (k.match(/(\d{10})/) || [])[1];
      if (m && out.indexOf(m) < 0) out.push(m);
    }
  } catch (e) {}
  return out;
};
MG.scanAllPaymentsFromStorage = function() {
  var bag = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf('vks_mentor') < 0 && k.indexOf('mentor_user') < 0 && k.indexOf('mg_user') < 0) {
        // still try parse user blobs
      }
      try {
        var raw = localStorage.getItem(k);
        if (!raw || raw[0] !== '{') continue;
        var o = JSON.parse(raw);
        var pays = o.payments || (o.data && o.data.payments);
        if (!Array.isArray(pays) || !pays.length) continue;
        var mob = o.mobile || o.phone || (k.match(/(\d{10})/) || [])[1] || '';
        pays.forEach(function(p){ bag.push(Object.assign({}, p, { _mobile: String(mob || '') })); });
      } catch (e1) {}
    }
  } catch (e) {}
  return bag;
};
