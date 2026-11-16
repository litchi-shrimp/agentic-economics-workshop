/* Agentic Economics · DAI 2026 Workshop
   Minimal enhancement layer: mobile menu + section highlighting.
   The site is fully readable with JavaScript disabled. */

(function () {
  'use strict';

  /* ---- Mobile menu ------------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    var close = function () {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    };

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) close();
    });
  }

  /* ---- Active section in the nav ---------------------------------------- */
  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );

  var targets = navAnchors
    .map(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  if (!targets.length || !('IntersectionObserver' in window)) return;

  var visible = {};

  var clearAll = function () {
    navAnchors.forEach(function (a) {
      a.classList.remove('is-active');
    });
  };

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (entry.isIntersecting) visible[id] = entry.intersectionRatio;
        else delete visible[id];
      });

      if (window.scrollY < 160) {
        clearAll();
        return;
      }

      var best = null;
      var bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) {
          bestRatio = visible[id];
          best = id;
        }
      });

      navAnchors.forEach(function (a) {
        a.classList.toggle(
          'is-active',
          best !== null && a.getAttribute('href') === '#' + best
        );
      });
    },
    { rootMargin: '-72px 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75] }
  );

  targets.forEach(function (t) {
    observer.observe(t.el);
  });

  window.addEventListener(
    'scroll',
    function () {
      if (window.scrollY < 160) clearAll();
    },
    { passive: true }
  );
})();
