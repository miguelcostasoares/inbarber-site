/* ==========================================================================
   InBarber — Motor da página de busca (barbearias.html)

   Tudo o que a página de busca faz vive aqui, separado do main.js porque é
   a única página que usa: sugestões enquanto se digita, filtros com
   contagem, ordenação, paginação e endereço compartilhável.

   O que este arquivo entrega:

     1. Sugestões por letra — digitar "a" já lista barbearias, cidades,
        bairros e serviços que começam com "a". Acento não atrapalha
        ("sao" acha "São Paulo") e o trecho digitado aparece destacado.
        É um combobox de verdade (role="combobox" + listbox), navegável
        pelas setas, com o item ativo anunciado por leitor de tela.

     2. Atalhos — "Abertas agora", "Perto de mim", "Nota 4,5+", "Novas" e
        "Favoritas" resolvem num clique as intenções mais comuns. Cada
        atalho mostra quantas barbearias atende; nenhum aparece prometendo
        resultado que não existe.

     3. Filtros com contagem — cada opção de cidade, serviço, nota, preço,
        dia e período exibe quantas barbearias sobram se ela for escolhida,
        considerando os demais filtros já ativos. Opção que zeraria a lista
        entra desabilitada, então ninguém cai numa tela vazia por acidente.

     4. Endereço compartilhável — os filtros vivem na query string. Copiar
        a URL e mandar para alguém entrega exatamente a mesma lista.

     5. Paginação — 9 cards por vez, com "carregar mais" e o foco indo para
        o primeiro card novo.

     6. Tela vazia útil — quando nada bate, a página calcula qual filtro
        está segurando a lista e oferece removê-lo, em vez de só avisar que
        não achou nada.

   Dependências (todas já carregadas pela página):
     window.InBarberI18n     traduções e formatação
     window.INBARBER_DATA    barbearias e utilidades de distância
     window.InBarberAccount  sessão e favoritas (opcional)
     window.InBarberReveal   observador das animações de entrada (opcional)
   ========================================================================== */

