/* =========================================================================
   Hell Grind: разоблачение — анимации
   Прогрессивное улучшение: без JS/GSAP контент уже виден (CSS = финал).
   Всё движение под гардом prefers-reduced-motion и pointer:fine.
   ========================================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var isDesktop = window.matchMedia("(min-width: 769px)").matches;

  // Нет GSAP (CDN не загрузился) или пользователь просит покой — выходим,
  // CSS уже показывает финальные состояния.
  if (!window.gsap || reduce) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------- S1 — HERO ----------------------------- */
  var restRotate = isDesktop ? -3 : 0;

  gsap.set(".frame", { autoAlpha: 0, y: 40, scale: 0.92, rotation: -9 });
  gsap.set(".word__i", { yPercent: 120 });
  gsap.set(".strike__path", { strokeDashoffset: 1 });
  gsap.set(".hero .btn--ghost", { autoAlpha: 0, y: 12 });

  var hero = gsap.timeline({ defaults: { ease: "power3.out" } });
  hero
    .to(".frame", {
      autoAlpha: 1, y: 0, scale: 1, rotation: restRotate,
      duration: 1.1, ease: "elastic.out(1, 0.7)"
    })
    .to(".word__i", { yPercent: 0, duration: 0.7, stagger: 0.06 }, "-=0.7")
    // «удар»: страйк рисуется ~700ms после старта заголовка
    .to(".strike__path", { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, "+=0.15")
    .to(".hero .btn--ghost", { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.1")
    // один импульс CTA после страйка
    .to(".hero .btn--ghost", {
      scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut"
    });

  // параллакс кадра на курсор (≤8px) — только desktop + fine pointer
  if (fine && isDesktop) {
    var fx = gsap.quickTo(".frame", "x", { duration: 0.6, ease: "power3.out" });
    var fy = gsap.quickTo(".frame", "y", { duration: 0.6, ease: "power3.out" });
    var heroEl = document.querySelector(".hero");
    heroEl.addEventListener("pointermove", function (e) {
      var r = heroEl.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      fx(nx * 8);
      fy(ny * 8);
    });
  }

  if (!ScrollTrigger) return;

  /* ---------------------- S2 — count-up по цифрам ---------------------- */
  function fmt(v, type) {
    var n = Math.round(v);
    if (type === "space") return n.toLocaleString("ru-RU").replace(/\s/g, " ");
    return String(n);
  }
  gsap.utils.toArray(".fact__num").forEach(function (el, i) {
    var target = parseInt(el.dataset.count, 10);
    var type = el.dataset.format;
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: function () {
        el.textContent = fmt(0, type);
        gsap.to(obj, {
          v: target, duration: 1.2, delay: i * 0.12, ease: "power2.out",
          onUpdate: function () { el.textContent = fmt(obj.v, type); }
        });
      }
    });
  });

  /* ------------------- S3 — построчный mask-reveal --------------------- */
  gsap.set(".turn__line .line__i", { yPercent: 110 });
  ScrollTrigger.create({
    trigger: ".turn__line",
    start: "top 78%",
    once: true,
    onEnter: function () {
      gsap.to(".turn__line .line__i", {
        yPercent: 0, duration: 0.7, stagger: 0.12, ease: "power3.out"
      });
    }
  });

  /* ----------------------- S4 — fade + lift карточек ------------------- */
  gsap.set(".card", { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch(".card", {
    start: "top 88%",
    onEnter: function (batch) {
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" });
    }
  });

  /* --------------------- S5 — магнитный CTA (desktop) ------------------ */
  if (fine && isDesktop) {
    var btn = document.querySelector(".join .btn--accent");
    if (btn) {
      var bx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      var by = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
      var radius = 40;
      window.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy);
        if (dist < r.width / 2 + radius) {
          bx(dx * 0.3);
          by(dy * 0.3);
        } else {
          bx(0);
          by(0);
        }
      });
    }
  }
})();
