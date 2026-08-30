/* ==========================================================================
   InBarber — verificação do carrossel de destaques e do perfil da barbearia
   Chromium headless via Playwright.

   Uso:
     python3 -m http.server 8899        (na raiz do projeto)
     node verificar.mjs
   ========================================================================== */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:8899";
const ok = [];
const falhas = [];

function checar(nome, condicao, detalhe = "") {
  if (condicao) ok.push(nome);
  else falhas.push(`${nome}${detalhe ? " → " + detalhe : ""}`);
}

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 }, locale: "pt-BR" });

const problemas = [];
function vigiar(pagina, rotulo) {
  pagina.on("pageerror", (e) => problemas.push(`${rotulo}: ${e.message}`));
  pagina.on("console", (m) => {
    const texto = m.text();
    if (m.type() === "error" && !/net::|Failed to load resource/.test(texto)) {
      problemas.push(`${rotulo}: ${texto}`);
    }
    // O i18n avisa no console quando falta uma chave — isso é falha, não ruído.
    if (/chave sem tradução/.test(texto)) problemas.push(`${rotulo}: ${texto}`);
  });
}

await ctx.addInitScript(() => {
  window.dataLayer = [];
});

const home = await ctx.newPage();
vigiar(home, "index");
await home.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await home.waitForSelector(".featured__slide", { timeout: 5000 });

/* --- 1. Vigência automática ------------------------------------------------ */
const nomes = await home.$$eval(".featured__name", (ns) => ns.map((n) => n.textContent.trim()));
checar("Vigência: contrato vencido fica fora do ar", !nomes.includes("Casa do Barbeiro"), nomes.join(", "));
checar("Vigência: contratos válidos entram", nomes.length >= 2, `${nomes.length} slides`);
const tetoSlots = await home.evaluate(() => window.INBARBER_FEATURED.maxSlots);
checar(
  `Escassez: respeita o teto de ${tetoSlots} slots`,
  nomes.length <= tetoSlots,
  `${nomes.length} slides`
);
checar(
  "Destaques só usam barbearias reais do data.js",
  await home.evaluate(
    () =>
      window.InBarberFeatured.instances[0].ads.every((ad) =>
        window.INBARBER_DATA.barbershops.some((s) => s.id === ad.shop.id)
      )
  )
);

/* --- 2. Rótulo de patrocinado ---------------------------------------------- */
const selos = await home.$$eval(".featured__sponsored", (ns) => ns.length);
checar("Rótulo de patrocinado em todos os slides", selos === nomes.length, `${selos}/${nomes.length}`);
const nota = await home.$eval(".featured__sponsored .visually-hidden", (n) => n.textContent);
checar("Rótulo explicado para leitor de tela", /pagou para aparecer aqui/.test(nota), nota.trim());
checar(
  "A nota deixa claro quem vende o espaço e quem paga",
  /InBarber/.test(nota) && /Esta barbearia pagou/.test(nota),
  nota.trim()
);
checar(
  "Rótulo traz ícone além do texto",
  (await home.$$eval(".featured__sponsored svg", (ns) => ns.length)) === nomes.length
);
checar(
  "Ícone do rótulo é decorativo para o leitor de tela",
  await home.$eval(".featured__sponsored svg", (n) => n.getAttribute("aria-hidden") === "true")
);

/* --- Baralho: as próximas cartas ficam visíveis por baixo ------------------ */
const baralho = await home.evaluate(() => {
  const slides = Array.from(document.querySelectorAll(".featured__slide"));
  return slides.map((s) => ({
    i: s.style.getPropertyValue("--i").trim(),
    ativo: s.classList.contains("is-active"),
    atras: s.classList.contains("is-behind"),
    fora: s.classList.contains("is-out"),
    opacidade: Number(getComputedStyle(s).opacity.slice(0, 4)),
    visivel: getComputedStyle(s).visibility
  }));
});
checar("Baralho: uma carta ativa por vez", baralho.filter((s) => s.ativo).length === 1);
checar("Baralho: duas cartas visíveis atrás da ativa", baralho.filter((s) => s.atras).length === 2);
checar(
  "Baralho: as demais ficam fora da pilha",
  baralho.filter((s) => s.fora).every((s) => s.visivel === "hidden"),
  JSON.stringify(baralho.map((s) => s.i))
);
checar(
  "Baralho: profundidade --i cresce a partir da carta ativa",
  baralho.map((s) => Number(s.i)).sort((a, b) => a - b).join(",") ===
    baralho.map((_, i) => i).join(","),
  baralho.map((s) => s.i).join(",")
);
checar(
  "Baralho: a segunda carta aparece mais que a terceira",
  baralho.find((s) => s.i === "1").opacidade > baralho.find((s) => s.i === "2").opacidade,
  baralho.map((s) => `${s.i}:${s.opacidade}`).join(" ")
);
checar(
  "Só a carta do topo mostra texto e selo",
  await home.evaluate(() => {
    const atras = document.querySelector(".featured__slide.is-behind");
    return getComputedStyle(atras.querySelector(".featured__info")).opacity === "0";
  })
);

/* --- Controles do slide ----------------------------------------------------- */
checar(
  "Contador de posição visível no cabeçalho",
  /^1\s*de\s*\d+$/.test((await home.$eval(".featured__counter", (n) => n.textContent)).trim()),
  await home.$eval(".featured__counter", (n) => n.textContent.trim())
);
checar(
  "Botão 'Ver perto de mim' foi removido",
  (await home.$$(".featured__geo")).length === 0
);
checar("Chip de escopo foi removido", (await home.$$(".featured__scope")).length === 0);
checar(
  "Cada ponto tem barra de progresso do autoplay",
  (await home.$$eval(".featured__dot-fill", (ns) => ns.length)) === nomes.length
);
checar(
  "Autoplay em curso é sinalizado na classe do bloco",
  await home.$eval("[data-featured-carousel]", (n) => n.classList.contains("is-running"))
);
checar(
  "Pilha convida ao arrasto com o cursor certo",
  (await home.$eval(".featured__track", (n) => getComputedStyle(n).cursor)) === "grab"
);

