/**
 * Winds & Echoes Ghost Theme — main.js
 *
 * Handles:
 * - Dark mode toggle + persistence
 * - Mobile menu open/close
 * - Lazy image loading fallback
 */

(function () {
  'use strict';

  // ── Dark mode ─────────────────────────────────────────────────────────────

  const html       = document.documentElement;
  const darkToggle = document.querySelector('.gh-dark-toggle');
  const DARK_KEY   = 'wae-dark-mode';

  function setDark(isDark) {
    html.classList.toggle('dark', isDark);
    localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  }

  // Restore preference on load
  const saved = localStorage.getItem(DARK_KEY);
  if (saved === '1') {
    setDark(true);
  } else if (saved === null) {
    // First visit — respect OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) setDark(true);
  }

  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      setDark(!html.classList.contains('dark'));
    });
  }

  // ── Mobile menu ───────────────────────────────────────────────────────────

  const burger  = document.querySelector('.gh-burger');
  const head    = document.querySelector('.gh-head');
  const mobileNav = document.querySelector('.gh-head-nav-mobile');

  if (burger && head && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = head.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (head.classList.contains('is-open') && !head.contains(e.target)) {
        head.classList.remove('is-open');
        mobileNav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', false);
        mobileNav.setAttribute('aria-hidden', true);
      }
    });
  }

  // ── Scroll-based header shadow ────────────────────────────────────────────

  const ghHead = document.querySelector('.gh-head');
  if (ghHead) {
    window.addEventListener('scroll', () => {
      ghHead.style.boxShadow = window.scrollY > 10
        ? '0 1px 12px rgba(28,28,26,.08)'
        : 'none';
    }, { passive: true });
  }

})();
