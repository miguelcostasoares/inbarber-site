/* ==========================================================================
   InBarber — Conta do visitante e barbearias favoritas

   O site é estático: não existe servidor de autenticação. Em vez de fingir
   um login que não existe, este módulo mantém uma sessão local — nome e
   e-mail guardados no próprio navegador — e é ela que destranca o coração
   dos cards. Quando o backend existir, basta trocar readUser()/signIn() por
   chamadas reais: todo o resto do site conversa com este módulo por eventos.

   API pública (window.InBarberAccount):
     isSignedIn()            sessão ativa?
     getUser()               { name, email } ou null
     signIn({ name, email }) inicia a sessão e avisa quem depende dela
     signOut()               encerra a sessão (as favoritas ficam guardadas)
     favorites()             ids das barbearias favoritas do usuário atual
     isFavorite(id)          essa barbearia está nas favoritas?
     toggleFavorite(id, name) alterna; sem sessão, abre o painel de entrada
     open(options)           abre o painel de entrada
     close()                 fecha o painel

   Eventos emitidos no document:
     inbarber:authchange       { user }       sessão iniciada ou encerrada
     inbarber:favoriteschange  { favorites }  lista de favoritas mudou

   Armazenamento (localStorage):
     inbarber:user                sessão atual
     inbarber:favorites:<e-mail>  favoritas por conta
   ========================================================================== */