/* --- 3. A prova social da plataforma continua no hero ----------------------- */
const stats = await home.$$eval(".hero__stats .stat__value", (ns) => ns.map((n) => n.getAttribute("data-count")));
checar(
  "Nota 4,9 da plataforma permanece nas estatísticas do hero",
  stats.includes("4.9"),
  stats.join(" | ")
);
checar("Card flutuante antigo foi removido do hero", (await home.$$(".hero__floating-card")).length === 0);

/* --- 4. Rotação justa ------------------------------------------------------ */
const ordens = new Set();
for (let i = 0; i < 12; i += 1) {
  const limpo = await navegador.newContext({ viewport: { width: 1280, height: 900 }, locale: "pt-BR" });
  const p = await limpo.newPage();
  await p.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
  await p.waitForSelector(".featured__name");
  ordens.add(await p.$$eval(".featured__name", (ns) => ns.map((n) => n.textContent).join("|")));
  await limpo.close();
}
checar("Rotação justa: a ordem muda entre carregamentos", ordens.size > 1, `${ordens.size} ordens em 12 cargas`);

/* --- 5. Navegação ---------------------------------------------------------- */
const primeiro = await home.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
await home.click(".featured__arrow--next");
await home.waitForTimeout(150);
const segundo = await home.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
checar("Botão avançar troca o slide", primeiro !== segundo, `${primeiro} → ${segundo}`);

await home.click(".featured__arrow--prev");
await home.waitForTimeout(150);
checar(
  "Botão voltar retorna ao slide anterior",
  (await home.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent)) === primeiro
);

checar(
  "Um ponto de navegação por slide",
  (await home.$$eval(".featured__dots button", (ns) => ns.length)) === nomes.length
);

await home.focus(".featured__arrow--next");
await home.keyboard.press("ArrowRight");
await home.waitForTimeout(150);
checar(
  "Setas do teclado navegam o carrossel",
  (await home.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent)) !== primeiro
);