(function (window, document) {
  "use strict";

  var i18n = window.InBarberI18n;
  var data = window.INBARBER_DATA;

  var grid = document.querySelector("[data-shops-grid]");
  if (!grid || !i18n || !data) return;

  /* ======================================================================
     1. CONSTANTES
     ====================================================================== */

  /* Nove cards por página: fecha três fileiras completas no desktop. */
  var PAGE_SIZE = 9;

  /* Teto de sugestões por grupo e no painel inteiro. Uma lista que não cabe
     na tela deixa de ser sugestão e vira mais uma coisa para ler. */
  var SUGGESTION_LIMITS = { shop: 5, city: 3, district: 3, service: 3 };
  var SUGGESTIONS_MAX = 9;

  /* Buscas recentes: guardadas neste navegador, aparecem quando o campo
     está vazio. Cinco é o que cabe sem empurrar as sugestões da InBarber
     para fora da tela. */
  var RECENT_KEY = "inbarber:recent-searches";
  var RECENT_MAX = 5;
  var RECENT_SHOWN = 3;

  /* Raio de "perto de mim". A base tem uma cidade por região metropolitana,
     então 120 km é o que separa "sua cidade" de "outra cidade". */
  var NEAR_RADIUS_KM = 120;

  /* Distância máxima para considerar que o visitante está numa cidade
     atendida (mesmo critério da busca do hero, no main.js). */
  var MAX_CITY_DISTANCE_KM = 250;

  /* Painel de filtros em gaveta abaixo deste ponto; em linha a partir dele. */
  var DESKTOP_QUERY = "(min-width: 960px)";

  var RATING_OPTIONS = [
    { value: 0, key: "filters.anyRating" },
    { value: 4.5, key: "filters.rating45" },
    { value: 4, key: "filters.rating40" },
    { value: 3.5, key: "filters.rating35" }
  ];

  /* Faixas de preço em reais (a exibição é convertida pelo i18n). */
  var PRICE_OPTIONS = [0, 40, 60, 80];

  var DAY_OPTIONS = [
    { value: "any", key: "day.any" },
    { value: "today", key: "day.today" },
    { value: "tomorrow", key: "day.tomorrow" },
    { value: "weekend", key: "day.weekend" }
  ];

  var TIME_OPTIONS = [
    { value: "any", key: "time.any" },
    { value: "morning", key: "time.morningShort" },
    { value: "afternoon", key: "time.afternoonShort" },
    { value: "evening", key: "time.eveningShort" }
  ];

  var ICONS = {
    star:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    shop:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 9.5 5 4h14l1.5 5.5a3 3 0 0 1-5.7 1.6 3 3 0 0 1-5.6 0 3 3 0 0 1-5.7-1.6Z"/><path d="M5 11.4V20h14v-8.6"/><path d="M10 20v-4.5h4V20"/></svg>',
    district:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V8l6-4v17"/><path d="M10 21V10l8 3v8"/><path d="M2 21h20"/></svg>',
    scissors:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M8 7.6 20 18M20 6 8 16.4"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
    history:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 9.5A9 9 0 1 1 3 12"/><path d="M3 4.5v5h5"/><path d="M12 7.5V12l3 2"/></svg>',
    target:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7c-.3 0-.6-.1-.8-.3C7.6 17.5 3 14 3 9.9A4.9 4.9 0 0 1 12 7.2a4.9 4.9 0 0 1 9 2.7c0 4.1-4.6 7.6-8.2 10.5-.2.2-.5.3-.8.3Z" stroke-linejoin="round"/></svg>',
    sparkle:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5 13.9 8l5.6 1.9-5.6 1.9L12 17.3l-1.9-5.5L4.5 9.9 10.1 8 12 2.5Z"/></svg>',
    door:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v17h9"/><path d="M14 3l5 2.5V21h-5z"/><path d="M16.5 12.5v1.5"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    searchOff:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/><path d="m8.5 8.5 5 5"/><path d="m13.5 8.5-5 5"/></svg>',
    arrowRight:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
  };

  /* ======================================================================
     2. UTILIDADES
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
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function t(key, params) {
    return i18n.t(key, params);
  }

  /**
   * Texto comparável: minúsculo e sem acento.
   * É o que faz "sao paulo" encontrar "São Paulo" e "estudio" encontrar
   * "Estúdio Lâmina" — ninguém digita acento na pressa.
   */
  function fold(value) {
    var text = String(value === undefined || value === null ? "" : value).toLowerCase();
    if (text.normalize) {
      try {
        text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      } catch (err) {
        /* navegador sem suporte a NFD: segue sem dobrar acento */
      }
    }
    return text;
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null; // modo privado
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* silencioso: a sessão atual continua funcionando */
    }
  }

  var mediaDesktop = window.matchMedia ? window.matchMedia(DESKTOP_QUERY) : null;
  function isDesktop() {
    return !!(mediaDesktop && mediaDesktop.matches);
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ======================================================================
     3. ELEMENTOS DA PÁGINA
     ====================================================================== */

  var searchForm = qs("[data-search-form]");
  var comboRoot = qs("[data-combobox]");
  var queryInput = qs("[data-search-input]");
  var clearButton = qs("[data-search-clear]");
  var panel = qs("[data-suggestions]");
  var statusNode = qs("[data-search-status]");
  var quickRow = qs("[data-quick-filters]");

  var toolbarNode = qs("[data-toolbar]");
  var filtersToggle = qs("[data-filters-toggle]");
  var filtersCount = qs("[data-filters-count]");
  var filtersPanel = qs("[data-filters-panel]");
  var filtersClose = qs("[data-filters-close]");
  var filtersApply = qs("[data-filters-apply]");
  var resetButton = qs("[data-filter-reset]");
  var countLabel = qs("[data-results-count]");
  var activeBox = qs("[data-active-filters]");

  var cityInput = qs("[data-filter-city]");
  var serviceInput = qs("[data-filter-service]");
  var ratingInput = qs("[data-filter-rating]");
  var priceInput = qs("[data-filter-price]");
  var dayInput = qs("[data-filter-day]");
  var timeInput = qs("[data-filter-time]");
  var sortInput = qs("[data-filter-sort]");

  var pagination = qs("[data-pagination]");
  var paginationStatus = qs("[data-pagination-status]");
  var loadMoreButton = qs("[data-load-more]");

  /* ======================================================================
     4. ESTADO

     Um objeto só, espelhado na query string. Quem chega por um link
     compartilhado vê exatamente a mesma lista de quem montou o filtro.
     ====================================================================== */

  var state = {
    query: "",
    city: "",
    service: "",
    rating: 0,
    price: 0,
    day: "any",
    time: "any",
    open: false,
    fav: false,
    fresh: false,
    near: false,
    sort: "relevance",
    page: 1
  };

  /* Cidade do visitante: vem da busca do hero, da geolocalização ou de uma
     escolha anterior. Sem ela não existe "perto de mim" nem distância no
     card — a página não estima o que não sabe. */
  var visitorCity = null;

  /* Última lista calculada, para não refiltrar a cada leitura. */
  var results = [];

  function accountApi() {
    return window.InBarberAccount || null;
  }

  function favoriteIds() {
    var account = accountApi();
    return account ? account.favorites() : [];
  }

  function readVisitorCity() {
    var stored = readStorage("inbarber:city");
    return stored && data.cityCoords[stored] ? stored : null;
  }

  /* ======================================================================
     5. FILTRAGEM, ORDENAÇÃO E FACETAS
     ====================================================================== */

  /** Tokens da busca livre: "corte real" vira ["corte", "real"]. */
  function tokensOf(query) {
    return fold(query).split(/\s+/).filter(function (token) {
      return token.length > 0;
    });
  }

  /** Texto no qual a busca livre procura: nome, bairro, cidade e serviços. */
  function haystackOf(shop) {
    if (!shop._haystack || shop._haystackLang !== i18n.getLanguage()) {
      var services = shop.serviceKeys
        .map(function (key) {
          return t("service." + key);
        })
        .join(" ");
      shop._haystack = fold(shop.name + " " + shop.neighborhood + " " + shop.city + " " + services);
      shop._haystackLang = i18n.getLanguage();
    }
    return shop._haystack;
  }

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

  function distanceOf(shop) {
    if (!visitorCity) return null;
    if (shop.city === visitorCity) return 0;
    return data.distanceFromCity(visitorCity, shop);
  }

  /** Aplica um conjunto de filtros à base inteira. Não ordena. */
  function filterShops(filters) {
    var tokens = tokensOf(filters.query);
    var favs = filters.fav ? favoriteIds() : null;

    return data.barbershops.filter(function (shop) {
      if (filters.city && shop.city !== filters.city) return false;
      if (filters.service && shop.serviceKeys.indexOf(filters.service) === -1) return false;
      if (filters.rating && shop.rating < filters.rating) return false;
      if (filters.price && shop.priceFrom > filters.price) return false;
      if (!matchesDay(shop, filters.day)) return false;
      if (!matchesTime(shop, filters.time)) return false;
      if (filters.open && !shop.openNow) return false;
      if (filters.fresh && !data.isNewShop(shop)) return false;
      if (filters.fav && favs.indexOf(shop.id) === -1) return false;
      if (filters.near) {
        var km = distanceOf(shop);
        if (km === null || km > NEAR_RADIUS_KM) return false;
      }
      if (tokens.length) {
        var haystack = haystackOf(shop);
        for (var i = 0; i < tokens.length; i += 1) {
          if (haystack.indexOf(tokens[i]) === -1) return false;
        }
      }
      return true;
    });
  }

  /**
   * Quão bem a barbearia responde ao texto digitado (menor é melhor).
   * Nome que começa com o termo vem antes de nome que só o contém, que vem
   * antes de quem casou pelo bairro ou pelo serviço.
   */
  function queryRank(shop, query) {
    if (!query) return 0;
    var needle = fold(query);
    var name = fold(shop.name);
    var index = name.indexOf(needle);
    if (index === 0) return 0;
    if (index > 0) return isWordStart(name, index) ? 1 : 2;
    if (fold(shop.neighborhood).indexOf(needle) === 0) return 3;
    if (fold(shop.city).indexOf(needle) === 0) return 4;
    return 5;
  }

  function isWordStart(text, index) {
    return index === 0 || /[\s·\-&/]/.test(text.charAt(index - 1));
  }

  function sortResults(list, filters) {
    var query = filters.query;

    var sorters = {
      relevance: function (a, b) {
        var rank = queryRank(a, query) - queryRank(b, query);
        if (rank) return rank;
        if (visitorCity) {
          var da = distanceOf(a);
          var db = distanceOf(b);
          if (da !== null && db !== null && da !== db) return da - db;
        }
        if (a.openNow !== b.openNow) return a.openNow ? -1 : 1;
        return b.rating - a.rating || b.reviews - a.reviews;
      },
      distance: function (a, b) {
        var da = distanceOf(a);
        var db = distanceOf(b);
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db || b.rating - a.rating;
      },
      rating: function (a, b) {
        return b.rating - a.rating || b.reviews - a.reviews;
      },
      reviews: function (a, b) {
        return b.reviews - a.reviews;
      },
      price: function (a, b) {
        return a.priceFrom - b.priceFrom || b.rating - a.rating;
      },
      newest: function (a, b) {
        if (a.joinedAt === b.joinedAt) return b.rating - a.rating;
        return a.joinedAt < b.joinedAt ? 1 : -1;
      },
      name: function (a, b) {
        return a.name.localeCompare(b.name, i18n.getLocale());
      }
    };

    var sorter = sorters[filters.sort] || sorters.relevance;
    return list.slice().sort(sorter);
  }

  /** Cópia do estado com uma ou mais chaves trocadas (para contar facetas). */
  function withFilters(overrides) {
    var copy = {};
    Object.keys(state).forEach(function (key) {
      copy[key] = state[key];
    });
    Object.keys(overrides || {}).forEach(function (key) {
      copy[key] = overrides[key];
    });
    return copy;
  }

  /** Quantas barbearias sobram com esse ajuste nos filtros atuais. */
  function countWith(overrides) {
    return filterShops(withFilters(overrides)).length;
  }

  function activeFilterCount() {
    var count = 0;
    if (state.city) count += 1;
    if (state.service) count += 1;
    if (state.rating) count += 1;
    if (state.price) count += 1;
    if (state.day !== "any") count += 1;
    if (state.time !== "any") count += 1;
    if (state.open) count += 1;
    if (state.fav) count += 1;
    if (state.fresh) count += 1;
    if (state.near) count += 1;
    return count;
  }

  /* ======================================================================
     6. ENDEREÇO COMPARTILHÁVEL

     Só o que está ativo entra na URL: link curto continua legível, e o
     estado inicial (?) não polui a barra de endereço.
     ====================================================================== */

  function syncUrl() {
    if (!window.history || !window.history.replaceState) return;

    var params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.city) params.set("city", state.city);
    if (state.service) params.set("service", state.service);
    if (state.rating) params.set("rating", String(state.rating));
    if (state.price) params.set("price", String(state.price));
    if (state.day !== "any") params.set("day", state.day);
    if (state.time !== "any") params.set("time", state.time);
    if (state.open) params.set("open", "1");
    if (state.fav) params.set("fav", "1");
    if (state.fresh) params.set("new", "1");
    if (state.near) params.set("near", "1");
    if (state.sort !== "relevance") params.set("sort", state.sort);

    var query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? "?" + query : "") + window.location.hash
    );
  }

  function readUrl() {
    var params = new URLSearchParams(window.location.search);

    var query = params.get("q") || "";
    var city = params.get("city") || "";

    /* Compatibilidade com a busca do hero, que manda a cidade em ?q=:
       termo que é exatamente uma cidade atendida vira filtro de cidade. */
    if (!city && query && data.cities.indexOf(query) !== -1) {
      city = query;
      query = "";
    }

    state.query = query;
    state.city = data.cities.indexOf(city) !== -1 ? city : "";
    state.service = data.serviceKeys.indexOf(params.get("service")) !== -1 ? params.get("service") : "";
    state.rating = validNumber(params.get("rating"), [4.5, 4, 3.5]);
    state.price = validNumber(params.get("price"), PRICE_OPTIONS.slice(1));
    state.day = validOption(params.get("day"), DAY_OPTIONS);
    state.time = validOption(params.get("time"), TIME_OPTIONS);
    state.open = params.get("open") === "1";
    state.fav = params.get("fav") === "1";
    state.fresh = params.get("new") === "1";
    state.near = params.get("near") === "1" && !!visitorCity;

    var sort = params.get("sort") || "relevance";
    var allowedSorts = ["relevance", "rating", "reviews", "price", "newest", "name"];
    if (visitorCity) allowedSorts.push("distance");
    state.sort = allowedSorts.indexOf(sort) !== -1 ? sort : "relevance";

    state.page = 1;
  }

  function validNumber(raw, allowed) {
    var value = Number(raw);
    return allowed.indexOf(value) !== -1 ? value : 0;
  }

  function validOption(raw, options) {
    for (var i = 0; i < options.length; i += 1) {
      if (options[i].value === raw) return raw;
    }
    return "any";
  }

  /* ======================================================================
     7. ÍNDICE DE SUGESTÕES

     Montado uma vez por idioma: barbearias, cidades, bairros e serviços,
     cada um com o texto dobrado (sem acento) para a comparação e com o
     número de barbearias que a escolha entrega.
     ====================================================================== */

  var suggestionIndex = [];

  function buildSuggestionIndex() {
    var entries = [];

    data.barbershops.forEach(function (shop) {
      entries.push({
        type: "shop",
        value: shop.id,
        label: shop.name,
        meta: shop.neighborhood + " · " + shop.city,
        aside: i18n.formatRating(shop.rating),
        shop: shop,
        folded: fold(shop.name),
        foldedMeta: fold(shop.neighborhood + " " + shop.city)
      });
    });

    data.cities.forEach(function (city) {
      var count = data.barbershops.filter(function (shop) {
        return shop.city === city;
      }).length;
      entries.push({
        type: "city",
        value: city,
        label: city,
        meta: countLabelFor(count),
        count: count,
        folded: fold(city),
        foldedMeta: ""
      });
    });

    var districts = {};
    data.barbershops.forEach(function (shop) {
      var key = shop.neighborhood + "|" + shop.city;
      if (!districts[key]) {
        districts[key] = { name: shop.neighborhood, city: shop.city, count: 0 };
      }
      districts[key].count += 1;
    });
    Object.keys(districts).forEach(function (key) {
      var district = districts[key];
      entries.push({
        type: "district",
        value: district.name,
        label: district.name,
        meta: district.city,
        count: district.count,
        folded: fold(district.name),
        foldedMeta: fold(district.city)
      });
    });

    data.serviceKeys.forEach(function (key) {
      var label = t("service." + key);
      var count = data.barbershops.filter(function (shop) {
        return shop.serviceKeys.indexOf(key) !== -1;
      }).length;
      if (!count) return;
      entries.push({
        type: "service",
        value: key,
        label: label,
        meta: countLabelFor(count),
        count: count,
        folded: fold(label),
        foldedMeta: ""
      });
    });

    suggestionIndex = entries;
  }

  function countLabelFor(count) {
    return count === 1
      ? t("shops.resultsOne")
      : t("shops.resultsMany", { count: i18n.formatNumber(count) });
  }

  /**
   * Pontua uma entrada contra o termo digitado.
   * @returns {number} 0 melhor, -1 quando não casa de jeito nenhum.
   */
  function suggestionScore(entry, needle) {
    var index = entry.folded.indexOf(needle);
    if (index === 0) return 0;
    if (index > 0) return isWordStart(entry.folded, index) ? 1 : 2;
    if (entry.foldedMeta && entry.foldedMeta.indexOf(needle) !== -1) return 3;
    return -1;
  }

  var TYPE_ORDER = ["shop", "city", "district", "service"];

  /** Sugestões para o termo digitado, agrupadas por tipo e já cortadas. */
  function suggestionsFor(query) {
    var needle = fold(query.trim());
    if (!needle) return [];

    var scored = [];
    suggestionIndex.forEach(function (entry) {
      var score = suggestionScore(entry, needle);
      if (score === -1) return;
      scored.push({ entry: entry, score: score });
    });

    scored.sort(function (a, b) {
      if (a.score !== b.score) return a.score - b.score;
      var typeDiff = TYPE_ORDER.indexOf(a.entry.type) - TYPE_ORDER.indexOf(b.entry.type);
      if (typeDiff) return typeDiff;
      var weightA = a.entry.shop ? a.entry.shop.rating : a.entry.count || 0;
      var weightB = b.entry.shop ? b.entry.shop.rating : b.entry.count || 0;
      if (weightA !== weightB) return weightB - weightA;
      return a.entry.label.localeCompare(b.entry.label, i18n.getLocale());
    });

    var used = { shop: 0, city: 0, district: 0, service: 0 };
    var picked = [];
    scored.forEach(function (item) {
      if (picked.length >= SUGGESTIONS_MAX) return;
      if (used[item.entry.type] >= SUGGESTION_LIMITS[item.entry.type]) return;
      used[item.entry.type] += 1;
      picked.push(item);
    });

    /* Cada tipo precisa formar um bloco só — senão o painel repetiria o
       título "Barbearias" duas vezes. A ordem entre os blocos é a do melhor
       resultado de cada um: quem digita "asa" vê Bairros no topo, quem
       digita "ate" vê Barbearias. */
    var bestScore = {};
    picked.forEach(function (item) {
      var type = item.entry.type;
      if (bestScore[type] === undefined || item.score < bestScore[type]) {
        bestScore[type] = item.score;
      }
    });

    return picked
      .map(function (item, position) {
        return { item: item, position: position };
      })
      .sort(function (a, b) {
        var typeA = a.item.entry.type;
        var typeB = b.item.entry.type;
        if (typeA !== typeB) {
          if (bestScore[typeA] !== bestScore[typeB]) return bestScore[typeA] - bestScore[typeB];
          return TYPE_ORDER.indexOf(typeA) - TYPE_ORDER.indexOf(typeB);
        }
        return a.position - b.position;
      })
      .map(function (wrapped) {
        return wrapped.item.entry;
      });
  }

  /** Sugestões do campo vazio: buscas recentes + cidades + mais bem avaliadas. */
  function defaultSuggestions() {
    var out = [];

    recentSearches().slice(0, RECENT_SHOWN).forEach(function (term) {
      out.push({ type: "recent", value: term, label: term, meta: "" });
    });

    data.cities
      .map(function (city) {
        return {
          city: city,
          count: data.barbershops.filter(function (shop) {
            return shop.city === city;
          }).length
        };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 3)
      .forEach(function (item) {
        out.push({
          type: "city",
          value: item.city,
          label: item.city,
          meta: countLabelFor(item.count)
        });
      });

    data.barbershops
      .slice()
      .sort(function (a, b) {
        return b.rating - a.rating || b.reviews - a.reviews;
      })
      .slice(0, 3)
      .forEach(function (shop) {
        out.push({
          type: "shop",
          value: shop.id,
          label: shop.name,
          meta: shop.neighborhood + " · " + shop.city,
          aside: i18n.formatRating(shop.rating),
          shop: shop
        });
      });

    return out;
  }

  /* ---------------------------------------------------------------------
     Buscas recentes
     --------------------------------------------------------------------- */

  function recentSearches() {
    var raw = readStorage(RECENT_KEY);
    if (!raw) return [];
    try {
      var list = JSON.parse(raw);
      return Object.prototype.toString.call(list) === "[object Array]"
        ? list.filter(function (item) { return typeof item === "string" && item; })
        : [];
    } catch (err) {
      return [];
    }
  }

  function rememberSearch(term) {
    var clean = String(term || "").trim();
    if (clean.length < 2) return;

    var list = recentSearches().filter(function (item) {
      return fold(item) !== fold(clean);
    });
    list.unshift(clean);
    writeStorage(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  }

  function clearRecentSearches() {
    writeStorage(RECENT_KEY, "[]");
  }

  /* ======================================================================
     8. COMBOBOX — painel de sugestões e teclado
     ====================================================================== */

  var openSuggestions = [];
  var activeIndex = -1;
  var panelOpen = false;

  function iconFor(type) {
    if (type === "shop") return ICONS.shop;
    if (type === "city") return ICONS.pin;
    if (type === "district") return ICONS.district;
    if (type === "service") return ICONS.scissors;
    return ICONS.history;
  }

  function groupTitleKey(type) {
    return {
      recent: "search.groupRecent",
      shop: "search.groupShops",
      city: "search.groupCities",
      district: "search.groupDistricts",
      service: "search.groupServices"
    }[type];
  }

  /** Rótulo com o trecho digitado destacado (e sempre escapado). */
  function highlight(label, query) {
    var needle = fold(query.trim());
    if (!needle) return escapeHtml(label);

    var index = fold(label).indexOf(needle);
    if (index === -1) return escapeHtml(label);

    return (
      escapeHtml(label.slice(0, index)) +
      "<mark>" + escapeHtml(label.slice(index, index + needle.length)) + "</mark>" +
      escapeHtml(label.slice(index + needle.length))
    );
  }

  function renderSuggestions() {
    if (!panel || !queryInput) return;

    var query = queryInput.value;
    var isDefault = !query.trim();
    var items = isDefault ? defaultSuggestions() : suggestionsFor(query);

    openSuggestions = items;
    activeIndex = -1;

    if (!items.length) {
      panel.innerHTML =
        '<p class="suggestions__empty">' +
          ICONS.searchOff +
          "<span>" + escapeHtml(t("search.noSuggestions", { term: query.trim() })) + "</span>" +
        "</p>";
      openPanel();
      announce(t("search.noSuggestions", { term: query.trim() }));
      return;
    }

    var html = "";
    var lastType = null;
    var hasRecent = false;

    items.forEach(function (item, index) {
      if (item.type !== lastType) {
        if (lastType !== null) html += "</div>";
        var titleKey = groupTitleKey(item.type);
        html +=
          '<div class="suggestions__group" role="group" aria-label="' + escapeHtml(t(titleKey)) + '">' +
            '<p class="suggestions__title">' + escapeHtml(t(titleKey)) + "</p>";
        lastType = item.type;
      }
      if (item.type === "recent") hasRecent = true;

      html +=
        '<div class="suggestion" role="option" id="suggestion-' + index + '" aria-selected="false" ' +
          'data-index="' + index + '">' +
          '<span class="suggestion__icon" aria-hidden="true">' + iconFor(item.type) + "</span>" +
          '<span class="suggestion__body">' +
            '<span class="suggestion__label">' + highlight(item.label, isDefault ? "" : query) + "</span>" +
            (item.meta ? '<span class="suggestion__meta">' + escapeHtml(item.meta) + "</span>" : "") +
          "</span>" +
          (item.aside
            ? '<span class="suggestion__aside">' + ICONS.star + escapeHtml(item.aside) + "</span>"
            : "") +
        "</div>";
    });

    if (lastType !== null) html += "</div>";

    if (hasRecent) {
      html +=
        '<div class="suggestions__foot">' +
          '<button type="button" class="suggestions__clear" data-clear-recent>' +
            escapeHtml(t("search.clearRecent")) +
          "</button>" +
        "</div>";
    }

    panel.innerHTML = html;
    openPanel();
    announce(
      items.length === 1
        ? t("search.oneSuggestion")
        : t("search.manySuggestions", { count: i18n.formatNumber(items.length) })
    );
  }

  function openPanel() {
    if (!panel || !queryInput) return;
    panel.hidden = false;
    panelOpen = true;
    queryInput.setAttribute("aria-expanded", "true");
    if (comboRoot) comboRoot.classList.add("is-open");
  }

  function closePanel() {
    if (!panel || !queryInput) return;
    panel.hidden = true;
    panelOpen = false;
    activeIndex = -1;
    queryInput.setAttribute("aria-expanded", "false");
    queryInput.removeAttribute("aria-activedescendant");
    if (comboRoot) comboRoot.classList.remove("is-open");
  }

  function setActiveSuggestion(index) {
    var options = qsa(".suggestion", panel);
    if (!options.length) return;

    if (index < 0) index = options.length - 1;
    if (index >= options.length) index = 0;
    activeIndex = index;

    options.forEach(function (option, position) {
      var active = position === index;
      option.setAttribute("aria-selected", active ? "true" : "false");
      option.classList.toggle("is-active", active);
      if (active) {
        queryInput.setAttribute("aria-activedescendant", option.id);
        if (option.scrollIntoView) option.scrollIntoView({ block: "nearest" });
      }
    });
  }

  /**
   * O que acontece ao escolher uma sugestão.
   * Barbearia e bairro viram texto de busca (a lista continua na tela, com
   * o resultado certo em cima); cidade e serviço viram filtro, que é como
   * o visitante pensa: "quero em Curitiba", "quero barba".
   */
  function applySuggestion(item) {
    if (!item) return;

    if (item.type === "shop") {
      state.query = item.label;
      rememberSearch(item.label);
    } else if (item.type === "district" || item.type === "recent") {
      state.query = item.label;
      rememberSearch(item.label);
    } else if (item.type === "city") {
      state.query = "";
      state.city = item.value;
      state.near = false;
      rememberCity(item.value);
    } else if (item.type === "service") {
      state.query = "";
      state.service = item.value;
    }

    state.page = 1;
    if (queryInput) queryInput.value = state.query;
    closePanel();
    syncControls();
    render();
    scrollToResults();
  }

  function rememberCity(city) {
    if (!data.cityCoords[city]) return;
    visitorCity = city;
    writeStorage("inbarber:city", city);
    document.dispatchEvent(new CustomEvent("inbarber:citychange", { detail: { city: city } }));
  }

  function bindCombobox() {
    if (!queryInput) return;

    queryInput.addEventListener("input", function () {
      state.query = queryInput.value.trim();
      state.page = 1;
      updateClearButton();
      renderSuggestions();
      render();
    });

    queryInput.addEventListener("focus", function () {
      renderSuggestions();
    });

    queryInput.addEventListener("keydown", function (event) {
      var key = event.key;

      if (key === "ArrowDown" || key === "ArrowUp") {
        event.preventDefault();
        if (!panelOpen) {
          renderSuggestions();
          setActiveSuggestion(key === "ArrowDown" ? 0 : openSuggestions.length - 1);
          return;
        }
        setActiveSuggestion(activeIndex + (key === "ArrowDown" ? 1 : -1));
        return;
      }

      if (key === "Home" && panelOpen && activeIndex !== -1) {
        event.preventDefault();
        setActiveSuggestion(0);
        return;
      }

      if (key === "End" && panelOpen && activeIndex !== -1) {
        event.preventDefault();
        setActiveSuggestion(openSuggestions.length - 1);
        return;
      }

      if (key === "Enter") {
        if (panelOpen && activeIndex >= 0) {
          event.preventDefault();
          applySuggestion(openSuggestions[activeIndex]);
        }
        return;
      }

      if (key === "Escape") {
        if (panelOpen) {
          event.preventDefault();
          closePanel();
        } else if (queryInput.value) {
          event.preventDefault();
          clearQuery();
        }
      }
    });

    /* mousedown no painel roubaria o foco do campo e fecharia tudo antes
       do clique acontecer. */
    if (panel) {
      panel.addEventListener("mousedown", function (event) {
        event.preventDefault();
      });

      panel.addEventListener("click", function (event) {
        if (event.target.closest("[data-clear-recent]")) {
          clearRecentSearches();
          renderSuggestions();
          if (queryInput) queryInput.focus();
          return;
        }
        var option = event.target.closest(".suggestion");
        if (!option) return;
        applySuggestion(openSuggestions[Number(option.getAttribute("data-index"))]);
      });
    }

    document.addEventListener("click", function (event) {
      if (!comboRoot || comboRoot.contains(event.target)) return;
      closePanel();
    });

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (panelOpen && activeIndex >= 0) {
          applySuggestion(openSuggestions[activeIndex]);
          return;
        }
        state.query = queryInput.value.trim();
        state.page = 1;
        rememberSearch(state.query);
        closePanel();
        render();
        scrollToResults();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        clearQuery();
        queryInput.focus();
      });
    }
  }

  function clearQuery() {
    state.query = "";
    state.page = 1;
    if (queryInput) queryInput.value = "";
    updateClearButton();
    closePanel();
    render();
  }

  function updateClearButton() {
    if (clearButton) clearButton.hidden = !(queryInput && queryInput.value);
  }

  function announce(message) {
    if (statusNode) statusNode.textContent = message;
  }

  function scrollToResults() {
    if (!toolbarNode || !toolbarNode.getBoundingClientRect) return;
    var top = toolbarNode.getBoundingClientRect().top + window.pageYOffset - 120;
    if (top < window.pageYOffset) {
      window.scrollTo({ top: top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }

  /* ======================================================================
     9. ATALHOS RÁPIDOS

     Cada atalho é um filtro de uma tecla só, com a contagem do que ele
     entrega. Nenhum aparece prometendo lista vazia: quando o critério não
     tem barbearia alguma, o botão entra desabilitado — menos "Perto de
     mim" antes da localização, que é justamente o que ainda não se sabe.
     ====================================================================== */

  function quickDefinitions() {
    var geoReady = !!visitorCity;

    return [
      {
        key: "open",
        icon: ICONS.door,
        label: t("quick.openNow"),
        active: state.open,
        count: countWith({ open: true }),
        toggle: function () { state.open = !state.open; }
      },
      {
        key: "near",
        icon: ICONS.target,
        label: geoReady ? t("quick.nearCity", { city: visitorCity }) : t("quick.near"),
        active: state.near,
        count: geoReady ? countWith({ near: true }) : null,
        toggle: function () {
          if (!visitorCity) {
            locate();
            return false;
          }
          state.near = !state.near;
        }
      },
      {
        key: "top",
        icon: ICONS.star,
        label: t("quick.topRated"),
        active: state.rating === 4.5,
        count: countWith({ rating: 4.5 }),
        toggle: function () { state.rating = state.rating === 4.5 ? 0 : 4.5; }
      },
      {
        key: "fresh",
        icon: ICONS.sparkle,
        label: t("quick.new"),
        active: state.fresh,
        count: countWith({ fresh: true }),
        toggle: function () { state.fresh = !state.fresh; }
      },
      {
        key: "fav",
        icon: ICONS.heart,
        label: t("quick.favorites"),
        active: state.fav,
        count: countWith({ fav: true }),
        locked: !(accountApi() && accountApi().isSignedIn()),
        toggle: function () {
          var account = accountApi();
          if (!account || !account.isSignedIn()) {
            account && account.open();
            return false;
          }
          state.fav = !state.fav;
        }
      }
    ];
  }

  function renderQuickFilters() {
    if (!quickRow) return;

    quickRow.innerHTML = quickDefinitions()
      .map(function (item) {
        var disabled = item.count === 0 && !item.active && !item.locked;
        return (
          '<button type="button" class="quick-chip' + (item.active ? " is-active" : "") + '"' +
            ' data-quick="' + item.key + '"' +
            ' aria-pressed="' + (item.active ? "true" : "false") + '"' +
            (disabled ? " disabled" : "") + ">" +
            '<span class="quick-chip__icon" aria-hidden="true">' + item.icon + "</span>" +
            "<span>" + escapeHtml(item.label) + "</span>" +
            (item.count === null
              ? ""
              : '<span class="quick-chip__count">' + escapeHtml(i18n.formatNumber(item.count)) + "</span>") +
          "</button>"
        );
      })
      .join("");
  }

  function bindQuickFilters() {
    if (!quickRow) return;
    quickRow.addEventListener("click", function (event) {
      var button = event.target.closest("[data-quick]");
      if (!button || button.disabled) return;

      var key = button.getAttribute("data-quick");
      var definition = null;
      quickDefinitions().forEach(function (item) {
        if (item.key === key) definition = item;
      });
      if (!definition) return;

      if (definition.toggle() === false) return;
      state.page = 1;
      syncControls();
      render();
    });
  }

  /* Geolocalização sem API externa: comparamos a posição do navegador com
     as coordenadas das cidades atendidas e ficamos com a mais próxima. */
  function locate() {
    if (!navigator.geolocation) {
      announce(t("geo.unsupported"));
      return;
    }
    announce(t("geo.locating"));

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var match = data.nearestCity(position.coords.latitude, position.coords.longitude);
        if (!match || match.distanceKm > MAX_CITY_DISTANCE_KM) {
          announce(t("geo.tooFar"));
          renderQuickFilters();
          return;
        }
        rememberCity(match.city);
        state.near = true;
        state.page = 1;
        announce(t("geo.matched", { city: match.city }));
        syncControls();
        render();
      },
      function () {
        announce(t("geo.error"));
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  /* ======================================================================
     10. PAINEL DE FILTROS

     Os selects mostram a contagem de cada opção considerando os demais
     filtros ativos. É o que evita o vaivém de escolher, não achar nada e
     voltar atrás: a lista já diz o que existe antes do clique.
     ====================================================================== */

  function optionMarkup(value, label, count, selected) {
    var disabled = count === 0 && !selected;
    return (
      '<option value="' + escapeHtml(value) + '"' +
        (selected ? " selected" : "") +
        (disabled ? " disabled" : "") + ">" +
        escapeHtml(count === null ? label : t("filters.optionCount", {
          label: label,
          count: i18n.formatNumber(count)
        })) +
      "</option>"
    );
  }

  function fillFilterControls() {
    if (cityInput) {
      cityInput.innerHTML =
        optionMarkup("", t("filters.anyCity"), countWith({ city: "" }), !state.city) +
        data.cities
          .map(function (city) {
            return optionMarkup(city, city, countWith({ city: city }), state.city === city);
          })
          .join("");
    }

    if (serviceInput) {
      serviceInput.innerHTML =
        optionMarkup("", t("filters.anyService"), countWith({ service: "" }), !state.service) +
        data.serviceKeys
          .map(function (key) {
            return optionMarkup(
              key,
              t("service." + key),
              countWith({ service: key }),
              state.service === key
            );
          })
          .join("");
    }

    if (ratingInput) {
      ratingInput.innerHTML = RATING_OPTIONS.map(function (option) {
        return optionMarkup(
          String(option.value),
          t(option.key),
          countWith({ rating: option.value }),
          state.rating === option.value
        );
      }).join("");
    }

    if (priceInput) {
      priceInput.innerHTML = PRICE_OPTIONS.map(function (value) {
        var label = value === 0
          ? t("filters.anyPrice")
          : t("filters.priceUnder", { price: i18n.formatPrice(value) });
        return optionMarkup(String(value), label, countWith({ price: value }), state.price === value);
      }).join("");
    }

    if (dayInput) {
      dayInput.innerHTML = DAY_OPTIONS.map(function (option) {
        return optionMarkup(
          option.value,
          t(option.key),
          countWith({ day: option.value }),
          state.day === option.value
        );
      }).join("");
    }

    if (timeInput) {
      timeInput.innerHTML = TIME_OPTIONS.map(function (option) {
        return optionMarkup(
          option.value,
          t(option.key),
          countWith({ time: option.value }),
          state.time === option.value
        );
      }).join("");
    }

    if (sortInput) {
      var sortOptions = [
        { value: "relevance", key: "filters.sortRelevance" },
        { value: "rating", key: "filters.sortRating" },
        { value: "reviews", key: "filters.sortReviews" },
        { value: "price", key: "filters.sortPrice" },
        { value: "newest", key: "filters.sortNewest" },
        { value: "name", key: "filters.sortName" }
      ];
      /* Ordenar por distância só existe quando há uma cidade conhecida —
         sem isso não há distância para ordenar, e a opção seria mentira. */
      if (visitorCity) {
        sortOptions.splice(1, 0, { value: "distance", key: "filters.sortDistance" });
      }
      if (!visitorCity && state.sort === "distance") state.sort = "relevance";

      sortInput.innerHTML = sortOptions
        .map(function (option) {
          return (
            '<option value="' + option.value + '"' +
              (state.sort === option.value ? " selected" : "") + ">" +
              escapeHtml(t(option.key)) +
            "</option>"
          );
        })
        .join("");
    }
  }

  function bindFilterControls() {
    if (cityInput) {
      cityInput.addEventListener("change", function () {
        state.city = cityInput.value;
        if (state.city) {
          state.near = false;
          rememberCity(state.city);
        }
        afterFilterChange();
      });
    }
    if (serviceInput) {
      serviceInput.addEventListener("change", function () {
        state.service = serviceInput.value;
        afterFilterChange();
      });
    }
    if (ratingInput) {
      ratingInput.addEventListener("change", function () {
        state.rating = Number(ratingInput.value) || 0;
        afterFilterChange();
      });
    }
    if (priceInput) {
      priceInput.addEventListener("change", function () {
        state.price = Number(priceInput.value) || 0;
        afterFilterChange();
      });
    }
    if (dayInput) {
      dayInput.addEventListener("change", function () {
        state.day = dayInput.value;
        afterFilterChange();
      });
    }
    if (timeInput) {
      timeInput.addEventListener("change", function () {
        state.time = timeInput.value;
        afterFilterChange();
      });
    }
    if (sortInput) {
      sortInput.addEventListener("change", function () {
        state.sort = sortInput.value;
        state.page = 1;
        render();
      });
    }
    if (resetButton) resetButton.addEventListener("click", resetAll);

    /* Os filtros valem na hora; se algum navegador resolver submeter o
       formulário, isso não pode recarregar a página e perder o estado. */
    var filtersForm = qs("[data-filters]");
    if (filtersForm) {
      filtersForm.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    }

    if (activeBox) {
      activeBox.addEventListener("click", function (event) {
        var button = event.target.closest("[data-clear-filter]");
        if (!button) return;
        clearFilter(button.getAttribute("data-clear-filter"));
      });
    }

    /* Gaveta de filtros no mobile */
    if (filtersToggle) filtersToggle.addEventListener("click", toggleFiltersPanel);
    if (filtersClose) filtersClose.addEventListener("click", function () { setFiltersPanel(false); });
    if (filtersApply) filtersApply.addEventListener("click", function () { setFiltersPanel(false); });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && filtersPanel && filtersPanel.classList.contains("is-open") && !isDesktop()) {
        setFiltersPanel(false);
        if (filtersToggle) filtersToggle.focus();
      }
    });

    if (mediaDesktop) {
      var onBreakpoint = function () {
        if (isDesktop()) setFiltersPanel(false);
      };
      if (mediaDesktop.addEventListener) mediaDesktop.addEventListener("change", onBreakpoint);
      else if (mediaDesktop.addListener) mediaDesktop.addListener(onBreakpoint);
    }
  }

  function afterFilterChange() {
    state.page = 1;
    syncControls();
    render();
  }

  function toggleFiltersPanel() {
    setFiltersPanel(!(filtersPanel && filtersPanel.classList.contains("is-open")));
  }

  function setFiltersPanel(open) {
    if (!filtersPanel || !filtersToggle) return;
    filtersPanel.classList.toggle("is-open", open);
    filtersToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("has-drawer", open && !isDesktop());
    if (open) {
      var first = qs("select", filtersPanel);
      if (first && !isDesktop()) first.focus();
    }
  }

  function clearFilter(type) {
    if (type === "all") {
      resetAll();
      return;
    }
    if (type === "query") {
      state.query = "";
      if (queryInput) queryInput.value = "";
      updateClearButton();
    }
    if (type === "city") state.city = "";
    if (type === "service") state.service = "";
    if (type === "rating") state.rating = 0;
    if (type === "price") state.price = 0;
    if (type === "day") state.day = "any";
    if (type === "time") state.time = "any";
    if (type === "open") state.open = false;
    if (type === "fav") state.fav = false;
    if (type === "fresh") state.fresh = false;
    if (type === "near") state.near = false;
    afterFilterChange();
  }

  function resetAll() {
    state.query = "";
    state.city = "";
    state.service = "";
    state.rating = 0;
    state.price = 0;
    state.day = "any";
    state.time = "any";
    state.open = false;
    state.fav = false;
    state.fresh = false;
    state.near = false;
    state.sort = "relevance";
    state.page = 1;
    if (queryInput) queryInput.value = "";
    updateClearButton();
    closePanel();
    syncControls();
    render();
  }

  /* ---------------------------------------------------------------------
     Chips do que está ativo
     --------------------------------------------------------------------- */

  function activeChips() {
    var chips = [];
    if (state.query) chips.push({ type: "query", label: '"' + state.query + '"' });
    if (state.city) chips.push({ type: "city", label: state.city });
    if (state.service) chips.push({ type: "service", label: t("service." + state.service) });
    if (state.rating) {
      RATING_OPTIONS.forEach(function (option) {
        if (option.value === state.rating) chips.push({ type: "rating", label: t(option.key) });
      });
    }
    if (state.price) {
      chips.push({
        type: "price",
        label: t("filters.priceUnder", { price: i18n.formatPrice(state.price) })
      });
    }
    if (state.day !== "any") chips.push({ type: "day", label: t("day." + state.day) });
    if (state.time !== "any") chips.push({ type: "time", label: t("time." + state.time + "Short") });
    if (state.open) chips.push({ type: "open", label: t("quick.openNow") });
    if (state.near) chips.push({ type: "near", label: t("quick.nearCity", { city: visitorCity || "" }) });
    if (state.fresh) chips.push({ type: "fresh", label: t("quick.new") });
    if (state.fav) chips.push({ type: "fav", label: t("quick.favorites") });
    return chips;
  }

  function renderActiveFilters() {
    if (!activeBox) return;
    var chips = activeChips();

    if (!chips.length) {
      activeBox.hidden = true;
      activeBox.innerHTML = "";
      return;
    }

    activeBox.hidden = false;
    activeBox.innerHTML =
      '<span class="active-filters__label">' + escapeHtml(t("filters.activeTitle")) + "</span>" +
      chips
        .map(function (chip) {
          return (
            '<span class="filter-chip">' + escapeHtml(chip.label) +
              '<button type="button" class="filter-chip__remove" data-clear-filter="' + chip.type + '" ' +
                'aria-label="' + escapeHtml(t("filters.removeFilter", { label: chip.label })) + '">' +
                ICONS.close +
              "</button>" +
            "</span>"
          );
        })
        .join("") +
      '<button type="button" class="active-filters__reset" data-clear-filter="all">' +
        escapeHtml(t("filters.reset")) +
      "</button>";
  }

  /* ======================================================================
     11. CARDS E GRADE
     ====================================================================== */

  function favButtonMarkup(shop) {
    var account = accountApi();
    var signedIn = !!(account && account.isSignedIn());
    var active = !!(account && account.isFavorite(shop.id));
    var label = signedIn
      ? t(active ? "fav.remove" : "fav.add", { name: shop.name })
      : t("fav.locked", { name: shop.name });

    return (
      '<button type="button" class="fav-btn"' +
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

  function formatTime(date) {
    try {
      return new Intl.DateTimeFormat(i18n.getLocale(), {
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch (err) {
      var minutes = String(date.getMinutes());
      return date.getHours() + ":" + (minutes.length < 2 ? "0" + minutes : minutes);
    }
  }

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
    if (slot.daysAhead === 0) return t("day.today");
    if (slot.daysAhead === 1) return t("day.tomorrow");
    return t("day.short" + slot.date.getDay());
  }

  /** Próximos horários livres como atalho de agendamento. */
  function slotsMarkup(shop) {
    var slots = data.nextSlots(shop, 2);
    if (!slots.length) return "";

    return (
      '<div class="shop-card__slots">' +
        '<span class="shop-card__slots-label">' + ICONS.clock +
          "<span>" + escapeHtml(t("shops.nextSlots")) + "</span>" +
        "</span>" +
        '<ul class="shop-card__slots-list">' +
          slots
            .map(function (slot) {
              var day = slotDayLabel(slot);
              var time = formatTime(slot.date);
              return (
                "<li><a class=\"shop-slot\" href=\"barbearia.html?id=" +
                  encodeURIComponent(shop.id) + "&ref=busca&slot=" +
                  encodeURIComponent(localISO(slot.date)) + "\"" +
                  ' aria-label="' + escapeHtml(t("recs.slotAria", { day: day, time: time, name: shop.name })) + '">' +
                  '<span class="shop-slot__day">' + escapeHtml(day) + "</span>" +
                  '<span class="shop-slot__time">' + escapeHtml(time) + "</span>" +
                "</a></li>"
              );
            })
            .join("") +
        "</ul>" +
      "</div>"
    );
  }

  function distanceMarkup(shop) {
    var km = distanceOf(shop);
    if (km === null) return "";
    if (km === 0) return '<span class="shop-card__distance">' + escapeHtml(t("recs.here")) + "</span>";
    return (
      '<span class="shop-card__distance">' +
        escapeHtml(t("shops.distance", { km: i18n.formatNumber(km) })) +
      "</span>"
    );
  }

  function shopCard(shop) {
    var card = el("article", "card shop-card");
    card.id = shop.id;
    card.setAttribute("data-reveal", "");

    var statusClass = shop.openNow ? "badge--success" : "badge--danger";
    var statusText = t(shop.openNow ? "shops.openNow" : "shops.closed");
    var altText = t("shops.photoAlt", { name: shop.name, city: shop.city });
    var isNew = data.isNewShop(shop);

    card.innerHTML =
      '<div class="shop-card__media">' +
        '<img src="' + shop.image + '" alt="' + escapeHtml(altText) + '" loading="lazy" decoding="async" width="800" height="500">' +
        '<span class="shop-card__flags">' +
          '<span class="badge ' + statusClass + ' shop-card__status"><span class="badge__dot"></span>' +
            escapeHtml(statusText) +
          "</span>" +
          (isNew
            ? '<span class="badge badge--cyan shop-card__new">' + ICONS.sparkle +
                escapeHtml(t("news.badge")) +
              "</span>"
            : "") +
        "</span>" +
        favButtonMarkup(shop) +
        '<span class="shop-card__rating">' + ICONS.star +
          escapeHtml(i18n.formatRating(shop.rating)) +
          '<span class="shop-card__reviews">(' + escapeHtml(i18n.formatNumber(shop.reviews)) + ")</span>" +
        "</span>" +
      "</div>" +
      '<div class="card__body">' +
        '<h3 class="shop-card__name">' + escapeHtml(shop.name) + "</h3>" +
        '<p class="shop-card__location">' + ICONS.pin +
          "<span>" + escapeHtml(shop.neighborhood + " · " + shop.city) + "</span>" +
          distanceMarkup(shop) +
        "</p>" +
        '<ul class="shop-card__services">' +
          shop.serviceKeys
            .map(function (key) {
              return '<li class="chip">' + escapeHtml(t("service." + key)) + "</li>";
            })
            .join("") +
        "</ul>" +
        slotsMarkup(shop) +
        '<div class="shop-card__footer">' +
          '<p class="shop-card__price">' + escapeHtml(t("shops.from")) +
            "<strong>" + escapeHtml(i18n.formatPrice(shop.priceFrom)) + "</strong>" +
          "</p>" +
          '<a class="btn btn--ghost btn--sm" href="barbearia.html?id=' +
            encodeURIComponent(shop.id) + '&ref=busca">' +
            escapeHtml(t("shops.viewProfile")) +
          "</a>" +
        "</div>" +
      "</div>";

    return card;
  }

  function reveal(scope) {
    var api = window.InBarberReveal;
    if (api && api.observe) {
      api.observe(scope);
      return;
    }
    qsa("[data-reveal]", scope).forEach(function (node) {
      node.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------------------
     Tela vazia que ajuda

     Em vez de só dizer "nada encontrado", a página procura qual filtro
     está segurando a lista: remove um de cada vez, vê qual devolve mais
     barbearias e oferece esse caminho como botão.
     --------------------------------------------------------------------- */

  function emptyState() {
    var box = el("div", "empty-state");
    var chips = activeChips();
    var best = null;

    chips.forEach(function (chip) {
      var count = countWith(overrideForClearing(chip.type));
      if (count > 0 && (!best || count > best.count)) {
        best = { type: chip.type, label: chip.label, count: count };
      }
    });

    box.innerHTML =
      ICONS.searchOff +
      "<p>" + escapeHtml(t("shops.empty")) + "</p>" +
      '<div class="empty-state__actions">' +
        (best
          ? '<button type="button" class="btn btn--primary btn--sm" data-empty-relax="' +
              escapeHtml(best.type) + '">' +
              escapeHtml(t("shops.emptyRelax", {
                label: best.label,
                count: i18n.formatNumber(best.count)
              })) +
            "</button>"
          : "") +
        '<button type="button" class="btn btn--ghost btn--sm" data-empty-reset>' +
          escapeHtml(t("shops.emptyAction")) +
        "</button>" +
      "</div>";

    var relax = qs("[data-empty-relax]", box);
    if (relax) {
      relax.addEventListener("click", function () {
        clearFilter(relax.getAttribute("data-empty-relax"));
      });
    }
    var reset = qs("[data-empty-reset]", box);
    if (reset) reset.addEventListener("click", resetAll);

    return box;
  }

  function overrideForClearing(type) {
    var map = {
      query: { query: "" },
      city: { city: "" },
      service: { service: "" },
      rating: { rating: 0 },
      price: { price: 0 },
      day: { day: "any" },
      time: { time: "any" },
      open: { open: false },
      fav: { fav: false },
      fresh: { fresh: false },
      near: { near: false }
    };
    return map[type] || {};
  }

  /* ======================================================================
     12. RENDERIZAÇÃO
     ====================================================================== */

  function renderCount() {
    if (!countLabel) return;
    countLabel.textContent =
      results.length === 1
        ? t("shops.resultsOne")
        : t("shops.resultsMany", { count: i18n.formatNumber(results.length) });
  }

  function renderPagination() {
    if (!pagination || !loadMoreButton || !paginationStatus) return;

    var shown = Math.min(results.length, state.page * PAGE_SIZE);
    if (results.length <= PAGE_SIZE) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;
    paginationStatus.textContent = t("shops.showing", {
      shown: i18n.formatNumber(shown),
      total: i18n.formatNumber(results.length)
    });

    var remaining = results.length - shown;
    loadMoreButton.hidden = remaining <= 0;
    loadMoreButton.textContent = t("shops.loadMore", {
      count: i18n.formatNumber(Math.min(remaining, PAGE_SIZE))
    });
  }

  /**
   * @param {Object} [options]
   * @param {boolean} [options.append] só acrescenta a página nova (o
   *        "carregar mais" não pode redesenhar o que já está na tela).
   */
  function render(options) {
    var append = !!(options && options.append);

    if (!append) {
      results = sortResults(filterShops(state), state);
    }

    var end = state.page * PAGE_SIZE;
    var start = append ? (state.page - 1) * PAGE_SIZE : 0;
    var slice = results.slice(start, end);

    if (!append) {
      grid.innerHTML = "";
      grid.classList.toggle("shops-grid", results.length > 0);
      if (!results.length) grid.appendChild(emptyState());
    }

    var firstNew = null;
    slice.forEach(function (shop, index) {
      var card = shopCard(shop);
      card.style.setProperty("--reveal-delay", Math.min(index, 8) * 45 + "ms");
      grid.appendChild(card);
      if (!firstNew) firstNew = card;
    });

    renderCount();
    /* As contagens dos filtros e dos atalhos mudam a cada tecla digitada:
       reescrevê-las aqui é o que mantém "São Paulo (3)" verdadeiro. */
    fillFilterControls();
    renderActiveFilters();
    renderQuickFilters();
    renderPagination();
    reveal(grid);
    syncUrl();

    if (filtersCount) {
      var count = activeFilterCount();
      filtersCount.hidden = count === 0;
      filtersCount.textContent = i18n.formatNumber(count);
    }
    if (filtersApply) {
      filtersApply.textContent = t("filters.applyCount", {
        count: i18n.formatNumber(results.length)
      });
    }

    /* Quem carregou mais precisa continuar de onde parou, não voltar ao
       topo: o foco vai para o primeiro card novo. */
    if (append && firstNew) {
      firstNew.setAttribute("tabindex", "-1");
      firstNew.focus({ preventScroll: true });
    }
  }

  /** Devolve o campo de busca ao que o estado diz (os selects vêm do render). */
  function syncControls() {
    if (queryInput && queryInput.value !== state.query) queryInput.value = state.query;
    updateClearButton();
  }

  /* ======================================================================
     13. BOOT
     ====================================================================== */

  function bindPagination() {
    if (!loadMoreButton) return;
    loadMoreButton.addEventListener("click", function () {
      state.page += 1;
      render({ append: true });
      announce(t("shops.showing", {
        shown: i18n.formatNumber(Math.min(results.length, state.page * PAGE_SIZE)),
        total: i18n.formatNumber(results.length)
      }));
    });
  }

  function init() {
    visitorCity = readVisitorCity();
    buildSuggestionIndex();
    readUrl();

    if (queryInput) queryInput.value = state.query;
    updateClearButton();

    bindCombobox();
    bindQuickFilters();
    bindFilterControls();
    bindPagination();

    syncControls();
    render();

    /* Trocar de idioma reescreve rótulos, sugestões e a lista inteira. */
    document.addEventListener("inbarber:languagechange", function () {
      buildSuggestionIndex();
      syncControls();
      render();
      if (panelOpen) renderSuggestions();
    });

    /* Favoritar/entrar mexe na contagem do atalho "Favoritas" e, quando o
       filtro está ligado, na própria lista. */
    document.addEventListener("inbarber:favoriteschange", function () {
      if (state.fav) render();
      else renderQuickFilters();
    });
    document.addEventListener("inbarber:authchange", function () {
      if (state.fav && !(accountApi() && accountApi().isSignedIn())) state.fav = false;
      render();
    });
  }

  init();
})(window, document);
