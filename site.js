// Sticky nav: add scrolled class after passing hero
(function() {
  const nav = document.querySelector('.nav');
  const stickyCta = document.querySelector('.sticky-cta');

  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      if (y > 100) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    }
    if (stickyCta) {
      const docEnd = document.body.scrollHeight - window.innerHeight - 600;
      if (y > 800 && y < docEnd) stickyCta.classList.add('show');
      else stickyCta.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Reveal-on-scroll via IntersectionObserver
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// Number ticker for hero stats
(function() {
  const ticks = document.querySelectorAll('.tick');
  if (!ticks.length || !('IntersectionObserver' in window)) {
    ticks.forEach(t => t.textContent = t.dataset.value);
    return;
  }
  function animate(el) {
    const target = parseInt(el.dataset.value.replace(/\s/g, ''), 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    function frame(t) {
      const p = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(target * eased);
      el.textContent = cur.toLocaleString('ru-RU').replace(/,/g, ' ') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  ticks.forEach(t => io.observe(t));
})();

// Smooth-scroll on nav links (smooth-scroll is in CSS but offset for sticky nav)
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

// Reveal fallback: ensure all .reveal become visible within 1.5s no matter what
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
}, 1800);

// ============ SIMULATOR ============
(function() {
  const sim = document.querySelector('.simulator');
  if (!sim) return;

  const inputs = {
    employees: sim.querySelector('[data-sim="employees"]'),
    fot: sim.querySelector('[data-sim="fot"]'),
    stations: sim.querySelector('[data-sim="stations"]'),
    requests: sim.querySelector('[data-sim="requests"]'),
    contracts: sim.querySelector('[data-sim="contracts"]'),
  };
  const vals = {
    employees: sim.querySelector('[data-sim-v="employees"]'),
    fot: sim.querySelector('[data-sim-v="fot"]'),
    stations: sim.querySelector('[data-sim-v="stations"]'),
    requests: sim.querySelector('[data-sim-v="requests"]'),
    contracts: sim.querySelector('[data-sim-v="contracts"]'),
  };
  const out = {
    total: sim.querySelector('[data-sim-out="total"]'),
    monthly: sim.querySelector('[data-sim-out="monthly"]'),
    payback: sim.querySelector('[data-sim-out="payback"]'),
  };

  function fmt(n) {
    return Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');
  }

  function recalc() {
    const employees = +inputs.employees.value;
    const fot = +inputs.fot.value;            // monthly USD
    const stations = +inputs.stations.value;
    const requests = +inputs.requests.value;  // per day
    const contracts = +inputs.contracts.value; // per year

    // 1. HR начисления — ошибки 0.6% от ФОТ
    const hrErrors = fot * 0.006 * 12;

    // 2. HR время сверка табелей — ~30% × 2-3 человека × $400 × 12
    const hrAnalysts = Math.max(2, Math.min(5, Math.ceil(employees / 150)));
    const hrTime = 0.30 * hrAnalysts * 400 * 12;

    // 3. Заявки — время руководителей × ставка
    const requestsSaving = employees * 0.4 * 10 * 12;

    // 4. Антифрод табеля — 0.6% сотрудников × avg salary × 12
    const avgSalary = employees > 0 ? fot / employees : 0;
    const antifraud = employees * 0.006 * avgSalary * 12;

    // 5. Юристы — договоры × 1.5ч × $25
    const legalSaving = contracts * 1.5 * 25;

    // 6. Колл-центр — обращения/день × 3мин × $5/ч × 365 × 30% redirect
    const callSaving = requests * (3/60) * 5 * 365 * 0.3;

    // 7. ML спрос — экономия на запасах per АЗС (~$80/мес/АЗС)
    const mlSaving = stations * 80 * 12;

    // 8. ЭЗС analytics — небольшая, фиксированная
    const evSaving = 8000;

    const total = hrErrors + hrTime + requestsSaving + antifraud + legalSaving + callSaving + mlSaving + evSaving;
    const monthly = total / 12;

    // RedStaff Этапы 2+3 = $66 000
    const paybackMonths = total > 0 ? (66000 / monthly) : 999;
    const paybackText = paybackMonths < 12 ? `${paybackMonths.toFixed(1)} мес` : `${(paybackMonths/12).toFixed(1)} лет`;

    out.total.innerHTML = '$' + fmt(total);
    out.monthly.textContent = '$' + fmt(monthly) + ' / мес';
    out.payback.textContent = paybackText;
  }

  function updateValueLabels() {
    vals.employees.textContent = (+inputs.employees.value).toLocaleString('ru-RU').replace(/,/g, ' ') + ' чел.';
    vals.fot.textContent = '$' + (+inputs.fot.value).toLocaleString('ru-RU').replace(/,/g, ' ');
    vals.stations.textContent = (+inputs.stations.value) + ' АЗС';
    vals.requests.textContent = (+inputs.requests.value).toLocaleString('ru-RU').replace(/,/g, ' ') + ' / день';
    vals.contracts.textContent = (+inputs.contracts.value).toLocaleString('ru-RU').replace(/,/g, ' ') + ' / год';
  }

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => {
      updateValueLabels();
      recalc();
    });
  });

  updateValueLabels();
  recalc();
})();