/* Arrastar com o dedo (ou com o mouse) troca de carta. */
await home.evaluate(() => window.InBarberFeatured.instances[0].go(0, true));
await home.waitForTimeout(200);
const antesArrasto = await home.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
const caixa = await home.$eval(".featured__track", (n) => {
  const r = n.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await home.mouse.move(caixa.x, caixa.y);
await home.mouse.down();
await home.mouse.move(caixa.x - 120, caixa.y, { steps: 12 });
await home.mouse.up();
await home.waitForTimeout(250);
checar(
  "Arrastar para a esquerda avança o carrossel",
  (await home.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent)) !== antesArrasto,
  antesArrasto
);
checar(
  "Arrastar não deixa deslocamento preso no palco",
  (await home.$eval(".featured__stage", (n) => n.style.getPropertyValue("--featured-drag"))) === ""
);
checar("Navegação por arrasto não navega para o perfil", home.url().includes("index.html"));

/* --- 6. Acessibilidade ----------------------------------------------------- */
const aria = await home.evaluate(() => {
  const stage = document.querySelector(".featured__stage");
  const ativo = document.querySelector(".featured__slide.is-active");
  const inativo = document.querySelector(".featured__slide:not(.is-active)");
  return {
    roleDesc: stage.getAttribute("aria-roledescription"),
    label: stage.getAttribute("aria-label"),
    slideRole: ativo.getAttribute("aria-roledescription"),
    ativoOculto: ativo.getAttribute("aria-hidden"),
    inativoOculto: inativo ? inativo.getAttribute("aria-hidden") : null,
    tabInativo: inativo ? inativo.querySelector("a").tabIndex : null,
    live: document.querySelector(".featured__track").getAttribute("aria-live")
  };
});
checar("Palco anunciado como carrossel", aria.roleDesc === "carrossel" && !!aria.label);
checar("Slides anunciados como slide", aria.slideRole === "slide");
checar("Slide ativo visível ao leitor de tela", aria.ativoOculto === null);
checar("Slides inativos ocultos e fora da tabulação", aria.inativoOculto === "true" && aria.tabInativo === -1);
checar("Trilha com aria-live", aria.live === "polite");

/* --- 7. i18n pelo seletor real do site ------------------------------------- */
for (const [codigo, esperado] of [
  ["en", "Paid placement"],
  ["es", "Destacado pagado"],
  ["pt", "Destaque pago"]
]) {
  await home.evaluate((lang) => window.InBarberI18n.setLanguage(lang), codigo);
  await home.waitForTimeout(150);
  const selo = await home.$eval(".featured__sponsored", (n) => n.textContent.trim());
  const titulo = await home.$eval(".featured__title", (n) => n.textContent.trim());
  checar(`i18n ${codigo}: rótulo traduzido`, selo.startsWith(esperado), selo.slice(0, 24));
  checar(`i18n ${codigo}: título traduzido`, titulo.length > 0 && !titulo.includes("featured."), titulo);
}
const cruas = await home.evaluate(
  () => document.body.innerText.match(/\b(featured|profile|shops|service|time|day|geo)\.[a-zA-Z0-9]+/g) || []
);
checar("Nenhuma chave de tradução vazando na tela", cruas.length === 0, cruas.join(", "));

/* --- 8. Métricas ----------------------------------------------------------- */
const eventos = await home.evaluate(() => window.dataLayer.map((e) => e.event));
checar("Evento de impressão disparado", eventos.includes("featured_impression"), eventos.join(", "));

await home.$eval(".featured__slide.is-active .featured__link", (a) => {
  a.removeAttribute("href");
  a.click();
});
await home.waitForTimeout(150);
const cliques = await home.evaluate(() => window.dataLayer.filter((e) => e.event === "featured_click"));
checar(
  "Evento de clique traz id, posição e plano",
  cliques.length > 0 && !!cliques[0].shop_id && !!cliques[0].position && !!cliques[0].plan,
  JSON.stringify(cliques[0] || {})
);
const impressoes = await home.evaluate(() =>
  window.dataLayer.filter((e) => e.event === "featured_impression").map((e) => e.shop_id)
);
checar(
  "Impressão contada uma vez por anunciante",
  new Set(impressoes).size === impressoes.length,
  impressoes.join(", ")
);

/* --- 9. Link para o perfil -------------------------------------------------- */
const destino = await home.$$eval(".featured__link", (as) => as.map((a) => a.getAttribute("href")).filter(Boolean));
checar(
  "Destaques apontam para o perfil individual com ref e posição",
  destino.every((h) => /^barbearia\.html\?id=[^&]+&ref=hero-featured&pos=\d+$/.test(h)),
  destino[0]
);

/* --- 10. Relevância geográfica ---------------------------------------------
   O carrossel não pede localização por conta própria: a cidade vem da busca do
   hero (evento inbarber:citychange) ou do que ficou guardado de outra visita. */
const guardada = await navegador.newContext({ viewport: { width: 1280, height: 900 }, locale: "pt-BR" });
const pGuardada = await guardada.newPage();
vigiar(pGuardada, "cidade-guardada");
await pGuardada.addInitScript(() => {
  window.dataLayer = [];
  localStorage.setItem("inbarber:city", "Rio de Janeiro");
});
await pGuardada.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await pGuardada.waitForSelector(".featured__slide");
const locaisGuardada = await pGuardada.$$eval(".featured__location", (ns) => ns.map((n) => n.textContent.trim()));
checar(
  "Cidade guardada coloca os anúncios locais na frente",
  locaisGuardada[0].includes("Rio de Janeiro"),
  locaisGuardada.join(" | ")
);
checar(
  "Impressão registra o escopo local para o relatório",
  await pGuardada.evaluate(() =>
    window.dataLayer.some((e) => e.event === "featured_impression" && e.scope === "city")
  )
);
await guardada.close();

/* --- 11. Busca do hero alimenta o carrossel --------------------------------- */
const sync = await ctx.newPage();
vigiar(sync, "sync");
await sync.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await sync.waitForSelector(".featured__slide");
await sync.click('[data-popover-trigger="where"]');
await sync.click('[data-city="Curitiba"]');
await sync.waitForTimeout(300);
const locaisSync = await sync.$$eval(".featured__location", (ns) => ns.map((n) => n.textContent.trim()));
checar(
  "Escolher cidade na busca reajusta os destaques na hora",
  locaisSync[0].includes("Curitiba"),
  locaisSync.join(" | ")
);
checar(
  "A cidade escolhida fica guardada para a próxima visita",
  (await sync.evaluate(() => localStorage.getItem("inbarber:city"))) === "Curitiba"
);
await sync.close();

/* --- 12. Autoplay e pausa --------------------------------------------------- */
const auto = await ctx.newPage();
await auto.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await auto.waitForSelector(".featured__slide.is-active");
const inicial = await auto.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
await auto.waitForTimeout(7600);
const girou = await auto.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
checar("Autoplay avança sozinho", inicial !== girou, `${inicial} → ${girou}`);

await auto.click(".featured__pause");
const parado = await auto.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
await auto.waitForTimeout(7600);
checar(
  "Botão de pausa realmente para a rotação",
  (await auto.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent)) === parado
);
await auto.close();

/* --- 13. prefers-reduced-motion --------------------------------------------- */
const calmo = await navegador.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
const pCalmo = await calmo.newPage();
await pCalmo.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await pCalmo.waitForSelector(".featured__slide.is-active");
const antesCalmo = await pCalmo.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent);
await pCalmo.waitForTimeout(2500);
checar(
  "prefers-reduced-motion desliga o autoplay",
  (await pCalmo.$eval(".featured__slide.is-active .featured__name", (n) => n.textContent)) === antesCalmo
);
checar("prefers-reduced-motion esconde o botão de pausa", await pCalmo.$eval(".featured__pause", (n) => n.hidden));
await calmo.close();

/* --- 14. Perfil individual --------------------------------------------------- */
const perfil = await ctx.newPage();
vigiar(perfil, "perfil");
await perfil.goto(`${BASE}/barbearia.html?id=navalha-cia&ref=hero-featured&pos=1`, { waitUntil: "domcontentloaded" });
await perfil.waitForSelector(".shop-profile__name");
checar(
  "Perfil carrega a barbearia certa do data.js",
  (await perfil.$eval(".shop-profile__name", (n) => n.textContent)) === "Navalha & Cia"
);
checar(
  "Perfil lista os serviços cadastrados",
  (await perfil.$$eval(".shop-card__services .chip", (n) => n.length)) === 3
);
checar(
  "Perfil marca os dias abertos",
  (await perfil.$$eval(".shop-profile__day--open", (n) => n.length)) === 6
);
checar("Perfil exibe o selo de destaque ativo", (await perfil.$$(".shop-profile__badge")).length === 1);
checar(
  "Perfil mostra o preço a partir de, formatado pelo i18n",
  /R\$/.test(await perfil.$eval(".shop-profile__price", (n) => n.textContent))
);
checar("Título da página traz o nome da barbearia", (await perfil.title()).includes("Navalha & Cia"));
checar(
  "Meta description é preenchida com nome e cidade",
  /Navalha & Cia/.test(await perfil.$eval('meta[name="description"]', (n) => n.content))
);

