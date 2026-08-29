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
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>'
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

    var statusClass = shop.openNow ? "badge--success" : "badge--muted";
    var statusText = i18n.t(shop.openNow ? "shops.openNow" : "shops.closed");
    var altText = i18n.t("shops.photoAlt", { name: shop.name, city: shop.city });

    card.innerHTML =
      '<div class="shop-card__media">' +
        '<img src="' + shop.image + '" alt="' + escapeHtml(altText) + '" loading="lazy" decoding="async" width="800" height="500">' +
        '<span class="badge ' + statusClass + ' shop-card__status"><span class="badge__dot"></span>' + escapeHtml(statusText) + "</span>" +
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

  function initFeaturedShops() {
    var grid = qs("[data-featured-shops]");
    if (!grid) return;

    function render() {
      grid.innerHTML = "";
      data.barbershops
        .filter(function (shop) { return shop.featured; })
        .slice(0, 6)
        .forEach(function (shop, index) {
          var card = shopCard(shop);
          card.style.setProperty("--reveal-delay", index * 70 + "ms");
          grid.appendChild(card);
        });
      observeNew(grid);
    }

    render();
    onLanguageChange(render);
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
    initFeaturedShops();
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