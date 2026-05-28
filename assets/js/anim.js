/* RP Ecosystem · Motion enhancements (anim.js) v2 — minimal & safe.
 * Lessons from v1: heading split + 3D tilt + parallax = layout disasters
 * on real viewports. Removed. Kept only safe progressive enhancement.
 * All animations honour prefers-reduced-motion.
 * Animates only opacity + translateY — no transform that affects layout.
 */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const ready = () => window.Motion;
  const start = () => {
    const { animate, inView } = window.Motion;

    // ---------- 1. Gentle stagger reveal of cards on scroll ----------
    // Strictly opacity + small Y. No tilt, no perspective, no width changes.
    const cardSelectors = [
      '.fact-block',
      '.gs-card',
      '.ledger-row',
      '.ai-card',
      '.pack-card',
      '.h-sub',
      '.timeline-step',
      '.num-card',
      '.pillar'
    ].join(',');

    inView(cardSelectors, ({ target }) => {
      animate(target,
        { opacity: [0, 1], y: [16, 0] },
        { duration: 0.5, easing: [0.22, 1, 0.36, 1] }
      );
      return () => {};
    }, { amount: 0.15 });

    // ---------- 2. Marquee pauses on hover ----------
    const marquee = document.querySelector('.marquee-track');
    if (marquee) {
      marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
      marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
    }

    // ---------- 3. Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const tgt = document.getElementById(id);
        if (!tgt) return;
        e.preventDefault();
        const top = tgt.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    // ---------- 4. Reading progress bar (no layout impact) ----------
    const bar = document.createElement('div');
    bar.id = 'read-progress';
    Object.assign(bar.style, {
      position: 'fixed', top: '0', left: '0', height: '2px',
      width: '0%', background: '#E30613', zIndex: '9999',
      transition: 'width 80ms linear', pointerEvents: 'none'
    });
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = Math.max(0, Math.min(100, (window.scrollY / max) * 100));
      bar.style.width = pct + '%';
    }, { passive: true });
  };

  const tryStart = () => { if (ready()) start(); else setTimeout(tryStart, 50); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStart);
  } else {
    tryStart();
  }
})();
