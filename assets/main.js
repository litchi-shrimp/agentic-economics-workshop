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

  /* ---- Speaker cards: hover preview + full abstract dialog -------------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.sp-card'));

  cards.forEach(function (card) {
    card.addEventListener('pointerenter', function () {
      card.classList.remove('is-out');
      card.classList.add('is-on');
    });

    /* Pointer left: drop the preview immediately, even if :hover is still
       latched on a slow frame. */
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-on');
      card.classList.add('is-out');
    });

    card.addEventListener('focusin', function () {
      card.classList.remove('is-out');
    });
    card.addEventListener('focusout', function () {
      if (!card.contains(document.activeElement)) card.classList.add('is-out');
    });
  });

  var dialog = document.getElementById('sp-dialog');

  if (dialog && typeof dialog.showModal === 'function') {
    var dName = dialog.querySelector('.sp-dialog-name');
    var dTalk = dialog.querySelector('.sp-dialog-talk');
    var dBody = dialog.querySelector('.sp-dialog-body');
    var dHome = dialog.querySelector('.sp-dialog-home');
    var dClose = dialog.querySelector('.sp-dialog-close');
    var lastCard = null;

    var openDialog = function (card) {
      var name = card.querySelector('.sp-pname');
      var talk = card.querySelector('.sp-talk');
      var abs = card.querySelector('.sp-abs');
      var home = card.querySelector('.sp-home');

      dName.textContent = name ? name.textContent.trim() : '';
      dTalk.textContent = talk ? talk.textContent.replace(/\s+/g, ' ').trim() : '';
      dBody.innerHTML = abs ? abs.innerHTML : '';

      if (home) {
        dHome.setAttribute('href', home.getAttribute('href'));
        dHome.textContent = home.textContent.trim();
        dHome.hidden = false;
      } else {
        dHome.hidden = true;
      }

      lastCard = card;
      dialog.showModal();
      dBody.scrollTop = 0;
    };

    cards.forEach(function (card) {
      ['sp-media', 'sp-more'].forEach(function (cls) {
        var btn = card.querySelector('.' + cls);
        if (!btn) return;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          openDialog(card);
        });
      });
    });

    dClose.addEventListener('click', function () {
      dialog.close();
    });

    /* click on the backdrop closes */
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', function () {
      if (!lastCard) return;
      lastCard.classList.remove('is-out', 'is-on');
      var media = lastCard.querySelector('.sp-media');
      if (media) media.focus({ preventScroll: true });
      lastCard = null;
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