(function (window, document) {
  "use strict";

  var i18n = window.InBarberI18n;

  var USER_KEY = "inbarber:user";
  var FAV_PREFIX = "inbarber:favorites:";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TOAST_MS = 3600;

  var ICON_USER =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 20.5v-1.8a4.2 4.2 0 0 0-4.2-4.2H9.2A4.2 4.2 0 0 0 5 18.7v1.8"/><circle cx="12" cy="7.5" r="3.8"/></svg>';
  var ICON_HEART =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7c-.3 0-.6-.1-.8-.3C7.6 17.5 3 14 3 9.9A4.9 4.9 0 0 1 12 7.2a4.9 4.9 0 0 1 9 2.7c0 4.1-4.6 7.6-8.2 10.5-.2.2-.5.3-.8.3Z"/></svg>';
  var ICON_LOGOUT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8"/><path d="m17 15 4-3-4-3"/><path d="M21 12H10"/></svg>';
  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

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
  function t(key, params) {
    return i18n ? i18n.t(key, params) : key;
  }

  /* ======================================================================
     Persistência — sempre tolerante ao modo privado
     ====================================================================== */
  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* silencioso: a sessão continua valendo até fechar a aba */
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      /* idem */
    }
  }

  function readUser() {
    var raw = read(USER_KEY);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.email || !EMAIL_RE.test(parsed.email)) return null;
      return { name: String(parsed.name || "").trim(), email: String(parsed.email).trim() };
    } catch (err) {
      return null;
    }
  }

  function favKey(account) {
    return FAV_PREFIX + account.email.toLowerCase();
  }

  function readFavorites(account) {
    if (!account) return [];
    var raw = read(favKey(account));
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (id) { return typeof id === "string"; }) : [];
    } catch (err) {
      return [];
    }
  }

  /* ======================================================================
     Estado
     ====================================================================== */
  var user = readUser();
  var favorites = readFavorites(user);

  /* Barbearia que o visitante tentou favoritar antes de ter conta: assim que
     a sessão começa, o coração que ficou pela metade é preenchido sozinho. */
  var pendingFavorite = null;

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail }));
  }

  function persistFavorites() {
    if (!user) return;
    write(favKey(user), JSON.stringify(favorites));
  }

  function isSignedIn() {
    return !!user;
  }

  function getUser() {
    return user ? { name: user.name, email: user.email } : null;
  }

  function isFavorite(id) {
    return favorites.indexOf(id) !== -1;
  }

  function signIn(candidate) {
    if (!candidate || !EMAIL_RE.test(String(candidate.email || ""))) return false;
    user = {
      name: String(candidate.name || "").trim(),
      email: String(candidate.email).trim()
    };
    write(USER_KEY, JSON.stringify(user));
    favorites = readFavorites(user);
    emit("inbarber:authchange", { user: getUser() });
    emit("inbarber:favoriteschange", { favorites: favorites.slice() });
    return true;
  }

  function signOut() {
    /* As favoritas ficam guardadas na chave da conta: quem volta reencontra
       a própria lista. Só a sessão é apagada. */
    user = null;
    favorites = [];
    remove(USER_KEY);
    emit("inbarber:authchange", { user: null });
    emit("inbarber:favoriteschange", { favorites: [] });
  }

  /**
   * Alterna a barbearia nas favoritas.
   * Sem conta, nada é salvo: o painel de entrada abre explicando o porquê e
   * a barbearia fica na fila para ser favoritada assim que a sessão começar.
   * @returns {boolean|null} novo estado, ou null quando não há sessão.
   */
  function toggleFavorite(id, name) {
    if (!user) {
      pendingFavorite = { id: id, name: name || "" };
      open({ reason: "favorite", shopName: name });
      return null;
    }

    var index = favorites.indexOf(id);
    var added = index === -1;
    if (added) favorites.push(id);
    else favorites.splice(index, 1);

    persistFavorites();
    emit("inbarber:favoriteschange", { favorites: favorites.slice(), id: id, favorite: added });
    if (name) toast(t(added ? "fav.saved" : "fav.removed", { name: name }));
    return added;
  }

  /* ======================================================================
     Corações dos cards

     O markup do botão é escrito pelo main.js junto do card; aqui cuidamos do
     clique e de manter todos os botões da mesma barbearia em sincronia —
     inclusive o rótulo, que muda de idioma e de estado.
     ====================================================================== */
  function syncFavButtons() {
    qsa("[data-fav]").forEach(function (button) {
      var id = button.getAttribute("data-fav");
      var name = button.getAttribute("data-fav-name") || "";
      var active = isFavorite(id);
      var label = user
        ? t(active ? "fav.remove" : "fav.add", { name: name })
        : t("fav.locked", { name: name });

      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      if (user) button.removeAttribute("data-fav-locked");
      else button.setAttribute("data-fav-locked", "");
    });
  }

  function bindFavButtons() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("[data-fav]") : null;
      if (!button) return;
      /* O card inteiro é um link; o coração não pode levar junto para o perfil. */
      event.preventDefault();
      event.stopPropagation();

      var state = toggleFavorite(button.getAttribute("data-fav"), button.getAttribute("data-fav-name") || "");
      if (state !== null) {
        button.classList.remove("is-beating");
        /* reinicia a animação mesmo em cliques seguidos */
        void button.offsetWidth;
        if (state) button.classList.add("is-beating");
      }
      syncFavButtons();
    });
  }

  /* ======================================================================
     Aviso passageiro (o coração fica longe do olho quando se rola a página)
     ====================================================================== */
  var toastNode = null;
  var toastTimer = null;

  function toast(message) {
    if (!toastNode) {
      toastNode = document.createElement("div");
      toastNode.className = "account-toast";
      toastNode.setAttribute("role", "status");
      toastNode.setAttribute("aria-live", "polite");
      document.body.appendChild(toastNode);
    }
    toastNode.textContent = message;
    toastNode.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastNode.classList.remove("is-visible");
    }, TOAST_MS);
  }

  /* ======================================================================
     Painel de entrada
     ====================================================================== */
  var panel = null;
  var lastFocused = null;
  var closeTimer = null;

  function buildPanel() {
    panel = document.createElement("div");
    panel.className = "account-panel";
    panel.setAttribute("data-account-panel", "");
    panel.hidden = true;
    panel.innerHTML =
      '<div class="account-panel__backdrop" data-account-dismiss></div>' +
      '<div class="account-panel__dialog" role="dialog" aria-modal="true" aria-labelledby="account-panel-title">' +
        '<button type="button" class="account-panel__close" data-account-dismiss>' + ICON_CLOSE + "</button>" +
        '<span class="account-panel__mark" aria-hidden="true">' + ICON_HEART + "</span>" +
        '<h2 class="account-panel__title" id="account-panel-title"></h2>' +
        '<p class="account-panel__intro" data-account-intro></p>' +
        '<form class="account-panel__form" novalidate>' +
          '<div class="field">' +
            '<label class="field__label" for="account-name"></label>' +
            '<input class="input" id="account-name" name="name" type="text" autocomplete="name" required>' +
          "</div>" +
          '<div class="field">' +
            '<label class="field__label" for="account-email"></label>' +
            '<input class="input" id="account-email" name="email" type="email" autocomplete="email" required>' +
          "</div>" +
          '<p class="account-panel__error" data-account-error role="alert" hidden></p>' +
          '<button class="btn btn--gradient btn--lg account-panel__submit" type="submit"></button>' +
        "</form>" +
        '<p class="account-panel__note"></p>' +
      "</div>";

    document.body.appendChild(panel);

    qsa("[data-account-dismiss]", panel).forEach(function (node) {
      node.addEventListener("click", close);
    });

    qs("form", panel).addEventListener("submit", onSubmit);

    panel.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      trapFocus(event);
    });

    translatePanel();
  }

  /** O foco não escapa do diálogo enquanto ele estiver aberto. */
  function trapFocus(event) {
    var focusable = qsa(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      qs(".account-panel__dialog", panel)
    ).filter(function (node) {
      return !node.disabled && node.offsetParent !== null;
    });
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function translatePanel() {
    if (!panel) return;
    qs(".account-panel__title", panel).textContent = t("account.title");
    qs(".account-panel__close", panel).setAttribute("aria-label", t("account.close"));
    qs('label[for="account-name"]', panel).textContent = t("account.nameLabel");
    qs('label[for="account-email"]', panel).textContent = t("account.emailLabel");
    qs("#account-name", panel).setAttribute("placeholder", t("account.namePlaceholder"));
    qs("#account-email", panel).setAttribute("placeholder", t("account.emailPlaceholder"));
    qs(".account-panel__submit", panel).textContent = t("account.submit");
    qs(".account-panel__note", panel).textContent = t("account.note");

    var intro = qs("[data-account-intro]", panel);
    var shopName = panel.getAttribute("data-account-shop");
    intro.textContent = shopName
      ? t("account.introFavorite", { name: shopName })
      : t("account.intro");
  }

  function open(options) {
    if (user) return;
    if (!panel) buildPanel();

    var shopName = options && options.shopName ? options.shopName : "";
    if (shopName) panel.setAttribute("data-account-shop", shopName);
    else panel.removeAttribute("data-account-shop");

    translatePanel();
    clearError();

    lastFocused = document.activeElement;
    window.clearTimeout(closeTimer);
    panel.hidden = false;
    document.documentElement.classList.add("has-panel-open");

    window.requestAnimationFrame(function () {
      panel.classList.add("is-open");
      var field = qs("#account-name", panel);
      if (field) field.focus();
    });
  }

  function close() {
    if (!panel || panel.hidden) return;
    panel.classList.remove("is-open");
    document.documentElement.classList.remove("has-panel-open");
    pendingFavorite = null;

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      panel.hidden = true;
    }, 180);

    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  function clearError() {
    if (!panel) return;
    var box = qs("[data-account-error]", panel);
    box.hidden = true;
    box.textContent = "";
    qsa(".field", panel).forEach(function (field) {
      field.classList.remove("has-error");
    });
  }

  function showError(message, field) {
    var box = qs("[data-account-error]", panel);
    box.textContent = message;
    box.hidden = false;
    if (field) {
      field.closest(".field").classList.add("has-error");
      field.focus();
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    clearError();

    var nameField = qs("#account-name", panel);
    var emailField = qs("#account-email", panel);
    var name = nameField.value.trim();
    var email = emailField.value.trim();

    if (name.length < 2) {
      showError(t("account.errorName"), nameField);
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showError(t("account.errorEmail"), emailField);
      return;
    }

    var wanted = pendingFavorite;
    signIn({ name: name, email: email });

    nameField.value = "";
    emailField.value = "";
    close();

    if (wanted && !isFavorite(wanted.id)) {
      toggleFavorite(wanted.id, wanted.name);
    } else {
      toast(t("account.greeting", { name: firstName(user.name) }));
    }
  }

  /* ======================================================================
     Botão da conta no header

     Deslogado: "Iniciar sessão", que abre o painel.
     Logado: iniciais + primeiro nome, que abrem o menu da conta.
     ====================================================================== */
  function firstName(value) {
    return String(value || "").split(/\s+/)[0] || "";
  }

  function initials(value) {
    var parts = String(value || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function favoritesLabel() {
    if (!favorites.length) return t("account.favoritesNone");
    if (favorites.length === 1) return t("account.favoritesOne");
    return t("account.favoritesMany", {
      count: i18n ? i18n.formatNumber(favorites.length) : favorites.length
    });
  }

  function renderHeader() {
    qsa("[data-account]").forEach(function (root) {
      var button = qs("[data-signin]", root);
      var menu = qs("[data-account-menu]", root);
      if (!button) return;

      if (user) {
        button.classList.add("header__signin--account");
        button.classList.remove("btn--gradient");
        button.classList.add("btn--ghost");
        button.setAttribute("aria-haspopup", "true");
        button.setAttribute("aria-expanded", menu && !menu.hidden ? "true" : "false");
        button.setAttribute("aria-label", t("account.menuLabel"));
        button.innerHTML =
          '<span class="account-avatar" aria-hidden="true">' + escapeHtml(initials(user.name)) + "</span>" +
          '<span class="header__signin-label">' + escapeHtml(firstName(user.name)) + "</span>";
      } else {
        button.classList.remove("header__signin--account", "btn--ghost");
        button.classList.add("btn--gradient");
        button.removeAttribute("aria-haspopup");
        button.removeAttribute("aria-expanded");
        button.setAttribute("aria-label", t("nav.signIn"));
        button.innerHTML =
          ICON_USER + '<span class="header__signin-label">' + escapeHtml(t("nav.signIn")) + "</span>";
      }

      if (!menu) return;
      if (!user) {
        menu.hidden = true;
        menu.innerHTML = "";
        return;
      }

      menu.setAttribute("aria-label", t("account.menuLabel"));
      menu.innerHTML =
        '<p class="account-menu__label">' + escapeHtml(t("account.signedInAs")) + "</p>" +
        '<p class="account-menu__email">' + escapeHtml(user.email) + "</p>" +
        '<p class="account-menu__favorites">' + ICON_HEART + "<span>" + escapeHtml(favoritesLabel()) + "</span></p>" +
        '<button type="button" class="account-menu__signout" data-account-signout>' +
          ICON_LOGOUT + "<span>" + escapeHtml(t("account.signOut")) + "</span>" +
        "</button>";
    });
  }

  function closeMenus(except) {
    qsa("[data-account]").forEach(function (root) {
      if (root === except) return;
      var menu = qs("[data-account-menu]", root);
      var button = qs("[data-signin]", root);
      if (menu) menu.hidden = true;
      if (button && user) button.setAttribute("aria-expanded", "false");
    });
  }

  function toggleMenu(root) {
    var menu = qs("[data-account-menu]", root);
    var button = qs("[data-signin]", root);
    if (!menu || !button) return;
    var willOpen = menu.hidden;
    closeMenus(root);
    menu.hidden = !willOpen;
    button.setAttribute("aria-expanded", willOpen ? "true" : "false");
  }

  function bindHeader() {
    document.addEventListener("click", function (event) {
      var signout = event.target.closest ? event.target.closest("[data-account-signout]") : null;
      if (signout) {
        signOut();
        closeMenus(null);
        return;
      }
      if (!event.target.closest || !event.target.closest("[data-account]")) closeMenus(null);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenus(null);
    });

    /* O main.js já dispara "inbarber:signin" no clique do botão do header —
       este módulo é quem responde por ele. Com sessão ativa, o mesmo botão
       abre o menu da conta em vez do painel. */
    document.addEventListener("inbarber:signin", function () {
      var root = qs("[data-account]");
      if (user) {
        if (root) toggleMenu(root);
      } else {
        open({ reason: "header" });
      }
    });
  }

  /* ======================================================================
     Início
     ====================================================================== */
  function refresh() {
    renderHeader();
    syncFavButtons();
  }

  function init() {
    bindHeader();
    bindFavButtons();
    refresh();

    document.addEventListener("inbarber:authchange", refresh);
    document.addEventListener("inbarber:favoriteschange", refresh);
    document.addEventListener("inbarber:languagechange", function () {
      translatePanel();
      refresh();
    });
  }

  window.InBarberAccount = {
    isSignedIn: isSignedIn,
    getUser: getUser,
    signIn: signIn,
    signOut: signOut,
    favorites: function () {
      return favorites.slice();
    },
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    syncFavButtons: syncFavButtons,
    open: open,
    close: close
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
