/* FEATURE MODULE: ui
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== Free Flexible Packaging training modules + Learning Paths + Certificates ==========

MG._moduleById = function(id) {
  return (MG.FREE_PACK_MODULES || []).find(function(m){ return m.id === id; }) || null;
};

MG.renderLearningPaths = function() {
  var host = document.getElementById('learningPaths');
  if (!host) return;
  if (MG.state && MG.state.data) MG.ensureProgressFields(MG.state.data);

  var colorMap = {
    teal: { ring: 'border-teal-300 dark:border-teal-700', bar: 'bg-teal-500', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200', iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300' },
    indigo: { ring: 'border-indigo-300 dark:border-indigo-700', bar: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' },
    orange: { ring: 'border-orange-300 dark:border-orange-700', bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' }
  };

  host.innerHTML = (MG.LEARNING_PATHS || []).map(function(path) {
    var prog = MG.getPathProgress(path);
    var c = colorMap[path.color] || colorMap.teal;
    var steps = path.moduleIds.map(function(mid, idx) {
      var mod = MG._moduleById(mid);
      var done = MG.isModuleComplete(mid);
      return '<span class="inline-flex items-center gap-1 text-[11px] ' + (done ? 'text-emerald-600 font-semibold' : 'text-slate-500') + '">' +
        (done ? '<i class="fas fa-circle-check"></i> ' : '<span class="opacity-60">' + (idx + 1) + '.</span> ') +
        (mod ? mod.title : mid) + '</span>';
    }).join('<span class="text-slate-300 mx-1">→</span>');

    var certBtn = prog.complete
      ? '<button type="button" data-cert-path="' + path.id + '" class="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline"><i class="fas fa-certificate mr-1"></i>View certificate</button>'
      : '';

    return '<div class="rounded-xl border-2 ' + c.ring + ' bg-white dark:bg-slate-800 p-4 shadow-sm" data-path-id="' + path.id + '">' +
      '<div class="flex items-start gap-3 mb-2">' +
      '<div class="w-11 h-11 rounded-xl ' + c.iconBg + ' flex items-center justify-center shrink-0"><i class="fas ' + path.icon + ' text-lg"></i></div>' +
      '<div class="min-w-0 flex-1">' +
      '<div class="font-bold text-sm text-slate-800 dark:text-slate-100">' + path.title + '</div>' +
      '<div class="text-[11px] mt-0.5 ' + c.badge + ' inline-block px-1.5 py-0.5 rounded">' + path.audience + '</div>' +
      '<p class="text-xs text-slate-500 mt-1.5 leading-relaxed">' + path.desc + '</p>' +
      '</div></div>' +
      '<div class="mt-2 flex flex-wrap items-center gap-y-1">' + steps + '</div>' +
      '<div class="mt-3 flex items-center gap-3">' +
      '<div class="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">' +
      '<div class="h-full ' + c.bar + ' transition-all" style="width:' + prog.pct + '%"></div></div>' +
      '<span class="text-xs font-bold tabular-nums ' + (prog.complete ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300') + '">' + prog.done + '/' + prog.total + '</span>' +
      '</div>' +
      certBtn +
      '</div>';
  }).join('');

  host.querySelectorAll('[data-cert-path]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      MG.showCertificate({ type: 'path', refId: btn.getAttribute('data-cert-path') });
    });
  });
};

MG.renderFreePackSection = function() {
  var host = document.getElementById('freePackModules');
  if (!host) return;
  if (MG.state && MG.state.data) MG.ensureProgressFields(MG.state.data);

  host.innerHTML = MG.FREE_PACK_MODULES.map(function (m) {
    var done = MG.isModuleComplete(m.id);
    var statusBadge = done
      ? '<span class="text-[10px] font-bold text-emerald-600 uppercase"><i class="fas fa-check-circle"></i> Completed</span>'
      : '<span class="text-[10px] font-bold text-emerald-600 uppercase">Free</span>';
    var actions = done
      ? '<button type="button" data-cert-mod="' + m.id + '" class="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline"><i class="fas fa-certificate mr-0.5"></i>Certificate</button>'
      : '<button type="button" data-mark-mod="' + m.id + '" class="text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline"><i class="fas fa-check mr-0.5"></i>Mark complete</button>';

    return '<div class="block p-3 rounded-xl border ' + (done ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800') + ' hover:border-teal-500 hover:shadow transition" data-module-id="' + m.id + '">' +
      '<div class="flex items-start gap-3">' +
      '<a href="' + m.href + '" class="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0"><i class="fas ' + m.icon + '"></i></a>' +
      '<div class="min-w-0 flex-1">' +
      '<div class="font-semibold text-sm flex flex-wrap items-center gap-2"><a href="' + m.href + '" class="hover:underline">' + m.title + '</a> ' + statusBadge + '</div>' +
      '<div class="text-xs text-slate-500 mt-0.5">' + m.desc + '</div>' +
      '<div class="mt-2 flex items-center gap-3">' +
      '<a href="' + m.href + '" class="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600"><i class="fas fa-external-link-alt mr-0.5"></i>Open module</a>' +
      actions +
      '</div></div></div></div>';
  }).join('');

  host.querySelectorAll('[data-mark-mod]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var id = btn.getAttribute('data-mark-mod');
      var res = MG.markModuleComplete(id, { source: 'self' });
      if (res && res.ok) {
        MG.showToast(res.already ? 'Already marked complete' : 'Module marked complete ✓');
        if (res.pathJustCompleted) {
          var path = (MG.LEARNING_PATHS || []).find(function(p){ return p.id === res.pathJustCompleted; });
          setTimeout(function(){
            MG.showToast('Learning path completed: ' + (path ? path.title : res.pathJustCompleted) + ' — certificate ready!');
          }, 600);
        }
        MG.renderFreePackSection();
        MG.renderLearningPaths();
      }
    });
  });
  host.querySelectorAll('[data-cert-mod]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      MG.showCertificate({ type: 'module', refId: btn.getAttribute('data-cert-mod') });
    });
  });

  try { MG.renderLearningPaths(); } catch (e) {}
};

/** Digital certificate modal (printable) */
MG.showCertificate = function(opts) {
  opts = opts || {};
  var data = MG.ensureProgressFields(MG.state.data || {});
  var cert = (data.certificates || []).find(function(c) {
    return c.type === opts.type && c.refId === opts.refId;
  });
  // Allow viewing even if cert object missing but progress exists
  if (!cert) {
    var title = opts.refId;
    var name = (data.profile && (data.profile.name || data.profile.fullName)) || 'Learner';
    if (opts.type === 'module') {
      var mod = MG._moduleById(opts.refId);
      if (!mod || !MG.isModuleComplete(opts.refId)) {
        MG.showToast('Complete the module first to unlock the certificate');
        return;
      }
      title = mod.title;
    } else if (opts.type === 'path') {
      var path = (MG.LEARNING_PATHS || []).find(function(p){ return p.id === opts.refId; });
      if (!path || !MG.getPathProgress(path).complete) {
        MG.showToast('Finish all modules in the path to unlock the certificate');
        return;
      }
      title = path.title;
    }
    cert = { type: opts.type, refId: opts.refId, title: title, name: name, issuedAt: Date.now() };
  }

  var issued = new Date(cert.issuedAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  var typeLabel = cert.type === 'path' ? 'Learning Path Certificate' : 'Module Completion Certificate';
  var old = document.getElementById('certModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'certModal';
  modal.className = 'fixed inset-0 z-[80] flex items-center justify-center p-3 bg-black/50';
  modal.innerHTML =
    '<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">' +
    '<div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">' +
    '<span class="font-bold text-sm"><i class="fas fa-certificate text-amber-500 mr-1"></i> Certificate</span>' +
    '<div class="flex gap-2">' +
    '<button type="button" id="certPrintBtn" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700"><i class="fas fa-print mr-1"></i>Print</button>' +
    '<button type="button" id="certCloseBtn" class="px-2 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600">Close</button>' +
    '</div></div>' +
    '<div id="certPrintArea" class="p-6 sm:p-8 text-center bg-gradient-to-b from-amber-50 to-white dark:from-slate-800 dark:to-slate-900">' +
    '<div class="border-4 border-double border-amber-400 rounded-xl p-6 sm:p-8">' +
    '<div class="text-[10px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300 font-bold mb-1">VKS Tech · Mentor App</div>' +
    '<div class="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 mb-1">' + typeLabel + '</div>' +
    '<div class="w-16 h-1 bg-amber-400 mx-auto mb-4 rounded"></div>' +
    '<p class="text-xs text-slate-500 mb-1">This certifies that</p>' +
    '<div class="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-300 mb-2">' + (cert.name || 'Learner') + '</div>' +
    '<p class="text-xs text-slate-500 mb-1">has successfully completed</p>' +
    '<div class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">“' + (cert.title || '') + '”</div>' +
    '<p class="text-[11px] text-slate-500">Issued on ' + issued + '</p>' +
    '<p class="text-[10px] text-slate-400 mt-3">Flexible Packaging · Competence evidence for plant skill matrix</p>' +
    '<div class="mt-4 text-[10px] text-slate-400">vkstech.com · Mentor by VKS Tech</div>' +
    '</div></div></div>';

  document.body.appendChild(modal);
  document.getElementById('certCloseBtn').onclick = function(){ modal.remove(); };
  modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });
  document.getElementById('certPrintBtn').onclick = function() {
    var area = document.getElementById('certPrintArea');
    var w = window.open('', '_blank');
    if (!w) { MG.showToast('Allow pop-ups to print certificate'); return; }
    w.document.write('<!DOCTYPE html><html><head><title>Certificate — ' + (cert.title || '') + '</title>' +
      '<style>body{font-family:system-ui,sans-serif;margin:40px;text-align:center;}' +
      '.box{border:6px double #f59e0b;padding:40px;max-width:560px;margin:0 auto;}' +
      'h1{font-size:20px;margin:8px 0;} .name{font-size:28px;color:#0f766e;font-weight:800;margin:12px 0;}' +
      '.title{font-size:18px;font-weight:700;margin:12px 0;} .meta{color:#64748b;font-size:12px;}</style></head><body>' +
      '<div class="box"><div class="meta">VKS TECH · MENTOR APP</div>' +
      '<h1>' + typeLabel + '</h1><p class="meta">This certifies that</p>' +
      '<div class="name">' + (cert.name || 'Learner') + '</div>' +
      '<p class="meta">has successfully completed</p>' +
      '<div class="title">“' + (cert.title || '') + '”</div>' +
      '<p class="meta">Issued on ' + issued + '</p>' +
      '<p class="meta" style="margin-top:24px">Flexible Packaging · Competence evidence</p>' +
      '<p class="meta">vkstech.com</p></div>' +
      '<script>window.onload=function(){window.print();}<\/script></body></html>');
    w.document.close();
  };
};

