/* FEATURE MODULE: ui
 * Edit this file for related Mentor features. See AI_INDEX.md / HOW_AI_READS.md
 */
(function (MG) {
'use strict';
// ========== Free Flexible Packaging training modules ==========

MG.renderFreePackSection = function() {
  var host = document.getElementById('freePackModules');
  if (!host) return;
  host.innerHTML = MG.FREE_PACK_MODULES.map(function (m) {
    return '<a href="' + m.href + '" class="block p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-teal-500 hover:shadow transition">' +
      '<div class="flex items-start gap-3">' +
      '<div class="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0"><i class="fas ' + m.icon + '"></i></div>' +
      '<div class="min-w-0"><div class="font-semibold text-sm">' + m.title + ' <span class="text-[10px] font-bold text-emerald-600 uppercase">Free</span></div>' +
      '<div class="text-xs text-slate-500 mt-0.5">' + m.desc + '</div></div></div></a>';
  }).join('');
}


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
