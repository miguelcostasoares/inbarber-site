/* =============================================================================
   InBarber — Barbearias em Destaque (motor do carrossel)
   -----------------------------------------------------------------------------
   Vanilla JS, sem dependências. Monta o carrossel dentro de [data-destaques].

   As quatro regras que sustentam o produto comercial:

   1. VIGÊNCIA AUTOMÁTICA  — só entra no ar quem tem contrato válido hoje.
                             Contrato vencido some sem deploy (`vigente()`).
   2. RELEVÂNCIA GEOGRÁFICA — destaques da cidade do visitante primeiro; o pool
                             nacional completa os slots (`selecionar()`).
   3. ROTAÇÃO JUSTA        — quem foi menos exibido para este visitante abre a
                             fila, com desempate aleatório (`ordenarComJustica()`).
   4. RÓTULO DE PATROCINADO — todo slide carrega o selo, visível e no leitor de
                             tela (`montarSlide()`).

   Métricas: eventos `destaque_impressao` e `destaque_clique` no GA4 (gtag) com
   fallback para dataLayer. Nunca lança erro se nenhum dos dois existir.
============================================================================= */
(function (global, doc) {
  'use strict';

  var FONTE = global.INBARBER_DESTAQUES || { cidades: [], destaques: [], raioMaxKm: 250 };

  var CFG = {
    /* Escassez sustenta o preço: poucos slots, cada um com exposição real. */
    maxSlots: 5,
    intervaloMs: 7000,
    raioMaxKm: FONTE.raioMaxKm || 250,

    /* Quando não sabemos a cidade do visitante, os anúncios de plano 'cidade'
       entram para completar o hero. É exposição de bônus — não prejudica o
       anunciante e evita um hero quase vazio. Coloque `false` para servir
       apenas o pool nacional a quem não foi geolocalizado. */
    preencherComLocais: true,

    chaveCidade: 'inbarber:cidade',
    chaveImpressoes: 'inbarber:destaques:impressoes',

    /* Só usado quando o destaque aponta para fora do site (`urlExterna`). */
    utmSource: 'inbarber',
    utmMedium: 'destaque-hero'
  };

  var IDIOMAS = ['pt-BR', 'en-US', 'es-ES'];
  var PADRAO = 'pt-BR';

  /* ==========================================================================
     Utilidades
     ========================================================================== */

  function normalizarIdioma(tag) {
    if (!tag) return PADRAO;
    var base = String(tag).toLowerCase().slice(0, 2);
    if (base === 'en') return 'en-US';
    if (base === 'es') return 'es-ES';
    return PADRAO;
  }

  function idiomaAtivo() {
    return normalizarIdioma(doc.documentElement.getAttribute('lang') || global.navigator.language);
  }

  /* Usa o t() do projeto quando existir; senão lê o dicionário direto. */
  function t(chave, vars) {
    var texto = null;
    var app = global.InBarber || global.inbarber;

    try {
      if (app && app.i18n && typeof app.i18n.t === 'function') texto = app.i18n.t(chave);
      else if (global.i18n && typeof global.i18n.t === 'function') texto = global.i18n.t(chave);
    } catch (e) { texto = null; }

    if (!texto || texto === chave) {
      var dic = global.INBARBER_TRANSLATIONS || {};
      var atual = dic[idiomaAtivo()] || {};
      var base = dic[PADRAO] || {};
      texto = atual[chave] || base[chave] || chave;
    }

    if (vars) {
      Object.keys(vars).forEach(function (k) {
        texto = texto.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return texto;
  }

  function numero(valor, casas) {
    try {
      return new Intl.NumberFormat(idiomaAtivo(), {
        minimumFractionDigits: casas || 0,
        maximumFractionDigits: casas || 0
      }).format(valor);
    } catch (e) {
      return String(valor);
    }
  }

  function guardar(chave, valor) {
    try { global.localStorage.setItem(chave, valor); } catch (e) { /* modo privado */ }
  }

  function ler(chave) {
    try { return global.localStorage.getItem(chave); } catch (e) { return null; }
  }

  function el(tag, classe, texto) {
    var n = doc.createElement(tag);
    if (classe) n.className = classe;
    /* textContent sempre: a copy vem do anunciante e não pode virar HTML. */
    if (texto != null) n.textContent = texto;
    return n;
  }

  /* ==========================================================================
     1. Vigência automática
     ========================================================================== */

  function hojeISO() {
    var d = new Date();
    var mes = String(d.getMonth() + 1);
    var dia = String(d.getDate());
    return d.getFullYear() + '-' +
      (mes.length < 2 ? '0' + mes : mes) + '-' +
      (dia.length < 2 ? '0' + dia : dia);
  }

  /* Comparação lexicográfica de datas ISO: sem parsing, sem fuso, sem surpresa. */
  function vigente(d) {
    var hoje = hojeISO();
    return (!d.inicio || d.inicio <= hoje) && (!d.fim || d.fim >= hoje);
  }

  /* ==========================================================================
     2. Relevância geográfica
     ========================================================================== */

  function haversine(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad;
    var dLng = (lng2 - lng1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function cidadeMaisProxima(lat, lng) {
    var melhor = null;
    FONTE.cidades.forEach(function (c) {
      var dist = haversine(lat, lng, c.lat, c.lng);
      if (!melhor || dist < melhor.distancia) melhor = { cidade: c, distancia: dist };
    });
    return melhor;
  }

  function cidadePorId(id) {
    var achada = null;
    FONTE.cidades.forEach(function (c) { if (c.id === id) achada = c; });
    return achada;
  }

  /* ==========================================================================
     3. Rotação justa
     ========================================================================== */

  function lerImpressoes() {
    try { return JSON.parse(ler(CFG.chaveImpressoes) || '{}') || {}; }
    catch (e) { return {}; }
  }

  function registrarImpressao(id) {
    var mapa = lerImpressoes();
    mapa[id] = (mapa[id] || 0) + 1;

    /* Impede crescimento sem fim: ao passar de 500, divide todos pela metade e
       preserva a proporção entre anunciantes. */
    var maior = 0;
    Object.keys(mapa).forEach(function (k) { if (mapa[k] > maior) maior = mapa[k]; });
    if (maior > 500) {
      Object.keys(mapa).forEach(function (k) { mapa[k] = Math.floor(mapa[k] / 2); });
    }

    guardar(CFG.chaveImpressoes, JSON.stringify(mapa));
  }

  function embaralhar(lista) {
    for (var i = lista.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = lista[i]; lista[i] = lista[j]; lista[j] = tmp;
    }
    return lista;
  }

  /* Embaralha e depois ordena por número de exibições. Como o sort é estável,
     quem tem a mesma contagem sai em ordem aleatória — ninguém fica preso à
     primeira posição nem ao rodapé da fila. */
  function ordenarComJustica(lista) {
    var imp = lerImpressoes();
    embaralhar(lista);
    return lista.sort(function (a, b) {
      return (imp[a.id] || 0) - (imp[b.id] || 0);
    });
  }

  function selecionar(cidadeId) {
    var validos = FONTE.destaques.filter(vigente);
    var locais = [];
    var nacionais = [];
    var outros = [];

    validos.forEach(function (d) {
      if (cidadeId && d.cidade === cidadeId) locais.push(d);
      else if (d.plano === 'nacional') nacionais.push(d);
      else outros.push(d);
    });

    var lista = ordenarComJustica(locais).concat(ordenarComJustica(nacionais));

    if (!cidadeId && CFG.preencherComLocais) {
      lista = lista.concat(ordenarComJustica(outros));
    }

    return lista.slice(0, CFG.maxSlots);
  }

  /* ==========================================================================
     Métricas — GA4 com fallback para dataLayer
     ========================================================================== */

  function medir(evento, dados) {
    try {
      if (typeof global.gtag === 'function') {
        global.gtag('event', evento, dados);
        return;
      }
      global.dataLayer = global.dataLayer || [];
      var carga = { event: evento };
      Object.keys(dados).forEach(function (k) { carga[k] = dados[k]; });
      global.dataLayer.push(carga);
    } catch (e) { /* medição nunca pode derrubar a página */ }
  }

  function destino(d, posicao) {
    if (d.urlExterna) {
      var sep = d.urlExterna.indexOf('?') === -1 ? '?' : '&';
      return d.urlExterna + sep +
        'utm_source=' + encodeURIComponent(CFG.utmSource) +
        '&utm_medium=' + encodeURIComponent(CFG.utmMedium) +
        '&utm_campaign=' + encodeURIComponent(d.id);
    }
    return 'barbearia.html?id=' + encodeURIComponent(d.id) +
      '&ref=destaque-hero&pos=' + posicao;
  }

  /* ==========================================================================
     Construção do DOM
     ========================================================================== */

  function montarEstrelas(nota) {
    var caixa = el('span', 'estrelas');
    caixa.setAttribute('aria-hidden', 'true');

    var fundo = el('span', 'estrelas__fundo');
    var frente = el('span', 'estrelas__frente');
    fundo.textContent = '★★★★★';
    frente.textContent = '★★★★★';
    frente.style.width = Math.max(0, Math.min(100, (nota / 5) * 100)) + '%';

    caixa.appendChild(fundo);
    caixa.appendChild(frente);
    return caixa;
  }

  function montarSlide(d, indice, total) {
    var idioma = idiomaAtivo();

    var item = el('li', 'destaque');
    item.setAttribute('role', 'group');
    item.setAttribute('aria-roledescription', 'slide');
    item.setAttribute('aria-label', t('destaques.slide', { atual: indice + 1, total: total }));
    item.dataset.id = d.id;
    if (indice !== 0) item.setAttribute('aria-hidden', 'true');

    var link = el('a', 'destaque__link');
    link.href = destino(d, indice + 1);
    link.setAttribute('aria-label', d.nome + ' — ' + t('destaques.verPerfil'));

    /* Foto ---------------------------------------------------------------- */
    var moldura = el('span', 'destaque__moldura');
    var img = doc.createElement('img');
    img.className = 'destaque__foto';
    img.src = d.foto;
    img.alt = d.nome + ' — ' + d.bairro;
    img.decoding = 'async';
    /* Primeiro slide entra no LCP; os demais podem esperar. */
    if (indice === 0) {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.loading = 'lazy';
    }
    img.addEventListener('error', function () {
      moldura.classList.add('destaque__moldura--sem-foto');
      img.remove();
    });
    moldura.appendChild(img);

    /* Rótulo de patrocinado ------------------------------------------------ */
    var rotulo = el('span', 'destaque__rotulo', t('destaques.rotulo'));
    rotulo.title = t('destaques.rotuloAria');
    var rotuloSr = el('span', 'sr-only', ' ' + t('destaques.rotuloAria'));
    rotulo.appendChild(rotuloSr);
    moldura.appendChild(rotulo);

    /* Informação ------------------------------------------------------------ */
    var info = el('span', 'destaque__info');

    var nome = el('span', 'destaque__nome', d.nome);
    var cidade = cidadePorId(d.cidade);
    var local = el('span', 'destaque__local',
      d.bairro + (cidade ? ' · ' + cidade.nome + '/' + cidade.uf : ''));

    var chamada = el('span', 'destaque__chamada',
      (d.chamada && (d.chamada[idioma] || d.chamada[PADRAO])) || '');

    var nota = el('span', 'destaque__nota');
    nota.appendChild(montarEstrelas(d.nota));
    nota.appendChild(el('strong', 'destaque__notaValor', numero(d.nota, 1)));
    nota.appendChild(el('small', 'destaque__avaliacoes',
      t('destaques.avaliacoes', { n: numero(d.avaliacoes) })));

    var cta = el('span', 'destaque__cta', t('destaques.verPerfil'));

    info.appendChild(nome);
    info.appendChild(local);
    if (chamada.textContent) info.appendChild(chamada);
    info.appendChild(nota);
    info.appendChild(cta);

    link.appendChild(moldura);
    link.appendChild(info);
    item.appendChild(link);

    link.addEventListener('click', function () {
      medir('destaque_clique', {
        destaque_id: d.id,
        destaque_nome: d.nome,
        posicao: indice + 1,
        plano: d.plano,
        cidade: d.cidade
      });
    });

    return item;
  }

  /* ==========================================================================
     Carrossel
     ========================================================================== */

  function Carrossel(raiz) {
    this.raiz = raiz;
    this.indice = 0;
    this.timer = null;
    this.pausadoManual = false;
    this.jaMedidos = {};
    this.cidadeId = ler(CFG.chaveCidade) || null;
    this.escopo = this.cidadeId ? 'cidade' : 'nacional';

    this.reduzirMovimento = global.matchMedia
      ? global.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    this.construirEsqueleto();
    this.recarregar();
    this.observarIdioma();
    this.observarVisibilidade();
  }

  Carrossel.prototype.construirEsqueleto = function () {
    var self = this;
    this.raiz.classList.add('destaques');
    this.raiz.innerHTML = '';

    /* Cabeçalho ------------------------------------------------------------ */
    var cabecalho = el('div', 'destaques__cabecalho');
    this.titulo = el('h2', 'destaques__titulo');
    this.titulo.setAttribute('data-i18n', 'destaques.titulo');
    this.escopoTag = el('span', 'destaques__escopo');
    cabecalho.appendChild(this.titulo);
    cabecalho.appendChild(this.escopoTag);

    /* Palco ---------------------------------------------------------------- */
    this.palco = el('div', 'destaques__palco');
    this.palco.setAttribute('role', 'group');
    this.palco.setAttribute('aria-roledescription', 'carrossel');

    this.trilha = el('ul', 'destaques__trilha');
    this.trilha.setAttribute('aria-live', 'polite');
    this.palco.appendChild(this.trilha);

    this.btnAnterior = el('button', 'destaques__seta destaques__seta--anterior');
    this.btnAnterior.type = 'button';
    this.btnAnterior.innerHTML = seta('anterior');
    this.btnAnterior.addEventListener('click', function () { self.mover(-1, true); });

    this.btnProximo = el('button', 'destaques__seta destaques__seta--proximo');
    this.btnProximo.type = 'button';
    this.btnProximo.innerHTML = seta('proximo');
    this.btnProximo.addEventListener('click', function () { self.mover(1, true); });

    this.palco.appendChild(this.btnAnterior);
    this.palco.appendChild(this.btnProximo);

    /* Rodapé --------------------------------------------------------------- */
    var rodape = el('div', 'destaques__rodape');
    this.pontos = el('ol', 'destaques__pontos');

    this.btnPausa = el('button', 'destaques__pausa');
    this.btnPausa.type = 'button';
    this.btnPausa.addEventListener('click', function () {
      self.pausadoManual = !self.pausadoManual;
      if (self.pausadoManual) self.parar(); else self.iniciar();
      self.sincronizarPausa();
    });

    this.btnPerto = el('button', 'destaques__perto');
    this.btnPerto.type = 'button';
    this.btnPerto.addEventListener('click', function () { self.localizar(); });

    rodape.appendChild(this.pontos);
    rodape.appendChild(this.btnPausa);

    this.aviso = el('p', 'destaques__aviso');
    this.aviso.setAttribute('role', 'status');

    this.raiz.appendChild(cabecalho);
    this.raiz.appendChild(this.palco);
    this.raiz.appendChild(rodape);
    this.raiz.appendChild(this.btnPerto);
    this.raiz.appendChild(this.aviso);

    /* Pausa ao passar o mouse ou ao focar por teclado. */
    this.palco.addEventListener('mouseenter', function () { self.parar(); });
    this.palco.addEventListener('mouseleave', function () { if (!self.pausadoManual) self.iniciar(); });
    this.raiz.addEventListener('focusin', function () { self.parar(); });
    this.raiz.addEventListener('focusout', function () {
      if (!self.pausadoManual && !self.raiz.contains(doc.activeElement)) self.iniciar();
    });

    this.raiz.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); self.mover(1, true); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); self.mover(-1, true); }
    });
  };

  function seta(direcao) {
    var d = direcao === 'anterior' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7';
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  Carrossel.prototype.recarregar = function () {
    var self = this;
    this.itens = selecionar(this.cidadeId);
    this.indice = 0;
    this.jaMedidos = {};
    this.trilha.innerHTML = '';
    this.pontos.innerHTML = '';

    if (!this.itens.length) return this.mostrarVazio();

    this.raiz.classList.remove('destaques--vazio');

    this.itens.forEach(function (d, i) {
      self.trilha.appendChild(montarSlide(d, i, self.itens.length));

      var li = el('li', 'destaques__ponto');
      var b = el('button');
      b.type = 'button';
      b.setAttribute('aria-label', t('destaques.irPara', { n: i + 1 }));
      b.addEventListener('click', function () { self.ir(i, true); });
      li.appendChild(b);
      self.pontos.appendChild(li);
    });

    /* Um slide só não precisa de controles. */
    var varios = this.itens.length > 1;
    this.palco.classList.toggle('destaques__palco--unico', !varios);
    this.btnAnterior.hidden = !varios;
    this.btnProximo.hidden = !varios;
    this.btnPausa.hidden = !varios || this.reduzirMovimento;
    this.pontos.hidden = !varios;

    this.aplicarTextos();
    this.ir(0, false);
    this.observarViewport();
    if (varios && !this.reduzirMovimento && !this.pausadoManual) this.iniciar();
  };

  Carrossel.prototype.mostrarVazio = function () {
    this.raiz.classList.add('destaques--vazio');
    this.btnAnterior.hidden = true;
    this.btnProximo.hidden = true;
    this.btnPausa.hidden = true;
    this.pontos.hidden = true;
    this.parar();

    var caixa = el('li', 'destaque destaque--vazio');
    caixa.appendChild(el('span', 'destaque__nome', t('destaques.vazioTitulo')));
    caixa.appendChild(el('span', 'destaque__chamada', t('destaques.vazioTexto')));

    var cta = el('a', 'destaque__cta destaque__cta--vazio', t('destaques.anuncie'));
    cta.href = 'para-barbearias.html';
    caixa.appendChild(cta);

    this.trilha.appendChild(caixa);
    this.aplicarTextos();
  };

  Carrossel.prototype.ir = function (i, manual) {
    if (!this.itens.length) return;
    var total = this.itens.length;
    this.indice = ((i % total) + total) % total;

    var slides = this.trilha.children;
    for (var s = 0; s < slides.length; s++) {
      var ativo = s === this.indice;
      slides[s].classList.toggle('destaque--ativo', ativo);
      if (ativo) slides[s].removeAttribute('aria-hidden');
      else slides[s].setAttribute('aria-hidden', 'true');
      var a = slides[s].querySelector('a');
      if (a) a.tabIndex = ativo ? 0 : -1;
    }

    var botoes = this.pontos.querySelectorAll('button');
    for (var p = 0; p < botoes.length; p++) {
      var atual = p === this.indice;
      botoes[p].classList.toggle('is-ativo', atual);
      botoes[p].setAttribute('aria-current', atual ? 'true' : 'false');
    }

    if (manual) this.reiniciarTimer();
    this.medirImpressao();
  };

  Carrossel.prototype.mover = function (passo, manual) {
    this.ir(this.indice + passo, manual);
  };

  Carrossel.prototype.iniciar = function () {
    if (this.timer || this.reduzirMovimento || this.itens.length < 2) return;
    var self = this;
    this.timer = global.setInterval(function () { self.mover(1, false); }, CFG.intervaloMs);
    this.raiz.classList.add('destaques--rodando');
    this.sincronizarPausa();
  };

  Carrossel.prototype.parar = function () {
    if (this.timer) { global.clearInterval(this.timer); this.timer = null; }
    this.raiz.classList.remove('destaques--rodando');
    this.sincronizarPausa();
  };

  Carrossel.prototype.reiniciarTimer = function () {
    if (!this.timer || this.pausadoManual) return;
    this.parar();
    this.iniciar();
  };

  Carrossel.prototype.sincronizarPausa = function () {
    if (!this.btnPausa) return;
    var rodando = !!this.timer;
    this.btnPausa.setAttribute('aria-pressed', rodando ? 'false' : 'true');
    this.btnPausa.setAttribute('aria-label', rodando ? t('destaques.pausar') : t('destaques.retomar'));
    this.btnPausa.classList.toggle('is-pausado', !rodando);
    this.btnPausa.innerHTML = rodando
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  };

  /* Impressão só conta quando o slide está ativo E visível na tela. */
  Carrossel.prototype.observarViewport = function () {
    var self = this;
    this.visivel = true;
    if (!global.IntersectionObserver) return;
    if (this.observador) this.observador.disconnect();

    this.observador = new global.IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        self.visivel = e.isIntersecting;
        if (self.visivel) self.medirImpressao();
      });
    }, { threshold: 0.5 });

    this.observador.observe(this.raiz);
  };

  Carrossel.prototype.medirImpressao = function () {
    if (!this.visivel || !this.itens.length) return;
    var d = this.itens[this.indice];
    if (!d || this.jaMedidos[d.id]) return;

    this.jaMedidos[d.id] = true;
    registrarImpressao(d.id);

    medir('destaque_impressao', {
      destaque_id: d.id,
      destaque_nome: d.nome,
      posicao: this.indice + 1,
      plano: d.plano,
      cidade: d.cidade,
      escopo: this.escopo
    });
  };

  /* Geolocalização só a pedido do visitante — nunca no carregamento. */
  Carrossel.prototype.localizar = function () {
    var self = this;
    if (!global.navigator.geolocation) {
      this.aviso.textContent = t('destaques.semLocalizacao');
      return;
    }

    this.btnPerto.disabled = true;
    this.aviso.textContent = t('destaques.localizando');

    global.navigator.geolocation.getCurrentPosition(function (pos) {
      self.btnPerto.disabled = false;
      var perto = cidadeMaisProxima(pos.coords.latitude, pos.coords.longitude);

      if (!perto || perto.distancia > CFG.raioMaxKm) {
        self.cidadeId = null;
        self.escopo = 'nacional';
        self.aviso.textContent = t('destaques.foraDeArea');
      } else {
        self.cidadeId = perto.cidade.id;
        self.escopo = 'perto';
        guardar(CFG.chaveCidade, self.cidadeId);
        self.aviso.textContent = '';
      }
      self.recarregar();
    }, function () {
      self.btnPerto.disabled = false;
      self.aviso.textContent = t('destaques.semLocalizacao');
    }, { timeout: 8000, maximumAge: 600000 });
  };

  /* Reaplica os textos sem remontar o DOM quando o idioma muda. */
  Carrossel.prototype.aplicarTextos = function () {
    var self = this;

    this.titulo.textContent = t('destaques.titulo');
    this.palco.setAttribute('aria-label', t('destaques.carrossel'));
    this.btnAnterior.setAttribute('aria-label', t('destaques.anterior'));
    this.btnProximo.setAttribute('aria-label', t('destaques.proximo'));
    this.btnPerto.textContent = t('destaques.pertoDeVoce');
    this.sincronizarPausa();

    var cidade = cidadePorId(this.cidadeId);
    if (this.escopo === 'perto' && cidade) {
      this.escopoTag.textContent = t('destaques.escopoPerto');
      this.escopoTag.hidden = false;
      this.btnPerto.hidden = true;
    } else if (cidade) {
      this.escopoTag.textContent = t('destaques.escopoCidade', { cidade: cidade.nome });
      this.escopoTag.hidden = false;
      this.btnPerto.hidden = false;
    } else {
      this.escopoTag.textContent = t('destaques.escopoNacional');
      this.escopoTag.hidden = false;
      this.btnPerto.hidden = false;
    }

    var slides = this.trilha.querySelectorAll('.destaque');
    Array.prototype.forEach.call(slides, function (slide, i) {
      var d = self.itens[i];
      if (!d) return;
      slide.setAttribute('aria-label', t('destaques.slide', { atual: i + 1, total: self.itens.length }));

      var campo = function (sel) { return slide.querySelector(sel); };
      if (campo('.destaque__rotulo')) {
        campo('.destaque__rotulo').childNodes[0].nodeValue = t('destaques.rotulo');
        campo('.destaque__rotulo').title = t('destaques.rotuloAria');
      }
      if (campo('.sr-only')) campo('.sr-only').textContent = ' ' + t('destaques.rotuloAria');
      if (campo('.destaque__chamada')) {
        campo('.destaque__chamada').textContent =
          (d.chamada && (d.chamada[idiomaAtivo()] || d.chamada[PADRAO])) || '';
      }
      if (campo('.destaque__notaValor')) campo('.destaque__notaValor').textContent = numero(d.nota, 1);
      if (campo('.destaque__avaliacoes')) {
        campo('.destaque__avaliacoes').textContent =
          t('destaques.avaliacoes', { n: numero(d.avaliacoes) });
      }
      if (campo('.destaque__cta')) campo('.destaque__cta').textContent = t('destaques.verPerfil');
      if (campo('.destaque__link')) {
        campo('.destaque__link').setAttribute('aria-label', d.nome + ' — ' + t('destaques.verPerfil'));
      }
    });

    var pontos = this.pontos.querySelectorAll('button');
    Array.prototype.forEach.call(pontos, function (b, i) {
      b.setAttribute('aria-label', t('destaques.irPara', { n: i + 1 }));
    });
  };

  /* Funciona com qualquer i18n: observa o atributo lang do <html>. */
  Carrossel.prototype.observarIdioma = function () {
    var self = this;
    var reagir = function () { self.aplicarTextos(); };

    doc.addEventListener('inbarber:idioma', reagir);
    doc.addEventListener('inbarber:languagechange', reagir);

    if (global.MutationObserver) {
      new global.MutationObserver(reagir).observe(doc.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
      });
    }
  };

  Carrossel.prototype.observarVisibilidade = function () {
    var self = this;
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) self.parar();
      else if (!self.pausadoManual) self.iniciar();
    });
  };

  /* ==========================================================================
     Inicialização
     ========================================================================== */

  function iniciar() {
    var raizes = doc.querySelectorAll('[data-destaques]');
    var instancias = [];
    Array.prototype.forEach.call(raizes, function (raiz) {
      instancias.push(new Carrossel(raiz));
    });
    global.InBarberDestaques = {
      instancias: instancias,
      selecionar: selecionar,
      vigente: vigente,
      ordenarComJustica: ordenarComJustica,
      cidadeMaisProxima: cidadeMaisProxima
    };
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window, document);