/** Deep-link from Man Power / external: ?openModule=id  or  ?path=id */
MG.handleMentorDeepLink = function() {
  try {
    var params = new URLSearchParams(window.location.search || '');
    var openMod = params.get('openModule') || params.get('module');
    var pathId = params.get('path') || params.get('learningPath');
    if (pathId) {
      if (typeof MG.showCategory === 'function') MG.showCategory('packaging');
      setTimeout(function() {
        var el = document.querySelector('[data-path-id="' + pathId + '"]');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-offset-2', 'ring-teal-500');
        }
      }, 400);
    }
    if (openMod) {
      var mod = MG._moduleById(openMod);
      if (mod && mod.href) {
        // Open module in same tab after short delay so path highlight can show
        if (typeof MG.showCategory === 'function') MG.showCategory('packaging');
        setTimeout(function() {
          window.location.href = mod.href + (mod.href.indexOf('?') >= 0 ? '&' : '?') + 'from=manpower';
        }, pathId ? 900 : 200);
      }
    }
  } catch (e) { console.warn('[Mentor] deep link', e); }
};


// ========== Theme ==========
MG.applyTheme = function(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(MG.THEME_KEY, theme);
}

// ========== UI Helpers ==========
MG.showToast = function(msg, duration) {
  const el = MG.$('#toast');
  if (!el) return;
  el.textContent = msg;
  // Long errors need more time + ensure visible above bottom browser bars
  if (duration == null) duration = String(msg || '').length > 60 ? 5500 : 2800;
  el.classList.remove('translate-y-16', 'translate-y-24', 'opacity-0');
  el.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(MG._toastTimer);
  MG._toastTimer = setTimeout(() => {
    el.classList.add('translate-y-24', 'opacity-0');
    el.classList.remove('translate-y-0', 'opacity-100');
  }, duration);
}