// ============ LEDGER (11 tensions): click row → update detail panel ============
(function() {
  const list = document.querySelector('.ledger-list');
  const detail = document.querySelector('.ledger-detail');
  if (!list || !detail) return;

  const rows = list.querySelectorAll('.ledger-row');

  function showRow(row) {
    rows.forEach(r => r.classList.remove('active'));
    row.classList.add('active');
    const num = row.dataset.n;
    const title = row.dataset.title;
    const body = row.dataset.body;
    const fix = row.dataset.fix;
    const badges = (row.dataset.badges || '').split(',').filter(Boolean);

    const badgeMap = { pub: 'Публично', hyp: 'Гипотеза', tz: 'Из ТЗ' };
    const badgeClass = (b) => b === 'pub' || b === 'tz' ? 'pub' : 'hyp';
    const badgeLabel = (b) => b === 'pub' ? '✓ Публично' : b === 'tz' ? '✓ Из ТЗ' : '⚑ Гипотеза';

    detail.innerHTML = `
      <div class="ld-no">
        <span class="num">${num}</span>
        <div class="ld-meta">
          <div class="badges">${badges.map(b => `<span class="b ${badgeClass(b)}">${badgeLabel(b)}</span>`).join('')}</div>
        </div>
      </div>
      <div class="ld-t">${title}</div>
      <div class="ld-b">${body}</div>
      <div class="ld-fix">
        <div class="ll">Решение в архитектуре</div>
        <div class="vv">→ ${fix}</div>
      </div>
    `;
  }

  rows.forEach(row => row.addEventListener('click', () => showRow(row)));
  if (rows.length) showRow(rows[0]);
})();

// ============ HORIZONTAL MODULE SCROLL ============
(function() {
  const track = document.querySelector('.h-scroll-track');
  if (!track) return;
  const prev = document.querySelector('.h-scroll-bar .prev');
  const next = document.querySelector('.h-scroll-bar .next');
  const cur = document.querySelector('.h-scroll-bar .pages .cur');
  const total = document.querySelector('.h-scroll-bar .pages .total');
  const progress = document.querySelector('.h-scroll-bar .progress span');
  const books = track.querySelectorAll('.h-book');

  if (total) total.textContent = String(books.length).padStart(2, '0');

  function updateProgress() {
    const scrollLeft = track.scrollLeft;
    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? scrollLeft / max : 0;
    // current index
    const bookWidth = books[0] ? books[0].offsetWidth + 24 : 1;
    const idx = Math.round(scrollLeft / bookWidth);
    const clamped = Math.max(0, Math.min(books.length - 1, idx));
    if (cur) cur.textContent = String(clamped + 1).padStart(2, '0');
    if (progress) {
      const segWidth = 100 / books.length;
      progress.style.left = (segWidth * clamped) + '%';
      progress.style.width = segWidth + '%';
    }
  }
  function scrollByBook(dir) {
    const bookWidth = books[0] ? books[0].offsetWidth + 24 : track.clientWidth;
    track.scrollBy({ left: dir * bookWidth, behavior: 'smooth' });
  }
  if (prev) prev.addEventListener('click', () => scrollByBook(-1));
  if (next) next.addEventListener('click', () => scrollByBook(1));
  track.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

// ============ PROGRESS RAIL (right side dots) ============
(function() {
  const rail = document.querySelector('.progress-rail');
  if (!rail) return;
  const links = rail.querySelectorAll('a');
  const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll() {
    const y = window.scrollY + window.innerHeight * 0.4;
    let active = -1;
    sections.forEach((s, i) => {
      if (s.offsetTop <= y) active = i;
    });
    links.forEach((a, i) => a.classList.toggle('active', i === active));

    // show rail after scrolling past cover
    if (window.scrollY > window.innerHeight * 0.8) rail.classList.add('show');
    else rail.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
