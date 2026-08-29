/* =============================================================================
   InBarber — perfil individual da barbearia (barbearia.html?id=)
   -----------------------------------------------------------------------------
   Destino do clique no carrossel de destaques. Lê o `id` da query string e monta
   a página a partir da base de barbearias do projeto (`window.INBARBER_DATA`)
   ou, na ausência dela, da base de destaques.

   Sem backend: o botão de agendamento dispara o evento `inbarber:agendar` no
   document — mesmo padrão do `inbarber:signin` do header — para o fluxo real ser
   plugado depois sem tocar nesta página.
============================================================================= */
(function (global, doc) {
  'use strict';

  var PADRAO = 'pt-BR';

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

  function t(chave, vars) {
    var dic = global.INBARBER_TRANSLATIONS || {};
    var atual = dic[idiomaAtivo()] || {};
    var base = dic[PADRAO] || {};
    var texto = atual[chave] || base[chave] || chave;
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
    } catch (e) { return String(valor); }
  }

  function moeda(valor) {
    try {
      return new Intl.NumberFormat(idiomaAtivo(), {
        style: 'currency', currency: 'BRL', maximumFractionDigits: 0
      }).format(valor);
    } catch (e) { return 'R$ ' + valor; }
  }

  function el(tag, classe, texto) {
    var n = doc.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  /* Mesma regra de vigência de destaques.js, replicada aqui para a página não
     depender da ordem de carregamento dos scripts. */
  function hojeISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1), dia = String(d.getDate());
    return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (dia.length < 2 ? '0' + dia : dia);
  }

  function vigente(d) {
    var hoje = hojeISO();
    return (!d.inicio || d.inicio <= hoje) && (!d.fim || d.fim >= hoje);
  }

  function parametro(nome) {
    var busca = global.location.search.replace(/^\?/, '').split('&');
    var valor = null;
    busca.forEach(function (par) {
      var partes = par.split('=');
      if (decodeURIComponent(partes[0]) === nome) {
        valor = decodeURIComponent((partes[1] || '').replace(/\+/g, ' '));
      }
    });
    return valor;
  }

  function fonteDeDados() {
    var base = global.INBARBER_DADOS || global.INBARBER_DATA || {};
    var lista = base.barbearias || [];
    var destaques = (global.INBARBER_DESTAQUES && global.INBARBER_DESTAQUES.destaques) || [];

    /* A base oficial manda; os destaques completam quem ainda não estiver lá. */
    var mapa = {};
    lista.forEach(function (b) { mapa[b.id] = b; });
    destaques.forEach(function (d) { if (!mapa[d.id]) mapa[d.id] = d; });
    return mapa;
  }

  function cidadePorId(id) {
    var cidades = (global.INBARBER_DESTAQUES && global.INBARBER_DESTAQUES.cidades) || [];
    var achada = null;
    cidades.forEach(function (c) { if (c.id === id) achada = c; });
    return achada;
  }

  function montarEstrelas(nota) {
    var caixa = el('span', 'estrelas');
    caixa.setAttribute('aria-hidden', 'true');
    var fundo = el('span', 'estrelas__fundo', '★★★★★');
    var frente = el('span', 'estrelas__frente', '★★★★★');
    frente.style.width = Math.max(0, Math.min(100, (nota / 5) * 100)) + '%';
    caixa.appendChild(fundo);
    caixa.appendChild(frente);
    return caixa;
  }

  /* ==========================================================================
     Renderização
     ========================================================================== */

  function renderizarVazio(raiz) {
    raiz.innerHTML = '';
    var caixa = el('div', 'perfil__vazio');
    caixa.appendChild(el('h1', 'perfil__nome', t('perfil.naoEncontradaTitulo')));
    caixa.appendChild(el('p', null, t('perfil.naoEncontradaTexto')));
    var link = el('a', 'destaque__cta', t('perfil.verTodas'));
    link.href = 'barbearias.html';
    caixa.appendChild(link);
    raiz.appendChild(caixa);
    doc.title = t('perfil.naoEncontradaTitulo') + ' — InBarber';
  }

  function renderizar(raiz, b) {
    raiz.innerHTML = '';

    doc.title = t('perfil.tituloPagina', { nome: b.nome });
    var descricao = doc.querySelector('meta[name="description"]');
    if (descricao && b.chamada) {
      descricao.setAttribute('content', b.chamada[idiomaAtivo()] || b.chamada[PADRAO] || '');
    }

    /* Voltar --------------------------------------------------------------- */
    var voltar = el('a', 'perfil__voltar', '← ' + t('perfil.voltar'));
    voltar.href = 'barbearias.html';
    raiz.appendChild(voltar);

    /* Capa ------------------------------------------------------------------ */
    var capa = el('div', 'perfil__capa');
    var img = doc.createElement('img');
    img.className = 'perfil__foto';
    img.src = b.foto;
    img.alt = b.nome + ' — ' + (b.bairro || '');
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
    img.decoding = 'async';
    img.addEventListener('error', function () { img.remove(); });
    capa.appendChild(img);

    if (vigente(b) && b.plano) {
      capa.appendChild(el('span', 'perfil__selo', t('perfil.destaqueAtivo')));
    }

    /* Cabeçalho sobre a foto, com o mesmo scrim do card do hero. ------------- */
    var cabecalho = el('header', 'perfil__cabecalho');
    cabecalho.appendChild(el('h1', 'perfil__nome', b.nome));

    var cidade = cidadePorId(b.cidade);
    cabecalho.appendChild(el('p', 'perfil__local',
      (b.bairro || '') + (cidade ? ' · ' + cidade.nome + '/' + cidade.uf : '')));

    var nota = el('div', 'perfil__nota');
    nota.appendChild(montarEstrelas(b.nota));
    nota.appendChild(el('strong', null, numero(b.nota, 1)));
    nota.appendChild(el('span', 'destaque__avaliacoes',
      t('perfil.avaliacoes', { n: numero(b.avaliacoes) })));
    cabecalho.appendChild(nota);
    capa.appendChild(cabecalho);
    raiz.appendChild(capa);

    /* Grade ------------------------------------------------------------------ */
    var grade = el('div', 'perfil__grade');

    /* Serviços */
    var blocoServicos = el('section', 'perfil__bloco');
    blocoServicos.appendChild(el('h2', 'perfil__blocoTitulo', t('perfil.servicos')));
    var lista = el('ul', 'perfil__servicos');
    (b.servicos || []).forEach(function (s) {
      var li = el('li', 'perfil__servico');
      li.appendChild(el('span', null, t('servicos.' + s.chave)));
      li.appendChild(el('span', 'perfil__preco', moeda(s.preco)));
      lista.appendChild(li);
    });
    blocoServicos.appendChild(lista);
    grade.appendChild(blocoServicos);

    /* Lateral: horários + contato + agendar */
    var lateral = el('div');

    var blocoHorarios = el('section', 'perfil__bloco');
    blocoHorarios.appendChild(el('h2', 'perfil__blocoTitulo', t('perfil.horarios')));

    var dias = el('ul', 'perfil__dias');
    for (var d = 0; d < 7; d++) {
      var aberto = (b.dias || []).indexOf(d) !== -1;
      var item = el('li', 'perfil__dia' + (aberto ? ' perfil__dia--aberto' : ''), t('dias.' + d));
      item.setAttribute('aria-label', t('dias.' + d));
      dias.appendChild(item);
    }
    blocoHorarios.appendChild(dias);

    var periodos = el('ul', 'perfil__periodos');
    (b.periodos || []).forEach(function (p) {
      periodos.appendChild(el('li', 'perfil__periodo', t('periodos.' + p)));
    });
    blocoHorarios.appendChild(periodos);
    lateral.appendChild(blocoHorarios);

    var blocoContato = el('section', 'perfil__bloco');
    blocoContato.style.marginTop = '1rem';
    blocoContato.appendChild(el('h2', 'perfil__blocoTitulo', t('perfil.contato')));
    var contato = el('address', 'perfil__contato');
    contato.style.fontStyle = 'normal';
    if (b.endereco) { contato.appendChild(el('span', null, b.endereco)); contato.appendChild(doc.createElement('br')); }
    if (b.telefone) {
      var tel = el('a', null, b.telefone);
      tel.href = 'tel:' + b.telefone.replace(/[^+\d]/g, '');
      contato.appendChild(tel);
    }
    blocoContato.appendChild(contato);

    var agendar = el('button', 'perfil__agendar', t('perfil.agendar'));
    agendar.type = 'button';
    agendar.addEventListener('click', function () {
      doc.dispatchEvent(new CustomEvent('inbarber:agendar', {
        detail: { id: b.id, nome: b.nome, origem: parametro('ref') || 'perfil' }
      }));
      try {
        if (typeof global.gtag === 'function') {
          global.gtag('event', 'agendamento_intencao', {
            barbearia_id: b.id, barbearia_nome: b.nome, origem: parametro('ref') || 'perfil'
          });
        }
      } catch (e) { /* medição nunca derruba a página */ }
    });
    blocoContato.appendChild(agendar);
    lateral.appendChild(blocoContato);

    grade.appendChild(lateral);
    raiz.appendChild(grade);
  }

  /* ==========================================================================
     Inicialização
     ========================================================================== */

  function iniciar() {
    var raiz = doc.querySelector('[data-perfil]');
    if (!raiz) return;

    var id = parametro('id');
    var barbearia = id ? fonteDeDados()[id] : null;

    var pintar = function () {
      if (barbearia) renderizar(raiz, barbearia);
      else renderizarVazio(raiz);
    };

    pintar();

    /* Repinta ao trocar de idioma, qualquer que seja o mecanismo do projeto. */
    doc.addEventListener('inbarber:idioma', pintar);
    doc.addEventListener('inbarber:languagechange', pintar);
    if (global.MutationObserver) {
      new global.MutationObserver(pintar).observe(doc.documentElement, {
        attributes: true, attributeFilter: ['lang']
      });
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window, document);