const agendou = await perfil.evaluate(
  () =>
    new Promise((res) => {
      document.addEventListener("inbarber:booking", (e) => res(e.detail), { once: true });
      document.querySelector("[data-book]").click();
      setTimeout(() => res(null), 500);
    })
);
checar(
  "Botão de agendar dispara inbarber:booking com a origem",
  agendou && agendou.id === "navalha-cia" && agendou.origin === "hero-featured",
  JSON.stringify(agendou)
);
checar(
  "Agendamento gera evento de métrica",
  (await perfil.evaluate(() => window.dataLayer.some((e) => e.event === "booking_intent")))
);

await perfil.evaluate(() => window.InBarberI18n.setLanguage("en"));
await perfil.waitForTimeout(200);
checar(
  "Perfil se re-renderiza ao trocar de idioma",
  (await perfil.$eval(".shop-profile__block-title", (n) => n.textContent)) === "SERVICES AND PRICES" ||
    (await perfil.$eval(".shop-profile__block-title", (n) => n.textContent)) === "Services and prices",
  await perfil.$eval(".shop-profile__block-title", (n) => n.textContent)
);

const semDestaque = await ctx.newPage();
await semDestaque.goto(`${BASE}/barbearia.html?id=oficina-do-corte`, { waitUntil: "domcontentloaded" });
await semDestaque.waitForSelector(".shop-profile__name");
checar("Barbearia sem contrato não exibe selo de destaque", (await semDestaque.$$(".shop-profile__badge")).length === 0);
await semDestaque.close();

const inexistente = await ctx.newPage();
vigiar(inexistente, "inexistente");
await inexistente.goto(`${BASE}/barbearia.html?id=nao-existe`, { waitUntil: "domcontentloaded" });
await inexistente.waitForSelector(".shop-profile__empty");
checar("Perfil inexistente mostra estado vazio em vez de quebrar", true);
await inexistente.close();

/* --- 15. Cards de barbearia levam ao perfil --------------------------------- */
const lista = await ctx.newPage();
vigiar(lista, "barbearias");
await lista.goto(`${BASE}/barbearias.html`, { waitUntil: "domcontentloaded" });
await lista.waitForSelector(".shop-card__footer a");
const links = await lista.$$eval(".shop-card__footer a", (as) => as.map((a) => a.getAttribute("href")));
checar(
  "Cards da lista apontam para barbearia.html?id=",
  links.length > 0 && links.every((h) => h.startsWith("barbearia.html?id=")),
  links[0]
);
await lista.close();

/* --- 15.1 Barbearias recomendadas (ranking + novas) -------------------------- */
const recs = await ctx.newPage();
vigiar(recs, "recomendadas");
await recs.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
/* Testes anteriores deste mesmo contexto podem ter guardado uma cidade;
   o ranking nacional é o ponto de partida desta bateria. */
await recs.evaluate(() => localStorage.removeItem("inbarber:city"));
await recs.reload({ waitUntil: "domcontentloaded" });
await recs.waitForSelector(".rec-hero__name");

const esperado = await recs.evaluate(() =>
  window.INBARBER_DATA.recommended(null, 7).map((s) => s.name)
);
const exibido = await recs.$$eval(".rec-hero__name, .rec-card__name a", (ns) =>
  ns.map((n) => (n.lastChild ? n.lastChild.textContent : n.textContent).trim())
);
checar(
  "Ranking mostra 1 destaque + 6 cards no desktop",
  (await recs.$$(".rec-hero")).length === 1 && (await recs.$$(".rec-card")).length === 6
);
checar(
  "Ranking segue o mérito do data.js (nota + avaliações de 30 dias)",
  exibido.join(" | ") === esperado.join(" | "),
  exibido.join(" | ")
);
checar(
  "Primeiro colocado é marcado por uma coroa, não por numeral",
  (await recs.$$(".rec-hero__medal svg")).length === 1 && (await recs.$$(".rec-rank")).length === 0
);
checar(
  "Nenhum card mostra numeral de posição",
  await recs.$$eval(".rec-hero, .rec-card", (cards) =>
    cards.every((c) => !/^\s*0?\d\s*$/.test(c.textContent.trim().slice(0, 3)))
  )
);
checar(
  "Título da seção anuncia o ranking da semana (no idioma ativo)",
  (await recs.$eval("[data-recs-title]", (n) => n.textContent)) ===
    (await recs.evaluate(() => window.InBarberI18n.t("shops.title"))),
  await recs.$eval("[data-recs-title]", (n) => n.textContent)
);
checar(
  "Todo card do ranking leva ao perfil com a origem home-recs",
  (await recs.$$eval(".recs .rec-link", (as) => as.map((a) => a.getAttribute("href")))).every((h) =>
    h.startsWith("barbearia.html?id=") && h.includes("ref=home-recs")
  )
);
checar(
  "Todo card do ranking mostra os próximos horários",
  (await recs.$$eval(".recs .rec-slots", (ns) => ns.length)) === 7
);
const horarios = await recs.$$eval(".rec-slot", (as) => as.map((a) => a.getAttribute("href")));
checar(
  "Cada horário leva ao perfil já com a data escolhida",
  horarios.length > 0 && horarios.every((h) => /&slot=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}$/.test(h)),
  horarios[0]
);
checar(
  "Recomendação não é espaço comprado: nenhum selo de patrocinado no ranking",
  (await recs.$$(".recs [class*='sponsored']")).length === 0
);
checar(
  "Sem cidade conhecida, nenhum card promete distância",
  (await recs.$$(".rec-near")).length === 0
);

/* Cidade conhecida: o título muda, a cidade do visitante vem primeiro e a
   distância aparece — tudo sem recarregar a página. */
