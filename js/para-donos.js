/* ==========================================================================
   InBarber — Seção "Para donos de barbearia" (home)
   Demonstração guiada do painel: câmera que aproxima cada área do
   dashboard, cantos de foco, varredura de luz, legenda e passos com barra
   de progresso em autoplay. Pausa em hover/foco, fora da tela e com a aba
   oculta; respeita prefers-reduced-motion; aceita swipe e setas.
   ========================================================================== */
(function () {
  "use strict";

  var section = document.getElementById("para-donos");
  if (!section) return;

  var showcase = section.querySelector("#owners-showcase");
  var stage = section.querySelector(".owners-demo__stage");
  var tilt = section.querySelector("[data-tilt]");
  var camera = section.querySelector("[data-camera]");
  var focus = section.querySelector("[data-focus]");
  var sweep = section.querySelector("[data-sweep]");
  var caption = section.querySelector("[data-caption]");
  var captionText = section.querySelector("[data-caption-text]");
  var stepsWrap = section.querySelector("[data-steps]");
  var steps = [].slice.call(section.querySelectorAll(".owners-step"));
  if (!steps.length || !camera) return;

  var rm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  var STEP_MS = 5200;
  var step = 0;
  var raf = null;
  var t0 = 0;
  var elapsed = 0;
  var paused = false;
  var inView = false;

  /* ---------- Câmera ---------- */
  function parseCam(btn) {
    var parts = (btn.getAttribute("data-cam") || "50 50 1").trim().split(/\s+/);
    var z = parseFloat(parts[2]);
    if (!(z >= 1)) z = 1;
    var half = 50 / z;
    var cx = parseFloat(parts[0]);
    var cy = parseFloat(parts[1]);
    if (isNaN(cx)) cx = 50;
    if (isNaN(cy)) cy = 50;
    cx = Math.min(Math.max(cx, half), 100 - half);
    cy = Math.min(Math.max(cy, half), 100 - half);
    return { cx: cx, cy: cy, z: z, half: half };
  }

  function applyCamera(btn, instant) {
    var c = parseCam(btn);

    if (instant || rm.matches) {
      camera.style.transition = "none";
      void camera.offsetWidth;
    }
    camera.style.setProperty("--z", String(c.z));
    camera.style.setProperty("--tx", (50 - c.cx).toFixed(3) + "%");
    camera.style.setProperty("--ty", (50 - c.cy).toFixed(3) + "%");
    if (instant || rm.matches) {
      void camera.offsetWidth;
      camera.style.transition = "";
    }

    if (focus) {
      /* moldura um pouco mais fechada que o enquadramento, para os cantos
         ficarem visíveis dentro da tela */
      var fh = c.half / 1.16;
      focus.style.setProperty("--z", String(c.z));
      focus.style.setProperty("--fx", (c.cx - fh).toFixed(3) + "%");
      focus.style.setProperty("--fy", (c.cy - fh).toFixed(3) + "%");
      focus.style.setProperty("--fw", (fh * 2).toFixed(3) + "%");
      focus.style.setProperty("--fh", (fh * 2).toFixed(3) + "%");
      focus.classList.remove("is-on");
      void focus.offsetWidth;
      if (c.z > 1.02) focus.classList.add("is-on");
    }
  }

  /* ---------- Legenda (acompanha o idioma ativo) ---------- */
  function syncCaption(animate) {
    if (!captionText) return;
    var label = steps[step].querySelector(".owners-step__txt b");
    if (!label) return;
    captionText.textContent = label.textContent.trim();
    if (animate && caption && !rm.matches) {
      caption.classList.remove("is-swap");
      void caption.offsetWidth;
      caption.classList.add("is-swap");
    }
  }

  /* ---------- Progresso ---------- */
  function paint(frac) {
    steps.forEach(function (b, i) {
      var bar = b.querySelector(".owners-step__bar i");
      if (bar) bar.style.width = i === step ? (frac * 100).toFixed(2) + "%" : "0%";
    });
  }

  /* ---------- Autoplay ---------- */
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function play() {
    if (raf || rm.matches || paused || !inView || document.hidden) return;
    t0 = performance.now() - elapsed;
    raf = requestAnimationFrame(loop);
  }

  function loop(now) {
    raf = null;
    var frac = Math.min((now - t0) / STEP_MS, 1);
    paint(frac);
    if (frac >= 1) {
      goStep((step + 1) % steps.length);
      return;
    }
    elapsed = now - t0;
    raf = requestAnimationFrame(loop);
  }

  /* ---------- Navegação ---------- */
  function scrollStepIntoView(btn) {
    if (!stepsWrap || stepsWrap.scrollWidth <= stepsWrap.clientWidth + 4) return;
    var wrapRect = stepsWrap.getBoundingClientRect();
    var liRect = btn.parentNode.getBoundingClientRect();
    var left = Math.max(stepsWrap.scrollLeft + (liRect.left - wrapRect.left) - 8, 0);
    stepsWrap.scrollTo({ left: left, behavior: rm.matches ? "auto" : "smooth" });
  }

  function goStep(i, instant) {
    step = (i + steps.length) % steps.length;
    var btn = steps[step];

    steps.forEach(function (b, j) {
      var on = j === step;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-current", on ? "true" : "false");
    });

    applyCamera(btn, instant);
    syncCaption(!instant);

    if (sweep && !rm.matches && !instant) {
      sweep.classList.remove("is-on");
      void sweep.offsetWidth;
      sweep.classList.add("is-on");
    }

    if (!instant) scrollStepIntoView(btn);

    elapsed = 0;
    paint(0);
    stop();
    play();
  }

  steps.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      goStep(i);
    });
    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i + 1;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i - 1;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = steps.length - 1;
      if (next === null) return;
      e.preventDefault();
      goStep(next);
      steps[step].focus();
    });
  });

  /* ---------- Pausa em interação ---------- */
  function pause() {
    paused = true;
    stop();
  }

  function resume() {
    paused = false;
    play();
  }

  showcase.addEventListener("mouseenter", pause);
  showcase.addEventListener("mouseleave", function () {
    if (!showcase.contains(document.activeElement)) resume();
  });
  showcase.addEventListener("focusin", pause);
  showcase.addEventListener("focusout", function (e) {
    if (showcase.contains(e.relatedTarget)) return;
    if (!showcase.matches(":hover")) resume();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else play();
  });

  /* ---------- Swipe no palco ---------- */
  if (stage) {
    var x0 = 0;
    stage.addEventListener("touchstart", function (e) {
      x0 = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) < 48) return;
      goStep(dx < 0 ? step + 1 : step - 1);
    }, { passive: true });
  }

  /* ---------- Paralaxe suave do mockup ---------- */
  if (stage && tilt && finePointer.matches && !rm.matches) {
    var pending = false;
    var rx = 0;
    var ry = 0;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      ry = ((e.clientX - r.left) / r.width - 0.5) * 3.4;
      rx = ((e.clientY - r.top) / r.height - 0.5) * -2.4;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        tilt.style.setProperty("--rx", rx.toFixed(2) + "deg");
        tilt.style.setProperty("--ry", ry.toFixed(2) + "deg");
      });
    });
    stage.addEventListener("pointerleave", function () {
      tilt.style.setProperty("--rx", "0deg");
      tilt.style.setProperty("--ry", "0deg");
    });
  }

  /* ---------- Só anima com a seção na tela ---------- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        if (inView) play();
        else stop();
      });
    }, { threshold: 0.25 }).observe(section);
  } else {
    inView = true;
  }

  /* Troca de idioma: o i18n reescreve os textos; a legenda vem do passo. */
  document.addEventListener("inbarber:languagechange", function () {
    syncCaption(false);
  });

  goStep(0, true);
})();