// RP Ecosystem · interactions (Asystem)

// ===== Ecosystem ROI simulator =====
// All coefficients are model estimates based on typical retail fuel
// industry numbers. ⚑ Calibrated on Discovery with actual client data.
window.ecosystemSimulator = function () {
  return {
    // Inputs (defaults: orientation values, NOT facts about client)
    staff: 300,
    payroll: 80000,        // monthly USD, group total
    stations: 200,
    tickets: 400,          // client service interactions / day
    contracts: 1500,       // legal department contracts / year

    // ===== Outputs =====
    // Each value is annual USD savings, formula shown inline.

    // 1. Payroll calculation errors due to HR/1C desync
    // Model: 0.5% of monthly payroll × 12 months
    eFOT() {
      return Math.round(this.payroll * 0.005 * 12);
    },

    // 2. HR time spent on manual timesheet reconciliation
    // Model: 2.5 HR specialists × 30% time × $400/mo × 12
    eHRTime() {
      const hrSpecialists = Math.max(2, Math.round(this.staff / 150));
      return Math.round(hrSpecialists * 0.3 * 400 * 12);
    },

    // 3. Manager time on processing requests (vacations / sick / etc)
    // Model: managers count × hours/week × 50 weeks × $10/h
    eRequests() {
      const managers = Math.max(5, Math.round(this.staff / 20));
      return Math.round(managers * 1.5 * 50 * 10);
    },

    // 4. Antifraud in timesheets (GPS + auto-close)
    // Model: 0.5% staff × $250/mo × 12
    eAntifraud() {
      return Math.round(this.staff * 0.005 * 250 * 12);
    },

    // 5. Legal department efficiency (AI assistant)
    // Model: 1.5 hours saved per contract × $15/h × contracts
    eLegal() {
      return Math.round(this.contracts * 1.5 * 15);
    },

    // 6. Client service load reduction
    // Model: tickets/day × 365 × 5 min × 30% deflection × $0.08/min
    eClientService() {
      return Math.round(this.tickets * 365 * 5 * 0.3 * 0.08);
    },

    breakdown() {
      const rows = [
        { label: 'Ошибки начисления ФОТ',           value: this.eFOT(),           formula: '0,5% × ФОТ × 12 мес' },
        { label: 'Время HR на табели',              value: this.eHRTime(),        formula: '~штат/150 спец × 30% × $400/мес' },
        { label: 'Скорость согласования заявок',    value: this.eRequests(),      formula: 'руководители × 1.5ч/нед × 50 × $10' },
        { label: 'Антифрод табеля',                 value: this.eAntifraud(),     formula: '0,5% × штат × $250/мес × 12' },
        { label: 'Юридический отдел',               value: this.eLegal(),         formula: 'договоры × 1,5ч × $15' },
        { label: 'Клиентский сервис',               value: this.eClientService(), formula: 'обращения × 365 × 5мин × 30% × $0,08' },
      ];
      const max = Math.max(...rows.map(r => r.value), 1);
      return rows.map(r => ({ ...r, pct: Math.round((r.value / max) * 100) }));
    },

    total() {
      return this.breakdown().reduce((sum, r) => sum + r.value, 0);
    },

    paybackMonths() {
      const monthly = this.total() / 12;
      if (monthly <= 0) return '—';
      return Math.round(66000 / monthly);
    },
  };
};

document.addEventListener('DOMContentLoaded', () => {
  // GSAP scroll-reveal for sections
  if (typeof gsap !== 'undefined' && gsap.registerPlugin && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('section').forEach((section) => {
      const headings = section.querySelectorAll('h1, h2, h3');
      const cards = section.querySelectorAll('.bg-coal, .bg-ink');
      gsap.from(headings, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 80%' },
      });
      gsap.from(cards, {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: section, start: 'top 70%' },
      });
    });
  }

  // Nav darken on scroll
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) nav.classList.add('bg-ink/90');
      else nav.classList.remove('bg-ink/90');
    });
  }
});
