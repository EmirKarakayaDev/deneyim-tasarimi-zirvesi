document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;

  if (!prefersReducedMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const targetEl = document.querySelector(id);
      if (!targetEl) return;
      e.preventDefault();
      if (id === '#top') {
        history.pushState(null, '', window.location.pathname);
      } else {
        history.pushState(null, '', id);
      }
      if (lenis) {
        lenis.scrollTo(targetEl, { offset: -32 });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  });

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });

  const videoPlayBtn = document.getElementById('video-play');
  const videoPlayText = document.getElementById('video-play-text');
  const videoModal = document.getElementById('video-modal');
  const videoModalPlayer = document.getElementById('video-modal-player');
  const videoModalClose = document.getElementById('video-modal-close');

  if (videoModal && videoModalPlayer) {
    const isMobile = () => window.matchMedia('(max-width: 760px)').matches;

    const openVideoModal = () => {
      videoModal.classList.add('is-open');
      videoModalPlayer.currentTime = 0;
      videoModalPlayer.play();

      if (isMobile()) {
        if (videoModalPlayer.webkitEnterFullscreen) {
          videoModalPlayer.webkitEnterFullscreen();
        } else if (videoModalPlayer.requestFullscreen) {
          videoModalPlayer.requestFullscreen().catch(() => {});
        }
      }
    };

    const closeVideoModal = () => {
      videoModal.classList.remove('is-open');
      videoModalPlayer.pause();
    };

    videoPlayBtn.addEventListener('click', openVideoModal);
    videoPlayText.addEventListener('click', openVideoModal);
    videoModalClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('is-open')) closeVideoModal();
    });
  }

  const heroSlides = document.querySelectorAll('.hero-bg-slide');
  if (heroSlides.length > 1) {
    const loadDeferredSlides = () => {
      heroSlides.forEach((slide) => {
        const bg = slide.getAttribute('data-bg');
        if (bg) {
          slide.style.backgroundImage = `url('${bg}')`;
          slide.removeAttribute('data-bg');
        }
      });
    };

    if (document.readyState === 'complete') {
      loadDeferredSlides();
    } else {
      window.addEventListener('load', loadDeferredSlides);
    }

    let currentSlide = 0;
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('is-active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('is-active');
    }, 5000);
  }
});
