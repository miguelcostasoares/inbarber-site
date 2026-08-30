/* ==========================================================================
   InBarber — Interações do site

   Módulos:
     1. Header  — estado "grudado", idioma e botão de sessão
     2. Reveal  — animações de scroll via Intersection Observer
     3. Counter — contadores animados do hero
     4. Shops   — renderização de cards, filtros, busca e ordenação
     5. Reviews — depoimentos de clientes e de barbeiros + carrossel
     6. Trends  — editorial de tendências
     7. Search  — busca do hero com filtros de local, dia e período
     8. Signup  — validação do formulário B2B

   Todo texto vem do i18n; os módulos se re-renderizam no evento
   "inbarber:languagechange".
   ========================================================================== */

(function (window, document) {
  "use strict";

  var i18n = window.InBarberI18n;
  var data = window.INBARBER_DATA;

  /* ======================================================================
     Ícones (SVG inline, sem requisições extras)
     ====================================================================== */
  var ICONS = {
    star:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    arrowRight:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    searchOff:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/><path d="m8.5 8.5 5 5"/><path d="m13.5 8.5-5 5"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    target:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
    trend:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 16 5.5-5.5 3.5 3.5L21 5"/><path d="M15 5h6v6"/></svg>',
    sparkle:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.3l-1.9-5.5L4.5 9.9 10.1 8 12 2.5Z"/><path d="M18.5 14.5 19.4 17l2.6.9-2.6.9-.9 2.5-.9-2.5-2.6-.9 2.6-.9.9-2.5Z" opacity=".65"/></svg>',
    chevronLeft:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14.5 5-7 7 7 7"/></svg>',
    chevronRight:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9.5 5 7 7-7 7"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7c-.3 0-.6-.1-.8-.3C7.6 17.5 3 14 3 9.9A4.9 4.9 0 0 1 12 7.2a4.9 4.9 0 0 1 9 2.7c0 4.1-4.6 7.6-8.2 10.5-.2.2-.5.3-.8.3Z" stroke-linejoin="round"/></svg>',
    door:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v17h9"/><path d="M14 3l5 2.5V21h-5z"/><path d="M16.5 12.5v1.5"/></svg>',
    crown:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.4 7.6a1.4 1.4 0 0 1 2.2 1.15l-.02.2 2.2 1.5a1 1 0 0 0 1.44-.32l2-3.46a1.4 1.4 0 1 1 1.56 0l2 3.46a1 1 0 0 0 1.44.32l2.2-1.5-.02-.2A1.4 1.4 0 1 1 20.4 10l-1.24 6.1a1.3 1.3 0 0 1-1.28 1.05H6.12a1.3 1.3 0 0 1-1.28-1.05L3.6 10a1.4 1.4 0 0 1-.2-2.4Z"/><rect x="5.6" y="18.35" width="12.8" height="2.15" rx="1.07"/></svg>'
  };

  /* ======================================================================
     Opções fixas da busca (rótulos vêm do i18n)
     ====================================================================== */
  var DAY_OPTIONS = [
    { value: "any", key: "day.any" },
    { value: "today", key: "day.today" },
    { value: "tomorrow", key: "day.tomorrow" },
    { value: "weekend", key: "day.weekend" }
  ];

  var TIME_OPTIONS = [
    { value: "any", key: "time.any" },
    { value: "morning", key: "time.morning" },
    { value: "afternoon", key: "time.afternoon" },
    { value: "evening", key: "time.evening" }
  ];

  var RATING_LABELS = {
    "4.5": "filters.rating45",
    "4": "filters.rating40",
    "3.5": "filters.rating35"
  };

  /* Raio máximo, em km, para considerar que o usuário está numa cidade atendida. */
  var MAX_CITY_DISTANCE_KM = 250;

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

  /**
   * Guarda a cidade escolhida pelo visitante (na lista ou pela geolocalização)
   * e avisa quem depende dela. Hoje o ouvinte é o carrossel de Barbearias em
   * Destaque: quem buscou "Curitiba" passa a ver os anúncios de Curitiba sem
   * precisar autorizar a localização de novo.
   */
  function rememberCity(city) {
    try {
      window.localStorage.setItem("inbarber:city", city);
    } catch (err) {
      /* silencioso: a sessão atual continua funcionando */
    }
    document.dispatchEvent(new CustomEvent("inbarber:citychange", { detail: { city: city } }));
  }

  /**
   * Coração de favorita, em cima da foto do card.
   *
   * Favoritar exige conta: sem sessão o botão continua visível e clicável,
   * mas o clique abre o painel de entrada em vez de salvar — quem não sabe
   * que a função existe nunca cria conta por causa dela. O estado e o
   * rótulo são mantidos pelo js/conta.js, que sincroniza todos os botões da
   * mesma barbearia quando a sessão ou a lista de favoritas muda.
   */
  function favButtonMarkup(shop, className) {
    var account = window.InBarberAccount;
    var signedIn = !!(account && account.isSignedIn());
    var active = !!(account && account.isFavorite(shop.id));
    var label = signedIn
      ? i18n.t(active ? "fav.remove" : "fav.add", { name: shop.name })
      : i18n.t("fav.locked", { name: shop.name });

    return (
      '<button type="button" class="fav-btn' + (className ? " " + className : "") + '"' +
        ' data-fav="' + escapeHtml(shop.id) + '"' +
        ' data-fav-name="' + escapeHtml(shop.name) + '"' +
        ' aria-pressed="' + (active ? "true" : "false") + '"' +
        (signedIn ? "" : " data-fav-locked") +
        ' aria-label="' + escapeHtml(label) + '"' +
        ' title="' + escapeHtml(label) + '">' +
        ICONS.heart +
      "</button>"
    );
  }

  function starsMarkup(rating, size) {
    var full = Math.round(rating);
    var out = '<span class="stars' + (size ? " stars--" + size : "") + '" role="img" aria-label="' +
      escapeHtml(i18n.t("reviews.starsAlt", { rating: i18n.formatRating(rating) })) + '">';
    for (var i = 1; i <= 5; i += 1) {
      out += i <= full ? ICONS.star : '<span class="stars__empty">' + ICONS.star + "</span>";
    }
    return out + "</span>";
  }

  /* ======================================================================
     1. HEADER — estado grudado, seletor de idioma e botão de sessão
     ====================================================================== */
  function initHeader() {
    var header = qs("[data-header]");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /**
   * Dropdowns de idioma (header e rodapé).
   * O conteúdo do menu é montado pelo i18n; aqui cuidamos só de abrir,
   * fechar e devolver o foco.
   */
  function initLangDropdowns() {
    var selects = qsa("[data-lang-select]");
    if (!selects.length) return;

    function close(select) {
      var trigger = qs("[data-lang-trigger]", select);
      var menu = qs("[data-lang-menu]", select);
      if (!trigger || !menu) return;
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }

    function closeAll(except) {
      selects.forEach(function (select) {
        if (select !== except) close(select);
      });
    }

    selects.forEach(function (select) {
      var trigger = qs("[data-lang-trigger]", select);
      var menu = qs("[data-lang-menu]", select);
      if (!trigger || !menu) return;

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        closeAll(select);
        trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
        menu.hidden = isOpen;
        if (!isOpen) {
          var first = qs(".lang-select__option", menu);
          if (first) first.focus();
        }
      });

      // Escolher um idioma fecha o menu e devolve o foco ao gatilho, antes
      // que o i18n remonte as opções.
      menu.addEventListener("click", function (event) {
        if (!event.target.closest("[data-lang-option]")) return;
        close(select);
        trigger.focus();
      });

      select.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        close(select);
        trigger.focus();
      });
    });

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-lang-select]")) return;
      closeAll(null);
    });

    onLanguageChange(function () {
      closeAll(null);
    });
  }

  /**
   * Botão "Iniciar sessão".
   * Ainda não existe backend de autenticação, então o botão não abre
   * nenhuma tela falsa: ele apenas dispara o evento "inbarber:signin",
   * que é o gancho para plugar o fluxo real quando ele existir.
   */
  function initSignIn() {
    qsa("[data-signin]").forEach(function (button) {
      button.addEventListener("click", function () {
        document.dispatchEvent(
          new CustomEvent("inbarber:signin", { detail: { source: "header" } })
        );
        if (window.console && console.info) {
          console.info(
            "[InBarber] Iniciar sessão: ligue o fluxo de autenticação ao evento \"inbarber:signin\"."
          );
        }
      });
    });
  }

  /* ======================================================================
     2. REVEAL — animações de scroll
     ====================================================================== */
  function initReveal() {
    var targets = qsa("[data-reveal]");
    if (!targets.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    targets.forEach(function (node) {
      observer.observe(node);
    });

    // Elementos criados dinamicamente também entram na observação.
    window.InBarberReveal = {
      observe: function (scope) {
        qsa("[data-reveal]", scope).forEach(function (node) {
          if (node.classList.contains("is-visible")) return;
          observer.observe(node);
        });
      }
    };
  }

  function observeNew(scope) {
    if (window.InBarberReveal) window.InBarberReveal.observe(scope);
    else qsa("[data-reveal]", scope).forEach(function (n) { n.classList.add("is-visible"); });
  }

  /* ======================================================================
     3. COUNTER — contadores do hero
     ====================================================================== */
  function initCounters() {
    var counters = qsa("[data-count]");
    if (!counters.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function render(node, value) {
      var decimals = Number(node.getAttribute("data-count-decimals") || 0);
      var suffix = node.getAttribute("data-count-suffix") || "";
      node.textContent =
        i18n.formatNumber(value, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) + suffix;
    }

    function animate(node) {
      var target = Number(node.getAttribute("data-count"));
      if (reduced) {
        render(node, target);
        return;
      }
      var duration = 1400;
      var start = null;

      function frame(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        render(node, target * eased);
        if (progress < 1) window.requestAnimationFrame(frame);
        else render(node, target);
      }
      window.requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (node) { render(node, Number(node.getAttribute("data-count"))); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (node) { observer.observe(node); });

    // Ao trocar de idioma, reformata os números já exibidos.
    onLanguageChange(function () {
      counters.forEach(function (node) { render(node, Number(node.getAttribute("data-count"))); });
    });
  }

  /* ======================================================================
     4. SHOPS — cards, filtros, busca e ordenação
     ====================================================================== */
  function shopCard(shop) {
    var card = el("article", "card shop-card");
    card.setAttribute("data-reveal", "");

    var services = shop.serviceKeys
      .map(function (key) {
        return '<li class="chip">' + escapeHtml(i18n.t("service." + key)) + "</li>";
      })
      .join("");

    /* Fechada em vermelho: é o dado que muda a decisão de quem está olhando. */
    var statusClass = shop.openNow ? "badge--success" : "badge--danger";
    var statusText = i18n.t(shop.openNow ? "shops.openNow" : "shops.closed");
    var altText = i18n.t("shops.photoAlt", { name: shop.name, city: shop.city });

    card.innerHTML =
      '<div class="shop-card__media">' +
        '<img src="' + shop.image + '" alt="' + escapeHtml(altText) + '" loading="lazy" decoding="async" width="800" height="500">' +
        '<span class="badge ' + statusClass + ' shop-card__status"><span class="badge__dot"></span>' + escapeHtml(statusText) + "</span>" +
        favButtonMarkup(shop) +
        '<span class="shop-card__rating">' + ICONS.star +
          i18n.formatRating(shop.rating) +
          '<span class="shop-card__reviews">(' + i18n.formatNumber(shop.reviews) + ")</span>" +
        "</span>" +
      "</div>" +
      '<div class="card__body">' +
        '<h3 class="shop-card__name">' + escapeHtml(shop.name) + "</h3>" +
        '<p class="shop-card__location">' + ICONS.pin + escapeHtml(shop.neighborhood + " · " + shop.city) + "</p>" +
        '<ul class="shop-card__services">' + services + "</ul>" +
        '<div class="shop-card__footer">' +
          '<p class="shop-card__price">' + escapeHtml(i18n.t("shops.from")) +
            "<strong>" + escapeHtml(i18n.formatPrice(shop.priceFrom)) + "</strong>" +
          "</p>" +
          '<a class="btn btn--ghost btn--sm" href="barbearia.html?id=' + encodeURIComponent(shop.id) + '">' +
            escapeHtml(i18n.t("shops.viewProfile")) +
          "</a>" +
        "</div>" +
      "</div>";

    return card;
  }

  function emptyState(onReset) {
    var box = el("div", "empty-state");
    box.innerHTML =
      ICONS.searchOff +
      "<p>" + escapeHtml(i18n.t("shops.empty")) + "</p>" +
      '<button type="button" class="btn btn--ghost btn--sm">' + escapeHtml(i18n.t("shops.emptyAction")) + "</button>";
    var btn = qs("button", box);
    if (btn && onReset) btn.addEventListener("click", onReset);
    return box;
  }

  /* ======================================================================
     4.1 RECOMENDADAS — ranking, novas barbearias e abertas agora

     Três listas com propósitos diferentes, montadas do mesmo data.js:

       Ranking  — mérito puro (nota + avaliações dos últimos 30 dias). Não é
                  espaço comprado: quem paga aparece no carrossel do hero,
                  com selo de "Destaque pago". Aqui ninguém compra posição.
       Novas    — as últimas barbearias a entrar, ordenadas por joinedAt.
       Abertas  — quem está de portas abertas agora, com o próximo horário
                  livre já clicável. Responde ao "quero cortar hoje".

     Em todos os cards o coração salva a barbearia nas favoritas, e favoritar
     exige conta: sem sessão o clique abre o painel de entrada (js/conta.js).

     Quando o visitante já escolheu uma cidade (na busca do hero ou pela
     geolocalização), o ranking traz as barbearias dessa cidade primeiro e
     cada card mostra a distância. Sem cidade conhecida, o ranking é nacional
     e a linha de distância simplesmente não existe — nada é estimado.
     ====================================================================== */
  /* 1 destaque + 8 cards em um trilho de uma linha só. A grade de duas
     fileiras virou trilho: em vez de empurrar a seção para baixo, a lista
     anda para o lado, e cabe mais barbearia sem custar altura de página. */
  var RECS_LIMIT = 9;
  var RECS_LIMIT_SMALL = 7;
  var RECS_BREAKPOINT = "(min-width: 640px)";
  var NEWS_LIMIT = 6;
  /* "Abertas agora" é uma lista de ação, não de vitrine — e agora também um
     trilho de uma linha: oito cabem sem que ninguém precise rolar a página
     para decidir onde cortar hoje. */
  var OPEN_LIMIT = 8;

  /* Quanto tempo cada foto do card de destaque fica na tela enquanto o cursor
     está em cima. O mesmo valor alimenta a barra de progresso no CSS
     (--hero-photo-duration), então mexer aqui exige mexer lá. */
  var HERO_PHOTO_MS = 1400;

  /* Faltando isso ou menos para fechar, a barbearia ganha o aviso de "fecha
     em breve": ainda dá tempo de chegar, mas não dá para deixar para depois. */
  var CLOSING_SOON_MIN = 90;

  /** Cidade guardada pela busca do hero, se for uma cidade atendida. */
  function visitorCity() {
    try {
      var city = window.localStorage.getItem("inbarber:city");
      return city && data.cityCoords[city] ? city : null;
    } catch (err) {
      return null; // modo privado: o ranking segue nacional
    }
  }

  /* Relógio de 24h com zero à esquerda (09:00, como se escreve em PT e ES) e
     de 12h sem zero (9:00 AM, como se escreve em EN). O formatador é criado
     uma vez por idioma. */
  var timeFormatters = {};

  function formatTime(date) {
    try {
      var locale = i18n.getLocale();
      if (!timeFormatters[locale]) {
        var hour12 = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12;
        timeFormatters[locale] = new Intl.DateTimeFormat(locale, {
          hour: hour12 ? "numeric" : "2-digit",
          minute: "2-digit"
        });
      }
      return timeFormatters[locale].format(date);
    } catch (err) {
      var minutes = String(date.getMinutes());
      return date.getHours() + ":" + (minutes.length < 2 ? "0" + minutes : minutes);
    }
  }

  function formatMonth(date) {
    try {
      return new Intl.DateTimeFormat(i18n.getLocale(), { month: "long" }).format(date);
    } catch (err) {
      return String(date.getMonth() + 1);
    }
  }

  /** Data/hora local em ISO curto, sem passar por UTC (evita erro de fuso). */
  function localISO(date) {
    function pad(value) {
      var text = String(value);
      return text.length < 2 ? "0" + text : text;
    }
    return (
      date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
      "T" + pad(date.getHours()) + ":" + pad(date.getMinutes())
    );
  }

  function slotDayLabel(slot) {
    if (slot.daysAhead === 0) return i18n.t("day.today");
    if (slot.daysAhead === 1) return i18n.t("day.tomorrow");
    return i18n.t("day.short" + slot.date.getDay());
  }

  /**
   * Por que esta barbearia está no ranking.
   * A frase muda conforme o número que mais pesa — sempre um número que
   * existe no data.js, nunca um adjetivo genérico.
   */
  function reasonFor(shop) {
    if (shop.rebookRate >= 85) {
      return i18n.t("recs.reason.rebook", { percent: i18n.formatNumber(shop.rebookRate) });
    }
    if (shop.reviews30d >= 50) {
      return i18n.t("recs.reason.reviews", { count: i18n.formatNumber(shop.reviews30d) });
    }
    return i18n.t("recs.reason.rating", {
      rating: i18n.formatRating(shop.rating),
      count: i18n.formatNumber(shop.reviews)
    });
  }

  /** "Na sua cidade" ou "a 430 km de Curitiba" — só com cidade conhecida. */
  function proximityLabel(shop, city) {
    if (!city) return "";
    if (shop.city === city) return i18n.t("recs.here");
    var km = data.distanceFromCity(city, shop);
    if (km === null) return "";
    return i18n.t("recs.distance", { km: i18n.formatNumber(km), city: city });
  }

  function servicesMarkup(shop, max) {
    return shop.serviceKeys
      .slice(0, max || shop.serviceKeys.length)
      .map(function (key) {
        return '<li class="chip">' + escapeHtml(i18n.t("service." + key)) + "</li>";
      })
      .join("");
  }

  function ratingMarkup(shop) {
    return (
      '<span class="rec-rating">' + ICONS.star +
        '<strong>' + escapeHtml(i18n.formatRating(shop.rating)) + "</strong>" +
        '<span class="rec-rating__count">' +
          escapeHtml(i18n.t("recs.reviewsCount", { count: i18n.formatNumber(shop.reviews) })) +
        "</span>" +
      "</span>"
    );
  }

  /* Aberta em verde, fechada em vermelho: o selo é a única pista de que não
     adianta procurar horário para hoje, então ele precisa gritar. */
  function statusMarkup(shop, className) {
    var badgeClass = shop.openNow ? "badge--success" : "badge--danger";
    var label = i18n.t(shop.openNow ? "shops.openNow" : "shops.closed");
    return (
      '<span class="badge ' + badgeClass + " " + className + '">' +
        '<span class="badge__dot"></span>' + escapeHtml(label) +
      "</span>"
    );
  }

  function priceMarkup(shop) {
    return (
      '<p class="rec-price">' + escapeHtml(i18n.t("shops.from")) +
        "<strong>" + escapeHtml(i18n.formatPrice(shop.priceFrom)) + "</strong>" +
      "</p>"
    );
  }

  function profileHref(shop, ref, extra) {
    return (
      "barbearia.html?id=" + encodeURIComponent(shop.id) +
      "&ref=" + encodeURIComponent(ref) +
      (extra || "")
    );
  }

  /**
   * Próximos horários livres, como atalhos de agendamento.
   * Cada horário leva ao perfil já com a data escolhida na query string —
   * quando o backend de agenda existir, é ele que lê esse parâmetro.
   */
  function slotsMarkup(shop, ref) {
    var slots = data.nextSlots(shop, 3);
    var label =
      '<p class="rec-slots__label">' + ICONS.clock +
        "<span>" + escapeHtml(i18n.t("recs.slotsLabel")) + "</span>" +
      "</p>";

    if (!slots.length) {
      return (
        '<div class="rec-slots">' + label +
          '<p class="rec-slots__empty">' + escapeHtml(i18n.t("recs.slotsEmpty")) + "</p>" +
        "</div>"
      );
    }

    var items = slots
      .map(function (slot) {
        var day = slotDayLabel(slot);
        var time = formatTime(slot.date);
        var aria = i18n.t("recs.slotAria", { day: day, time: time, name: shop.name });
        return (
          '<li><a class="rec-slot" href="' +
            profileHref(shop, ref, "&slot=" + encodeURIComponent(localISO(slot.date))) +
            '" aria-label="' + escapeHtml(aria) + '">' +
            '<span class="rec-slot__day">' + escapeHtml(day) + "</span>" +
            '<span class="rec-slot__time">' + escapeHtml(time) + "</span>" +
          "</a></li>"
        );
      })
      .join("");

    return '<div class="rec-slots">' + label + '<ul class="rec-slots__list">' + items + "</ul></div>";
  }

  /* ----------------------------------------------------------------------
     Card #1 — o destaque do ranking

     A foto do destaque virou galeria: parado, o card mostra a capa; com o
     cursor em cima, as demais fotos do salão passam sozinhas, com uma régua
     de progresso no alto para dizer quantas são e em qual delas se está.
     As fotos seguintes só são baixadas no primeiro hover (data-src) — quem
     nunca passa o mouse não paga por elas.
     ---------------------------------------------------------------------- */
  function heroGalleryMarkup(shop, altText) {
    var photos = data.shopGallery(shop);

    var slides = photos
      .map(function (photo, index) {
        var first = index === 0;
        return (
          '<img class="rec-hero__photo' + (first ? " is-active" : "") + '"' +
            (first ? ' src="' + photo + '"' : ' data-src="' + photo + '"') +
            ' alt="' + (first ? escapeHtml(altText) : "") + '"' +
            (first ? "" : ' aria-hidden="true"') +
            ' loading="lazy" decoding="async" width="800" height="600">'
        );
      })
      .join("");

    var gallery =
      '<div class="rec-hero__gallery" data-hero-gallery' +
        (photos.length > 1
          ? ' role="group" aria-label="' + escapeHtml(i18n.t("recs.galleryLabel", { name: shop.name })) + '"'
          : "") +
      ">" + slides + "</div>";

    if (photos.length < 2) return gallery;

    var bars = "";
    for (var i = 0; i < photos.length; i += 1) {
      bars +=
        '<span class="rec-hero__progress-bar' + (i === 0 ? " is-current" : "") + '"><i></i></span>';
    }

    return (
      gallery +
      '<div class="rec-hero__progress" aria-hidden="true">' + bars + "</div>" +
      '<p class="visually-hidden" data-hero-gallery-status role="status" aria-live="polite"></p>'
    );
  }

  /**
   * Passagem de fotos no hover.
   *
   * Só com mouse e com foco de teclado: em tela de toque não existe "parar em
   * cima", então o card fica na capa. Quem pediu menos movimento também fica —
   * a régua de progresso some junto, porque ela só faz sentido em movimento.
   */
  function bindHeroGallery(card) {
    var gallery = qs("[data-hero-gallery]", card);
    if (!gallery) return;

    var photos = qsa(".rec-hero__photo", gallery);
    if (photos.length < 2) return;

    var bars = qsa(".rec-hero__progress-bar", card);
    var status = qs("[data-hero-gallery-status]", card);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var index = 0;
    var timer = null;

    function load(node) {
      var src = node.getAttribute("data-src");
      if (!src) return;
      node.src = src;
      node.removeAttribute("data-src");
    }

    function show(next) {
      photos[index].classList.remove("is-active");
      if (bars[index]) bars[index].classList.remove("is-current");

      index = next;
      load(photos[index]);
      photos[index].classList.add("is-active");

      bars.forEach(function (bar, position) {
        bar.classList.toggle("is-done", index !== 0 && position < index);
      });
      if (bars[index]) bars[index].classList.add("is-current");

      if (status) {
        status.textContent = i18n.t("recs.galleryPhoto", {
          index: index + 1,
          total: photos.length
        });
      }
    }

    function start() {
      if (timer || reduced.matches) return;
      photos.forEach(load); /* uma vez só: o resto da galeria entra em cache */
      card.classList.add("is-playing");
      timer = window.setInterval(function () {
        show((index + 1) % photos.length);
      }, HERO_PHOTO_MS);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      card.classList.remove("is-playing");
      if (index !== 0) show(0);
      if (status) status.textContent = "";
    }

    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", function (event) {
      if (card.contains(event.relatedTarget)) return;
      stop();
    });
  }

  function recHeroCard(shop, city) {
    var card = el("article", "rec-hero");
    card.setAttribute("data-reveal", "");

    var proximity = proximityLabel(shop, city);
    var altText = i18n.t("shops.photoAlt", { name: shop.name, city: shop.city });

    card.innerHTML =
      '<div class="rec-hero__media">' +
        heroGalleryMarkup(shop, altText) +
        '<span class="rec-hero__medal" aria-hidden="true">' + ICONS.crown + "</span>" +
        favButtonMarkup(shop) +
        statusMarkup(shop, "rec-hero__status") +
      "</div>" +
      '<div class="rec-hero__body">' +
        '<p class="rec-hero__crown">' + ICONS.crown +
          "<span>" + escapeHtml(i18n.t("recs.topBadge")) + "</span>" +
        "</p>" +
        '<h3 class="rec-hero__name">' +
          '<a class="rec-link" href="' + profileHref(shop, "home-recs") + '">' + escapeHtml(shop.name) + "</a>" +
        "</h3>" +
        '<div class="rec-hero__rating">' + starsMarkup(shop.rating) + ratingMarkup(shop) + "</div>" +
        '<p class="rec-meta">' + ICONS.pin +
          "<span>" + escapeHtml(shop.neighborhood + " · " + shop.city) + "</span>" +
          (proximity ? '<span class="rec-near">' + escapeHtml(proximity) + "</span>" : "") +
        "</p>" +
        '<ul class="rec-hero__metrics">' +
          "<li><strong>" + escapeHtml(i18n.formatNumber(shop.reviews30d)) + "</strong>" +
            "<span>" + escapeHtml(i18n.t("recs.metricReviews30")) + "</span></li>" +
          "<li><strong>" + escapeHtml(i18n.formatNumber(shop.rebookRate)) + "%</strong>" +
            "<span>" + escapeHtml(i18n.t("recs.metricRebook")) + "</span></li>" +
        "</ul>" +
        '<ul class="rec-services">' + servicesMarkup(shop) + "</ul>" +
        slotsMarkup(shop, "home-recs") +
        '<div class="rec-hero__footer">' +
          priceMarkup(shop) +
          '<a class="btn btn--primary" href="' + profileHref(shop, "home-recs") + '">' +
            escapeHtml(i18n.t("shops.viewProfile")) + ICONS.arrowRight +
          "</a>" +
        "</div>" +
      "</div>";

    bindHeroGallery(card);
    return card;
  }

  /* ----------------------------------------------------------------------
     Cards #2 em diante — itens do trilho horizontal
     ---------------------------------------------------------------------- */
  function recCard(shop, city) {
    var card = el("article", "rec-card");
    card.setAttribute("data-reveal", "");

    var proximity = proximityLabel(shop, city);
    var altText = i18n.t("shops.photoAlt", { name: shop.name, city: shop.city });

    card.innerHTML =
      '<div class="rec-card__media">' +
        '<img src="' + shop.image + '" alt="' + escapeHtml(altText) + '" loading="lazy" decoding="async" width="600" height="400">' +
        favButtonMarkup(shop) +
        statusMarkup(shop, "rec-card__status") +
      "</div>" +
      '<div class="rec-card__body">' +
        '<h3 class="rec-card__name">' +
          '<a class="rec-link" href="' + profileHref(shop, "home-recs") + '">' + escapeHtml(shop.name) + "</a>" +
        "</h3>" +
        '<div class="rec-card__rating">' + starsMarkup(shop.rating) + ratingMarkup(shop) + "</div>" +
        '<p class="rec-meta">' + ICONS.pin +
          "<span>" + escapeHtml(shop.neighborhood + " · " + shop.city) + "</span>" +
          (proximity ? '<span class="rec-near">' + escapeHtml(proximity) + "</span>" : "") +
        "</p>" +
        '<p class="rec-reason">' + ICONS.trend + "<span>" + escapeHtml(reasonFor(shop)) + "</span></p>" +
        '<ul class="rec-services">' + servicesMarkup(shop, 3) + "</ul>" +
        slotsMarkup(shop, "home-recs") +
        '<div class="rec-card__footer">' +
          priceMarkup(shop) +
          '<span class="rec-card__cta">' + escapeHtml(i18n.t("shops.viewProfile")) + ICONS.arrowRight + "</span>" +
        "</div>" +
      "</div>";

    var item = el("li", "recs-item");
    item.appendChild(card);
    return item;
  }

  /* ----------------------------------------------------------------------
     Trilho "Novas na InBarber"
     ---------------------------------------------------------------------- */
  function joinedLabel(shop) {
    var days = data.daysSinceJoining(shop);
    if (days === 0) return i18n.t("news.joinedToday");
    if (days === 1) return i18n.t("news.joinedYesterday");
    if (days <= data.newShopDays) {
      return i18n.t("news.joinedDays", { count: i18n.formatNumber(days) });
    }
    var parts = String(shop.joinedAt).split("-");
    var joined = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return i18n.t("news.joinedSince", { month: formatMonth(joined), year: joined.getFullYear() });
  }

  /* O card do trilho era o mais pobre da seção — foto, nome e data. Agora ele
     carrega a mesma informação que decide uma escolha nos outros cards: nota
     com o número de avaliações, se está aberta agora, serviços e preço. Só os
     "próximos horários" ficam de fora, porque o trilho é uma vitrine de quem
     chegou, e não a lista de agendamento. */
  function newsCard(shop) {
    var item = el("li", "news-item");
    var card = el("article", "news-card");
    card.setAttribute("data-reveal", "");

    var altText = i18n.t("shops.photoAlt", { name: shop.name, city: shop.city });

    card.innerHTML =
      '<div class="news-card__media">' +
        '<img src="' + shop.image + '" alt="' + escapeHtml(altText) + '" loading="lazy" decoding="async" width="480" height="300">' +
        (data.isNewShop(shop)
          ? '<span class="news-card__badge">' + ICONS.sparkle + escapeHtml(i18n.t("news.badge")) + "</span>"
          : "") +
        favButtonMarkup(shop) +
        statusMarkup(shop, "news-card__status") +
      "</div>" +
      '<div class="news-card__body">' +
        '<h4 class="news-card__name">' +
          '<a class="rec-link" href="' + profileHref(shop, "home-new") + '">' + escapeHtml(shop.name) + "</a>" +
        "</h4>" +
        '<div class="news-card__rating">' + ratingMarkup(shop) + "</div>" +
        '<p class="rec-meta">' + ICONS.pin +
          "<span>" + escapeHtml(shop.neighborhood + " · " + shop.city) + "</span>" +
        "</p>" +
        '<p class="news-card__joined">' + ICONS.sparkle +
          "<span>" + escapeHtml(joinedLabel(shop)) + "</span>" +
        "</p>" +
        '<ul class="rec-services">' + servicesMarkup(shop, 3) + "</ul>" +
        '<div class="news-card__footer">' +
          priceMarkup(shop) +
          '<span class="rec-card__cta">' + escapeHtml(i18n.t("shops.viewProfile")) + ICONS.arrowRight + "</span>" +
        "</div>" +
      "</div>";

    item.appendChild(card);
    return item;
  }

  /**
   * Navegação do trilho — a mesma para os três trilhos da seção.
   *
   * Quatro formas de percorrer a mesma lista, porque cada aparelho tem a sua:
   * setas nas laterais (mouse), arrastar (mouse e toque), setas do teclado
   * (o trilho é focável) e os pontos, que também dizem onde se está. As setas
   * e os pontos só existem quando há mesmo o que rolar.
   *
   * `options` diz de que trilho se trata: qual seletor identifica um item,
   * que classe têm os pontos e de que chave sai o rótulo deles. Sem opções,
   * o padrão é o trilho de "Novas na InBarber".
   */
  function bindRailControls(rail, prevBtn, nextBtn, dots, options) {
    if (!rail) return;

    var config = options || {};
    var itemSelector = config.itemSelector || ".news-item";
    var dotClass = config.dotClass || "news__dot";
    var dotAttr = config.dotAttr || "data-news-dot";
    var dotLabelKey = config.dotLabelKey || "news.dot";

    function items() {
      return qsa(itemSelector, rail);
    }

    function step() {
      var card = qs(itemSelector, rail);
      if (!card) return rail.clientWidth * 0.8;
      var gap = parseFloat(window.getComputedStyle(rail).columnGap || "16") || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function activeIndex() {
      var list = items();
      if (!list.length) return 0;
      var railLeft = rail.getBoundingClientRect().left;
      var best = 0;
      var bestDistance = Infinity;
      list.forEach(function (node, index) {
        var distance = Math.abs(node.getBoundingClientRect().left - railLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    }

    function scrollAmount(amount) {
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rail.scrollBy({ left: amount, behavior: reduced ? "auto" : "smooth" });
    }

    function goTo(index) {
      var list = items();
      if (!list[index]) return;
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rail.scrollTo({
        left: list[index].offsetLeft - list[0].offsetLeft,
        behavior: reduced ? "auto" : "smooth"
      });
    }

    function renderDots() {
      if (!dots) return;
      var total = items().length;
      var scrollable = rail.scrollWidth - rail.clientWidth > 4;
      dots.hidden = !scrollable || total < 2;
      if (dots.hidden) {
        dots.innerHTML = "";
        return;
      }
      if (dots.children.length !== total) {
        var markup = "";
        for (var i = 0; i < total; i += 1) {
          markup +=
            '<button type="button" class="' + dotClass + '" ' + dotAttr + '="' + i + '" aria-label="' +
            escapeHtml(i18n.t(dotLabelKey, { index: i + 1, total: total })) + '"></button>';
        }
        dots.innerHTML = markup;
      }
      var current = activeIndex();
      qsa("[" + dotAttr + "]", dots).forEach(function (dot, index) {
        var isCurrent = index === current;
        dot.classList.toggle("is-current", isCurrent);
        if (isCurrent) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function sync() {
      var scrollable = rail.scrollWidth - rail.clientWidth > 4;
      [prevBtn, nextBtn].forEach(function (button) {
        if (!button) return;
        button.hidden = !scrollable;
        if (!scrollable) return;
        button.disabled = button === prevBtn
          ? rail.scrollLeft <= 4
          : rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
      });
      rail.setAttribute("tabindex", scrollable ? "0" : "-1");
      renderDots();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollAmount(-step());
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollAmount(step());
      });
    }

    if (dots) {
      dots.addEventListener("click", function (event) {
        var dot = event.target.closest("[" + dotAttr + "]");
        if (!dot) return;
        goTo(Number(dot.getAttribute(dotAttr)));
      });
    }

    /* Teclado: o trilho é uma região focável, então as setas percorrem os
       cards em vez de rolar a página inteira. */
    rail.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      scrollAmount(event.key === "ArrowLeft" ? -step() : step());
    });

    /* Arrastar com o mouse. O toque já rola sozinho, e um arrasto que virou
       clique não pode abrir o perfil da barbearia por acidente. */
    var dragging = false;
    var moved = false;
    var startX = 0;
    var startScroll = 0;

    rail.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      if (event.target.closest("a, button")) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = rail.scrollLeft;
      rail.classList.add("is-dragging");
    });

    rail.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      rail.scrollLeft = startScroll - delta;
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove("is-dragging");
    }

    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("pointerleave", endDrag);
    rail.addEventListener("click", function (event) {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);

    rail.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
    return sync;
  }

  /* ----------------------------------------------------------------------
     Abertas agora

     A terceira lista da seção responde a uma pergunta que as outras duas não
     respondem: "dá para cortar o cabelo hoje?". O trilho é o mesmo do bloco
     de novas — uma linha, setas, arrasto, teclado e pontos —, e a diferença
     está no que cada card diz: até que horas a barbearia fica aberta, se ela
     está perto de fechar e qual é o próximo horário livre, já clicável.
     Acento verde, o mesmo do selo "Aberta agora", para não disputar com o
     dourado do ranking nem com o violeta das novas.
     ---------------------------------------------------------------------- */
  /** "21:00" em PT/ES, "9:00 PM" em EN — mesmo formatador dos horários livres. */
  function formatClock(value) {
    var parts = String(value || "").split(":");
    var date = new Date();
    date.setHours(Number(parts[0]) || 0, Number(parts[1]) || 0, 0, 0);
    return formatTime(date);
  }

  /**
   * Minutos que faltam para a barbearia fechar hoje.
   * Devolve null quando não há horário de fechamento cadastrado ou quando ele
   * já passou — nesses casos o card não inventa urgência nenhuma.
   */
  function minutesUntilClose(shop) {
    if (!shop.closesAt) return null;
    var parts = String(shop.closesAt).split(":");
    var closes = new Date();
    closes.setHours(Number(parts[0]) || 0, Number(parts[1]) || 0, 0, 0);
    var diff = Math.round((closes.getTime() - Date.now()) / 60000);
    return diff > 0 ? diff : null;
  }

  function openCard(shop, city) {
    var item = el("li", "open-item");
    var card = el("article", "open-card");
    card.setAttribute("data-reveal", "");

    var proximity = proximityLabel(shop, city);
    var altText = i18n.t("shops.photoAlt", { name: shop.name, city: shop.city });
    var slots = data.nextSlots(shop, 1);
    var slot = slots.length ? slots[0] : null;
    var left = minutesUntilClose(shop);
    var soon = left !== null && left <= CLOSING_SOON_MIN;

    /* O próximo horário livre ocupa uma faixa inteira, e não um canto do
       rodapé: é a razão de a lista existir. Sem horário na agenda, a faixa
       some — o card não finge disponibilidade que não tem. */
    var slotMarkup = "";
    if (slot) {
      var day = slotDayLabel(slot);
      var time = formatTime(slot.date);
      slotMarkup =
        '<a class="rec-slot open-card__slot" href="' +
          profileHref(shop, "home-open", "&slot=" + encodeURIComponent(localISO(slot.date))) +
          '" aria-label="' + escapeHtml(i18n.t("recs.slotAria", { day: day, time: time, name: shop.name })) + '">' +
          '<span class="rec-slot__day">' + escapeHtml(i18n.t("open.nextLabel")) + "</span>" +
          '<span class="rec-slot__time">' + escapeHtml(day + " \u00b7 " + time) + "</span>" +
        "</a>";
    }

    card.innerHTML =
      '<div class="open-card__media">' +
        '<img src="' + shop.image + '" alt="' + escapeHtml(altText) + '" loading="lazy" decoding="async" width="480" height="300">' +
        '<span class="open-card__live">' +
          '<span class="badge__dot"></span>' + escapeHtml(i18n.t("open.badge")) +
        "</span>" +
        (soon
          ? '<span class="open-card__soon">' + ICONS.clock +
              "<span>" + escapeHtml(i18n.t("open.closingSoon")) + "</span>" +
            "</span>"
          : "") +
        favButtonMarkup(shop) +
      "</div>" +
      '<div class="open-card__body">' +
        '<h4 class="open-card__name">' +
          '<a class="rec-link" href="' + profileHref(shop, "home-open") + '">' + escapeHtml(shop.name) + "</a>" +
        "</h4>" +
        '<div class="open-card__rating">' + ratingMarkup(shop) + "</div>" +
        '<p class="open-card__meta">' + ICONS.pin +
          "<span>" + escapeHtml(shop.neighborhood + " \u00b7 " + shop.city) + "</span>" +
        "</p>" +
        (proximity ? '<p class="open-card__near"><span class="rec-near">' + escapeHtml(proximity) + "</span></p>" : "") +
        '<p class="open-card__until' + (soon ? " open-card__until--soon" : "") + '">' + ICONS.clock +
          "<span>" + escapeHtml(i18n.t("open.until", { time: formatClock(shop.closesAt) })) + "</span>" +
        "</p>" +
        '<p class="open-card__reason">' + ICONS.trend +
          "<span>" + escapeHtml(reasonFor(shop)) + "</span>" +
        "</p>" +
        '<ul class="rec-services">' + servicesMarkup(shop, 2) + "</ul>" +
        slotMarkup +
        '<div class="open-card__footer">' +
          priceMarkup(shop) +
          '<span class="rec-card__cta">' + escapeHtml(i18n.t("shops.viewProfile")) + ICONS.arrowRight + "</span>" +
        "</div>" +
      "</div>";

    item.appendChild(card);
    return item;
  }


  function initRecommendedShops() {
    var grid = qs("[data-featured-shops]");
    var heroSlot = qs("[data-recs-hero]");
    var recsRail = qs("[data-recs-shops]");
    var rail = qs("[data-new-shops]");
    var openRail = qs("[data-open-shops]");
    if (!grid && !rail && !openRail) return;

    var title = qs("[data-recs-title]");
    var subtitle = qs("[data-recs-subtitle]");
    var newsCount = qs("[data-news-count]");
    var openBlock = qs("[data-open-block]");
    var openSubtitle = qs("[data-open-subtitle]");
    var openCount = qs("[data-open-count]");
    var openEmpty = qs("[data-open-empty]");

    /* Três trilhos, um controlador só. Cada um se identifica pelo seletor do
       item e pela classe dos pontos; o de recomendadas anda apenas pelas
       setas, pelo arrasto e pelo teclado, porque os pontos já são o trabalho
       do ranking logo acima. */
    var syncRecsRail = bindRailControls(
      recsRail,
      qs("[data-recs-prev]"),
      qs("[data-recs-next]"),
      null,
      { itemSelector: ".recs-item" }
    );
    var syncRail = bindRailControls(
      rail,
      qs("[data-news-prev]"),
      qs("[data-news-next]"),
      qs("[data-news-dots]")
    );
    var syncOpenRail = bindRailControls(
      openRail,
      qs("[data-open-prev]"),
      qs("[data-open-next]"),
      qs("[data-open-dots]"),
      {
        itemSelector: ".open-item",
        dotClass: "open__dot",
        dotAttr: "data-open-dot",
        dotLabelKey: "open.dot"
      }
    );
    var wide = window.matchMedia(RECS_BREAKPOINT);

    function renderRanking(city) {
      if (!heroSlot || !recsRail) return;
      heroSlot.innerHTML = "";
      recsRail.innerHTML = "";
      if (grid) grid.setAttribute("aria-label", i18n.t("recs.listLabel"));
      recsRail.setAttribute("aria-label", i18n.t("recs.railLabel"));

      var shops = data.recommended(city, wide.matches ? RECS_LIMIT : RECS_LIMIT_SMALL);
      if (!shops.length) return;

      heroSlot.appendChild(recHeroCard(shops[0], city));

      shops.slice(1).forEach(function (shop, index) {
        var item = recCard(shop, city);
        qs(".rec-card", item).style.setProperty("--reveal-delay", index * 70 + "ms");
        recsRail.appendChild(item);
      });

      observeNew(grid || recsRail);
      if (syncRecsRail) syncRecsRail();
    }

    function renderNews() {
      if (!rail) return;
      rail.innerHTML = "";
      rail.setAttribute("aria-label", i18n.t("news.railLabel"));

      var shops = data.newest(NEWS_LIMIT);
      shops.forEach(function (shop, index) {
        var item = newsCard(shop);
        qs(".news-card", item).style.setProperty("--reveal-delay", index * 60 + "ms");
        rail.appendChild(item);
      });

      /* A contagem só aparece quando existe: passado o prazo do selo "Novo",
         o trilho continua correto (são as últimas a entrar) e a pílula sai de
         cena em vez de anunciar zero. */
      if (newsCount) {
        var recent = shops.filter(function (shop) {
          return data.isNewShop(shop);
        }).length;
        newsCount.hidden = recent === 0;
        newsCount.textContent = recent
          ? i18n.t("news.count", {
              count: i18n.formatNumber(recent),
              days: i18n.formatNumber(data.newShopDays)
            })
          : "";
      }

      observeNew(rail);
      if (syncRail) syncRail();
    }

    function renderOpenNow(city) {
      if (!openRail) return;
      openRail.innerHTML = "";
      openRail.setAttribute("aria-label", i18n.t("open.listLabel"));

      var total = data.openNowCount();
      var shops = data.openNowShops(city, OPEN_LIMIT);

      if (openSubtitle) {
        openSubtitle.textContent = city
          ? i18n.t("open.subtitleCity", { city: city })
          : i18n.t("open.subtitle");
      }
      if (openCount) {
        openCount.hidden = total === 0;
        var countText = qs("[data-open-count-text]", openCount) || openCount;
        countText.textContent = total === 1
          ? i18n.t("open.countOne")
          : i18n.t("open.count", { count: i18n.formatNumber(total) });
      }
      if (openEmpty) openEmpty.hidden = shops.length > 0;
      if (openBlock) openBlock.classList.toggle("open--empty", shops.length === 0);

      shops.forEach(function (shop, index) {
        var item = openCard(shop, city);
        qs(".open-card", item).style.setProperty("--reveal-delay", index * 55 + "ms");
        openRail.appendChild(item);
      });
      observeNew(openRail);
      if (syncOpenRail) syncOpenRail();
    }

    function render() {
      var city = visitorCity();

      if (title) title.textContent = city ? i18n.t("shops.titleCity", { city: city }) : i18n.t("shops.title");
      if (subtitle) {
        subtitle.textContent = city
          ? i18n.t("shops.subtitleCity", { city: city })
          : i18n.t("shops.subtitle");
      }

      renderRanking(city);
      renderNews();
      renderOpenNow(city);
    }

    render();
    onLanguageChange(render);

    /* A busca do hero avisa quando o visitante escolhe uma cidade; o ranking
       se reordena na hora, sem recarregar a página. */
    document.addEventListener("inbarber:citychange", render);

    /* Girar o celular ou redimensionar a janela cruza o breakpoint: a lista
       ganha (ou devolve) os dois últimos cards sem recarregar. */
    if (wide.addEventListener) wide.addEventListener("change", render);
    else if (wide.addListener) wide.addListener(render);
  }

  function initShopExplorer() {
    var grid = qs("[data-shops-grid]");
    if (!grid) return;

    var form = qs("[data-filters]");
    var cityInput = qs("[data-filter-city]");
    var serviceInput = qs("[data-filter-service]");
    var ratingInput = qs("[data-filter-rating]");
    var dayInput = qs("[data-filter-day]");
    var timeInput = qs("[data-filter-time]");
    var sortInput = qs("[data-filter-sort]");
    var resetBtn = qs("[data-filter-reset]");
    var queryInput = qs("[data-search-input]");
    var countLabel = qs("[data-results-count]");
    var activeBox = qs("[data-active-filters]");

    /* Popula os selects mantendo o valor escolhido ao trocar de idioma. */
    function fillSelects() {
      if (cityInput) {
        var city = cityInput.value;
        cityInput.innerHTML =
          '<option value="">' + escapeHtml(i18n.t("filters.anyCity")) + "</option>" +
          data.cities
            .map(function (name) {
              return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + "</option>";
            })
            .join("");
        cityInput.value = city;
      }
      if (serviceInput) {
        var service = serviceInput.value;
        serviceInput.innerHTML =
          '<option value="">' + escapeHtml(i18n.t("filters.anyService")) + "</option>" +
          data.serviceKeys
            .map(function (key) {
              return '<option value="' + key + '">' + escapeHtml(i18n.t("service." + key)) + "</option>";
            })
            .join("");
        serviceInput.value = service;
      }
    }

    function currentFilters() {
      return {
        query: queryInput ? queryInput.value.trim() : "",
        city: cityInput ? cityInput.value : "",
        service: serviceInput ? serviceInput.value : "",
        rating: ratingInput ? Number(ratingInput.value || 0) : 0,
        day: dayInput ? dayInput.value : "any",
        time: timeInput ? timeInput.value : "any",
        sort: sortInput ? sortInput.value : "rating"
      };
    }

    /** A barbearia abre no dia pedido? "weekend" cobre sábado e domingo. */
    function matchesDay(shop, day) {
      if (!day || day === "any" || !shop.days) return true;
      var today = new Date().getDay();
      if (day === "today") return shop.days.indexOf(today) !== -1;
      if (day === "tomorrow") return shop.days.indexOf((today + 1) % 7) !== -1;
      if (day === "weekend") return shop.days.indexOf(6) !== -1 || shop.days.indexOf(0) !== -1;
      return true;
    }

    function matchesTime(shop, period) {
      if (!period || period === "any" || !shop.periods) return true;
      return shop.periods.indexOf(period) !== -1;
    }

    function applyFilters(filters) {
      var query = filters.query.toLowerCase();

      var list = data.barbershops.filter(function (shop) {
        if (filters.city && shop.city !== filters.city) return false;
        if (filters.service && shop.serviceKeys.indexOf(filters.service) === -1) return false;
        if (filters.rating && shop.rating < filters.rating) return false;
        if (!matchesDay(shop, filters.day)) return false;
        if (!matchesTime(shop, filters.time)) return false;
        if (query) {
          var haystack = (shop.name + " " + shop.neighborhood + " " + shop.city).toLowerCase();
          if (haystack.indexOf(query) === -1) return false;
        }
        return true;
      });

      var sorters = {
        rating: function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; },
        reviews: function (a, b) { return b.reviews - a.reviews; },
        price: function (a, b) { return a.priceFrom - b.priceFrom; },
        name: function (a, b) { return a.name.localeCompare(b.name, i18n.getLocale()); }
      };
      return list.sort(sorters[filters.sort] || sorters.rating);
    }

    /* ---------------------------------------------------------------
       Chips dos filtros ativos
       --------------------------------------------------------------- */
    function clearFilter(type) {
      if (type === "query" && queryInput) queryInput.value = "";
      if (type === "city" && cityInput) cityInput.value = "";
      if (type === "service" && serviceInput) serviceInput.value = "";
      if (type === "rating" && ratingInput) ratingInput.value = "0";
      if (type === "day" && dayInput) dayInput.value = "any";
      if (type === "time" && timeInput) timeInput.value = "any";
      render();
    }

    function renderActiveFilters(filters) {
      if (!activeBox) return;

      var chips = [];
      if (filters.query) chips.push({ type: "query", label: filters.query });
      if (filters.city) chips.push({ type: "city", label: filters.city });
      if (filters.service) chips.push({ type: "service", label: i18n.t("service." + filters.service) });
      if (filters.rating) {
        var ratingKey = RATING_LABELS[String(filters.rating)];
        if (ratingKey) chips.push({ type: "rating", label: i18n.t(ratingKey) });
      }
      if (filters.day !== "any") chips.push({ type: "day", label: i18n.t("day." + filters.day) });
      if (filters.time !== "any") {
        chips.push({ type: "time", label: i18n.t("time." + filters.time + "Short") });
      }

      if (!chips.length) {
        activeBox.hidden = true;
        activeBox.innerHTML = "";
        return;
      }

      activeBox.hidden = false;
      activeBox.innerHTML =
        '<span class="active-filters__label">' + escapeHtml(i18n.t("filters.activeTitle")) + "</span>" +
        chips
          .map(function (chip) {
            return (
              '<span class="filter-chip">' + escapeHtml(chip.label) +
              '<button type="button" class="filter-chip__remove" data-clear-filter="' + chip.type + '" ' +
              'aria-label="' + escapeHtml(i18n.t("filters.removeFilter", { label: chip.label })) + '">' +
              ICONS.close +
              "</button></span>"
            );
          })
          .join("");
    }

    function reset() {
      if (form) form.reset();
      if (queryInput) queryInput.value = "";
      if (sortInput) sortInput.value = "rating";
      if (dayInput) dayInput.value = "any";
      if (timeInput) timeInput.value = "any";
      render();
    }

    function render() {
      var filters = currentFilters();
      var results = applyFilters(filters);

      grid.innerHTML = "";
      if (!results.length) {
        grid.classList.remove("shops-grid");
        grid.appendChild(emptyState(reset));
      } else {
        grid.classList.add("shops-grid");
        results.forEach(function (shop, index) {
          var card = shopCard(shop);
          card.id = shop.id;
          card.style.setProperty("--reveal-delay", Math.min(index, 8) * 50 + "ms");
          grid.appendChild(card);
        });
      }

      if (countLabel) {
        countLabel.textContent =
          results.length === 1
            ? i18n.t("shops.resultsOne")
            : i18n.t("shops.resultsMany", { count: i18n.formatNumber(results.length) });
      }

      renderActiveFilters(filters);
      observeNew(grid);
    }

    fillSelects();

    /* Pré-carrega os filtros vindos da busca do hero: ?q=&day=&time= */
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    var initialDay = params.get("day");
    var initialTime = params.get("time");

    if (initialQuery && queryInput) queryInput.value = initialQuery;
    if (initialQuery && cityInput && data.cities.indexOf(initialQuery) !== -1) {
      // Quando o termo é exatamente uma cidade atendida, vira filtro de cidade.
      cityInput.value = initialQuery;
      if (queryInput) queryInput.value = "";
    }
    if (initialDay && dayInput) dayInput.value = initialDay;
    if (initialTime && timeInput) timeInput.value = initialTime;

    [cityInput, serviceInput, ratingInput, dayInput, timeInput, sortInput].forEach(function (input) {
      if (input) input.addEventListener("change", render);
    });
    if (queryInput) queryInput.addEventListener("input", render);
    if (resetBtn) resetBtn.addEventListener("click", reset);
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }
    if (activeBox) {
      activeBox.addEventListener("click", function (event) {
        var button = event.target.closest("[data-clear-filter]");
        if (!button) return;
        clearFilter(button.getAttribute("data-clear-filter"));
      });
    }

    render();
    onLanguageChange(function () {
      fillSelects();
      render();
    });
  }

  /* ======================================================================
     5. REVIEWS — depoimentos
     ====================================================================== */
  function reviewCard(item, options) {
    var card = el("article", "card testimonial");
    card.setAttribute("data-reveal", "");

    var name = i18n.t(item.key + ".name");
    var meta = i18n.t(item.key + (options.roleKey ? ".role" : ".city"));
    var metric = options.showMetric && item.metric
      ? '<div class="testimonial__metric-block">' +
          '<p class="testimonial__metric">' + escapeHtml(item.metric) + "</p>" +
          '<p class="testimonial__metric-label">' + escapeHtml(i18n.t(item.key + ".metricLabel")) + "</p>" +
        "</div>"
      : "";

    card.innerHTML =
      metric +
      (options.showStars ? starsMarkup(item.rating || 5) : "") +
      '<p class="testimonial__quote">' + escapeHtml(i18n.t(item.key + ".text")) + "</p>" +
      '<div class="testimonial__person">' +
        '<img class="testimonial__avatar" src="' + item.photo + '" alt="' +
          escapeHtml(i18n.t("reviews.avatarAlt", { name: name })) +
          '" loading="lazy" decoding="async" width="88" height="88">' +
        "<div>" +
          '<p class="testimonial__name">' + escapeHtml(name) + "</p>" +
          '<p class="testimonial__meta">' + escapeHtml(meta) + "</p>" +
        "</div>" +
      "</div>";

    return card;
  }

  function initReviews() {
    var grid = qs("[data-reviews-grid]");
    if (!grid) return;

    function render() {
      grid.innerHTML = "";
      data.reviews.forEach(function (item, index) {
        var card = reviewCard(item, { showStars: true });
        card.style.setProperty("--reveal-delay", index * 60 + "ms");
        grid.appendChild(card);
      });
      observeNew(grid);
    }

    render();
    onLanguageChange(render);

    var prev = qs("[data-reviews-prev]");
    var next = qs("[data-reviews-next]");

    function scrollByCard(direction) {
      var first = grid.firstElementChild;
      if (!first) return;
      var step = first.getBoundingClientRect().width + 16;
      grid.scrollBy({ left: direction * step, behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { scrollByCard(-1); });
    if (next) next.addEventListener("click", function () { scrollByCard(1); });
  }

  function initBarberTestimonials() {
    var grid = qs("[data-barber-testimonials]");
    if (!grid) return;

    function render() {
      grid.innerHTML = "";
      data.barberTestimonials.forEach(function (item, index) {
        var card = reviewCard(item, { roleKey: true, showMetric: true });
        card.style.setProperty("--reveal-delay", index * 60 + "ms");
        grid.appendChild(card);
      });
      observeNew(grid);
    }

    render();
    onLanguageChange(render);
  }

  /* ======================================================================
     6. TRENDS — editorial
     ====================================================================== */
  function trendCard(item, isFeature) {
    var article = el("article", "trend" + (isFeature ? " trend--feature" : ""));
    article.setAttribute("data-reveal", isFeature ? "scale" : "");

    article.innerHTML =
      '<img class="trend__image" src="' + item.image + '" alt="' +
        escapeHtml(i18n.t(item.key + ".alt")) + '" loading="lazy" decoding="async" width="1200" height="800">' +
      '<span class="badge badge--cyan trend__tag">' + escapeHtml(i18n.t(item.key + ".tag")) + "</span>" +
      '<h3 class="trend__title">' + escapeHtml(i18n.t(item.key + ".title")) + "</h3>" +
      '<p class="trend__desc">' + escapeHtml(i18n.t(item.key + ".desc")) + "</p>" +
      '<a class="btn btn--link trend__link" href="#trends">' +
        escapeHtml(i18n.t("trends.readMore")) + ICONS.arrowRight +
      "</a>" +
      '<span class="trend__accent trend__accent--' + item.accent + '"></span>';

    return article;
  }

  function initTrends() {
    var grid = qs("[data-trends-grid]");
    if (!grid) return;

    function render() {
      grid.innerHTML = "";
      grid.appendChild(trendCard(data.trends.main, true));
      data.trends.items.forEach(function (item, index) {
        var card = trendCard(item, false);
        card.style.setProperty("--reveal-delay", index * 70 + "ms");
        grid.appendChild(card);
      });
      observeNew(grid);
    }

    render();
    onLanguageChange(render);
  }

  /* ======================================================================
     7. SEARCH — barra de busca do hero com filtros
     Três painéis: Onde (cidade, com "usar minha localização" dentro),
     Quando (dia) e Horário (período). O resultado vira query string para
     barbearias.html, que aplica exatamente os mesmos filtros.

     Além do clique, a barra funciona inteira pelo teclado: seta para baixo
     abre o painel, setas percorrem as opções, Home/End vão aos extremos e
     Esc devolve o foco ao campo. Ao escolher um valor a barra avança
     sozinha para o próximo filtro ainda no padrão, então quem quer só a
     cidade continua a um Enter do resultado.
     ====================================================================== */
  var PANEL_ORDER = ["where", "day", "time"];

  function initHeroSearch() {
    var form = qs("[data-hero-search]");
    if (!form) return;

    var state = { where: "", day: "any", time: "any" };
    var geoState = { key: null, variant: null, city: null };

    var whereInput = qs("[data-where-input]", form);
    var cityList = qs("[data-city-list]", form);
    var dayList = qs("[data-day-list]", form);
    var timeList = qs("[data-time-list]", form);
    var geoButton = qs("[data-geo-button]", form);
    var geoStatus = qs("[data-geo-status]", form);
    var clearWhere = qs("[data-clear-where]", form);
    var submitButton = qs(".searchbox__submit", form);

    var root = form.parentNode;
    var quickList = qs("[data-quick-list]", root);
    var liveStatus = qs("[data-search-status]", root);

    /* ---------------------------------------------------------------
       Painéis
       --------------------------------------------------------------- */
    function triggerOf(name) {
      return qs('[data-popover-trigger="' + name + '"]', form);
    }

    function panelOf(name) {
      return qs('[data-popover="' + name + '"]', form);
    }

    function closePanels(except) {
      qsa("[data-popover-trigger]", form).forEach(function (trigger) {
        var name = trigger.getAttribute("data-popover-trigger");
        if (name === except) return;
        trigger.setAttribute("aria-expanded", "false");
        var panel = panelOf(name);
        if (panel) panel.hidden = true;
      });
    }

    function openPanel(name, focusFirst) {
      var trigger = triggerOf(name);
      var panel = panelOf(name);
      if (!trigger || !panel) return;

      closePanels(name);
      trigger.setAttribute("aria-expanded", "true");
      panel.hidden = false;

      if (focusFirst === "input" && name === "where" && whereInput) {
        whereInput.focus();
        whereInput.select();
        return;
      }
      if (focusFirst) focusOption(panel, 0);
    }

    function isOpen(name) {
      var trigger = triggerOf(name);
      return !!trigger && trigger.getAttribute("aria-expanded") === "true";
    }

    /* Avança para o próximo filtro que ainda está no padrão. Se todos já
       foram preenchidos, fecha tudo e entrega o foco ao botão Buscar. */
    function advanceFrom(name) {
      var next = PANEL_ORDER[PANEL_ORDER.indexOf(name) + 1];
      var untouched = { where: !state.where, day: state.day === "any", time: state.time === "any" };

      while (next) {
        if (untouched[next]) {
          openPanel(next, next === "where" ? "input" : true);
          return;
        }
        next = PANEL_ORDER[PANEL_ORDER.indexOf(next) + 1];
      }

      closePanels(null);
      if (submitButton) submitButton.focus();
    }

    qsa("[data-popover-trigger]", form).forEach(function (trigger) {
      var name = trigger.getAttribute("data-popover-trigger");

      trigger.addEventListener("click", function () {
        if (isOpen(name)) {
          closePanels(null);
          return;
        }
        openPanel(name, name === "where" ? "input" : false);
      });

      trigger.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown" && event.key !== "Down") return;
        event.preventDefault();
        openPanel(name, name === "where" ? "input" : true);
      });
    });

    document.addEventListener("click", function (event) {
      /* Escolher uma opção re-renderiza a lista, então o alvo do clique já
         saiu do DOM quando o evento chega aqui: ignoramos esses casos para
         não fechar o painel que a própria escolha acabou de abrir. */
      if (!event.target.isConnected) return;
      if (form.contains(event.target)) return;
      if (root && root.contains(event.target)) return;
      closePanels(null);
    });

    /* ---------------------------------------------------------------
       Teclado dentro dos painéis
       --------------------------------------------------------------- */
    function optionsIn(panel) {
      return qsa(".popover__option, .popover__action", panel).filter(function (node) {
        return !node.disabled;
      });
    }

    function focusOption(panel, index) {
      var options = optionsIn(panel);
      if (!options.length) return;
      var safe = Math.max(0, Math.min(index, options.length - 1));
      options[safe].focus();
    }

    function moveFocus(panel, step) {
      var options = optionsIn(panel);
      if (!options.length) return;
      var current = options.indexOf(document.activeElement);
      var next = current === -1 ? 0 : (current + step + options.length) % options.length;
      options[next].focus();
    }

    form.addEventListener("keydown", function (event) {
      var panel = event.target.closest ? event.target.closest(".popover") : null;

      if (event.key === "Escape" || event.key === "Esc") {
        var openName = PANEL_ORDER.filter(isOpen)[0];
        closePanels(null);
        if (openName) {
          var trigger = triggerOf(openName);
          if (trigger) trigger.focus();
        }
        return;
      }

      if (!panel) return;

      if (event.key === "ArrowDown" || event.key === "Down") {
        event.preventDefault();
        moveFocus(panel, 1);
      } else if (event.key === "ArrowUp" || event.key === "Up") {
        event.preventDefault();
        moveFocus(panel, -1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusOption(panel, 0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusOption(panel, optionsIn(panel).length - 1);
      } else if (event.key === "Enter" && event.target === whereInput) {
        /* Enter no campo de texto aceita a primeira cidade da lista. */
        event.preventDefault();
        var first = qs("[data-city]", panel);
        if (first) first.click();
      }
    });

    /* ---------------------------------------------------------------
       Rótulos visíveis nos três segmentos
       --------------------------------------------------------------- */
    function labelOf(options, value) {
      for (var i = 0; i < options.length; i += 1) {
        if (options[i].value === value) return i18n.t(options[i].key);
      }
      return "";
    }

    function renderValues() {
      var whereNode = qs('[data-value="where"]', form);
      var dayNode = qs('[data-value="day"]', form);
      var timeNode = qs('[data-value="time"]', form);

      if (whereNode) {
        whereNode.textContent = state.where || i18n.t("search.whereAny");
        whereNode.classList.toggle("is-empty", !state.where);
      }
      if (dayNode) {
        dayNode.textContent = labelOf(DAY_OPTIONS, state.day);
        dayNode.classList.toggle("is-empty", state.day === "any");
      }
      if (timeNode) {
        timeNode.textContent = labelOf(TIME_OPTIONS, state.time);
        timeNode.classList.toggle("is-empty", state.time === "any");
      }
      if (clearWhere) clearWhere.hidden = !state.where;
      form.classList.toggle("is-filled", !!state.where);
    }

    /* ---------------------------------------------------------------
       Listas dos painéis
       --------------------------------------------------------------- */
    function shopsIn(city) {
      return data.barbershops.filter(function (shop) {
        return shop.city === city;
      }).length;
    }

    function cityCountLabel(city) {
      var total = shopsIn(city);
      return total === 1
        ? i18n.t("search.oneShopInCity", { city: city })
        : i18n.t("search.shopsInCity", { count: i18n.formatNumber(total), city: city });
    }

    /* Destaca o trecho digitado sem abrir mão do escape do resto do texto. */
    function highlight(text, query) {
      if (!query) return escapeHtml(text);
      var at = text.toLowerCase().indexOf(query);
      if (at === -1) return escapeHtml(text);
      return (
        escapeHtml(text.slice(0, at)) +
        '<mark class="popover__mark">' + escapeHtml(text.slice(at, at + query.length)) + "</mark>" +
        escapeHtml(text.slice(at + query.length))
      );
    }

    function renderCities() {
      if (!cityList) return;
      var query = (whereInput ? whereInput.value : "").trim().toLowerCase();
      var matches = data.cities.filter(function (city) {
        return !query || city.toLowerCase().indexOf(query) !== -1;
      });

      if (!matches.length) {
        cityList.innerHTML = '<p class="popover__empty">' + escapeHtml(i18n.t("shops.empty")) + "</p>";
        return;
      }

      cityList.innerHTML = matches
        .map(function (city) {
          var isActive = city === state.where;
          return (
            '<button type="button" class="popover__option" data-city="' + escapeHtml(city) + '"' +
            (isActive ? ' aria-current="true"' : "") + ">" +
            ICONS.pin +
            "<span>" + highlight(city, query) + "</span>" +
            '<span class="popover__option-meta">' + i18n.formatNumber(shopsIn(city)) + "</span>" +
            "</button>"
          );
        })
        .join("");
    }

    function renderChoices(node, options, current, attribute) {
      if (!node) return;
      node.innerHTML = options
        .map(function (option) {
          var isActive = option.value === current;
          return (
            '<button type="button" class="popover__option" ' + attribute + '="' + option.value + '"' +
            (isActive ? ' aria-current="true"' : "") + ">" +
            "<span>" + escapeHtml(i18n.t(option.key)) + "</span>" +
            (isActive ? '<span class="popover__option-meta">' + ICONS.check + "</span>" : "") +
            "</button>"
          );
        })
        .join("");
    }

    /* Atalhos: localização + as três cidades com mais barbearias. */
    function renderQuick() {
      if (!quickList) return;

      var top = data.cities
        .slice()
        .sort(function (a, b) {
          return shopsIn(b) - shopsIn(a);
        })
        .slice(0, 3);

      var chips = [
        '<button type="button" class="searchbox__chip searchbox__chip--action" data-quick-geo>' +
          ICONS.target + "<span>" + escapeHtml(i18n.t("search.nearMe")) + "</span></button>"
      ];

      top.forEach(function (city) {
        chips.push(
          '<button type="button" class="searchbox__chip" data-quick-city="' + escapeHtml(city) + '"' +
          (city === state.where ? ' aria-pressed="true"' : ' aria-pressed="false"') + ">" +
          escapeHtml(city) + "</button>"
        );
      });

      quickList.innerHTML = chips.join("");
    }

    function announce(message) {
      if (liveStatus) liveStatus.textContent = message;
    }

    function renderAll() {
      renderValues();
      renderCities();
      renderChoices(dayList, DAY_OPTIONS, state.day, "data-day");
      renderChoices(timeList, TIME_OPTIONS, state.time, "data-time");
      renderQuick();
      renderGeoStatus();
    }

    /* ---------------------------------------------------------------
       Seleção
       --------------------------------------------------------------- */
    function chooseCity(city, advance) {
      state.where = city;
      if (whereInput) whereInput.value = city;
      rememberCity(city);
      clearGeoStatus();
      renderAll();
      announce(cityCountLabel(city));
      if (advance) advanceFrom("where");
      else closePanels(null);
    }

    if (cityList) {
      cityList.addEventListener("click", function (event) {
        var option = event.target.closest("[data-city]");
        if (!option) return;
        chooseCity(option.getAttribute("data-city"), true);
      });
    }

    if (quickList) {
      quickList.addEventListener("click", function (event) {
        var cityChip = event.target.closest("[data-quick-city]");
        if (cityChip) {
          chooseCity(cityChip.getAttribute("data-quick-city"), false);
          return;
        }
        if (event.target.closest("[data-quick-geo]")) {
          openPanel("where", false);
          locate();
        }
      });
    }

    if (clearWhere) {
      clearWhere.addEventListener("click", function () {
        state.where = "";
        if (whereInput) whereInput.value = "";
        clearGeoStatus();
        renderAll();
        announce(i18n.t("search.whereAny"));
        var trigger = triggerOf("where");
        if (trigger) trigger.focus();
      });
    }

    if (whereInput) {
      whereInput.addEventListener("input", function () {
        state.where = whereInput.value.trim();
        clearGeoStatus();
        renderValues();
        renderCities();
        renderQuick();
      });
    }

    if (dayList) {
      dayList.addEventListener("click", function (event) {
        var option = event.target.closest("[data-day]");
        if (!option) return;
        state.day = option.getAttribute("data-day");
        renderAll();
        announce(i18n.t("search.selected", {
          field: i18n.t("search.whenLabel"),
          value: labelOf(DAY_OPTIONS, state.day)
        }));
        advanceFrom("day");
      });
    }

    if (timeList) {
      timeList.addEventListener("click", function (event) {
        var option = event.target.closest("[data-time]");
        if (!option) return;
        state.time = option.getAttribute("data-time");
        renderAll();
        announce(i18n.t("search.selected", {
          field: i18n.t("search.timeLabel"),
          value: labelOf(TIME_OPTIONS, state.time)
        }));
        advanceFrom("time");
      });
    }

    /* ---------------------------------------------------------------
       Geolocalização
       Sem API externa: comparamos a posição do navegador com as
       coordenadas das cidades atendidas e escolhemos a mais próxima.
       --------------------------------------------------------------- */
    function setGeoStatus(key, variant, city) {
      geoState = { key: key, variant: variant, city: city || null };
      renderGeoStatus();
    }

    function clearGeoStatus() {
      geoState = { key: null, variant: null, city: null };
      renderGeoStatus();
    }

    function renderGeoStatus() {
      if (!geoStatus) return;
      if (!geoState.key) {
        geoStatus.hidden = true;
        geoStatus.textContent = "";
        return;
      }
      geoStatus.hidden = false;
      geoStatus.className = "popover__hint status-message status-message--" + geoState.variant;
      geoStatus.textContent = i18n.t(geoState.key, geoState.city ? { city: geoState.city } : null);
    }

    function locate() {
      if (!navigator.geolocation) {
        setGeoStatus("geo.unsupported", "error");
        return;
      }
      setGeoStatus("geo.locating", "info");

      navigator.geolocation.getCurrentPosition(
        function (position) {
          var match = data.nearestCity(position.coords.latitude, position.coords.longitude);
          if (!match || match.distanceKm > MAX_CITY_DISTANCE_KM) {
            setGeoStatus("geo.tooFar", "error");
            announce(i18n.t("geo.tooFar"));
            return;
          }
          state.where = match.city;
          if (whereInput) whereInput.value = match.city;
          rememberCity(match.city);
          setGeoStatus("geo.matched", "success", match.city);
          renderValues();
          renderCities();
          renderQuick();
          announce(cityCountLabel(match.city));
        },
        function () {
          setGeoStatus("geo.error", "error");
          announce(i18n.t("geo.error"));
        },
        { timeout: 8000, maximumAge: 300000 }
      );
    }

    if (geoButton) geoButton.addEventListener("click", locate);

    /* ---------------------------------------------------------------
       Envio
       --------------------------------------------------------------- */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var params = [];
      if (state.where) params.push("q=" + encodeURIComponent(state.where));
      if (state.day !== "any") params.push("day=" + state.day);
      if (state.time !== "any") params.push("time=" + state.time);
      window.location.href = "barbearias.html" + (params.length ? "?" + params.join("&") : "");
    });

    renderAll();
    onLanguageChange(renderAll);
  }

  /* ======================================================================
     8. SIGNUP — formulário B2B
     ====================================================================== */
  function initSignupForm() {
    var form = qs("[data-signup-form]");
    if (!form) return;

    var success = qs("[data-signup-success]");
    var successTitle = qs("[data-signup-success-title]");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    function fieldOf(input) {
      return input.closest(".field");
    }

    function showError(input, messageKey) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.add("has-error");
      var errorNode = qs(".field__error", field);
      if (errorNode) {
        errorNode.setAttribute("data-i18n", messageKey);
        errorNode.textContent = i18n.t(messageKey);
      }
      input.setAttribute("aria-invalid", "true");
    }

    function clearError(input) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.remove("has-error");
      input.removeAttribute("aria-invalid");
    }

    function validate() {
      var inputs = qsa("input[required]", form);
      var firstInvalid = null;

      inputs.forEach(function (input) {
        clearError(input);
        var value = input.value.trim();
        if (!value) {
          showError(input, "b2b.form.errorRequired");
          firstInvalid = firstInvalid || input;
          return;
        }
        if (input.type === "email" && !emailPattern.test(value)) {
          showError(input, "b2b.form.errorEmail");
          firstInvalid = firstInvalid || input;
        }
      });

      return firstInvalid;
    }

    qsa("input", form).forEach(function (input) {
      input.addEventListener("input", function () { clearError(input); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var invalid = validate();
      if (invalid) {
        invalid.focus();
        return;
      }

      var ownerName = (qs("#owner-name", form) || {}).value || "";
      var firstName = ownerName.trim().split(" ")[0] || "";

      if (success) {
        if (successTitle) {
          successTitle.textContent = i18n.t("b2b.form.successTitle", { name: firstName });
        }
        form.hidden = true;
        success.hidden = false;
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }

  /* ======================================================================
     Ano corrente no rodapé (mantém o copyright sempre atual)
     ====================================================================== */
  function initFooterYear() {
    var nodes = qsa("[data-copyright]");
    if (!nodes.length) return;

    function render() {
      var year = String(new Date().getFullYear());
      nodes.forEach(function (node) {
        node.textContent = i18n.t("footer.copyright", { year: year });
      });
    }
    render();
    onLanguageChange(render);
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  function boot() {
    if (!i18n || !data) {
      if (window.console) console.error("[InBarber] i18n ou data não carregados.");
      return;
    }
    initHeader();
    initLangDropdowns();
    initSignIn();
    initReveal();
    initCounters();
    initRecommendedShops();
    initShopExplorer();
    initReviews();
    initBarberTestimonials();
    initTrends();
    initHeroSearch();
    initSignupForm();
    initFooterYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);