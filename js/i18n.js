/* ==========================================================================
   InBarber — Internacionalização (JS puro, sem dependências)

   Responsabilidades:
   - Detectar o idioma na primeira visita (navigator.language)
   - Persistir a escolha em localStorage
   - Traduzir o DOM em tempo real, sem reload
   - Manter <html lang> e as meta tags coerentes com o idioma ativo
   - Montar os seletores de idioma (bandeira + código da localidade)
   - Expor window.InBarberI18n para os demais scripts

   Marcação suportada no HTML:
     data-i18n="chave"                              → textContent
     data-i18n-html="chave"                         → innerHTML (marcação inline)
     data-i18n-attr="placeholder:chave|title:outra" → atributos
     data-i18n-content="chave"                      → content de <meta>
   ========================================================================== */

(function (window, document) {
  "use strict";

  var SUPPORTED = ["pt", "en", "es"];
  var FALLBACK = "pt";
  var STORAGE_KEY = "inbarber:lang";

  /* ----------------------------------------------------------------------
     Metadados de cada idioma.
     As bandeiras são SVG inline de propósito: emoji de bandeira não é
     renderizado no Windows, onde apareceria só o código do país.
     ---------------------------------------------------------------------- */
  var LANGUAGES = {
    pt: {
      locale: "pt-BR",
      code: "pt-BR",
      nameKey: "lang.pt",
      flag:
        '<svg class="flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">' +
        '<rect width="24" height="16" fill="#009c3b"/>' +
        '<path d="M12 2.1 22.2 8 12 13.9 1.8 8z" fill="#ffdf00"/>' +
        '<circle cx="12" cy="8" r="3.5" fill="#002776"/>' +
        '<path d="M8.7 6.9a7.2 7.2 0 0 1 6.6 1.8" stroke="#fff" stroke-width="1" fill="none"/>' +
        "</svg>"
    },
    en: {
      locale: "en-US",
      code: "en-US",
      nameKey: "lang.en",
      flag:
        '<svg class="flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">' +
        '<rect width="24" height="16" fill="#ffffff"/>' +
        '<g fill="#b22234">' +
        '<rect width="24" height="1.23"/><rect y="2.46" width="24" height="1.23"/>' +
        '<rect y="4.92" width="24" height="1.23"/><rect y="7.38" width="24" height="1.23"/>' +
        '<rect y="9.85" width="24" height="1.23"/><rect y="12.31" width="24" height="1.23"/>' +
        '<rect y="14.77" width="24" height="1.23"/>' +
        "</g>" +
        '<rect width="10.2" height="8.62" fill="#3c3b6e"/>' +
        "</svg>"
    },
    es: {
      locale: "es-ES",
      code: "es-ES",
      nameKey: "lang.es",
      flag:
        '<svg class="flag" viewBox="0 0 24 16" aria-hidden="true" focusable="false">' +
        '<rect width="24" height="16" fill="#aa151b"/>' +
        '<rect y="4" width="24" height="8" fill="#f1bf00"/>' +
        "</svg>"
    }
  };

  var dictionaries = window.INBARBER_TRANSLATIONS || {};
  var currentLang = FALLBACK;

  /* ----------------------------------------------------------------------
     Detecção e persistência
     ---------------------------------------------------------------------- */

  function normalize(tag) {
    if (!tag) return null;
    var base = String(tag).toLowerCase().split("-")[0];
    return SUPPORTED.indexOf(base) !== -1 ? base : null;
  }

  function readStored() {
    try {
      return normalize(window.localStorage.getItem(STORAGE_KEY));
    } catch (err) {
      // localStorage pode estar bloqueado (modo privado, cookies desativados).
      return null;
    }
  }

  function persist(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      /* silencioso: a troca continua valendo para a sessão atual */
    }
  }

  function detect() {
    var stored = readStored();
    if (stored) return stored;

    var candidates = [];
    if (navigator.languages && navigator.languages.length) {
      candidates = candidates.concat(Array.prototype.slice.call(navigator.languages));
    }
    if (navigator.language) candidates.push(navigator.language);

    for (var i = 0; i < candidates.length; i += 1) {
      var match = normalize(candidates[i]);
      if (match) return match;
    }
    return FALLBACK;
  }

  /* ----------------------------------------------------------------------
     Tradução
     ---------------------------------------------------------------------- */

  /**
   * Retorna a string traduzida da chave informada.
   * @param {string} key      chave do translations.js
   * @param {Object} [params] valores para interpolar em {placeholders}
   */
  function t(key, params) {
    var dict = dictionaries[currentLang] || {};
    var value = dict[key];

    if (value === undefined) {
      var fallbackDict = dictionaries[FALLBACK] || {};
      value = fallbackDict[key];
    }
    if (value === undefined) {
      if (window.console && console.warn) {
        console.warn("[InBarber i18n] chave sem tradução:", key);
      }
      return key;
    }
    if (!params) return value;

    return value.replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : match;
    });
  }

  /* ----------------------------------------------------------------------
     Formatação sensível ao idioma
     ---------------------------------------------------------------------- */

  function localeOf(lang) {
    return (LANGUAGES[lang] || LANGUAGES[FALLBACK]).locale;
  }

  function formatNumber(value, options) {
    try {
      return new Intl.NumberFormat(localeOf(currentLang), options).format(value);
    } catch (err) {
      return String(value);
    }
  }

  function formatRating(value) {
    return formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function formatPrice(value) {
    var currency = { pt: "BRL", en: "USD", es: "EUR" }[currentLang] || "BRL";
    try {
      return new Intl.NumberFormat(localeOf(currentLang), {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } catch (err) {
      return String(value);
    }
  }

  /* ----------------------------------------------------------------------
     Aplicação no DOM
     ---------------------------------------------------------------------- */

  function translateElement(el) {
    var key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);

    var htmlKey = el.getAttribute("data-i18n-html");
    if (htmlKey) el.innerHTML = t(htmlKey);

    var attrSpec = el.getAttribute("data-i18n-attr");
    if (attrSpec) {
      attrSpec.split("|").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var attrKey = parts[1].trim();
        if (attr && attrKey) el.setAttribute(attr, t(attrKey));
      });
    }
  }

  function applyToDocument(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll("[data-i18n], [data-i18n-html], [data-i18n-attr]");
    Array.prototype.forEach.call(nodes, translateElement);
  }

  function updateDocumentMeta() {
    document.documentElement.setAttribute("lang", localeOf(currentLang));

    var titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) titleEl.textContent = t(titleEl.getAttribute("data-i18n"));

    var metas = document.querySelectorAll("meta[data-i18n-content]");
    Array.prototype.forEach.call(metas, function (meta) {
      meta.setAttribute("content", t(meta.getAttribute("data-i18n-content")));
    });
  }

  /* ----------------------------------------------------------------------
     Seletores de idioma
     Cada [data-lang-select] tem um gatilho (bandeira + código) e um menu
     montado aqui, para que haja uma única fonte de verdade dos idiomas.
     ---------------------------------------------------------------------- */

  function renderLanguageControls() {
    var active = LANGUAGES[currentLang] || LANGUAGES[FALLBACK];

    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-flag]"), function (node) {
      node.innerHTML = active.flag;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-code]"), function (node) {
      node.textContent = active.code;
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-menu]"), function (menu) {
      menu.innerHTML = SUPPORTED.map(function (lang) {
        var meta = LANGUAGES[lang];
        var isActive = lang === currentLang;
        return (
          '<button type="button" class="lang-select__option" data-lang-option="' + lang + '"' +
          (isActive ? ' aria-current="true"' : "") + ">" +
          '<span class="lang-select__flag">' + meta.flag + "</span>" +
          '<span class="lang-select__code">' + meta.code + "</span>" +
          '<span class="lang-select__name">' + t(meta.nameKey) + "</span>" +
          "</button>"
        );
      }).join("");
    });
  }

  /* ----------------------------------------------------------------------
     API pública
     ---------------------------------------------------------------------- */

  function setLanguage(lang, options) {
    var next = normalize(lang) || FALLBACK;
    var changed = next !== currentLang;
    currentLang = next;

    if (!options || options.persist !== false) persist(currentLang);

    applyToDocument();
    updateDocumentMeta();
    renderLanguageControls();

    document.dispatchEvent(
      new CustomEvent("inbarber:languagechange", {
        detail: { lang: currentLang, changed: changed }
      })
    );
  }

  function getLanguage() {
    return currentLang;
  }

  function getLocale() {
    return localeOf(currentLang);
  }

  function bindSwitchers() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest ? event.target.closest("[data-lang-option]") : null;
      if (!trigger) return;
      event.preventDefault();
      setLanguage(trigger.getAttribute("data-lang-option"));
    });
  }

  function init() {
    document.documentElement.classList.remove("no-js");
    currentLang = detect();
    bindSwitchers();
    setLanguage(currentLang, { persist: false });
  }

  window.InBarberI18n = {
    init: init,
    t: t,
    apply: applyToDocument,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    getLocale: getLocale,
    formatNumber: formatNumber,
    formatRating: formatRating,
    formatPrice: formatPrice,
    languages: LANGUAGES,
    supported: SUPPORTED.slice()
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