await recs.evaluate(() => {
  localStorage.setItem("inbarber:city", "Porto Alegre");
  document.dispatchEvent(new CustomEvent("inbarber:citychange", { detail: { city: "Porto Alegre" } }));
});
await recs.waitForTimeout(250);
checar(
  "Escolher a cidade reescreve o título da seção",
  (await recs.$eval("[data-recs-title]", (n) => n.textContent)).includes("Porto Alegre"),
  await recs.$eval("[data-recs-title]", (n) => n.textContent)
);
const primeiras = await recs.$$eval(".rec-hero, .rec-card", (cards) =>
  cards.slice(0, 2).map((c) => c.querySelector(".rec-meta span").textContent)
);
checar(
  "Barbearias da cidade do visitante encabeçam o ranking",
  primeiras.every((t) => t.includes("Porto Alegre")),
  primeiras.join(" | ")
);
checar(
  "Cards de outra cidade mostram a distância em km",
  (await recs.$$eval(".rec-near", (ns) => ns.map((n) => n.textContent))).some((t) => /km/.test(t))
);

/* Novas na InBarber */
const novasEsperadas = await recs.evaluate(() =>
  window.INBARBER_DATA.newest(6).map((s) => s.name)
);
checar(
  "Trilho de novas segue a data de entrada, da mais recente para a mais antiga",
  (await recs.$$eval(".news-card__name a", (ns) => ns.map((n) => n.textContent.trim()))).join(" | ") ===
    novasEsperadas.join(" | ")
);
checar(
  "Selo \"Novo\" só aparece em quem entrou dentro da janela",
  await recs.evaluate(() => {
    const data = window.INBARBER_DATA;
    const dentro = data.newest(6).filter((s) => data.isNewShop(s)).length;
    return document.querySelectorAll(".news-card__badge").length === dentro;
  })
);
checar(
  "Trilho de novas leva ao perfil com a origem home-new",
  (await recs.$$eval(".news-card .rec-link", (as) => as.map((a) => a.getAttribute("href")))).every((h) =>
    h.includes("ref=home-new")
  )
);

/* Idioma */
await recs.evaluate(() => window.InBarberI18n.setLanguage("es"));
await recs.waitForTimeout(250);
checar(
  "Seção inteira se re-renderiza ao trocar de idioma",
  (await recs.$eval(".news__title", (n) => n.textContent.replace(/\s+/g, " ").trim())) ===
    "Nuevas en InBarber" &&
    (await recs.$eval(".rec-slots__label", (n) => n.textContent.trim())) === "Próximas horas libres",
  await recs.$eval(".news__title", (n) => n.textContent.replace(/\s+/g, " ").trim())
);
/* O idioma fica guardado no localStorage do contexto: devolvemos o português
   para que as baterias seguintes não leiam rótulos em espanhol. */
await recs.evaluate(() => window.InBarberI18n.setLanguage("pt"));
await recs.close();

/* No celular a lista encurta em vez de virar um rolo sem fim. */
const recsMobile = await ctx.newPage();
vigiar(recsMobile, "recomendadas-mobile");
await recsMobile.setViewportSize({ width: 375, height: 800 });
await recsMobile.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await recsMobile.waitForSelector(".rec-hero__name");
checar(
  "No celular o ranking cai para 5 barbearias",
  (await recsMobile.$$(".rec-card")).length === 4
);
await recsMobile.close();

/* --- 15.2 Abertas agora ------------------------------------------------------ */
const abertas = await ctx.newPage();
vigiar(abertas, "abertas-agora");
await abertas.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await abertas.evaluate(() => localStorage.removeItem("inbarber:city"));
await abertas.reload({ waitUntil: "domcontentloaded" });
await abertas.waitForSelector(".open-card");

const abertasEsperadas = await abertas.evaluate(() =>
  window.INBARBER_DATA.openNowShops(null, 6).map((s) => s.name)
);
const abertasExibidas = await abertas.$$eval(".open-card__name a", (ns) =>
  ns.map((n) => n.textContent.trim())
);
checar(
  "Abertas agora segue a ordem de mérito do data.js",
  abertasExibidas.join(" | ") === abertasEsperadas.join(" | "),
  abertasExibidas.join(" | ")
);
checar(
  "Abertas agora só traz barbearia com as portas abertas",
  await abertas.evaluate(() => {
    const nomes = Array.from(document.querySelectorAll(".open-card__name a")).map((a) => a.textContent.trim());
    return nomes.every((nome) => {
      const shop = window.INBARBER_DATA.barbershops.find((s) => s.name === nome);
      return shop && shop.openNow === true;
    });
  })
);
checar(
  "A contagem de abertas bate com os dados",
  await abertas.evaluate(
    () =>
      document.querySelector("[data-open-count]").textContent.trim() ===
      `${window.INBARBER_DATA.openNowCount()} abertas`
  ),
  await abertas.$eval("[data-open-count]", (n) => n.textContent.trim())
);
checar(
  "Cada aberta leva ao perfil com origem home-open",
  (await abertas.$$eval(".open-card .rec-link", (as) => as.map((a) => a.getAttribute("href")))).every((h) =>
    h.includes("ref=home-open")
  )
);
checar(
  "O próximo horário das abertas já vai com a data escolhida na query",
  (await abertas.$$eval(".open-card__slot", (as) => as.map((a) => a.getAttribute("href")))).every((h) =>
    /slot=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}/.test(h)
  ),
  await abertas.$eval(".open-card__slot", (a) => a.getAttribute("href"))
);
checar(
  "Sem cidade conhecida, nenhuma aberta promete proximidade",
  (await abertas.$$(".open-card .rec-near")).length === 0
);

