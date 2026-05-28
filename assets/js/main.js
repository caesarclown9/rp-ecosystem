// RP Ecosystem · interactions (Asystem)

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
