/* ==========================================================================
   InBarber — Barbearias em Destaque (carrossel do hero)

   Ocupa o espaço mais visível do site e é vendido por contrato. Quatro regras
   sustentam o produto:

   1. VIGÊNCIA AUTOMÁTICA   — só vai ao ar quem tem contrato válido hoje.
                              Vencido some sozinho, sem deploy.
   2. RELEVÂNCIA GEOGRÁFICA — anúncios da cidade do visitante primeiro; o pool
                              nacional completa os slots. A cidade vem da busca
                              do hero (evento "inbarber:citychange") ou do que
                              ficou guardado de uma visita anterior — o
                              carrossel não pede localização por conta própria.
   3. ROTAÇÃO JUSTA         — quem foi menos exibido para este visitante abre a
                              fila, com desempate aleatório. Todos pagam igual,
                              todos aparecem primeiro em parte das visitas.
   4. RÓTULO DE PATROCINADO — o selo aparece em todo slide, na tela e no leitor
                              de tela. Protege a credibilidade das avaliações do
                              resto do site.

   O empilhamento em baralho não é enfeite: mostrar as próximas cartas por baixo
   é o que avisa, sem texto, que há mais barbearias ali.

   Dados da barbearia: js/data.js. Dados do contrato: js/featured-data.js.
   Métricas: GA4 via gtag, com fallback silencioso para dataLayer.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var i18n = window.InBarberI18n;
  var data = window.INBARBER_DATA;
  var config = window.INBARBER_FEATURED;

  var STORAGE_CITY = "inbarber:city";
  var STORAGE_IMPRESSIONS = "inbarber:featured:impressions";

  /* Quantas cartas ficam visíveis atrás da ativa. */
  var DECK_DEPTH = 2;
  /* Arrasto mínimo, em pixels, para trocar de slide. */
  var SWIPE_THRESHOLD = 45;

  var ICONS = {
    star:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    /* Selo de patrocinado: brilho grande + faísca menor, o vocabulário visual
       de "posição em destaque" sem parecer um aviso de erro. */
    sparkle:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M13.1 2.6a1.15 1.15 0 0 0-2.2 0l-1.1 3.6a3.4 3.4 0 0 1-2.25 2.25L3.95 9.55a1.15 1.15 0 0 0 0 2.2l3.6 1.1a3.4 3.4 0 0 1 2.25 2.25l1.1 3.6a1.15 1.15 0 0 0 2.2 0l1.1-3.6a3.4 3.4 0 0 1 2.25-2.25l3.6-1.1a1.15 1.15 0 0 0 0-2.2l-3.6-1.1a3.4 3.4 0 0 1-2.25-2.25z"/>' +
      '<path d="M18.6 16.1a.62.62 0 0 0-1.2 0l-.36 1.18a1.5 1.5 0 0 1-.96.96l-1.18.36a.62.62 0 0 0 0 1.2l1.18.36c.45.14.82.5.96.96l.36 1.18a.62.62 0 0 0 1.2 0l.36-1.18c.14-.46.5-.82.96-.96l1.18-.36a.62.62 0 0 0 0-1.2l-1.18-.36a1.5 1.5 0 0 1-.96-.96z"/>' +
      "</svg>",
    prev:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg>',
    next:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor"/></svg>',
    play:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'
  };

  /* ======================================================================
     Utilidades
     ====================================================================== */
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }
  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }
  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function onLanguageChange(handler) {
    document.addEventListener("inbarber:languagechange", handler);
  }
  function readStore(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null; // modo privado ou cookies desativados
    }
  }
  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* silencioso: a sessão atual continua funcionando */
    }
  }

  function starsMarkup(rating) {
    var full = Math.round(rating);
    var out =
      '<span class="stars" role="img" aria-label="' +
      escapeHtml(i18n.t("reviews.starsAlt", { rating: i18n.formatRating(rating) })) +
      '">';
    for (var i = 1; i <= 5; i += 1) {
      out += i <= full ? ICONS.star : '<span class="stars__empty">' + ICONS.star + "</span>";
    }
    return out + "</span>";
  }

  /* ======================================================================
     1. Vigência automática
     ====================================================================== */

  /* Data local em ISO. Comparação lexicográfica de strings ISO evita parsing
     de data e, com ele, todo o problema de fuso horário. */
  function todayISO() {
    var now = new Date();
    var month = String(now.getMonth() + 1);
    var day = String(now.getDate());
    return (
      now.getFullYear() +
      "-" +
      (month.length < 2 ? "0" + month : month) +
      "-" +
      (day.length < 2 ? "0" + day : day)
    );
  }

  function isLive(contract) {
    var today = todayISO();
    return (!contract.start || contract.start <= today) && (!contract.end || contract.end >= today);
  }

  /* ======================================================================
     2. Relevância geográfica
     ====================================================================== */

  function shopById(id) {
    var found = null;
    data.barbershops.forEach(function (shop) {
      if (shop.id === id) found = shop;
    });
    return found;
  }

  function storedCity() {
    var city = readStore(STORAGE_CITY);
    return city && data.cityCoords[city] ? city : null;
  }

  /* ======================================================================
     3. Rotação justa
     ====================================================================== */

  function readImpressions() {
    try {
      return JSON.parse(readStore(STORAGE_IMPRESSIONS) || "{}") || {};
    } catch (err) {
      return {};
    }
  }

  function countImpression(id) {
    var map = readImpressions();
    map[id] = (map[id] || 0) + 1;

    /* Impede crescimento sem fim: acima de 500, divide tudo pela metade e
       preserva a proporção entre anunciantes. */
    var highest = 0;
    Object.keys(map).forEach(function (key) {
      if (map[key] > highest) highest = map[key];
    });
    if (highest > 500) {
      Object.keys(map).forEach(function (key) {
        map[key] = Math.floor(map[key] / 2);
      });
    }
    writeStore(STORAGE_IMPRESSIONS, JSON.stringify(map));
  }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  /* Embaralha e depois ordena pelo número de exibições. Como Array#sort é
     estável, quem empata sai em ordem aleatória: ninguém compra a primeira
     posição nem fica preso ao fim da fila. */
  function sortFairly(list) {
    var impressions = readImpressions();
    shuffle(list);
    return list.sort(function (a, b) {
      return (impressions[a.shop.id] || 0) - (impressions[b.shop.id] || 0);
    });
  }

  /* Junta contrato + barbearia, aplica vigência e monta a fila do carrossel. */
  function selectAds(city) {
    var local = [];
    var national = [];
    var others = [];

    config.contracts.forEach(function (contract) {
      if (!isLive(contract)) return;
      var shop = shopById(contract.shopId);
      if (!shop) return; // contrato apontando para barbearia removida do data.js

      var ad = { contract: contract, shop: shop };
      if (city && shop.city === city) local.push(ad);
      else if (contract.plan === "national") national.push(ad);
      else others.push(ad);
    });

    var queue = sortFairly(local).concat(sortFairly(national));
    if (!city && config.fillWithLocalWhenCityUnknown) {
      queue = queue.concat(sortFairly(others));
    }
    return queue.slice(0, config.maxSlots);
  }

  /* ======================================================================
     Métricas — GA4 (gtag) com fallback para dataLayer
     ====================================================================== */
  function track(event, params) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", event, params);
        return;
      }
      window.dataLayer = window.dataLayer || [];
      var payload = { event: event };
      Object.keys(params).forEach(function (key) {
        payload[key] = params[key];
      });
      window.dataLayer.push(payload);
    } catch (err) {
      /* medição nunca pode derrubar a página */
    }
  }

  /* Link interno leva `ref`/`pos`, não UTM: UTM em link interno quebra a
     sessão do GA e infla o "tráfego direto". UTM só entra quando o anúncio
     aponta para fora do site (`contract.externalUrl`). */
  function adHref(ad, position) {
    var contract = ad.contract;
    if (contract.externalUrl) {
      var separator = contract.externalUrl.indexOf("?") === -1 ? "?" : "&";
      return (
        contract.externalUrl +
        separator +
        "utm_source=inbarber&utm_medium=hero-featured&utm_campaign=" +
        encodeURIComponent(contract.shopId)
      );
    }
    return "barbearia.html?id=" + encodeURIComponent(ad.shop.id) + "&ref=hero-featured&pos=" + position;
  }

  /* ======================================================================
     Carrossel
     ====================================================================== */
  function Carousel(root) {
    this.root = root;
    this.index = 0;
    this.timer = null;
    this.pausedByUser = false;
    /* Uma impressão por anunciante por visita à página. Trocar de idioma ou de
       cidade remonta o carrossel, mas não são olhos novos: se `measured` fosse
       zerado a cada render, o relatório do anunciante viria inflado. */
    this.measured = {};
    this.inView = true;
    this.city = storedCity();
    this.scope = this.city ? "city" : "national";

    this.reducedMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    this.build();
    this.render();

    var self = this;
    onLanguageChange(function () {
      self.render();
    });

    /* A busca do hero avisa quando o visitante escolhe uma cidade — na lista ou
       pelo "Usar minha localização". O carrossel serve os anúncios daquela
       praça na mesma hora, sem pedir permissão de novo. */
    document.addEventListener("inbarber:citychange", function (event) {
      var city = event.detail && event.detail.city;
      if (!city || !data.cityCoords[city] || city === self.city) return;
      self.city = city;
      self.scope = "city";
      self.render();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) self.stop();
      else if (!self.pausedByUser) self.start();
    });
  }

  Carousel.prototype.build = function () {
    var self = this;
    this.root.classList.add("featured");
    this.root.style.setProperty("--featured-interval", config.intervalMs + "ms");

    /* Cabeçalho: título e contador de posição. */
    this.head = el("div", "featured__head");
    this.title = el("h2", "featured__title");
    this.counter = el("p", "featured__counter");
    this.head.appendChild(this.title);
    this.head.appendChild(this.counter);

    /* Palco: a pilha de cartas mais os controles. */
    this.stage = el("div", "featured__stage");
    this.stage.setAttribute("role", "group");
    this.stage.setAttribute("aria-roledescription", "carrossel");

    this.track = el("ul", "featured__track");
    this.track.setAttribute("aria-live", "polite");
    this.stage.appendChild(this.track);

    this.prevBtn = el("button", "featured__arrow featured__arrow--prev", ICONS.prev);
    this.prevBtn.type = "button";
    this.prevBtn.addEventListener("click", function () {
      self.move(-1, true);
    });

    this.nextBtn = el("button", "featured__arrow featured__arrow--next", ICONS.next);
    this.nextBtn.type = "button";
    this.nextBtn.addEventListener("click", function () {
      self.move(1, true);
    });

    this.stage.appendChild(this.prevBtn);
    this.stage.appendChild(this.nextBtn);

    this.foot = el("div", "featured__foot");
    this.dots = el("ol", "featured__dots");
    this.pauseBtn = el("button", "featured__pause");
    this.pauseBtn.type = "button";
    this.pauseBtn.addEventListener("click", function () {
      self.pausedByUser = !self.pausedByUser;
      if (self.pausedByUser) self.stop();
      else self.start();
      self.syncPause();
    });
    this.foot.appendChild(this.dots);
    this.foot.appendChild(this.pauseBtn);

    this.root.appendChild(this.head);
    this.root.appendChild(this.stage);
    this.root.appendChild(this.foot);

    /* O autoplay não pode atropelar quem está lendo ou navegando por teclado. */
    this.stage.addEventListener("mouseenter", function () {
      self.stop();
    });
    this.stage.addEventListener("mouseleave", function () {
      if (!self.pausedByUser) self.start();
    });
    this.root.addEventListener("focusin", function () {
      self.stop();
    });
    this.root.addEventListener("focusout", function () {
      if (!self.pausedByUser && !self.root.contains(document.activeElement)) self.start();
    });
    this.root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        self.move(1, true);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        self.move(-1, true);
      }
    });

    this.bindSwipe();
  };

  /* Arrastar é o gesto que o visitante já tenta primeiro no celular; sem ele o
     carrossel parece travado. Vale para mouse e toque. */
  Carousel.prototype.bindSwipe = function () {
    var self = this;
    var startX = 0;
    var deltaX = 0;
    var dragging = false;

    function begin(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (!self.ads || self.ads.length < 2) return;
      dragging = true;
      startX = event.clientX;
      deltaX = 0;
      self.stage.classList.add("is-dragging");
      self.stop();
      /* Sem a captura, um movimento rápido sai do elemento e o arrasto morre
         no meio. */
      try {
        self.track.setPointerCapture(event.pointerId);
      } catch (err) {
        /* navegador sem captura de ponteiro: o arrasto simples ainda funciona */
      }
    }

    function moveBy(event) {
      if (!dragging) return;
      deltaX = event.clientX - startX;
      /* Resistência: o card acompanha o dedo, mas amortecido. */
      self.stage.style.setProperty("--featured-drag", deltaX * 0.35 + "px");
    }

    function end() {
      if (!dragging) return;
      dragging = false;
      self.stage.classList.remove("is-dragging");
      self.stage.style.removeProperty("--featured-drag");

      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        self.move(deltaX < 0 ? 1 : -1, true);
        /* Evita que o ponteiro solto vire um clique no link do card. */
        self.suppressClickUntil = Date.now() + 320;
      } else if (!self.pausedByUser) {
        self.start();
      }
      deltaX = 0;
    }

    /* O arrasto nativo de imagem e de link cancelaria o gesto no primeiro
       milímetro: o navegador assumiria o "arrastar para copiar". */
    this.track.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    this.track.addEventListener("pointerdown", begin);
    this.track.addEventListener("pointermove", moveBy);
    this.track.addEventListener("pointerup", end);
    this.track.addEventListener("pointercancel", end);
    /* Com a captura ativa o ponteiro "sai" do elemento logo no início, então
       pointerleave não serve de fim de gesto — quem encerra é a perda da
       captura, que cobre inclusive o ponteiro solto fora da janela. */
    this.track.addEventListener("lostpointercapture", end);
  };

  Carousel.prototype.slideMarkup = function (ad, index) {
    var shop = ad.shop;
    var lang = i18n.getLanguage();
    var pitch = ad.contract.pitch[lang] || ad.contract.pitch.pt || "";
    var first = index === 0;

    return (
      '<a class="featured__link" href="' + adHref(ad, index + 1) + '" draggable="false">' +
        '<figure class="framed framed--glow featured__photo">' +
          '<img src="' + escapeHtml(shop.image) + '" alt="' +
            escapeHtml(i18n.t("shops.photoAlt", { name: shop.name, city: shop.city })) + '"' +
            ' width="800" height="1000" decoding="async" draggable="false"' +
            (first ? ' fetchpriority="high"' : ' loading="lazy"') + ">" +
        "</figure>" +

        '<span class="featured__sponsored">' +
          ICONS.sparkle +
          "<span>" + escapeHtml(i18n.t("featured.sponsored")) + "</span>" +
          '<span class="visually-hidden">. ' + escapeHtml(i18n.t("featured.sponsoredNote")) + "</span>" +
        "</span>" +

        '<div class="featured__info">' +
          '<h3 class="featured__name">' + escapeHtml(shop.name) + "</h3>" +
          '<p class="featured__location">' + ICONS.pin +
            escapeHtml(shop.neighborhood + " · " + shop.city) + "</p>" +
          (pitch ? '<p class="featured__pitch">' + escapeHtml(pitch) + "</p>" : "") +
          '<p class="featured__rating">' + starsMarkup(shop.rating) +
            '<strong class="rating-value">' + escapeHtml(i18n.formatRating(shop.rating)) + "</strong>" +
            '<span class="featured__reviews">' + escapeHtml(i18n.formatNumber(shop.reviews)) +
              " " + escapeHtml(i18n.t("shops.reviewsSuffix")) + "</span>" +
          "</p>" +
          '<span class="btn btn--primary btn--sm featured__cta">' +
            escapeHtml(i18n.t("shops.viewProfile")) + "</span>" +
        "</div>" +
      "</a>"
    );
  };

  Carousel.prototype.render = function () {
    var self = this;
    this.ads = selectAds(this.city);
    this.index = 0;
    this.track.innerHTML = "";
    this.dots.innerHTML = "";

    this.title.textContent = i18n.t("featured.title");
    this.stage.setAttribute("aria-label", i18n.t("featured.carousel"));
    this.prevBtn.setAttribute("aria-label", i18n.t("featured.prev"));
    this.nextBtn.setAttribute("aria-label", i18n.t("featured.next"));

    if (!this.ads.length) return this.renderEmpty();

    this.root.classList.remove("featured--empty");

    this.ads.forEach(function (ad, index) {
      var item = el("li", "featured__slide", self.slideMarkup(ad, index));
      item.setAttribute("role", "group");
      item.setAttribute("aria-roledescription", "slide");
      item.setAttribute(
        "aria-label",
        i18n.t("featured.slide", { current: index + 1, total: self.ads.length })
      );
      item.setAttribute("data-shop", ad.shop.id);

      var link = qs(".featured__link", item);
      link.addEventListener("click", function (event) {
        /* Soltar o dedo depois de arrastar não pode virar navegação. */
        if (self.suppressClickUntil && Date.now() < self.suppressClickUntil) {
          event.preventDefault();
          return;
        }
        track("featured_click", {
          shop_id: ad.shop.id,
          shop_name: ad.shop.name,
          position: index + 1,
          plan: ad.contract.plan,
          city: ad.shop.city
        });
      });

      /* Foto do anunciante que não carrega não pode deixar um buraco no hero:
         o .framed já tem gradiente de fallback por trás. */
      var img = qs("img", item);
      if (img) {
        img.addEventListener("error", function () {
          img.remove();
        });
      }

      self.track.appendChild(item);

      var dot = el("li", "featured__dot");
      var button = el("button", null, '<span class="featured__dot-fill"></span>');
      button.type = "button";
      button.setAttribute("aria-label", i18n.t("featured.goTo", { n: index + 1 }));
      button.addEventListener("click", function () {
        self.go(index, true);
      });
      dot.appendChild(button);
      self.dots.appendChild(dot);
    });

    var many = this.ads.length > 1;
    this.root.classList.toggle("featured--single", !many);
    this.prevBtn.hidden = !many;
    this.nextBtn.hidden = !many;
    this.dots.hidden = !many;
    this.counter.hidden = !many;
    this.pauseBtn.hidden = !many || this.reducedMotion;

    this.go(0, false);
    this.watchViewport();
    if (many && !this.reducedMotion && !this.pausedByUser) this.start();
  };

  Carousel.prototype.renderEmpty = function () {
    this.root.classList.add("featured--empty");
    this.prevBtn.hidden = true;
    this.nextBtn.hidden = true;
    this.dots.hidden = true;
    this.counter.hidden = true;
    this.pauseBtn.hidden = true;
    this.stop();

    this.track.appendChild(
      el(
        "li",
        "featured__slide featured__slide--empty",
        '<div class="featured__info">' +
          '<h3 class="featured__name">' + escapeHtml(i18n.t("featured.emptyTitle")) + "</h3>" +
          '<p class="featured__pitch">' + escapeHtml(i18n.t("featured.emptyText")) + "</p>" +
          '<a class="btn btn--gradient btn--sm" href="para-barbearias.html">' +
            escapeHtml(i18n.t("featured.advertise")) + "</a>" +
        "</div>"
      )
    );
  };

  Carousel.prototype.go = function (index, manual) {
    if (!this.ads.length) return;
    var total = this.ads.length;
    this.index = ((index % total) + total) % total;

    /* --i é a distância da carta até o topo da pilha. O CSS traduz isso em
       deslocamento, escala e opacidade — é o que produz o baralho. */
    qsa(".featured__slide", this.track).forEach(function (slide, position) {
      var depth = (position - this.index + total) % total;
      var visible = depth <= DECK_DEPTH;

      slide.style.setProperty("--i", depth);
      slide.classList.toggle("is-active", depth === 0);
      slide.classList.toggle("is-behind", depth > 0 && visible);
      slide.classList.toggle("is-out", !visible);

      if (depth === 0) slide.removeAttribute("aria-hidden");
      else slide.setAttribute("aria-hidden", "true");

      var link = qs(".featured__link", slide);
      if (link) link.tabIndex = depth === 0 ? 0 : -1;
    }, this);

    qsa("button", this.dots).forEach(function (button, position) {
      var current = position === this.index;
      button.classList.toggle("is-active", current);
      button.setAttribute("aria-current", current ? "true" : "false");
    }, this);

    /* Os dois valores são números gerados aqui, não entrada de terceiros. */
    this.counter.innerHTML = i18n.t("featured.counter", {
      current: "<b>" + (this.index + 1) + "</b>",
      total: total
    });

    if (manual) this.restart();
    this.measure();
  };

  Carousel.prototype.move = function (step, manual) {
    this.go(this.index + step, manual);
  };

  Carousel.prototype.start = function () {
    if (this.timer || this.reducedMotion || !this.ads || this.ads.length < 2) return;
    var self = this;
    this.timer = window.setInterval(function () {
      self.move(1, false);
    }, config.intervalMs);
    this.syncPause();
  };

  Carousel.prototype.stop = function () {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.syncPause();
  };

  Carousel.prototype.restart = function () {
    if (!this.timer || this.pausedByUser) return;
    this.stop();
    this.start();
  };

  Carousel.prototype.syncPause = function () {
    if (!this.pauseBtn) return;
    var running = !!this.timer;
    this.pauseBtn.innerHTML = running ? ICONS.pause : ICONS.play;
    this.pauseBtn.setAttribute("aria-pressed", running ? "false" : "true");
    this.pauseBtn.setAttribute("aria-label", i18n.t(running ? "featured.pause" : "featured.resume"));
    /* Com o autoplay rodando, a barrinha do ponto ativo vira o relógio da
       próxima virada. Parado, ela fica cheia e só marca a posição. */
    this.root.classList.toggle("is-running", running);
  };

  /* Impressão só vale quando o slide está ativo E visível de verdade. */
  Carousel.prototype.watchViewport = function () {
    var self = this;
    if (!window.IntersectionObserver) return;
    if (this.observer) this.observer.disconnect();

    this.observer = new window.IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          self.inView = entry.isIntersecting;
          if (self.inView) self.measure();
        });
      },
      { threshold: 0.5 }
    );
    this.observer.observe(this.root);
  };

  Carousel.prototype.measure = function () {
    if (!this.inView || !this.ads || !this.ads.length) return;
    var ad = this.ads[this.index];
    if (!ad || this.measured[ad.shop.id]) return;

    this.measured[ad.shop.id] = true;
    countImpression(ad.shop.id);

    track("featured_impression", {
      shop_id: ad.shop.id,
      shop_name: ad.shop.name,
      position: this.index + 1,
      plan: ad.contract.plan,
      city: ad.shop.city,
      scope: this.scope
    });
  };

  /* ======================================================================
     Boot
     ====================================================================== */
  function boot() {
    var roots = qsa("[data-featured-carousel]");
    if (!roots.length) return;

    if (!i18n || !data || !config) {
      if (window.console) console.error("[InBarber] destaques: i18n, data ou contratos não carregados.");
      return;
    }

    window.InBarberFeatured = {
      instances: roots.map(function (root) {
        return new Carousel(root);
      }),
      selectAds: selectAds,
      isLive: isLive
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);