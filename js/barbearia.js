/* ==========================================================================
   InBarber — Perfil individual da barbearia (barbearia.html?id=)

   Destino do clique no carrossel de destaques e nos cards de barbearia. Lê o
   `id` da query string e monta a página a partir do js/data.js — nenhum dado é
   duplicado aqui.

   Sem backend: o botão de agendamento dispara o evento "inbarber:booking" no
   document, mesmo padrão do "inbarber:signin" do header, para o fluxo real ser
   ligado depois sem tocar nesta página.
   ========================================================================== */

(function (window, document) {
  "use strict";

  var i18n = window.InBarberI18n;
  var data = window.INBARBER_DATA;
  var featured = window.INBARBER_FEATURED;

  var ICONS = {
    star:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.4l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    back:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
    /* Mesmo brilho do selo no carrossel: o visitante reconhece o que já viu. */
    sparkle:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M13.1 2.6a1.15 1.15 0 0 0-2.2 0l-1.1 3.6a3.4 3.4 0 0 1-2.25 2.25L3.95 9.55a1.15 1.15 0 0 0 0 2.2l3.6 1.1a3.4 3.4 0 0 1 2.25 2.25l1.1 3.6a1.15 1.15 0 0 0 2.2 0l1.1-3.6a3.4 3.4 0 0 1 2.25-2.25l3.6-1.1a1.15 1.15 0 0 0 0-2.2l-3.6-1.1a3.4 3.4 0 0 1-2.25-2.25z"/>' +
      '<path d="M18.6 16.1a.62.62 0 0 0-1.2 0l-.36 1.18a1.5 1.5 0 0 1-.96.96l-1.18.36a.62.62 0 0 0 0 1.2l1.18.36c.45.14.82.5.96.96l.36 1.18a.62.62 0 0 0 1.2 0l.36-1.18c.14-.46.5-.82.96-.96l1.18-.36a.62.62 0 0 0 0-1.2l-1.18-.36a1.5 1.5 0 0 1-.96-.96z"/>' +
      "</svg>"
  };

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
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

  function param(name) {
    var found = null;
    window.location.search
      .replace(/^\?/, "")
      .split("&")
      .forEach(function (pair) {
        var parts = pair.split("=");
        if (decodeURIComponent(parts[0]) === name) {
          found = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));
        }
      });
    return found;
  }

  function starsMarkup(rating) {
    var full = Math.round(rating);
    var out =
      '<span class="stars stars--lg" role="img" aria-label="' +
      escapeHtml(i18n.t("reviews.starsAlt", { rating: i18n.formatRating(rating) })) +
      '">';
    for (var i = 1; i <= 5; i += 1) {
      out += i <= full ? ICONS.star : '<span class="stars__empty">' + ICONS.star + "</span>";
    }
    return out + "</span>";
  }

  function shopById(id) {
    var found = null;
    data.barbershops.forEach(function (shop) {
      if (shop.id === id) found = shop;
    });
    return found;
  }

  /* Mesma regra de vigência do featured.js, replicada em três linhas para a
     página não depender da ordem de carregamento dos scripts. */
  function hasLiveContract(shopId) {
    if (!featured || !featured.contracts) return false;
    var now = new Date();
    var month = String(now.getMonth() + 1);
    var day = String(now.getDate());
    var today =
      now.getFullYear() + "-" +
      (month.length < 2 ? "0" + month : month) + "-" +
      (day.length < 2 ? "0" + day : day);

    return featured.contracts.some(function (contract) {
      return (
        contract.shopId === shopId &&
        (!contract.start || contract.start <= today) &&
        (!contract.end || contract.end >= today)
      );
    });
  }

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

  /* ======================================================================
     Renderização
     ====================================================================== */

  function renderNotFound(root) {
    root.innerHTML =
      '<div class="shop-profile__empty">' +
        '<h1 class="shop-profile__name">' + escapeHtml(i18n.t("profile.notFoundTitle")) + "</h1>" +
        "<p>" + escapeHtml(i18n.t("profile.notFoundText")) + "</p>" +
        '<a class="btn btn--gradient" href="barbearias.html">' +
          escapeHtml(i18n.t("profile.seeAll")) + "</a>" +
      "</div>";

    document.title = i18n.t("profile.notFoundTitle") + " — InBarber";
  }

  function renderMeta(shop) {
    var title = i18n.t("meta.shop.title", { name: shop.name });
    var description = i18n.t("meta.shop.description", { name: shop.name, city: shop.city });

    document.title = title;
    var metaDescription = qs('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", description);
    var ogTitle = qs('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    var ogDescription = qs('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", description);
  }

  function renderShop(root, shop) {
    var isSponsored = hasLiveContract(shop.id);
    var statusClass = shop.openNow ? "badge--success" : "badge--muted";
    var statusText = i18n.t(shop.openNow ? "shops.openNow" : "shops.closed");

    var services = shop.serviceKeys
      .map(function (key) {
        return '<li class="chip">' + escapeHtml(i18n.t("service." + key)) + "</li>";
      })
      .join("");

    var days = "";
    for (var day = 0; day < 7; day += 1) {
      var open = shop.days.indexOf(day) !== -1;
      days +=
        '<li class="shop-profile__day' + (open ? " shop-profile__day--open" : "") + '">' +
        escapeHtml(i18n.t("day.short" + day)) +
        "</li>";
    }

    var periods = shop.periods
      .map(function (period) {
        return '<li class="chip">' + escapeHtml(i18n.t("time." + period)) + "</li>";
      })
      .join("");

    root.innerHTML =
      '<a class="shop-profile__back" href="barbearias.html">' + ICONS.back +
        "<span>" + escapeHtml(i18n.t("profile.back")) + "</span></a>" +

      '<figure class="framed framed--glow shop-profile__cover">' +
        '<img src="' + escapeHtml(shop.image) + '" alt="' +
          escapeHtml(i18n.t("shops.photoAlt", { name: shop.name, city: shop.city })) + '"' +
          ' width="1200" height="675" fetchpriority="high" decoding="async">' +

        (isSponsored
          ? '<span class="shop-profile__badge">' + ICONS.sparkle +
            "<span>" + escapeHtml(i18n.t("profile.featuredBadge")) + "</span></span>"
          : "") +

        '<figcaption class="shop-profile__head">' +
          '<h1 class="shop-profile__name">' + escapeHtml(shop.name) + "</h1>" +
          '<p class="shop-profile__location">' + ICONS.pin +
            escapeHtml(shop.neighborhood + " · " + shop.city) + "</p>" +
          '<p class="shop-profile__rating">' + starsMarkup(shop.rating) +
            '<strong class="rating-value">' + escapeHtml(i18n.formatRating(shop.rating)) + "</strong>" +
            '<span class="shop-profile__reviews">' + escapeHtml(i18n.formatNumber(shop.reviews)) +
              " " + escapeHtml(i18n.t("shops.reviewsSuffix")) + "</span>" +
          "</p>" +
        "</figcaption>" +
      "</figure>" +

      '<div class="shop-profile__grid">' +
        '<section class="shop-profile__block">' +
          '<h2 class="shop-profile__block-title">' + escapeHtml(i18n.t("profile.services")) + "</h2>" +
          '<ul class="shop-card__services">' + services + "</ul>" +
          '<p class="shop-profile__service shop-profile__price-row">' +
            "<span>" + escapeHtml(i18n.t("shops.from")) + "</span>" +
            '<strong class="shop-profile__price">' + escapeHtml(i18n.formatPrice(shop.priceFrom)) + "</strong>" +
          "</p>" +
          '<p class="shop-profile__note">' + escapeHtml(i18n.t("profile.priceNote")) + "</p>" +
        "</section>" +

        '<div class="shop-profile__aside">' +
          '<section class="shop-profile__block">' +
            '<h2 class="shop-profile__block-title">' + escapeHtml(i18n.t("profile.hours")) + "</h2>" +
            '<span class="badge ' + statusClass + '"><span class="badge__dot"></span>' +
              escapeHtml(statusText) + "</span>" +
            '<ul class="shop-profile__days">' + days + "</ul>" +
            '<ul class="shop-profile__periods">' + periods + "</ul>" +
          "</section>" +

          '<button type="button" class="btn btn--gradient btn--lg btn--block" data-book>' +
            escapeHtml(i18n.t("shops.book")) + "</button>" +
        "</div>" +
      "</div>";

    /* Foto que não carrega não pode deixar o alt exposto no meio da capa:
       o .framed já tem o gradiente de fallback por trás. */
    var cover = qs(".shop-profile__cover img", root);
    if (cover) {
      cover.addEventListener("error", function () {
        cover.remove();
      });
    }

    var bookButton = qs("[data-book]", root);
    if (bookButton) {
      bookButton.addEventListener("click", function () {
        var origin = param("ref") || "profile";
        document.dispatchEvent(
          new CustomEvent("inbarber:booking", {
            detail: { id: shop.id, name: shop.name, origin: origin }
          })
        );
        track("booking_intent", { shop_id: shop.id, shop_name: shop.name, origin: origin });
        if (window.console) {
          console.info('[InBarber] Agendamento: ligue o fluxo real ao evento "inbarber:booking".');
        }
      });
    }

    renderMeta(shop);
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  function boot() {
    var root = qs("[data-shop-profile]");
    if (!root) return;

    if (!i18n || !data) {
      if (window.console) console.error("[InBarber] perfil: i18n ou data não carregados.");
      return;
    }

    var shop = shopById(param("id") || "");

    function render() {
      if (shop) renderShop(root, shop);
      else renderNotFound(root);
    }

    render();
    onLanguageChange(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);