/* Descrição de cada card: horário de fechamento, motivo, serviços e nota. */
checar(
  "Cada aberta diz até que horas fica aberta, com o dado do data.js",
  await abertas.evaluate(() =>
    Array.from(document.querySelectorAll(".open-card")).every((card) => {
      const nome = card.querySelector(".open-card__name a").textContent.trim();
      const shop = window.INBARBER_DATA.barbershops.find((s) => s.name === nome);
      const texto = card.querySelector(".open-card__until").textContent.trim();
      return shop && shop.closesAt && texto === `Fecha às ${shop.closesAt}`;
    })
  ),
  await abertas.$eval(".open-card__until", (n) => n.textContent.trim())
);
checar(
  "Cada aberta traz motivo, serviços, nota com avaliações e preço",
  await abertas.evaluate(() =>
    Array.from(document.querySelectorAll(".open-card")).every(
      (card) =>
        card.querySelector(".open-card__reason") &&
        card.querySelectorAll(".rec-services .chip").length === 2 &&
        card.querySelector(".rec-rating__count") &&
        card.querySelector(".rec-price strong")
    )
  )
);
checar(
  "O selo de aberta agora vive sobre a foto",
  (await abertas.$$(".open-card__media .open-card__live")).length ===
    (await abertas.$$(".open-card")).length
);

/* A foto era uma tira esticada (1:2.6) que cortava rostos. */
const proporcoes = await abertas.$$eval(".open-card__media", (ns) =>
  ns.map((n) => {
    const r = n.getBoundingClientRect();
    return r.height / r.width;
  })
);
checar(
  "A foto de cada aberta fica num retrato normal, sem virar tira",
  proporcoes.length > 0 && proporcoes.every((r) => r >= 1 && r <= 1.9),
  proporcoes.map((r) => "1:" + r.toFixed(2)).join(", ")
);
checar(
  "O recorte retrato vem pronto do servidor de imagens, com a versão deitada para o celular",
  await abertas.evaluate(() =>
    Array.from(document.querySelectorAll(".open-card__media")).every((media) => {
      const img = media.querySelector("picture > img");
      const fonte = media.querySelector("picture > source");
      return (
        img &&
        fonte &&
        /w=480&h=760/.test(img.getAttribute("src")) &&
        fonte.getAttribute("media") === "(max-width: 519px)" &&
        /w=800/.test(fonte.getAttribute("srcset"))
      );
    })
  )
);

/* Com cidade escolhida na busca do hero, as da cidade encabeçam a lista. */
await abertas.evaluate(() => {
  localStorage.setItem("inbarber:city", "Curitiba");
  document.dispatchEvent(new CustomEvent("inbarber:citychange", { detail: { city: "Curitiba" } }));
});
await abertas.waitForTimeout(250);
checar(
  "Com cidade conhecida, as abertas da cidade vêm primeiro",
  (await abertas.$eval(".open-card__name a", (a) => a.textContent.trim())) === "Distrito Barber",
  await abertas.$eval(".open-card__name a", (a) => a.textContent.trim())
);
checar(
  "A aberta da cidade recebe o selo \"Na sua cidade\"",
  (await abertas.$eval(".open-card .rec-near", (n) => n.textContent.trim())) === "Na sua cidade"
);
await abertas.evaluate(() => localStorage.removeItem("inbarber:city"));
await abertas.close();

/* Ícone no lugar do ponto colorido, nos dois títulos de bloco. */
const marcas = await ctx.newPage();
vigiar(marcas, "marcas-de-bloco");
await marcas.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await marcas.waitForSelector(".open-card");
checar(
  "\"Novas na InBarber\" e \"Abertas agora\" são anunciadas por ícone, não por bola",
  await marcas.evaluate(() => {
    const novas = document.querySelector(".news__title .section-mark--violet svg");
    const abertas = document.querySelector(".open__title .section-mark--success svg");
    const semPseudo = (sel) =>
      getComputedStyle(document.querySelector(sel), "::before").content === "none";
    return !!novas && !!abertas && semPseudo(".news__title") && semPseudo(".open__title");
  })
);
checar(
  "As marcas dos títulos são decorativas para o leitor de tela",
  await marcas.evaluate(() =>
    Array.from(document.querySelectorAll(".section-mark")).every(
      (n) => n.getAttribute("aria-hidden") === "true"
    )
  )
);
checar(
  "O título continua legível como texto para o leitor de tela",
  (await marcas.$eval(".open__title", (n) => n.textContent.replace(/\s+/g, " ").trim())) ===
    "Abertas agora"
);
await marcas.close();

/* --- 15.3 Fechada em vermelho ------------------------------------------------ */
const status = await ctx.newPage();
vigiar(status, "status-fechada");
await status.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await status.waitForSelector(".rec-hero__name");
checar(
  "Todo selo de fechada usa o vermelho de erro, e nenhum de aberta usa",
  await status.evaluate(() => {
    const selos = Array.from(document.querySelectorAll(".rec-hero__status, .rec-card__status, .news-card__status"));
    if (!selos.length) return false;
    return selos.every((selo) => {
      const fechada = selo.textContent.trim() === "Fechada";
      return selo.classList.contains("badge--danger") === fechada;
    });
  })
);
const corFechada = await status.evaluate(() => {
  const selo = Array.from(document.querySelectorAll(".badge--danger"))[0];
  return selo ? getComputedStyle(selo).color : "";
});
checar(
  "O vermelho do selo é o --color-error do design system",
  corFechada === "rgb(239, 68, 68)",
  corFechada
);
await status.close();

/* --- 15.4 Trilho de novas: navegação e nada de rolagem vertical --------------- */
const trilho = await ctx.newPage();
vigiar(trilho, "trilho-novas");
await trilho.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await trilho.waitForSelector(".news-card");
await trilho.evaluate(() =>
  document.querySelectorAll("[data-reveal]").forEach((n) => n.classList.add("is-visible"))
);
await trilho.waitForTimeout(300);

