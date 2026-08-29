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
checar("Escassez: respeita o teto de 5 slots", nomes.length <= 5, `${nomes.length} slides`);
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