MG.formatDate = function(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

MG.youtubeId = function(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ========== Category navigation (Packaging vs Career & AI) ==========
MG.showCategory = function(cat) {
  var picker = document.getElementById('categoryPicker');
  var secP = document.getElementById('sectionPackaging');
  var secC = document.getElementById('sectionCareer');
  var eco = document.getElementById('vksEcosystem');
  var testi = document.getElementById('mentorTestimonials');
  var homeOnly = !cat;
  if (picker) picker.classList.toggle('hidden', !!cat);
  // Home-only blocks must hide when a path is open (was leaving empty-looking home)
  if (eco) eco.classList.toggle('hidden', !!cat);
  if (testi) testi.classList.toggle('hidden', !!cat);
  if (secP) secP.classList.toggle('hidden', cat !== 'packaging');
  if (secC) secC.classList.toggle('hidden', cat !== 'career');
  if (cat === 'packaging') {
    try { MG.renderFreePackSection(); } catch (e) {}
  }
  // Ensure topic grids are filled when opening a path (without re-binding nav)
  if (cat === 'packaging' || cat === 'career') {
    try {
      var gridCareer = MG.$('#topicsGrid');
      var gridPack = document.getElementById('topicsGridPackaging');
      var need = (cat === 'career' && gridCareer && !gridCareer.children.length) ||
                 (cat === 'packaging' && gridPack && !gridPack.children.length);
      if (need && typeof MG.renderCatalog === 'function') MG.renderCatalog();
    } catch (e3) {}
  }
  // Keep catalog intro visible only on home
  var intro = document.getElementById('catalogIntro');
  if (intro) intro.classList.toggle('hidden', !!cat);
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e2) {}
};

MG.initCategoryNav = function() {
  if (MG._categoryNavBound) return;
  MG._categoryNavBound = true;
  var bp = document.getElementById('catBtnPackaging');
  var bc = document.getElementById('catBtnCareer');
  if (bp) bp.addEventListener('click', function () { MG.showCategory('packaging'); });
  if (bc) bc.addEventListener('click', function () { MG.showCategory('career'); });
  document.querySelectorAll('.back-to-cats').forEach(function (btn) {
    btn.addEventListener('click', function () { MG.showCategory(null); });
  });
};

MG._topicHourlyRate = function(topic) {
  var trackId = (topic && topic.track) || 'career_ai';
  var tr = (MG.TRACKS && MG.TRACKS[trackId]) || (MG.TRACKS && MG.TRACKS.career_ai) || { hourlyRate: 699 };
  return Number(tr.hourlyRate) || 699;
};

MG._buildTopicCard = function(topic, activeData) {
  const unlocked = !!(activeData && activeData.unlocked && activeData.unlocked[topic.id]);
  const card = document.createElement('div');
  card.className = 'topic-card';
  card.dataset.id = topic.id;
  card.dataset.track = topic.track || 'career_ai';

  const rate = MG._topicHourlyRate(topic);
  const iconsHtml = (topic.icons || []).map(ic => {
    const title = (typeof ic === 'object' && ic.title) ? ic.title : '';
    if (typeof ic === 'object' && ic.img) {
      return `<span class="logo-badge logo-badge-img" title="${title}"><img src="${ic.img}" alt="${title}" width="28" height="28"/></span>`;
    }
    const isFa = typeof ic === 'object' && ic.icon && String(ic.icon).startsWith('fa-');
    const bg = (typeof ic === 'object' && ic.bg) ? ic.bg : '#ffffff';
    const content = (typeof ic === 'object')
      ? (isFa ? `<i class="${ic.icon}"></i>` : ic.icon)
      : ic;
    return `<span class="logo-badge" title="${title}" style="background:${bg};color:#fff;">${content}</span>`;
  }).join('');

  card.innerHTML = `
    <div class="card-banner" style="background:${topic.gradient}">
      ${iconsHtml}
      <span class="status-badge ${unlocked ? 'status-unlocked' : 'status-locked'}" data-catalog-rate="${topic.track || 'career_ai'}">
        ${unlocked ? '✓ Unlocked' : '₹' + rate.toLocaleString('en-IN') + '/Hr'}
      </span>
    </div>
    <div class="card-body">
      <h3 class="font-bold text-sm sm:text-[15px] leading-snug mb-1.5">${topic.title}</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-2.5 line-clamp-2">${topic.hook}</p>
      <div class="flex flex-wrap gap-0.5 mb-3">
        ${(topic.tags || []).slice(0, 5).map(t => `<span class="tag">${t}</span>`).join('')}
        ${(topic.tags || []).length > 5 ? `<span class="tag">+${topic.tags.length - 5}</span>` : ''}
      </div>
      <div class="flex gap-2">
        ${unlocked
          ? `<button class="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold enter-ws-btn">
               <i class="fas fa-door-open mr-1"></i> Enter Workspace
             </button>`
          : `<button class="flex-1 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold book-btn">
               <i class="fas fa-calendar-check mr-1"></i> Book One-to-One Session
             </button>`
        }
        <button class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-medium book-btn hover:bg-slate-50 dark:hover:bg-slate-700" title="Book more hours">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
  `;

  card.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      MG.openBooking(topic.id);
    });
  });
  const enterBtn = card.querySelector('.enter-ws-btn');
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      MG.openWorkspace(topic.id);
    });
  }
  if (unlocked) {
    card.addEventListener('click', () => MG.openWorkspace(topic.id));
  }
  return card;
};

