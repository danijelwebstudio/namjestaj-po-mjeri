import { useEffect, useRef } from 'react';
import './motion.css';

const ease = 'cubic-bezier(.16,1,.3,1)';
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

function mountMotion(root, paused) {
  const animations = new Set();
  const disposers = [];
  const photos = new Set();
  const desktop = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
  let frame = 0;
  let destroyed = false;
  root.classList.add('has-landing-motion');

  function animate(element, keyframes, options = {}) {
    if (!element?.animate || paused.current || destroyed) return;
    const animation = element.animate(keyframes, { duration: 850, easing: ease, ...options });
    animations.add(animation);
    animation.onfinish = animation.oncancel = () => animations.delete(animation);
  }

  function revealTitle(element, delay = 0) {
    element.querySelectorAll('.motion-word').forEach((word, index) => {
      animate(word, [
        { transform: 'translateY(115%) rotate(3deg)', opacity: 0 },
        { transform: 'translateY(0) rotate(0)', opacity: 1 },
      ], { delay: delay + index * 65, duration: 800, fill: 'backwards' });
    });
  }

  const header = root.parentElement.querySelector('.site-header');
  animate(header, [{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650 });
  const hero = root.querySelector('.hero');
  if (hero && hero.getBoundingClientRect().bottom > 0) {
    revealTitle(hero.querySelector('h1'), 90);
    animate(hero.querySelector('.section-eyebrow'), [{ opacity: 0, transform: 'translateX(-18px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 650 });
    [hero.querySelector('.hero-description'), hero.querySelector('.hero-actions')].forEach((element, index) => {
      animate(element, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: 200 + index * 100, fill: 'backwards' });
    });
    animate(hero.querySelector('.hero-visual'), [
      { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' },
    ], { duration: 1100, delay: 80, fill: 'backwards' });
    animate(hero.querySelector('.hero-image-reveal'), [{ transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 1500, delay: 80 });
  }

  const reveals = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting || paused.current) continue;
      reveals.unobserve(target);
      if (target.dataset.motion === 'title') {
        revealTitle(target);
      } else if (target.dataset.motion === 'photo') {
        animate(target, [
          { clipPath: 'inset(12% 5% 12% 5%)', transform: 'translateY(28px)', opacity: 0.3 },
          { clipPath: 'inset(0% 0% 0% 0%)', transform: 'translateY(0)', opacity: 1 },
        ], { duration: 1000 });
        animate(target.nextElementSibling, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: 180, duration: 700 });
      } else if (target.dataset.motion === 'steps') {
        target.querySelectorAll('li').forEach((step, index) => {
          animate(step, [{ opacity: 0, transform: 'translateX(32px)' }, { opacity: 1, transform: 'translateX(0)' }], { delay: index * 100, duration: 800, fill: 'backwards' });
        });
      } else {
        animate(target, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }]);
      }
    }
  }, { threshold: 0.12 });
  root.querySelectorAll('[data-motion]').forEach((element) => {
    if (!element.closest('.hero')) reveals.observe(element);
  });

  const allPhotos = [...root.querySelectorAll('.hero-image, .work-image img')];
  function updatePhotos() {
    frame = 0;
    if (destroyed || paused.current || !desktop.matches) return;
    const height = window.innerHeight;
    // Read all geometry before writing transforms; only visible photos participate.
    const positions = [...photos].map((image) => {
      const rect = image.parentElement.getBoundingClientRect();
      const amount = image.classList.contains('hero-image') ? 32 : 8;
      return [image, clamp((height / 2 - rect.top - rect.height / 2) / height, 0.75) * amount];
    });
    positions.forEach(([image, offset]) => image.style.setProperty('--scroll-y', `${offset.toFixed(2)}px`));
  }
  function schedule() {
    if (!frame && !paused.current && desktop.matches) frame = requestAnimationFrame(updatePhotos);
  }
  const photoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => isIntersecting ? photos.add(target) : photos.delete(target));
    schedule();
  });
  allPhotos.forEach((image) => photoObserver.observe(image));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  const resetPhotos = () => {
    if (!desktop.matches) allPhotos.forEach((image) => {
      image.style.removeProperty('--scroll-y');
      image.style.removeProperty('--pointer-x');
      image.style.removeProperty('--pointer-y');
    });
    schedule();
  };
  desktop.addEventListener('change', resetPhotos);

  function listen(element, name, handler) {
    element.addEventListener(name, handler, { passive: true });
    disposers.push(() => element.removeEventListener(name, handler));
  }
  root.querySelectorAll('.work-image').forEach((element) => {
    const image = element.querySelector('img');
    if (!image) return;
    listen(element, 'pointermove', (event) => {
      if (!desktop.matches || paused.current) return;
      const rect = element.getBoundingClientRect();
      image.style.setProperty('--pointer-x', `${clamp((event.clientX - rect.left - rect.width / 2) * 0.02, 4)}px`);
      image.style.setProperty('--pointer-y', `${clamp((event.clientY - rect.top - rect.height / 2) * 0.02, 3)}px`);
    });
    listen(element, 'pointerleave', () => {
      image.style.removeProperty('--pointer-x');
      image.style.removeProperty('--pointer-y');
    });
  });

  const buttons = [...root.querySelectorAll('[data-magnetic]'), ...header.querySelectorAll('[data-magnetic]')];
  buttons.forEach((button) => {
    listen(button, 'pointermove', (event) => {
      if (!desktop.matches || paused.current) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--magnetic-x', `${clamp((event.clientX - rect.left - rect.width / 2) * 0.08, 5)}px`);
      button.style.setProperty('--magnetic-y', `${clamp((event.clientY - rect.top - rect.height / 2) * 0.12, 4)}px`);
    });
    const reset = () => {
      button.style.removeProperty('--magnetic-x');
      button.style.removeProperty('--magnetic-y');
    };
    listen(button, 'pointerleave', reset);
    listen(button, 'blur', reset);
    disposers.push(reset);
  });

  return {
    setPaused(value) {
      animations.forEach((animation) => value ? animation.pause() : animation.play());
      if (value) { cancelAnimationFrame(frame); frame = 0; } else schedule();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      reveals.disconnect();
      photoObserver.disconnect();
      animations.forEach((animation) => animation.cancel());
      disposers.forEach((dispose) => dispose());
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      desktop.removeEventListener('change', resetPhotos);
      allPhotos.forEach((image) => ['--scroll-y', '--pointer-x', '--pointer-y'].forEach((property) => image.style.removeProperty(property)));
      root.classList.remove('has-landing-motion');
    },
  };
}

export default function useLandingMotion(rootRef, enabled, suspended) {
  const paused = useRef(suspended);
  const controller = useRef(null);
  useEffect(() => {
    paused.current = suspended;
    controller.current?.setPaused(suspended);
  }, [suspended]);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root || !('IntersectionObserver' in window)) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      controller.current?.destroy();
      controller.current = reduced.matches ? null : mountMotion(root, paused);
    };
    sync();
    reduced.addEventListener('change', sync);
    return () => {
      reduced.removeEventListener('change', sync);
      controller.current?.destroy();
      controller.current = null;
    };
  }, [enabled, rootRef]);
}
