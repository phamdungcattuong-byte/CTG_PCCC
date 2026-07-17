// ============================================================
// CTG MAP — Stylized Bắc Ninh region with sites + risk heatmap
// ============================================================

window.renderBacNinhMap = function(container, opts = {}) {
  const showLabels = opts.labels !== false;
  const showLegend = opts.legend !== false;
  const filter = opts.filter || null; // e.g. site => bool
  const interactive = opts.interactive !== false;
  const sites = window.SITES.filter(s => !filter || filter(s));

  const riskColor = { crit: '#EF4444', warn: '#F59E0B', ok: '#22C55E' };
  const kindIcon = {
    construction: '🏗',
    residential:  '🏢',
    hospitality:  '🏨',
    warehouse:    '📦',
  };

  const svg = `
  <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stop-color="#0F1A2C"/>
        <stop offset="100%" stop-color="#05080F"/>
      </linearGradient>
      <radialGradient id="riverGlow" cx="50%" cy="50%">
        <stop offset="0%" stop-color="#1E40AF" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#1E40AF" stop-opacity="0"/>
      </radialGradient>
      <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(46,67,99,.35)" stroke-width="0.5"/>
      </pattern>
      <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <rect width="800" height="450" fill="url(#mapBg)"/>
    <rect width="800" height="450" fill="url(#mapGrid)"/>

    <!-- Province outline (stylized Bắc Ninh) -->
    <path d="M 90 130 Q 130 90 220 100 Q 320 105 400 90 Q 520 85 620 115 Q 720 145 720 220 Q 710 300 640 340 Q 560 380 460 385 Q 350 390 260 370 Q 160 350 110 290 Q 70 220 90 130 Z"
          fill="rgba(22,168,153,.05)" stroke="rgba(34,211,193,.5)" stroke-width="1.4" stroke-dasharray="4 3"/>

    <!-- River (Sông Cầu / Đuống stylized) -->
    <path d="M 60 200 Q 200 260 380 240 Q 550 220 740 280"
          fill="none" stroke="#1E40AF" stroke-width="8" opacity=".35" stroke-linecap="round" filter="url(#glowSoft)"/>
    <path d="M 60 200 Q 200 260 380 240 Q 550 220 740 280"
          fill="none" stroke="#3B82F6" stroke-width="2" opacity=".7" stroke-linecap="round"/>

    <!-- Sub-districts stylized shapes -->
    <ellipse cx="270" cy="200" rx="90" ry="60" fill="rgba(255,255,255,.02)" stroke="rgba(107,125,155,.35)" stroke-width="0.8"/>
    <ellipse cx="420" cy="180" rx="80" ry="55" fill="rgba(255,255,255,.02)" stroke="rgba(107,125,155,.35)" stroke-width="0.8"/>
    <ellipse cx="560" cy="220" rx="90" ry="65" fill="rgba(255,255,255,.02)" stroke="rgba(107,125,155,.35)" stroke-width="0.8"/>
    <ellipse cx="380" cy="310" rx="130" ry="55" fill="rgba(255,255,255,.02)" stroke="rgba(107,125,155,.35)" stroke-width="0.8"/>

    <!-- District labels -->
    <text x="270" y="145" text-anchor="middle" fill="#6F819C" font-size="10" font-family="var(--font)" font-weight="600" letter-spacing="1.5">TP BẮC NINH</text>
    <text x="420" y="125" text-anchor="middle" fill="#6F819C" font-size="9" font-family="var(--font)" letter-spacing="1.5">YÊN PHONG</text>
    <text x="560" y="160" text-anchor="middle" fill="#6F819C" font-size="9" font-family="var(--font)" letter-spacing="1.5">QUẾ VÕ</text>
    <text x="380" y="365" text-anchor="middle" fill="#6F819C" font-size="9" font-family="var(--font)" letter-spacing="1.5">TIÊN DU · TỪ SƠN</text>

    <!-- Compass -->
    <g transform="translate(740, 60)">
      <circle r="24" fill="rgba(0,0,0,.4)" stroke="rgba(107,125,155,.4)"/>
      <path d="M 0 -18 L 5 0 L 0 5 L -5 0 Z" fill="#EF4444"/>
      <path d="M 0 18 L 5 0 L 0 -5 L -5 0 Z" fill="#6F819C" opacity=".7"/>
      <text y="-28" text-anchor="middle" fill="#A6B5CC" font-size="9" font-weight="700">N</text>
    </g>

    <!-- Scan sweep -->
    <g style="transform-origin:center;animation:mapSweep 6s linear infinite" opacity=".18">
      <path d="M 400 225 L 400 0 A 225 225 0 0 1 620 200 Z" fill="url(#riverGlow)"/>
    </g>
  </svg>
  `;

  const markers = sites.map(s => {
    const label = showLabels ? `<div class="mk-label">${kindIcon[s.kind] || '📍'} ${s.name}</div>` : '';
    const cls = s.kind === 'warehouse' ? 'map-marker warehouse' : 'map-marker';
    return `<div class="${cls}" data-risk="${s.risk}" data-site="${s.id}" style="left:${s.x}%;top:${s.y}%" title="${s.name} — ${s.staff} người">
      <div class="mk-dot"></div>${label}
    </div>`;
  }).join('');

  const legend = showLegend ? `
    <div class="map-legend">
      <div class="lg"><span class="sw" style="background:#EF4444;box-shadow:0 0 8px #EF4444"></span> Rủi ro cao</div>
      <div class="lg"><span class="sw" style="background:#F59E0B"></span> Cảnh giác</div>
      <div class="lg"><span class="sw" style="background:#34D399"></span> Bình thường</div>
      <div class="lg"><span class="sw" style="background:#38BDF8;border-radius:2px"></span> Kho vật tư</div>
    </div>` : '';

  container.innerHTML = `${svg}${markers}${legend}`;
  container.classList.add('map-wrap');

  if (interactive) {
    container.querySelectorAll('.map-marker').forEach(el => {
      el.addEventListener('click', () => {
        const site = window.byId(window.SITES, el.dataset.site);
        if (site && opts.onSelect) opts.onSelect(site);
      });
    });
  }
};

// Inject keyframes once
(function injectMapKeyframes() {
  if (document.getElementById('mapKfs')) return;
  const st = document.createElement('style');
  st.id = 'mapKfs';
  st.textContent = `@keyframes mapSweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(st);
})();
