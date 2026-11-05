/* ==========================================================================
   InBarber — Como funciona
   Conduz o agendamento que acontece dentro do notebook.

   Cada passo é uma cena com uma linha do tempo: em determinado instante o
   cursor anda até um alvo, clica, ou a cena ganha uma classe .p-* que o CSS
   transforma em estado (campo em foco, resultados, horário escolhido...).

   Regras de quem está assistindo:
     - só toca com a seção na tela e a aba visível;
     - segura enquanto o mouse está sobre o aparelho;
     - o botão de pausa para de vez (WCAG 2.2.2);
     - com prefers-reduced-motion nada toca sozinho: cada passo mostra a tela
       já pronta, e a troca é feita pela lista de passos.

   Nomes, notas e fotos vêm do data.js; textos, do translations.js; preços e
   datas, do idioma ativo. Os preços por serviço e o barbeiro são de
   demonstração, como o resto do data.js.
   ========================================================================== */
(function (window, document) {
  "use strict";

  var i18n = window.InBarberI18n;
  var data = window.INBARBER_DATA;

  var SHOP_ID = "navalha-cia";
  var CITY_KEY = "sao-paulo";
  var PATHS = ["/barbearias", "/navalha-cia", "/agendar", "/agendamento/8412"];
  var SERVICES = [
    { keys: ["service.fade", "service.beard"], price: 85, minutes: 45 },
    { keys: ["service.classic"], price: 55, minutes: 30 },
    { keys: ["service.hotTowel"], price: 70, minutes: 40 }
  ];
  var SLOTS = [
    { h: 9, m: 30, busy: true }, { h: 10, m: 15 }, { h: 11, m: 0, target: true }, { h: 11, m: 45, busy: true },
    { h: 14, m: 30 }, { h: 15, m: 15, busy: true }, { h: 16, m: 0 }, { h: 18, m: 0 }
  ];
  var ICON_STAR =
    '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.500l2.6 5.4 5.9.800-4.3 4.1 1 5.900L10 15l-5.2 2.7 1-5.900L1.5 7.700l5.9-.800z"/></svg>';
  var ICON_CHECK =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3,8.5 6.5,12 13,4.5"/></svg>';

  /* Linha do tempo de cada cena, em milissegundos. */
  var SCENES = [
    {
      duration: 6400,
      alt: "how.step1.alt",
      events: [
        [150, "show"],
        [200, "move", "field"],
        [1000, "press"],
        [1050, "state", "p-focus"],
        [1200, "type"],
        [2200, "state", "p-loading"],
        [2900, "state", "p-results"],
        [4000, "move", "card"],
        [5000, "state", "p-pick"],
        [5500, "press"]
      ]
    },
    {
      duration: 5600,
      alt: "how.step2.alt",
      events: [
        [700, "move", "service"],
        [1600, "press"],
        [1650, "state", "p-service"],
        [2800, "move", "profileCta"],
        [3800, "press"],
        [3850, "state", "p-press"]
      ]
    },
    {
      duration: 6200,
      alt: "how.step3.alt",
      events: [
        [500, "move", "day"],
        [1350, "press"],
        [1400, "state", "p-day"],
        [2100, "state", "p-slots"],
        [2600, "move", "slot"],
        [3500, "press"],
        [3550, "state", "p-slot"],
        [4400, "move", "confirmCta"],
        [5300, "press"],
        [5350, "state", "p-press"]
      ]
    },
    {
      duration: 6000,
      alt: "how.step4.alt",
      events: [
        [100, "hide"],
        [250, "state", "p-check"],
        [900, "state", "p-ticket"],
        [1800, "state", "p-toast"]
      ]
    }
  ];

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setField(root, name, value) {
    qsa('[data-demo="' + name + '"]', root).forEach(function (node) {
      node.textContent = value;
    });
  }

  function setHtml(root, name, html) {
    qsa('[data-demo="' + name + '"]', root).forEach(function (node) {
      node.innerHTML = html;
    });
  }

  function serviceName(service) {
    return service.keys.map(function (key) { return i18n.t(key); }).join(" + ");
  }

  /* Sempre um dia futuro em que a barbearia abre: daqui a dois dias, pulando
     o domingo. Assim o calendário nunca envelhece. */
  function bookingDate() {
    var date = new Date();
    date.setHours(11, 0, 0, 0);
    date.setDate(date.getDate() + 2);
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    return date;
  }

  function formatDate(date, options) {
    return new Intl.DateTimeFormat(i18n.getLocale(), options).format(date);
  }

  function formatTime(hours, minutes) {
    var date = new Date(2026, 0, 1, hours, minutes);
    return formatDate(date, { hour: "numeric", minute: "2-digit" });
  }

  function timeFromText(text) {
    var parts = String(text).split(":");
    return formatTime(Number(parts[0]), Number(parts[1] || 0));
  }

  /* ----------------------------------------------------------------------
     Conteúdo da tela
     ---------------------------------------------------------------------- */
  function resultsHtml(shops) {
    return shops
      .map(function (shop, index) {
        return (
          '<div class="demo-card' + (index === 0 ? " is-target" : "") + '"' +
          (index === 0 ? ' data-demo-target="card"' : "") +
          ' style="--demo-delay:' + index * 90 + 'ms">' +
          '<span class="demo-photo demo-card__photo"><img alt="" loading="lazy" data-demo-src="' + escapeHtml(shop.image) + '"></span>' +
          '<div class="demo-card__body">' +
          '<p class="demo-card__name">' + escapeHtml(shop.name) + "</p>" +
          '<p class="demo-card__place">' + escapeHtml(shop.neighborhood) + "</p>" +
          '<div class="demo-card__foot">' +
          '<span class="demo-rating">' + ICON_STAR + escapeHtml(i18n.formatRating(shop.rating)) + "</span>" +
          '<span class="demo-card__slot">' + escapeHtml(formatTime(10 + index, index ? 30 : 15)) + "</span>" +
          "</div></div></div>"
        );
      })
      .join("");
  }

  function servicesHtml() {
    return SERVICES.map(function (service, index) {
      return (
        '<div class="demo-service' + (index === 0 ? " is-target" : "") + '"' +
        (index === 0 ? ' data-demo-target="service"' : "") + ">" +
        '<span class="demo-service__tick">' + ICON_CHECK + "</span>" +
        '<span class="demo-service__name">' + escapeHtml(serviceName(service)) +
        '<span class="demo-service__meta">' + escapeHtml(i18n.t("how.demo.duration", { count: service.minutes })) + "</span></span>" +
        '<span class="demo-service__price">' + escapeHtml(i18n.formatPrice(service.price)) + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function calendarHtml(target) {
    var html = "";
    var first = new Date(target.getFullYear(), target.getMonth(), 1);
    var days = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    for (var dow = 0; dow < 7; dow++) {
      var label = formatDate(new Date(2026, 0, 4 + dow), { weekday: "short" }).replace(".", "");
      html += '<span class="demo-cal__dow">' + escapeHtml(label) + "</span>";
    }

    var targetOffset = first.getDay() + target.getDate() - 1;
    for (var blank = 0; blank < first.getDay(); blank++) {
      var inWeekBlank = Math.floor(blank / 7) === Math.floor(targetOffset / 7);
      html += '<span class="demo-day' + (inWeekBlank ? " is-week" : "") + '"></span>';
    }
    for (var day = 1; day <= days; day++) {
      var date = new Date(target.getFullYear(), target.getMonth(), day);
      var offset = first.getDay() + day - 1;
      var classes = ["demo-day"];
      if (date < today || date.getDay() === 0) classes.push("is-off");
      if (Math.floor(offset / 7) === Math.floor(targetOffset / 7)) classes.push("is-week");
      var isTarget = day === target.getDate();
      if (isTarget) classes.push("is-target");
      html +=
        '<span class="' + classes.join(" ") + '"' + (isTarget ? ' data-demo-target="day"' : "") + ">" +
        escapeHtml(i18n.formatNumber(day)) + "</span>";
    }
    return html;
  }

  function slotsHtml() {
    return SLOTS.map(function (slot) {
      var classes = ["demo-slot"];
      if (slot.busy) classes.push("is-busy");
      if (slot.target) classes.push("is-target");
      return (
        '<span class="' + classes.join(" ") + '"' + (slot.target ? ' data-demo-target="slot"' : "") + ">" +
        escapeHtml(formatTime(slot.h, slot.m)) + "</span>"
      );
    }).join("");
  }

  function pickShops() {
    var shops = data.barbershops
      .filter(function (shop) { return shop.cityKey === CITY_KEY; })
      .sort(function (a, b) {
        if (a.id === SHOP_ID) return -1;
        if (b.id === SHOP_ID) return 1;
        return b.rating - a.rating;
      });
    return shops.slice(0, 3);
  }

  function render(root) {
    var shops = pickShops();
    var shop = shops[0];
    var service = SERVICES[0];
    var date = bookingDate();
    var time = formatTime(11, 0);
    var name = serviceName(service);
    var total = i18n.formatPrice(service.price);

    setField(root, "shopName", shop.name);
    setHtml(root, "shopRating",
      ICON_STAR + escapeHtml(i18n.formatRating(shop.rating)) +
      " (" + escapeHtml(i18n.t("how.demo.reviews", { count: i18n.formatNumber(shop.reviews) })) + ")");
    setField(root, "shopPlace", shop.neighborhood + ", " + shop.city);
    setField(root, "shopOpen", i18n.t("how.demo.openUntil", { time: timeFromText(shop.closesAt) }));
    setField(root, "count", i18n.t("how.demo.count", { count: i18n.formatNumber(shops.length), city: shop.city }));
    setField(root, "month", formatDate(date, { month: "long", year: "numeric" }));
    setField(root, "recapService", name);
    setField(root, "summaryWhen", formatDate(date, { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "") + ", " + time);
    setField(root, "summarySub", "Marcos V., " + i18n.t("how.demo.duration", { count: service.minutes }));
    setField(root, "ticketWhen", formatDate(date, { weekday: "long", day: "numeric", month: "long" }) + ", " + time);
    setField(root, "ticketService", name);
    setField(root, "ticketTotal", total);

    setHtml(root, "results", resultsHtml(shops));
    setHtml(root, "services", servicesHtml());
    setHtml(root, "calendar", calendarHtml(date));
    setHtml(root, "slots", slotsHtml());

    return shop;
  }

  /* ----------------------------------------------------------------------
     Demonstração
     ---------------------------------------------------------------------- */
  function Demo(stage) {
    this.stage = stage;
    this.device = qs("[data-how-device]", stage);
    this.screen = qs("[data-demo-screen]", stage);
    this.cursor = qs("[data-demo-cursor]", stage);
    this.steps = qsa("[data-how-step]", stage);
    this.scenes = qsa("[data-scene]", stage);
    this.toggle = qs("[data-how-toggle]", stage);
    this.toggleLabel = qs("[data-how-toggle-label]", stage);
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.index = 0;
    this.clock = 0;
    this.nextEvent = 0;
    this.lastFrame = 0;
    this.frame = 0;
    this.paused = false;
    this.inView = false;
    this.opened = false;
    this.hovering = false;
    this.typeTimer = 0;
    this.pressTimer = 0;
    this.photos = [];
    this.photosLoaded = false;
    this.showingFinished = false;

    this.tick = this.tick.bind(this);
    this.bind();
    this.refresh();
    this.observe();
  }

  Demo.prototype.isStatic = function () {
    return this.reduced.matches || !("IntersectionObserver" in window);
  };

  Demo.prototype.bind = function () {
    var self = this;

    this.steps.forEach(function (step, index) {
      qs(".how-step__trigger", step).addEventListener("click", function () {
        self.go(index);
      });
    });

    this.toggle.addEventListener("click", function () {
      self.paused = !self.paused;
      self.syncToggle();
      /* Passo aberto na pausa está pronto: ao continuar, ele recomeça. */
      if (!self.paused && self.showingFinished) self.go(self.index);
      else self.syncPlayback();
    });

    this.device.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "mouse") {
        self.hovering = true;
        self.syncPlayback();
      }
    });
    this.device.addEventListener("pointerleave", function () {
      self.hovering = false;
      self.syncPlayback();
    });

    document.addEventListener("visibilitychange", function () {
      self.syncPlayback();
    });

    document.addEventListener("inbarber:languagechange", function () {
      self.refresh();
    });

    var onMotionChange = function () {
      self.go(self.index);
      self.syncToggle();
    };
    if (this.reduced.addEventListener) this.reduced.addEventListener("change", onMotionChange);
  };

  Demo.prototype.observe = function () {
    var self = this;

    if (!("IntersectionObserver" in window)) {
      this.loadPhotos();
      this.open();
      return;
    }

    new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) self.loadPhotos();
      },
      { rootMargin: "600px 0px" }
    ).observe(this.device);

    new IntersectionObserver(
      function (entries) {
        self.inView = entries[0].isIntersecting;
        if (self.inView && !self.opened) self.open();
        self.syncPlayback();
      },
      { threshold: 0.4 }
    ).observe(this.device);
  };

  /* A tampa abre uma vez, na primeira vez que a seção aparece. Só então a
     demonstração começa. */
  Demo.prototype.open = function () {
    var self = this;
    this.device.classList.add("is-open");
    if (this.isStatic()) {
      this.opened = true;
      return;
    }
    window.setTimeout(function () {
      self.opened = true;
      self.syncPlayback();
    }, 1000);
  };

  Demo.prototype.loadPhotos = function () {
    if (this.photosLoaded) return;
    this.photosLoaded = true;
    this.applyPhotos();
  };

  Demo.prototype.applyPhotos = function () {
    var photos = this.photos;
    qsa("[data-demo-photo]", this.stage).forEach(function (image) {
      var url = photos[Number(image.getAttribute("data-demo-photo"))];
      if (url && image.getAttribute("src") !== url) image.src = url;
    });
    qsa("[data-demo-src]", this.stage).forEach(function (image) {
      image.src = image.getAttribute("data-demo-src");
    });
  };

  /* Monta o conteúdo no idioma ativo e recomeça o passo atual. */
  Demo.prototype.refresh = function () {
    var shop = render(this.stage);
    this.city = shop.city;
    this.photos = data.shopGallery(shop);
    if (this.photosLoaded) this.applyPhotos();
    this.syncToggle();
    this.go(this.index);
  };

  Demo.prototype.syncToggle = function () {
    this.stage.classList.toggle("is-paused", this.paused);
    this.toggleLabel.textContent = i18n.t(this.paused ? "how.play" : "how.pause");
    this.toggle.hidden = this.isStatic();
  };

  Demo.prototype.canPlay = function () {
    return (
      this.opened && this.inView && !this.paused && !this.hovering &&
      !document.hidden && !this.isStatic()
    );
  };

  Demo.prototype.syncPlayback = function () {
    if (this.canPlay()) {
      if (!this.frame) {
        this.lastFrame = 0;
        this.frame = window.requestAnimationFrame(this.tick);
      }
    } else if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  };

  Demo.prototype.tick = function (now) {
    var scene = SCENES[this.index];
    /* Limitar o passo evita um salto depois de a aba ficar parada. */
    if (this.lastFrame) this.clock += Math.min(now - this.lastFrame, 100);
    this.lastFrame = now;

    while (this.nextEvent < scene.events.length && scene.events[this.nextEvent][0] <= this.clock) {
      this.run(scene.events[this.nextEvent]);
      this.nextEvent++;
    }
    this.setProgress(Math.min(this.clock / scene.duration, 1));

    if (this.clock >= scene.duration) {
      this.frame = 0;
      this.go((this.index + 1) % SCENES.length);
      this.syncPlayback();
      return;
    }
    this.frame = window.requestAnimationFrame(this.tick);
  };

  Demo.prototype.setProgress = function (value) {
    this.stage.style.setProperty("--how-progress", value.toFixed(4));
  };

  Demo.prototype.run = function (event) {
    var scene = this.scenes[this.index];
    switch (event[1]) {
      case "show":
        this.cursor.classList.add("is-on");
        break;
      case "hide":
        this.cursor.classList.remove("is-on");
        break;
      case "move":
        this.moveTo(qs('[data-demo-target="' + event[2] + '"]', this.stage));
        break;
      case "press":
        this.press();
        break;
      case "state":
        scene.classList.add(event[2]);
        break;
      case "type":
        this.type();
        break;
    }
  };

  /* A posição vale em cqw, então acompanha o aparelho se a janela mudar. */
  Demo.prototype.moveTo = function (target) {
    if (!target) return;
    var box = this.screen.getBoundingClientRect();
    var rect = target.getBoundingClientRect();
    var x = ((rect.left + rect.width / 2 - box.left) / box.width) * 100;
    var y = ((rect.top + rect.height / 2 - box.top) / box.width) * 100;
    this.cursor.style.setProperty("--x", x.toFixed(2));
    this.cursor.style.setProperty("--y", y.toFixed(2));
  };

  Demo.prototype.press = function () {
    var cursor = this.cursor;
    cursor.classList.remove("is-press");
    void cursor.offsetWidth;
    cursor.classList.add("is-press");
    window.clearTimeout(this.pressTimer);
    this.pressTimer = window.setTimeout(function () {
      cursor.classList.remove("is-press");
    }, 540);
  };

  Demo.prototype.typedNode = function () {
    return qs('[data-demo="typed"]', this.stage);
  };

  Demo.prototype.type = function () {
    var self = this;
    var node = this.typedNode();
    var text = this.city;
    var length = 0;

    window.clearInterval(this.typeTimer);
    node.classList.add("has-value");
    this.typeTimer = window.setInterval(function () {
      length++;
      node.textContent = text.slice(0, length);
      if (length >= text.length) window.clearInterval(self.typeTimer);
    }, 85);
  };

  /* Volta a cena ao início (ou ao fim, quando nada toca sozinho). */
  Demo.prototype.resetScene = function (index) {
    var scene = this.scenes[index];
    var finished = this.isStatic() || this.paused;

    this.showingFinished = finished;
    scene.className = scene.className.replace(/\s*\bp-[a-z]+\b/g, "");
    if (index === 0) {
      var node = this.typedNode();
      window.clearInterval(this.typeTimer);
      node.textContent = finished ? this.city : "";
      node.classList.toggle("has-value", finished);
    }
    if (finished) {
      SCENES[index].events.forEach(function (event) {
        if (event[1] === "state" && event[2] !== "p-press") scene.classList.add(event[2]);
      });
    }
  };

  Demo.prototype.go = function (index) {
    this.index = index;
    this.clock = 0;
    this.nextEvent = 0;
    this.lastFrame = 0;
    this.setProgress(this.isStatic() || this.paused ? 1 : 0);
    this.stage.setAttribute("data-step", String(index));

    this.steps.forEach(function (step, position) {
      var trigger = qs(".how-step__trigger", step);
      step.classList.toggle("is-active", position === index);
      step.classList.toggle("is-done", position < index);
      if (position === index) trigger.setAttribute("aria-current", "step");
      else trigger.removeAttribute("aria-current");
    });

    this.scenes.forEach(function (scene, position) {
      scene.classList.toggle("is-active", position === index);
    });

    this.resetScene(index);
    setField(this.stage, "path", PATHS[index]);
    this.device.setAttribute("aria-label", i18n.t(SCENES[index].alt));
    this.cursor.classList.toggle("is-on", index !== 0 && !this.showingFinished);

    /* Um clique na lista precisa continuar de onde o aparelho está. */
    if (this.frame) {
      window.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    this.syncPlayback();
  };

  function boot() {
    var stage = qs("[data-how-stage]");
    if (!stage) return;
    if (!i18n || !data) {
      if (window.console) console.error("[InBarber] como funciona: i18n ou dados não carregados.");
      return;
    }
    window.InBarberHowDemo = new Demo(stage);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);