// ========== Render Catalog ==========
MG.renderCatalog = function() {
  const gridCareer = MG.$('#topicsGrid');
  const gridPack = document.getElementById('topicsGridPackaging');
  const activeData = MG.state.data || { unlocked: {} };

  if (gridCareer) gridCareer.innerHTML = '';
  if (gridPack) gridPack.innerHTML = '';

  (MG.TOPICS || []).forEach(topic => {
    const track = topic.track || 'career_ai';
    const card = MG._buildTopicCard(topic, activeData);
    if (track === 'packaging') {
      if (gridPack) gridPack.appendChild(card);
    } else {
      if (gridCareer) gridCareer.appendChild(card);
    }
  });
  try { MG.renderFreePackSection(); } catch (e) {}
  try { MG.initCategoryNav(); } catch (e2) {}
  try { MG.loadMentorTestimonials(); } catch (e3) {}
}

// ========== In-app testimonials (GitHub shared library) ==========
MG.loadMentorTestimonials = async function () {
  var host = document.getElementById('mentorTestimonialsScroll');
  if (!host) return;
  var RAW = 'https://raw.githubusercontent.com/vkstecho/manpower/main/testimonials/';
  var CDN = 'https://cdn.jsdelivr.net/gh/vkstecho/manpower@main/testimonials/';
  var urls = [RAW + 'htmls/testimonials.html', CDN + 'htmls/testimonials.html'];
  var imgBase = [
    'https://cdn.jsdelivr.net/gh/vkstecho/manpower@main/testimonials/Images/',
    RAW + 'Images/'
  ];

  function starsHtml(rating) {
    var r = Math.max(0, Math.min(5, Number(rating) || 0));
    var full = Math.floor(r);
    var half = (r - full) >= 0.25;
    var html = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= full) html += '<i class="fas fa-star text-amber-400 text-[10px]"></i>';
      else if (i === full + 1 && half) html += '<i class="fas fa-star-half-alt text-amber-400 text-[10px]"></i>';
      else html += '<i class="far fa-star text-slate-300 text-[10px]"></i>';
    }
    return html;
  }

  function avatarUrl(folder) {
    if (!folder || folder === 'placeholder') return '';
    return imgBase[0] + encodeURIComponent(folder) + '/avatar.jpg';
  }

  function parseList(html) {
    var m = html.match(/const\s+TESTIMONIALS\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) m = html.match(/var\s+TESTIMONIALS\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) return null;
    try {
      // eslint-disable-next-line no-new-func
      return (new Function('return (' + m[1] + ')'))();
    } catch (e) {
      return null;
    }
  }

  var list = null;
  for (var i = 0; i < urls.length && !list; i++) {
    try {
      var res = await fetch(urls[i], { cache: 'force-cache' });
      if (!res.ok) continue;
      list = parseList(await res.text());
    } catch (e) {}
  }
  if (!list || !list.length) {
    host.innerHTML = '<div class="shrink-0 w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm text-slate-500">Testimonials unavailable offline.</div>';
    return;
  }

  // Skip pure founder featured as first, show mix; limit 10 for horizontal scroll
  var items = list.filter(function (t) { return t && t.quote; });
  var sum = 0;
  items.forEach(function (t) { sum += Number(t.stars) || 0; });
  var avg = items.length ? (Math.round((sum / items.length) * 10) / 10) : 0;
  var avgEl = document.getElementById('mentorTestAvg');
  var cntEl = document.getElementById('mentorTestCount');
  if (avgEl) avgEl.textContent = avg.toFixed(1);
  if (cntEl) cntEl.textContent = String(items.length);

  host.innerHTML = items.map(function (t) {
    var av = avatarUrl(t.imageFolder);
    var initial = (t.name || '?').charAt(0).toUpperCase();
    var avHtml = av
      ? '<img src="' + av + '" alt="" class="w-9 h-9 rounded-full object-cover bg-slate-200" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"/><span class="hidden w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-700 text-white text-xs font-bold items-center justify-center">' + initial + '</span>'
      : '<span class="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-700 text-white text-xs font-bold flex items-center justify-center">' + initial + '</span>';
    var quote = String(t.quote || '').replace(/</g, '&lt;');
    if (quote.length > 160) quote = quote.slice(0, 157) + '…';
    return (
      '<article class="mentor-t-card shrink-0 w-[85%] sm:w-72 snap-start p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm">' +
        '<div class="flex items-center gap-1 mb-2">' + starsHtml(t.stars) + '</div>' +
        '<p class="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed mb-3">“' + quote + '”</p>' +
        '<div class="flex items-center gap-2.5 mt-auto">' +
          '<div class="relative shrink-0">' + avHtml + '</div>' +
          '<div class="min-w-0">' +
            '<div class="text-xs font-bold text-slate-900 dark:text-white truncate">' + String(t.name || '').replace(/</g, '&lt;') + '</div>' +
            '<div class="text-[10px] text-slate-500 truncate">' + String(t.role || '').replace(/</g, '&lt;') + (t.plant ? ' · ' + String(t.plant).replace(/</g, '&lt;') : '') + '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');
};


})(window.MG = window.MG || {});
