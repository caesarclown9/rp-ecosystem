/* Слайд-презентация: счётчик, прогресс, навигация стрелками/кнопками. */
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  const cur = document.querySelector('.deck-bar .count .cur');
  const tot = document.querySelector('.deck-bar .count .tot');
  const progress = document.querySelector('.deck-progress');
  if (tot) tot.textContent = String(slides.length).padStart(2, '0');

  let active = 0;
  function setActive(i) {
    active = Math.max(0, Math.min(slides.length - 1, i));
    if (cur) cur.textContent = String(active + 1).padStart(2, '0');
    if (progress) progress.style.width = ((active + 1) / slides.length * 100) + '%';
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(slides.indexOf(e.target));
      });
    }, { threshold: 0.5 });
    slides.forEach((s) => io.observe(s));
  }

  function goTo(i) {
    const t = Math.max(0, Math.min(slides.length - 1, i));
    slides[t].scrollIntoView({ behavior: 'smooth' });
  }
  document.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(active + 1); }
    else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(active - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
  });

  const prev = document.querySelector('.deck-nav .prev');
  const next = document.querySelector('.deck-nav .next');
  if (prev) prev.addEventListener('click', () => goTo(active - 1));
  if (next) next.addEventListener('click', () => goTo(active + 1));

  setActive(0);
})();