checar(
  "O trilho de novas não rola na vertical",
  await trilho.evaluate(() => {
    const rail = document.querySelector(".news__rail");
    return getComputedStyle(rail).overflowY === "hidden" && rail.scrollHeight - rail.clientHeight <= 0;
  }),
  await trilho.evaluate(() => {
    const rail = document.querySelector(".news__rail");
    return `${getComputedStyle(rail).overflowY} / sobra ${rail.scrollHeight - rail.clientHeight}px`;
  })
);
checar(
  "Setas ficam nas laterais do trilho no desktop",
  await trilho.evaluate(() => {
    const prev = document.querySelector("[data-news-prev]");
    const rail = document.querySelector(".news__rail");
    /* absoluto: o inline-flex do CSS é "blockificado" para flex pelo navegador */
    if (prev.hidden || getComputedStyle(prev).display === "none") return false;
    const caixa = prev.getBoundingClientRect();
    const trilho = rail.getBoundingClientRect();
    return caixa.right <= trilho.left + 24;
  })
);
checar(
  "Um ponto por barbearia do trilho, com o primeiro em destaque",
  await trilho.evaluate(() => {
    const pontos = document.querySelectorAll(".news__dot");
    const cards = document.querySelectorAll(".news-card");
    return pontos.length === cards.length && pontos[0].classList.contains("is-current");
  })
);
checar(
  "A seta avança o trilho e o ponto acompanha",
  await trilho.evaluate(async () => {
    const rail = document.querySelector(".news__rail");
    document.querySelector("[data-news-next]").click();
    await new Promise((r) => setTimeout(r, 600));
    const pontoAtivo = Array.from(document.querySelectorAll(".news__dot")).findIndex((d) =>
      d.classList.contains("is-current")
    );
    return rail.scrollLeft > 0 && pontoAtivo > 0;
  })
);
checar(
  "O ponto leva direto à barbearia escolhida",
  await trilho.evaluate(async () => {
    const rail = document.querySelector(".news__rail");
    document.querySelectorAll(".news__dot")[0].click();
    await new Promise((r) => setTimeout(r, 600));
    return rail.scrollLeft < 8;
  })
);
checar(
  "As setas do teclado percorrem o trilho",
  await trilho.evaluate(async () => {
    const rail = document.querySelector(".news__rail");
    rail.focus();
    const antes = rail.scrollLeft;
    rail.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await new Promise((r) => setTimeout(r, 600));
    return document.activeElement === rail && rail.scrollLeft > antes;
  })
);
checar(
  "O card do trilho carrega nota, status, serviços e chamada para o perfil",
  await trilho.evaluate(() => {
    const card = document.querySelector(".news-card");
    return (
      !!card.querySelector(".rec-rating__count") &&
      !!card.querySelector(".news-card__status") &&
      card.querySelectorAll(".rec-services .chip").length > 0 &&
      !!card.querySelector(".rec-card__cta")
    );
  })
);
checar(
  "A contagem de novas bate com a janela do selo \"Novo\"",
  await trilho.evaluate(() => {
    const data = window.INBARBER_DATA;
    const dentro = data.newest(6).filter((s) => data.isNewShop(s)).length;
    const texto = document.querySelector("[data-news-count]").textContent.trim();
    return dentro === 0
      ? document.querySelector("[data-news-count]").hidden
      : texto === `${dentro} novas nos últimos ${data.newShopDays} dias`;
  }),
  await trilho.$eval("[data-news-count]", (n) => n.textContent.trim())
);
await trilho.close();

/* No celular as setas saem de cena: o trilho se rola com o polegar. */
const trilhoMobile = await ctx.newPage();
vigiar(trilhoMobile, "trilho-mobile");
await trilhoMobile.setViewportSize({ width: 375, height: 800 });
await trilhoMobile.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await trilhoMobile.waitForSelector(".news-card");
checar(
  "No celular o trilho não mostra setas",
  (await trilhoMobile.$eval("[data-news-next]", (n) => getComputedStyle(n).display)) === "none"
);
await trilhoMobile.close();

/* --- 15.5 Favoritar exige conta ---------------------------------------------- */
/* Contexto próprio: esta bateria cria sessão e favoritas, e nada disso pode
   vazar para as outras verificações. */
const ctxConta = await navegador.newContext({ viewport: { width: 1280, height: 900 }, locale: "pt-BR" });
const conta = await ctxConta.newPage();
vigiar(conta, "conta");
await conta.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded" });
await conta.waitForSelector(".open-card");

checar(
  "Todo card de barbearia da home tem coração",
  await conta.evaluate(() => {
    const cards = document.querySelectorAll(".rec-hero, .rec-card, .news-card, .open-card");
    return cards.length > 0 && Array.from(cards).every((c) => c.querySelector("[data-fav]"));
  })
);
checar(
  "Sem conta, o coração aparece bloqueado e vazio",
  await conta.evaluate(() =>
    Array.from(document.querySelectorAll("[data-fav]")).every(
      (b) => b.hasAttribute("data-fav-locked") && b.getAttribute("aria-pressed") === "false"
    )
  )
);
checar(
  "Sem conta, o rótulo do coração convida a entrar",
  /^Entre na sua conta para salvar .+ nas favoritas$/.test(
    await conta.$eval("[data-fav]", (b) => b.getAttribute("aria-label"))
  ),
  await conta.$eval("[data-fav]", (b) => b.getAttribute("aria-label"))
);

