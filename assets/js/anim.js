/* RP Ecosystem · Motion enhancements (anim.js)
 * Loads on top of existing site.js. Uses Motion (motion.dev) + GSAP via CDN.
 * All animations honour prefers-reduced-motion.
 * Animates only transform/opacity — no layout-affecting properties.
 */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // do nothing if user opted out

  // Wait for both Motion and GSAP to be present (loaded via CDN in <head>)
  const ready = () => window.Motion && window.gsap && window.ScrollTrigger;
  const start = () => {
    const { animate, inView, scroll, stagger } = window.Motion;
    const { gsap } = window;
    gsap.registerPlugin(window.ScrollTrigger);

    // ---------- 1. Stagger reveal of cards in sections ----------
    // Targets generic card-like containers across the whole document.
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
        { opacity: [0, 1], y: [24, 0] },
        { duration: 0.6, easing: [0.22, 1, 0.36, 1] }
      );
      return () => {}; // run once
    }, { amount: 0.18 });

    // ---------- 2. Headings: split into words and reveal with blur ----------
    document.querySelectorAll('h1, h2').forEach((h) => {
      if (h.dataset.anim === 'done' || !h.textContent.trim()) return;
      // Walk text nodes inside h, wrapping each word in span.
      const split = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          const parts = node.textContent.split(/(\s+)/);
          parts.forEach((p) => {
            if (/^\s+$/.test(p)) {
              frag.appendChild(document.createTextNode(p));
            } else if (p.length) {
              const span = document.createElement('span');
              span.className = 'word';
              span.style.display = 'inline-block';
              span.style.willChange = 'transform, opacity, filter';
              span.textContent = p;
              frag.appendChild(span);
            }
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(split);
        }
      };
      Array.from(h.childNodes).forEach(split);
      h.dataset.anim = 'done';

      const words = h.querySelectorAll('.word');
      inView(h, () => {
        animate(words,
          { opacity: [0, 1], y: [16, 0], filter: ['blur(6px)', 'blur(0px)'] },
          { duration: 0.55, easing: [0.22, 1, 0.36, 1], delay: stagger(0.04, { start: 0.05 }) }
        );
      }, { amount: 0.3 });
    });

    // ---------- 3. Magnetic CTA buttons ----------
    const magnets = document.querySelectorAll('.nav-cta, .pq, .cta-primary, .b-letter');
    magnets.forEach((el) => {
      const strength = 0.25;
      el.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0px, 0px)';
      });
    });

    // ---------- 4. 3D tilt on cards (subtle premium effect) ----------
    const tiltTargets = document.querySelectorAll('.fact-block, .ai-card, .gs-card, .num-card');
    tiltTargets.forEach((el) => {
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = (-py * 4).toFixed(2);
        const ry = (px * 4).toFixed(2);
        el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });

    // ---------- 5. Parallax on cover and chap-open via GSAP ScrollTrigger ----------
    document.querySelectorAll('.cover, .chap-open').forEach((sec) => {
      const layer = sec.querySelector('.cover-body, h2, .chap-no');
      if (!layer) return;
      gsap.to(layer, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    });

    // ---------- 6. Sticky-narrative — reveal facts on scroll progression ----------
    const facts = document.querySelectorAll('.sn-right .fact-block');
    facts.forEach((f, i) => {
      gsap.fromTo(f,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: f,
            start: 'top 80%',
            once: true
          }
        }
      );
    });

    // ---------- 7. Marquee speed boost on hover (UX delight) ----------
    const marquee = document.querySelector('.marquee-track');
    if (marquee) {
      marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
      marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
    }

    // ---------- 8. Smooth scroll for TOC and nav anchors ----------
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

    // ---------- 9. Reading progress bar ----------
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

  // Poll for CDN libs to be ready, then start.
  const tryStart = () => { if (ready()) start(); else setTimeout(tryStart, 50); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStart);
  } else {
    tryStart();
  }
})();