const urlAntes = conta.url();
const alvo = await conta.$eval(".rec-hero [data-fav]", (b) => b.getAttribute("data-fav-name"));
await conta.click(".rec-hero [data-fav]");
await conta.waitForTimeout(300);
checar("O coração não leva ao perfil por engano", conta.url() === urlAntes);
checar(
  "Sem conta, o clique no coração abre o painel de entrada",
  await conta.evaluate(() => {
    const painel = document.querySelector("[data-account-panel]");
    return painel && !painel.hidden;
  })
);
checar(
  "O painel diz qual barbearia o visitante quis salvar",
  (await conta.$eval("[data-account-intro]", (n) => n.textContent.trim())) ===
    `Entre para salvar ${alvo} nas suas favoritas.`,
  await conta.$eval("[data-account-intro]", (n) => n.textContent.trim())
);
checar(
  "Sem conta, nada é salvo",
  (await conta.evaluate(() => window.InBarberAccount.favorites().length)) === 0
);

/* E-mail inválido não abre sessão. */
await conta.fill("#account-name", "Miguel Costa");
await conta.fill("#account-email", "miguel");
await conta.click(".account-panel__submit");
await conta.waitForTimeout(200);
checar(
  "E-mail inválido não inicia sessão e explica o erro",
  (await conta.evaluate(() => window.InBarberAccount.isSignedIn())) === false &&
    (await conta.$eval("[data-account-error]", (n) => !n.hidden))
);

await conta.fill("#account-email", "miguel@exemplo.com");
await conta.click(".account-panel__submit");
await conta.waitForTimeout(400);

checar("Entrar inicia a sessão", await conta.evaluate(() => window.InBarberAccount.isSignedIn()));
checar(
  "A barbearia que estava esperando entra nas favoritas assim que a conta existe",
  await conta.evaluate(() => {
    const shop = window.INBARBER_DATA.recommended(null, 7)[0];
    return window.InBarberAccount.isFavorite(shop.id);
  })
);
checar(
  "O coração fica preenchido e muda o rótulo",
  await conta.$eval(
    ".rec-hero [data-fav]",
    (b) =>
      b.getAttribute("aria-pressed") === "true" &&
      !b.hasAttribute("data-fav-locked") &&
      b.getAttribute("aria-label").indexOf("Tirar") === 0
  )
);
checar(
  "O header passa a mostrar a conta do visitante",
  (await conta.$eval("[data-signin] .account-avatar", (n) => n.textContent.trim())) === "MC",
  await conta.$eval("[data-signin]", (n) => n.textContent.trim())
);

await conta.reload({ waitUntil: "domcontentloaded" });
await conta.waitForSelector(".rec-hero__name");
checar(
  "A favorita e a sessão sobrevivem ao recarregar",
  (await conta.evaluate(() => window.InBarberAccount.isSignedIn())) &&
    (await conta.$eval(".rec-hero [data-fav]", (b) => b.getAttribute("aria-pressed"))) === "true"
);

/* Desfavoritar volta atrás sem apagar a sessão. */
await conta.click(".rec-hero [data-fav]");
await conta.waitForTimeout(250);
checar(
  "Clicar de novo tira das favoritas",
  (await conta.evaluate(() => window.InBarberAccount.favorites().length)) === 0 &&
    (await conta.$eval(".rec-hero [data-fav]", (b) => b.getAttribute("aria-pressed"))) === "false"
);

/* Menu da conta e saída. */
await conta.click("[data-fav]");
await conta.waitForTimeout(200);
await conta.click("[data-signin]");
await conta.waitForTimeout(200);
checar(
  "Com sessão, o botão do header abre o menu da conta",
  await conta.$eval("[data-account-menu]", (n) => !n.hidden)
);
checar(
  "O menu conta quantas favoritas o visitante tem",
  (await conta.$eval(".account-menu__favorites", (n) => n.textContent.trim())) === "1 barbearia favorita",
  await conta.$eval(".account-menu__favorites", (n) => n.textContent.trim())
);
await conta.click("[data-account-signout]");
await conta.waitForTimeout(300);
checar(
  "Sair encerra a sessão e tranca o coração de novo",
  (await conta.evaluate(() => window.InBarberAccount.isSignedIn())) === false &&
    (await conta.$eval("[data-fav]", (b) => b.hasAttribute("data-fav-locked")))
);
checar(
  "As favoritas continuam guardadas para quando a mesma conta voltar",
  await conta.evaluate(() => {
    window.InBarberAccount.signIn({ name: "Miguel Costa", email: "miguel@exemplo.com" });
    return window.InBarberAccount.favorites().length === 1;
  })
);

/* i18n dos rótulos do coração. */
await conta.evaluate(() => window.InBarberI18n.setLanguage("en"));
await conta.waitForTimeout(300);
checar(
  "O rótulo do coração acompanha o idioma",
  /favourites$/.test(await conta.$eval("[data-fav]", (b) => b.getAttribute("aria-label"))),
  await conta.$eval("[data-fav]", (b) => b.getAttribute("aria-label"))
);
await ctxConta.close();

/* --- 16. Responsivo ---------------------------------------------------------- */
const rotas = ["index.html", "barbearias.html", "barbearia.html?id=distrito-barber", "para-barbearias.html"];
for (const largura of [320, 375, 480, 768, 1024, 1280, 1440]) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: largura, height: 900 });
  for (const rota of rotas) {
    await p.goto(`${BASE}/${rota}`, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(220);
    const excesso = await p.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    );
    checar(`Sem rolagem horizontal em ${largura}px (${rota.split("?")[0]})`, excesso === 0, `${excesso}px`);
  }
  await p.close();
}

/* --- 17. Saúde geral --------------------------------------------------------- */
checar("Nenhum erro de JS e nenhuma chave sem tradução", problemas.length === 0, problemas.slice(0, 6).join(" | "));

await navegador.close();

console.log(`\n✓ ${ok.length} verificações passaram`);
if (falhas.length) {
  console.log(`\n✗ ${falhas.length} falharam:`);
  falhas.forEach((f) => console.log("   - " + f));
  process.exit(1);
}
console.log("Tudo certo.\n");