/* ==========================================================================
   InBarber — Dicionário de traduções
   Idiomas: pt (PT-BR, padrão), en, es
   Regra do projeto: nenhum texto visível fica hardcoded no HTML.
   Chaves com "Html" no nome aceitam marcação inline (<span>, <br>, <strong>).
   Interpolação: {chave} é substituída em tempo de execução pelo i18n.
   ========================================================================== */

window.INBARBER_TRANSLATIONS = {
  /* ======================================================================
     PORTUGUÊS (BR) — idioma de fallback
     ====================================================================== */
  pt: {
    /* ---------- Metadados por página ---------- */
    "meta.home.title": "InBarber — Encontre e agende na melhor barbearia perto de você",
    "meta.home.description":
      "A InBarber conecta você às melhores barbearias da sua cidade. Compare avaliações, escolha o serviço e agende em menos de um minuto, direto pelo navegador.",
    "meta.shops.title": "Barbearias — Busque por cidade, serviço e avaliação | InBarber",
    "meta.shops.description":
      "Explore todas as barbearias cadastradas na InBarber. Filtre por cidade, tipo de serviço e nota mínima para achar o corte certo perto de você.",
    "meta.b2b.title": "Para Barbearias — Cadastre sua barbearia grátis | InBarber",
    "meta.b2b.description":
      "Coloque sua barbearia no mapa da InBarber: mais visibilidade, agenda organizada e clientes recorrentes. Cadastro gratuito e sem fidelidade.",

    /* ---------- Marca ---------- */
    "brand.name": "InBarber",
    "brand.tagline": "A plataforma que conecta você às melhores barbearias.",
    "brand.logoAlt": "InBarber — página inicial",

    /* ---------- Navegação e ações do header ---------- */
    "nav.skip": "Pular para o conteúdo principal",
    "nav.business": "InBarber para Negócios",
    "nav.businessShort": "Negócios",
    "nav.signIn": "Iniciar sessão",

    /* ---------- Seletor de idioma ---------- */
    "lang.label": "Selecionar idioma",
    "lang.pt": "Português (Brasil)",
    "lang.en": "English",
    "lang.es": "Español",
    "lang.menuLabel": "Escolher idioma",

    /* ---------- HOME · Hero ---------- */
    "hero.badge": "Novo: agendamento em tempo real em 42 cidades",
    "hero.titleHtml": "Seu próximo corte<br>começa <span class=\"text-gradient\">aqui</span>.",
    "hero.subtitle":
      "Encontre barbearias de verdade perto de você, veja quem já cortou lá e feche o horário em menos de um minuto. Sem telefonema, sem fila, sem app para instalar.",
    "hero.stat1Label": "barbearias cadastradas",
    "hero.stat2Label": "agendamentos realizados",
    "hero.stat3Label": "nota média da plataforma",
    "hero.imageAlt": "Barbeiro finalizando um degradê em um cliente numa barbearia com iluminação neon",
    "hero.scroll": "Role para descobrir",
    "hero.trustLabel": "Barbearias parceiras em",

    /* ---------- Busca com filtros (hero + página de barbearias) ---------- */
    "search.whereLabel": "Onde",
    "search.wherePlaceholder": "Cidade ou bairro",
    "search.whereAny": "Qualquer lugar",
    "search.whenLabel": "Quando",
    "search.timeLabel": "Horário",
    "search.submit": "Buscar",
    "search.useMyLocation": "Usar minha localização",
    "search.popularCities": "Cidades com mais barbearias",
    "search.openPanel": "Abrir opções de {field}",
    "geo.locating": "Localizando você…",
    "geo.matched": "Barbearias perto de {city}",
    "geo.tooFar": "Ainda não temos barbearias perto de você. Escolha uma cidade da lista.",
    "geo.error": "Não conseguimos acessar sua localização. Escolha a cidade na lista.",
    "geo.unsupported": "Seu navegador não suporta geolocalização. Escolha a cidade na lista.",

    /* ---------- Dia e período do dia ---------- */
    "day.any": "Qualquer dia",
    "day.today": "Hoje",
    "day.tomorrow": "Amanhã",
    "day.weekend": "Fim de semana",
    "time.any": "Qualquer horário",
    "time.morning": "Manhã · 8h às 12h",
    "time.afternoon": "Tarde · 12h às 18h",
    "time.evening": "Noite · 18h às 22h",
    "time.morningShort": "Manhã",
    "time.afternoonShort": "Tarde",
    "time.eveningShort": "Noite",

    /* ---------- HOME · Como funciona ---------- */
    "how.eyebrow": "Como funciona",
    "how.title": "Do celular à cadeira em quatro passos",
    "how.subtitle":
      "A InBarber tira o atrito do agendamento. Você escolhe, confirma e aparece — o resto a barbearia já sabe.",
    "how.stepLabel": "Passo",
    "how.step1.title": "Busque perto de você",
    "how.step1.desc":
      "Digite sua cidade ou use a localização do navegador. Mostramos as barbearias abertas hoje, ordenadas por distância e nota.",
    "how.step1.alt": "Tela de busca da InBarber com resultados de barbearias próximas",
    "how.step2.title": "Veja o perfil da barbearia",
    "how.step2.desc":
      "Fotos reais do espaço, portfólio de cortes, preços de cada serviço e avaliações de quem já sentou na cadeira.",
    "how.step2.alt": "Perfil de uma barbearia com galeria de fotos, serviços e avaliações",
    "how.step3.title": "Escolha serviço e horário",
    "how.step3.desc":
      "Selecione o corte, o barbeiro e um horário livre na agenda em tempo real. Nada de \"te retorno depois\".",
    "how.step3.alt": "Seleção de serviço e horário disponível na agenda da barbearia",
    "how.step4.title": "Confirme e pronto",
    "how.step4.desc":
      "Você recebe a confirmação na hora e um lembrete antes do horário. Precisou remarcar? Dois toques resolvem.",
    "how.step4.alt": "Tela de confirmação de agendamento com data, horário e barbeiro escolhidos",
    "how.note": "Tudo pelo navegador. Nenhum aplicativo para baixar.",
    "how.cta": "Buscar uma barbearia agora",

    /* ---------- HOME · Barbearias recomendadas ---------- */
    "shops.eyebrow": "Barbearias recomendadas",
    "shops.title": "As mais bem avaliadas desta semana",
    "shops.subtitle":
      "Seleção baseada em avaliações verificadas de clientes que agendaram pela InBarber nos últimos 30 dias.",
    "shops.viewAll": "Ver todas as barbearias",
    "shops.viewProfile": "Ver perfil",

    /* ---------- Barbearias em Destaque (carrossel patrocinado do hero) ---------- */
    "featured.title": "Barbearias em Destaque",
    "featured.sponsored": "Destaque pago",
    "featured.sponsoredNote": "Espaço publicitário da InBarber. Esta barbearia pagou para aparecer aqui.",
    "featured.carousel": "Barbearias em destaque",
    "featured.slide": "{current} de {total}",
    "featured.prev": "Barbearia anterior",
    "featured.next": "Próxima barbearia",
    "featured.pause": "Pausar a rotação",
    "featured.resume": "Retomar a rotação",
    "featured.goTo": "Ir para a barbearia {n}",
    "featured.counter": "{current} de {total}",
    "featured.emptyTitle": "Seu espaço começa aqui",
    "featured.emptyText": "Nenhuma barbearia em destaque no momento.",
    "featured.advertise": "Anuncie sua barbearia",

    /* ---------- Perfil individual da barbearia ---------- */
    "profile.back": "Voltar às barbearias",
    "profile.featuredBadge": "Destaque pago",
    "profile.services": "Serviços e preços",
    "profile.hours": "Quando abre",
    "profile.priceNote": "Valor a partir de, por serviço.",
    "profile.notFoundTitle": "Barbearia não encontrada",
    "profile.notFoundText": "O endereço acessado não corresponde a nenhuma barbearia cadastrada.",
    "profile.seeAll": "Ver todas as barbearias",
    "meta.shop.title": "{name} — InBarber",
    "meta.shop.description": "Serviços, preços, horários e agendamento na {name}, em {city}. Reserve pelo navegador, na InBarber.",

    /* ---------- Dias da semana (abreviados) ---------- */
    "day.short0": "Dom",
    "day.short1": "Seg",
    "day.short2": "Ter",
    "day.short3": "Qua",
    "day.short4": "Qui",
    "day.short5": "Sex",
    "day.short6": "Sáb",
    "shops.book": "Agendar",
    "shops.from": "a partir de",
    "shops.reviewsSuffix": "avaliações",
    "shops.openNow": "Aberto agora",
    "shops.closed": "Fechado",
    "shops.empty": "Nenhuma barbearia encontrada com esses filtros. Tente ampliar a busca.",
    "shops.emptyAction": "Limpar filtros",
    "shops.resultsOne": "1 barbearia encontrada",
    "shops.resultsMany": "{count} barbearias encontradas",
    "shops.photoAlt": "Interior da barbearia {name}, em {city}",

    /* ---------- Filtros da listagem ---------- */
    "filters.title": "Filtrar resultados",
    "filters.city": "Cidade",
    "filters.anyCity": "Todas as cidades",
    "filters.service": "Serviço",
    "filters.anyService": "Todos os serviços",
    "filters.rating": "Avaliação mínima",
    "filters.anyRating": "Qualquer nota",
    "filters.rating45": "4,5 estrelas ou mais",
    "filters.rating40": "4,0 estrelas ou mais",
    "filters.rating35": "3,5 estrelas ou mais",
    "filters.reset": "Limpar filtros",
    "filters.sort": "Ordenar por",
    "filters.sortRating": "Melhor avaliadas",
    "filters.sortReviews": "Mais avaliadas",
    "filters.sortPrice": "Menor preço",
    "filters.sortName": "Ordem alfabética",
    "filters.day": "Dia",
    "filters.time": "Período",
    "filters.activeTitle": "Filtros ativos",
    "filters.removeFilter": "Remover filtro {label}",

    /* ---------- Serviços ---------- */
    "service.fade": "Degradê",
    "service.beard": "Barba",
    "service.classic": "Corte clássico",
    "service.kids": "Corte infantil",
    "service.coloring": "Coloração",
    "service.hotTowel": "Barba na toalha quente",
    "service.braids": "Tranças e dreads",
    "service.grooming": "Cuidados masculinos",

    /* ---------- HOME · Tendências ---------- */
    "trends.eyebrow": "Tendências & estilos",
    "trends.title": "O que está saindo das cadeiras agora",
    "trends.subtitle":
      "Um recorte do que os barbeiros parceiros mais executaram no último trimestre — com o vocabulário certo para você pedir na cadeira.",
    "trends.readMore": "Ler matéria",
    "trends.main.tag": "Corte do trimestre",
    "trends.main.title": "Mid fade texturizado",
    "trends.main.desc":
      "O degradê médio dominou os pedidos em 2026. O topo vem mais longo e desconectado, trabalhado com pomada matte para criar movimento sem peso. Funciona em cabelo liso, ondulado e crespo — muda só a técnica de finalização.",
    "trends.main.alt": "Homem com corte mid fade texturizado visto de perfil",
    "trends.item1.tag": "Barba",
    "trends.item1.title": "Barba cheia com linha desenhada",
    "trends.item1.desc":
      "Volume preservado nas laterais e contorno milimétrico no pescoço e nas maçãs do rosto. Pede manutenção a cada 15 dias.",
    "trends.item1.alt": "Barbeiro desenhando o contorno da barba de um cliente com navalha",
    "trends.item2.tag": "Clássico",
    "trends.item2.title": "Volta do side part",
    "trends.item2.desc":
      "A risca lateral marcada voltou puxada pela alfaiataria. Combina com fade baixo e finalização com brilho controlado.",
    "trends.item2.alt": "Corte clássico com risca lateral bem definida",
    "trends.item3.tag": "Cor",
    "trends.item3.title": "Platinado com raiz sombreada",
    "trends.item3.desc":
      "Descoloração global com a raiz propositalmente mais escura: o crescimento fica natural e o retoque cai para 6 semanas.",
    "trends.item3.alt": "Cliente com cabelo platinado e raiz sombreada",
    "trends.item4.tag": "Cuidados",
    "trends.item4.title": "Ritual de toalha quente",
    "trends.item4.desc":
      "Vapor, óleo pré-barba e navalha. É o serviço com maior nota média da plataforma e o que mais faz o cliente voltar.",
    "trends.item4.alt": "Cliente recebendo tratamento de toalha quente na barbearia",

    /* ---------- HOME · Avaliações ---------- */
    "reviews.eyebrow": "Avaliações da InBarber",
    "reviews.title": "Quem agenda pela InBarber volta",
    "reviews.subtitle":
      "Avaliações verificadas: só quem concluiu um agendamento pela plataforma pode avaliar.",
    "reviews.scoreValue": "4,9",
    "reviews.scoreLabel": "de 12.000 avaliações",
    "reviews.scoreCaption": "Nota média da plataforma nos últimos 12 meses",
    "reviews.starsAlt": "Nota {rating} de 5 estrelas",
    "reviews.avatarAlt": "Foto de {name}",
    "reviews.prev": "Depoimento anterior",
    "reviews.next": "Próximo depoimento",
    "reviews.item1.name": "Rafael Nogueira",
    "reviews.item1.city": "São Paulo, SP",
    "reviews.item1.text":
      "Mudei de bairro e não conhecia ninguém. Achei uma barbearia com 4,9 a três quadras de casa, agendei às 22h de um domingo e no dia seguinte já estava na cadeira. Virou minha barbearia fixa.",
    "reviews.item2.name": "Diego Almeida",
    "reviews.item2.city": "Belo Horizonte, MG",
    "reviews.item2.text":
      "O que me pegou foi ver o preço de cada serviço antes de ir. Sem surpresa na hora de pagar, sem precisar perguntar no WhatsApp.",
    "reviews.item3.name": "Lucas Ferreira",
    "reviews.item3.city": "Porto Alegre, RS",
    "reviews.item3.text":
      "Trabalho em escala e nunca conseguia ligar no horário comercial. Agendo pelo celular na madrugada e recebo o lembrete no dia. Resolveu um problema real.",
    "reviews.item4.name": "Bruno Carvalho",
    "reviews.item4.city": "Recife, PE",
    "reviews.item4.text":
      "Levei meu filho pela primeira vez usando o filtro de corte infantil. O perfil mostrava fotos do espaço e ele foi tranquilo. Detalhe que faz diferença.",
    "reviews.item5.name": "Thiago Menezes",
    "reviews.item5.city": "Curitiba, PR",
    "reviews.item5.text":
      "Precisei remarcar duas vezes na mesma semana e não tive que pedir desculpa para ninguém no telefone. Dois cliques e pronto.",
    "reviews.item6.name": "André Batista",
    "reviews.item6.city": "Salvador, BA",
    "reviews.item6.text":
      "As avaliações são honestas porque só avalia quem foi de verdade. Já evitei dois lugares e acertei em cheio no terceiro.",

    /* ---------- HOME · Preview B2B ---------- */
    "b2bPreview.eyebrow": "Para donos de barbearia",
    "b2bPreview.title": "Você tem uma barbearia?",
    "b2bPreview.desc":
      "Coloque sua barbearia na frente de quem está procurando corte agora e receba os agendamentos em uma agenda organizada — sem mensalidade para começar.",
    "b2bPreview.bullet1": "Perfil público com fotos, serviços e preços",
    "b2bPreview.bullet2": "Agenda em tempo real, sem conflito de horário",
    "b2bPreview.bullet3": "Cadastro gratuito e sem fidelidade",
    "b2bPreview.cta": "Conhecer a InBarber para barbearias",
    "b2bPreview.imageAlt": "Painel de gestão da InBarber aberto no notebook de uma barbearia",

    /* ---------- B2B · Hero ---------- */
    "b2b.hero.badge": "Cadastro gratuito · Sem fidelidade",
    "b2b.hero.titleHtml": "Sua barbearia<br>no <span class=\"text-gradient\">InBarber</span>.",
    "b2b.hero.subtitle":
      "Mais gente descobrindo seu trabalho, uma agenda que não deixa horário vago e um histórico de clientes que volta. Tudo pelo navegador, sem instalar nada.",
    "b2b.hero.cta": "Cadastrar minha barbearia",
    "b2b.hero.secondary": "Ver funcionalidades do painel",
    "b2b.hero.imageAlt": "Painel de gestão da InBarber mostrando a agenda do dia de uma barbearia",
    "b2b.hero.stat1Label": "aumento médio de agendamentos em 90 dias",
    "b2b.hero.stat2Label": "queda média de faltas com lembrete automático",
    "b2b.hero.stat3Label": "das barbearias renovam depois do 1º mês",

    /* ---------- B2B · Benefícios ---------- */
    "b2b.benefits.eyebrow": "Proposta de valor",
    "b2b.benefits.title": "Três motivos para estar na InBarber",
    "b2b.benefits.subtitle":
      "Não é mais um sistema para você aprender. É o canal por onde o cliente novo te encontra e o antigo volta sozinho.",
    "b2b.benefits.item1.title": "Mais visibilidade",
    "b2b.benefits.item1.desc":
      "Sua barbearia aparece nas buscas por bairro, serviço e nota. Quem está procurando corte hoje encontra você antes de encontrar o concorrente.",
    "b2b.benefits.item2.title": "Agenda organizada",
    "b2b.benefits.item2.desc":
      "Horários em tempo real, bloqueio automático de conflitos e lembrete enviado ao cliente. Menos mensagem no WhatsApp, menos cadeira vazia.",
    "b2b.benefits.item3.title": "Mais clientes recorrentes",
    "b2b.benefits.item3.desc":
      "Histórico completo de cada cliente: o que cortou, com quem, quando e quanto pagou. Fica fácil trazer de volta quem sumiu.",

    /* ---------- B2B · Funcionalidades ---------- */
    "b2b.features.eyebrow": "Funcionalidades do painel",
    "b2b.features.title": "Tudo que a barbearia precisa, em uma tela só",
    "b2b.features.subtitle":
      "O painel foi desenhado com barbeiros, testado no balcão e pensado para ser usado entre um cliente e outro.",
    "b2b.features.item1.title": "Gestão de agenda",
    "b2b.features.item1.desc":
      "Veja o dia inteiro em uma linha do tempo por barbeiro. Arraste para remarcar, bloqueie intervalos e defina a duração de cada serviço. Encaixes de última hora entram sem quebrar o resto da agenda.",
    "b2b.features.item1.bullet1": "Visão por dia, semana e por profissional",
    "b2b.features.item1.bullet2": "Bloqueio de horários e folgas em dois cliques",
    "b2b.features.item1.bullet3": "Lembrete automático 24h antes do atendimento",
    "b2b.features.item1.alt": "Tela de gestão de agenda do painel InBarber com horários por barbeiro",
    "b2b.features.item2.title": "Perfil público",
    "b2b.features.item2.desc":
      "Sua vitrine na plataforma: galeria de fotos, lista de serviços com preço e duração, equipe, horário de funcionamento e endereço no mapa. Você edita, publica e vê no ar na hora.",
    "b2b.features.item2.bullet1": "Galeria de cortes e do espaço",
    "b2b.features.item2.bullet2": "Tabela de serviços com preço e duração",
    "b2b.features.item2.bullet3": "Página otimizada para busca no Google",
    "b2b.features.item2.alt": "Editor de perfil público da barbearia com galeria e tabela de serviços",
    "b2b.features.item3.title": "Histórico de clientes",
    "b2b.features.item3.desc":
      "Cada cliente tem uma ficha: serviços feitos, barbeiro preferido, frequência e observações. Descubra quem não aparece há 60 dias e traga de volta com uma ação simples.",
    "b2b.features.item3.bullet1": "Ficha com preferências e observações",
    "b2b.features.item3.bullet2": "Alerta de clientes inativos",
    "b2b.features.item3.bullet3": "Exportação da base em CSV, sempre sua",
    "b2b.features.item3.alt": "Ficha de cliente no painel InBarber com histórico de atendimentos",
    "b2b.features.item4.title": "Avaliações recebidas",
    "b2b.features.item4.desc":
      "Acompanhe sua nota por barbeiro e por serviço, responda publicamente e identifique padrões antes que virem reclamação. Só avalia quem realmente foi atendido.",
    "b2b.features.item4.bullet1": "Nota consolidada e evolução no tempo",
    "b2b.features.item4.bullet2": "Resposta pública a cada avaliação",
    "b2b.features.item4.bullet3": "Avaliações verificadas, sem review falso",
    "b2b.features.item4.alt": "Tela de avaliações recebidas com nota por barbeiro e comentários",

    /* ---------- B2B · Depoimentos ---------- */
    "b2b.testimonials.eyebrow": "Depoimentos de barbeiros",
    "b2b.testimonials.title": "Quem já está dentro",
    "b2b.testimonials.subtitle":
      "Donos de barbearia que trocaram a caderneta e o WhatsApp pelo painel da InBarber.",
    "b2b.testimonials.item1.metricLabel": "de agendamentos em 3 meses",
    "b2b.testimonials.item2.metricLabel": "conflitos de horário desde a migração",
    "b2b.testimonials.item3.metricLabel": "de faltas com lembrete automático",
    "b2b.testimonials.item4.metricLabel": "clientes recuperados em uma semana",
    "b2b.testimonials.item1.name": "Marcos Vinícius",
    "b2b.testimonials.item1.role": "Dono da Navalha & Cia · São Paulo, SP",
    "b2b.testimonials.item1.text":
      "Em três meses subi de 180 para 290 atendimentos por mês. A maior parte é gente que nunca tinha ouvido falar da minha barbearia e achou pelo filtro de bairro.",
    "b2b.testimonials.item2.name": "Jonas Ribeiro",
    "b2b.testimonials.item2.role": "Dono da Corte Real · Belo Horizonte, MG",
    "b2b.testimonials.item2.text":
      "Minha agenda era um caderno e três conversas de WhatsApp ao mesmo tempo. Hoje abro o painel de manhã e sei exatamente como vai ser o dia. Não marco dois clientes no mesmo horário há meses.",
    "b2b.testimonials.item3.name": "Paulo Sérgio",
    "b2b.testimonials.item3.role": "Sócio da Distrito Barber · Curitiba, PR",
    "b2b.testimonials.item3.text":
      "O lembrete automático derrubou as faltas quase pela metade. Cadeira vazia era o que mais doía no fim do mês.",
    "b2b.testimonials.item4.name": "Fernando Lima",
    "b2b.testimonials.item4.role": "Dono da Barbearia do Fernando · Recife, PE",
    "b2b.testimonials.item4.text":
      "O histórico me mostrou 40 clientes que não voltavam há dois meses. Mandei uma mensagem e mais da metade remarcou. Isso pagou o mês.",

    /* ---------- B2B · CTA final e formulário ---------- */
    "b2b.cta.eyebrow": "Comece agora",
    "b2b.cta.title": "Cadastre sua barbearia gratuitamente",
    "b2b.cta.subtitle":
      "Leva menos de dois minutos. Nossa equipe entra em contato para ativar seu perfil e configurar a agenda com você.",
    "b2b.cta.point1": "Sem mensalidade nos primeiros 30 dias",
    "b2b.cta.point2": "Sem fidelidade — cancele quando quiser",
    "b2b.cta.point3": "Suporte humano na configuração inicial",
    "b2b.form.legend": "Dados da barbearia",
    "b2b.form.shopName": "Nome da barbearia",
    "b2b.form.shopNamePlaceholder": "Ex.: Navalha & Cia",
    "b2b.form.ownerName": "Nome do responsável",
    "b2b.form.ownerNamePlaceholder": "Ex.: Marcos Vinícius",
    "b2b.form.email": "E-mail",
    "b2b.form.emailPlaceholder": "voce@suabarbearia.com",
    "b2b.form.city": "Cidade",
    "b2b.form.cityPlaceholder": "Ex.: São Paulo, SP",
    "b2b.form.submit": "Cadastrar minha barbearia",
    "b2b.form.privacy":
      "Ao enviar, você concorda com nossa Política de Privacidade. Não compartilhamos seus dados com terceiros.",
    "b2b.form.errorRequired": "Preencha este campo para continuar.",
    "b2b.form.errorEmail": "Informe um e-mail válido.",
    "b2b.form.success":
      "Cadastro recebido! Nossa equipe entra em contato pelo e-mail informado em até um dia útil.",
    "b2b.form.successTitle": "Tudo certo, {name}!",

    /* ---------- Página de barbearias ---------- */
    "search.eyebrow": "Todas as barbearias",
    "search.title": "Encontre a barbearia certa",
    "search.subtitle":
      "Filtre por cidade, serviço e nota mínima. Todos os perfis abaixo têm agenda ativa na InBarber.",
    "search.inputLabel": "Buscar por nome, bairro ou cidade",
    "search.placeholder": "Buscar por nome, bairro ou cidade",
    "search.button": "Buscar",
    "search.resultsLabel": "Resultados da busca",

    /* ---------- Rodapé ---------- */
    "footer.tagline":
      "Encontre, compare e agende na barbearia certa. Tudo pelo navegador, em três idiomas.",
    "footer.navLabel": "Navegação do rodapé",
    "footer.explore": "Explorar",
    "footer.business": "Para barbearias",
    "footer.company": "Institucional",
    "footer.legal": "Legal",
    "footer.link.barbershops": "Barbearias",
    "footer.link.trends": "Tendências",
    "footer.link.howItWorks": "Como funciona",
    "footer.link.reviews": "Avaliações",
    "footer.link.register": "Cadastrar barbearia",
    "footer.link.features": "Funcionalidades do painel",
    "footer.link.pricing": "Planos e preços",
    "footer.link.about": "Sobre",
    "footer.link.contact": "Contato",
    "footer.link.careers": "Trabalhe conosco",
    "footer.link.privacy": "Política de Privacidade",
    "footer.link.terms": "Termos de Uso",
    "footer.link.cookies": "Preferências de cookies",
    "footer.socialLabel": "Redes sociais",
    "footer.social.instagram": "Instagram da InBarber",
    "footer.social.tiktok": "TikTok da InBarber",
    "footer.social.youtube": "YouTube da InBarber",
    "footer.copyright": "© {year} InBarber. Todos os direitos reservados.",
    "footer.madeIn": "Feito para barbearias e para quem não abre mão de um bom corte."
  },

  /* ======================================================================
     ENGLISH
     ====================================================================== */
  en: {
    /* ---------- Metadados por página ---------- */
    "meta.home.title": "InBarber — Find and book the best barbershop near you",
    "meta.home.description":
      "InBarber connects you to the best barbershops in your city. Compare reviews, pick a service and book in under a minute, straight from your browser.",
    "meta.shops.title": "Barbershops — Search by city, service and rating | InBarber",
    "meta.shops.description":
      "Browse every barbershop on InBarber. Filter by city, service type and minimum rating to find the right cut near you.",
    "meta.b2b.title": "For Barbershops — List your shop for free | InBarber",
    "meta.b2b.description":
      "Put your barbershop on the InBarber map: more visibility, an organised calendar and clients who come back. Free to join, no lock-in.",

    /* ---------- Marca ---------- */
    "brand.name": "InBarber",
    "brand.tagline": "The platform that connects you to the best barbershops.",
    "brand.logoAlt": "InBarber — home page",

    /* ---------- Navegação e ações do header ---------- */
    "nav.skip": "Skip to main content",
    "nav.business": "InBarber for Business",
    "nav.businessShort": "Business",
    "nav.signIn": "Sign in",

    /* ---------- Seletor de idioma ---------- */
    "lang.label": "Select language",
    "lang.pt": "Português (Brazil)",
    "lang.en": "English",
    "lang.es": "Español",
    "lang.menuLabel": "Choose language",

    /* ---------- HOME · Hero ---------- */
    "hero.badge": "New: real-time booking in 42 cities",
    "hero.titleHtml": "Your next cut<br>starts <span class=\"text-gradient\">here</span>.",
    "hero.subtitle":
      "Find real barbershops near you, see who has already sat in the chair and lock in a slot in under a minute. No phone calls, no queue, no app to install.",
    "hero.stat1Label": "barbershops listed",
    "hero.stat2Label": "bookings completed",
    "hero.stat3Label": "average platform rating",
    "hero.imageAlt": "Barber finishing a fade on a client in a neon-lit barbershop",
    "hero.scroll": "Scroll to explore",
    "hero.trustLabel": "Partner barbershops in",

    /* ---------- Busca com filtros (hero + página de barbearias) ---------- */
    "search.whereLabel": "Where",
    "search.wherePlaceholder": "City or neighbourhood",
    "search.whereAny": "Anywhere",
    "search.whenLabel": "When",
    "search.timeLabel": "Time",
    "search.submit": "Search",
    "search.useMyLocation": "Use my location",
    "search.popularCities": "Cities with the most barbershops",
    "search.openPanel": "Open {field} options",
    "geo.locating": "Finding you…",
    "geo.matched": "Barbershops near {city}",
    "geo.tooFar": "We don't have barbershops near you yet. Pick a city from the list.",
    "geo.error": "We couldn't access your location. Pick a city from the list.",
    "geo.unsupported": "Your browser doesn't support geolocation. Pick a city from the list.",

    /* ---------- Dia e período do dia ---------- */
    "day.any": "Any day",
    "day.today": "Today",
    "day.tomorrow": "Tomorrow",
    "day.weekend": "This weekend",
    "time.any": "Any time",
    "time.morning": "Morning · 8am to 12pm",
    "time.afternoon": "Afternoon · 12pm to 6pm",
    "time.evening": "Evening · 6pm to 10pm",
    "time.morningShort": "Morning",
    "time.afternoonShort": "Afternoon",
    "time.eveningShort": "Evening",

    /* ---------- HOME · Como funciona ---------- */
    "how.eyebrow": "How it works",
    "how.title": "From your phone to the chair in four steps",
    "how.subtitle":
      "InBarber takes the friction out of booking. You choose, you confirm, you show up — the shop already knows the rest.",
    "how.stepLabel": "Step",
    "how.step1.title": "Search near you",
    "how.step1.desc":
      "Type your city or use your browser's location. We show the shops open today, sorted by distance and rating.",
    "how.step1.alt": "InBarber search screen showing nearby barbershop results",
    "how.step2.title": "Check the shop profile",
    "how.step2.desc":
      "Real photos of the space, a portfolio of cuts, the price of every service and reviews from people who actually went.",
    "how.step2.alt": "Barbershop profile with photo gallery, services and reviews",
    "how.step3.title": "Pick a service and time",
    "how.step3.desc":
      "Choose the cut, the barber and an open slot on the live calendar. No more \"I'll get back to you\".",
    "how.step3.alt": "Service selection and available time slots on the shop calendar",
    "how.step4.title": "Confirm and you're set",
    "how.step4.desc":
      "You get instant confirmation and a reminder before your slot. Need to move it? Two taps and it's done.",
    "how.step4.alt": "Booking confirmation screen with date, time and chosen barber",
    "how.note": "All in the browser. Nothing to download.",
    "how.cta": "Find a barbershop now",

    /* ---------- HOME · Barbearias recomendadas ---------- */
    "shops.eyebrow": "Recommended barbershops",
    "shops.title": "This week's highest rated",
    "shops.subtitle":
      "Picked from verified reviews left by clients who booked through InBarber in the last 30 days.",
    "shops.viewAll": "See all barbershops",
    "shops.viewProfile": "View profile",

    /* ---------- Featured Barbershops (sponsored hero carousel) ---------- */
    "featured.title": "Featured Barbershops",
    "featured.sponsored": "Paid placement",
    "featured.sponsoredNote": "InBarber advertising space. This barbershop paid to appear here.",
    "featured.carousel": "Featured barbershops",
    "featured.slide": "{current} of {total}",
    "featured.prev": "Previous barbershop",
    "featured.next": "Next barbershop",
    "featured.pause": "Pause rotation",
    "featured.resume": "Resume rotation",
    "featured.goTo": "Go to barbershop {n}",
    "featured.counter": "{current} of {total}",
    "featured.emptyTitle": "Your spot starts here",
    "featured.emptyText": "No featured barbershops at the moment.",
    "featured.advertise": "Advertise your barbershop",

    /* ---------- Individual barbershop profile ---------- */
    "profile.back": "Back to barbershops",
    "profile.featuredBadge": "Paid placement",
    "profile.services": "Services and prices",
    "profile.hours": "Opening times",
    "profile.priceNote": "Starting price, per service.",
    "profile.notFoundTitle": "Barbershop not found",
    "profile.notFoundText": "This address does not match any registered barbershop.",
    "profile.seeAll": "See all barbershops",
    "meta.shop.title": "{name} — InBarber",
    "meta.shop.description": "Services, prices, opening times and booking at {name}, in {city}. Book straight from your browser on InBarber.",

    /* ---------- Days of the week (short) ---------- */
    "day.short0": "Sun",
    "day.short1": "Mon",
    "day.short2": "Tue",
    "day.short3": "Wed",
    "day.short4": "Thu",
    "day.short5": "Fri",
    "day.short6": "Sat",
    "shops.book": "Book",
    "shops.from": "from",
    "shops.reviewsSuffix": "reviews",
    "shops.openNow": "Open now",
    "shops.closed": "Closed",
    "shops.empty": "No barbershops match these filters. Try widening your search.",
    "shops.emptyAction": "Clear filters",
    "shops.resultsOne": "1 barbershop found",
    "shops.resultsMany": "{count} barbershops found",
    "shops.photoAlt": "Inside {name}, a barbershop in {city}",

    /* ---------- Filtros da listagem ---------- */
    "filters.title": "Filter results",
    "filters.city": "City",
    "filters.anyCity": "All cities",
    "filters.service": "Service",
    "filters.anyService": "All services",
    "filters.rating": "Minimum rating",
    "filters.anyRating": "Any rating",
    "filters.rating45": "4.5 stars and up",
    "filters.rating40": "4.0 stars and up",
    "filters.rating35": "3.5 stars and up",
    "filters.reset": "Clear filters",
    "filters.sort": "Sort by",
    "filters.sortRating": "Highest rated",
    "filters.sortReviews": "Most reviewed",
    "filters.sortPrice": "Lowest price",
    "filters.sortName": "Alphabetical",
    "filters.day": "Day",
    "filters.time": "Time of day",
    "filters.activeTitle": "Active filters",
    "filters.removeFilter": "Remove {label} filter",

    /* ---------- Serviços ---------- */
    "service.fade": "Fade",
    "service.beard": "Beard trim",
    "service.classic": "Classic cut",
    "service.kids": "Kids' cut",
    "service.coloring": "Colouring",
    "service.hotTowel": "Hot towel shave",
    "service.braids": "Braids & locs",
    "service.grooming": "Men's grooming",

    /* ---------- HOME · Tendências ---------- */
    "trends.eyebrow": "Trends & styles",
    "trends.title": "What's leaving the chairs right now",
    "trends.subtitle":
      "A snapshot of what our partner barbers cut most last quarter — with the right words to ask for it in the chair.",
    "trends.readMore": "Read the story",
    "trends.main.tag": "Cut of the quarter",
    "trends.main.title": "Textured mid fade",
    "trends.main.desc":
      "The mid fade dominated requests in 2026. The top stays longer and disconnected, worked with matte pomade for movement without weight. It works on straight, wavy and coily hair — only the finishing technique changes.",
    "trends.main.alt": "Man with a textured mid fade seen in profile",
    "trends.item1.tag": "Beard",
    "trends.item1.title": "Full beard, sharp line-up",
    "trends.item1.desc":
      "Volume kept on the sides with a millimetre-precise line on the neck and cheeks. Needs a touch-up every two weeks.",
    "trends.item1.alt": "Barber shaping a client's beard line with a straight razor",
    "trends.item2.tag": "Classic",
    "trends.item2.title": "The side part is back",
    "trends.item2.desc":
      "Tailoring pulled the hard side part back into rotation. Pairs with a low fade and a controlled-shine finish.",
    "trends.item2.alt": "Classic cut with a sharply defined side part",
    "trends.item3.tag": "Colour",
    "trends.item3.title": "Platinum with a shadow root",
    "trends.item3.desc":
      "Full bleach with a deliberately darker root: regrowth reads as intentional and touch-ups stretch to six weeks.",
    "trends.item3.alt": "Client with platinum hair and a shadowed root",
    "trends.item4.tag": "Grooming",
    "trends.item4.title": "The hot towel ritual",
    "trends.item4.desc":
      "Steam, pre-shave oil and a straight razor. It's the highest rated service on the platform and the one that brings people back.",
    "trends.item4.alt": "Client receiving a hot towel treatment at the barbershop",

    /* ---------- HOME · Avaliações ---------- */
    "reviews.eyebrow": "InBarber reviews",
    "reviews.title": "People who book on InBarber come back",
    "reviews.subtitle":
      "Verified reviews: only clients who completed a booking on the platform can leave one.",
    "reviews.scoreValue": "4.9",
    "reviews.scoreLabel": "from 12,000 reviews",
    "reviews.scoreCaption": "Average platform rating over the last 12 months",
    "reviews.starsAlt": "Rated {rating} out of 5 stars",
    "reviews.avatarAlt": "Photo of {name}",
    "reviews.prev": "Previous review",
    "reviews.next": "Next review",
    "reviews.item1.name": "Rafael Nogueira",
    "reviews.item1.city": "São Paulo, Brazil",
    "reviews.item1.text":
      "I moved neighbourhoods and knew nobody. Found a 4.9-rated shop three blocks away, booked at 10pm on a Sunday and was in the chair the next day. It's my regular now.",
    "reviews.item2.name": "Diego Almeida",
    "reviews.item2.city": "Belo Horizonte, Brazil",
    "reviews.item2.text":
      "What sold me was seeing the price of every service before going. No surprise at the till, no need to ask over WhatsApp.",
    "reviews.item3.name": "Lucas Ferreira",
    "reviews.item3.city": "Porto Alegre, Brazil",
    "reviews.item3.text":
      "I work shifts and could never call during business hours. Now I book from my phone at 2am and get the reminder on the day. It solved a real problem.",
    "reviews.item4.name": "Bruno Carvalho",
    "reviews.item4.city": "Recife, Brazil",
    "reviews.item4.text":
      "I took my son for the first time using the kids' cut filter. The profile showed photos of the space and he was completely at ease. Small detail, big difference.",
    "reviews.item5.name": "Thiago Menezes",
    "reviews.item5.city": "Curitiba, Brazil",
    "reviews.item5.text":
      "I had to reschedule twice in one week and didn't have to apologise to anyone on the phone. Two clicks and done.",
    "reviews.item6.name": "André Batista",
    "reviews.item6.city": "Salvador, Brazil",
    "reviews.item6.text":
      "The reviews are honest because only people who actually went can write one. I skipped two places and nailed it on the third.",

    /* ---------- HOME · Preview B2B ---------- */
    "b2bPreview.eyebrow": "For shop owners",
    "b2bPreview.title": "Do you own a barbershop?",
    "b2bPreview.desc":
      "Put your shop in front of people looking for a cut right now and take bookings in one organised calendar — with nothing to pay to get started.",
    "b2bPreview.bullet1": "Public profile with photos, services and prices",
    "b2bPreview.bullet2": "Real-time calendar with no double bookings",
    "b2bPreview.bullet3": "Free to join, no lock-in",
    "b2bPreview.cta": "See InBarber for barbershops",
    "b2bPreview.imageAlt": "The InBarber management dashboard open on a laptop in a barbershop",

    /* ---------- B2B · Hero ---------- */
    "b2b.hero.badge": "Free to join · No lock-in",
    "b2b.hero.titleHtml": "Your barbershop<br>on <span class=\"text-gradient\">InBarber</span>.",
    "b2b.hero.subtitle":
      "More people discovering your work, a calendar that doesn't leave slots empty, and a client history that brings them back. All in the browser, nothing to install.",
    "b2b.hero.cta": "List my barbershop",
    "b2b.hero.secondary": "See dashboard features",
    "b2b.hero.imageAlt": "InBarber dashboard showing a barbershop's schedule for the day",
    "b2b.hero.stat1Label": "average lift in bookings within 90 days",
    "b2b.hero.stat2Label": "average drop in no-shows with automatic reminders",
    "b2b.hero.stat3Label": "of shops renew after the first month",

    /* ---------- B2B · Benefícios ---------- */
    "b2b.benefits.eyebrow": "Value proposition",
    "b2b.benefits.title": "Three reasons to be on InBarber",
    "b2b.benefits.subtitle":
      "This isn't another system to learn. It's the channel where new clients find you and old ones come back on their own.",
    "b2b.benefits.item1.title": "More visibility",
    "b2b.benefits.item1.desc":
      "Your shop shows up in searches by neighbourhood, service and rating. Whoever needs a cut today finds you before they find the shop down the road.",
    "b2b.benefits.item2.title": "An organised calendar",
    "b2b.benefits.item2.desc":
      "Real-time slots, automatic conflict blocking and reminders sent to the client. Fewer WhatsApp threads, fewer empty chairs.",
    "b2b.benefits.item3.title": "More repeat clients",
    "b2b.benefits.item3.desc":
      "A full history for every client: what they cut, with whom, when and what they paid. Winning back the ones who drifted off gets easy.",

    /* ---------- B2B · Funcionalidades ---------- */
    "b2b.features.eyebrow": "Dashboard features",
    "b2b.features.title": "Everything the shop needs, on one screen",
    "b2b.features.subtitle":
      "The dashboard was designed with barbers, tested at the counter and built to be used between one client and the next.",
    "b2b.features.item1.title": "Calendar management",
    "b2b.features.item1.desc":
      "See the whole day on a timeline per barber. Drag to reschedule, block breaks and set the duration of each service. Last-minute walk-ins slot in without breaking the rest of the day.",
    "b2b.features.item1.bullet1": "Day, week and per-barber views",
    "b2b.features.item1.bullet2": "Block time off and breaks in two clicks",
    "b2b.features.item1.bullet3": "Automatic reminder 24h before the appointment",
    "b2b.features.item1.alt": "InBarber calendar management screen with slots per barber",
    "b2b.features.item2.title": "Public profile",
    "b2b.features.item2.desc":
      "Your shopfront on the platform: photo gallery, services with price and duration, your team, opening hours and address on the map. You edit, publish and see it live instantly.",
    "b2b.features.item2.bullet1": "Gallery of cuts and of the space",
    "b2b.features.item2.bullet2": "Service list with price and duration",
    "b2b.features.item2.bullet3": "Page optimised for Google search",
    "b2b.features.item2.alt": "Public profile editor with gallery and service table",
    "b2b.features.item3.title": "Client history",
    "b2b.features.item3.desc":
      "Every client has a record: services taken, preferred barber, frequency and notes. Spot who hasn't been in for 60 days and bring them back with one simple move.",
    "b2b.features.item3.bullet1": "Records with preferences and notes",
    "b2b.features.item3.bullet2": "Inactive client alerts",
    "b2b.features.item3.bullet3": "CSV export — your data stays yours",
    "b2b.features.item3.alt": "Client record in the InBarber dashboard with appointment history",
    "b2b.features.item4.title": "Reviews received",
    "b2b.features.item4.desc":
      "Track your rating per barber and per service, reply in public and catch patterns before they turn into complaints. Only clients who were actually served can review.",
    "b2b.features.item4.bullet1": "Consolidated rating and trend over time",
    "b2b.features.item4.bullet2": "Public reply to every review",
    "b2b.features.item4.bullet3": "Verified reviews, no fakes",
    "b2b.features.item4.alt": "Reviews screen showing rating per barber and comments",

    /* ---------- B2B · Depoimentos ---------- */
    "b2b.testimonials.eyebrow": "Barber testimonials",
    "b2b.testimonials.title": "Shops already on board",
    "b2b.testimonials.subtitle":
      "Owners who traded the notebook and the WhatsApp thread for the InBarber dashboard.",
    "b2b.testimonials.item1.metricLabel": "in bookings within 3 months",
    "b2b.testimonials.item2.metricLabel": "double bookings since switching",
    "b2b.testimonials.item3.metricLabel": "in no-shows with automatic reminders",
    "b2b.testimonials.item4.metricLabel": "clients won back in one week",
    "b2b.testimonials.item1.name": "Marcos Vinícius",
    "b2b.testimonials.item1.role": "Owner, Navalha & Cia · São Paulo",
    "b2b.testimonials.item1.text":
      "In three months I went from 180 to 290 appointments a month. Most of them had never heard of my shop and found it through the neighbourhood filter.",
    "b2b.testimonials.item2.name": "Jonas Ribeiro",
    "b2b.testimonials.item2.role": "Owner, Corte Real · Belo Horizonte",
    "b2b.testimonials.item2.text":
      "My calendar was a notebook and three WhatsApp chats at once. Now I open the dashboard in the morning and know exactly how the day will go. I haven't double-booked in months.",
    "b2b.testimonials.item3.name": "Paulo Sérgio",
    "b2b.testimonials.item3.role": "Partner, Distrito Barber · Curitiba",
    "b2b.testimonials.item3.text":
      "The automatic reminder cut no-shows almost in half. An empty chair was what hurt most at the end of the month.",
    "b2b.testimonials.item4.name": "Fernando Lima",
    "b2b.testimonials.item4.role": "Owner, Barbearia do Fernando · Recife",
    "b2b.testimonials.item4.text":
      "The history showed me 40 clients who hadn't been back in two months. I messaged them and more than half rebooked. That paid for the month.",

    /* ---------- B2B · CTA final e formulário ---------- */
    "b2b.cta.eyebrow": "Get started",
    "b2b.cta.title": "List your barbershop for free",
    "b2b.cta.subtitle":
      "It takes under two minutes. Our team gets in touch to activate your profile and set the calendar up with you.",
    "b2b.cta.point1": "No monthly fee for the first 30 days",
    "b2b.cta.point2": "No lock-in — cancel whenever you want",
    "b2b.cta.point3": "Human support during setup",
    "b2b.form.legend": "Barbershop details",
    "b2b.form.shopName": "Barbershop name",
    "b2b.form.shopNamePlaceholder": "e.g. Navalha & Cia",
    "b2b.form.ownerName": "Owner's name",
    "b2b.form.ownerNamePlaceholder": "e.g. Marcos Vinícius",
    "b2b.form.email": "Email",
    "b2b.form.emailPlaceholder": "you@yourbarbershop.com",
    "b2b.form.city": "City",
    "b2b.form.cityPlaceholder": "e.g. São Paulo",
    "b2b.form.submit": "List my barbershop",
    "b2b.form.privacy":
      "By submitting you agree to our Privacy Policy. We never share your data with third parties.",
    "b2b.form.errorRequired": "Please fill in this field to continue.",
    "b2b.form.errorEmail": "Enter a valid email address.",
    "b2b.form.success":
      "Got it! Our team will reach out to the email you provided within one business day.",
    "b2b.form.successTitle": "You're all set, {name}!",

    /* ---------- Página de barbearias ---------- */
    "search.eyebrow": "All barbershops",
    "search.title": "Find the right barbershop",
    "search.subtitle":
      "Filter by city, service and minimum rating. Every profile below has an active calendar on InBarber.",
    "search.inputLabel": "Search by name, neighbourhood or city",
    "search.placeholder": "Search by name, neighbourhood or city",
    "search.button": "Search",
    "search.resultsLabel": "Search results",

    /* ---------- Rodapé ---------- */
    "footer.tagline":
      "Find, compare and book the right barbershop. All in the browser, in three languages.",
    "footer.navLabel": "Footer navigation",
    "footer.explore": "Explore",
    "footer.business": "For barbershops",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.link.barbershops": "Barbershops",
    "footer.link.trends": "Trends",
    "footer.link.howItWorks": "How it works",
    "footer.link.reviews": "Reviews",
    "footer.link.register": "List a barbershop",
    "footer.link.features": "Dashboard features",
    "footer.link.pricing": "Plans and pricing",
    "footer.link.about": "About",
    "footer.link.contact": "Contact",
    "footer.link.careers": "Careers",
    "footer.link.privacy": "Privacy Policy",
    "footer.link.terms": "Terms of Use",
    "footer.link.cookies": "Cookie preferences",
    "footer.socialLabel": "Social media",
    "footer.social.instagram": "InBarber on Instagram",
    "footer.social.tiktok": "InBarber on TikTok",
    "footer.social.youtube": "InBarber on YouTube",
    "footer.copyright": "© {year} InBarber. All rights reserved.",
    "footer.madeIn": "Built for barbershops and for anyone who won't settle for a bad cut."
  },

  /* ======================================================================
     ESPAÑOL
     ====================================================================== */
  es: {
    /* ---------- Metadados por página ---------- */
    "meta.home.title": "InBarber — Encuentra y reserva en la mejor barbería cerca de ti",
    "meta.home.description":
      "InBarber te conecta con las mejores barberías de tu ciudad. Compara valoraciones, elige el servicio y reserva en menos de un minuto, directo desde el navegador.",
    "meta.shops.title": "Barberías — Busca por ciudad, servicio y valoración | InBarber",
    "meta.shops.description":
      "Explora todas las barberías de InBarber. Filtra por ciudad, tipo de servicio y nota mínima para encontrar el corte adecuado cerca de ti.",
    "meta.b2b.title": "Para Barberías — Registra tu barbería gratis | InBarber",
    "meta.b2b.description":
      "Pon tu barbería en el mapa de InBarber: más visibilidad, agenda organizada y clientes que vuelven. Registro gratuito y sin permanencia.",

    /* ---------- Marca ---------- */
    "brand.name": "InBarber",
    "brand.tagline": "La plataforma que te conecta con las mejores barberías.",
    "brand.logoAlt": "InBarber — página de inicio",

    /* ---------- Navegação e ações do header ---------- */
    "nav.skip": "Saltar al contenido principal",
    "nav.business": "InBarber para Negocios",
    "nav.businessShort": "Negocios",
    "nav.signIn": "Iniciar sesión",

    /* ---------- Seletor de idioma ---------- */
    "lang.label": "Seleccionar idioma",
    "lang.pt": "Português (Brasil)",
    "lang.en": "English",
    "lang.es": "Español",
    "lang.menuLabel": "Elegir idioma",

    /* ---------- HOME · Hero ---------- */
    "hero.badge": "Nuevo: reservas en tiempo real en 42 ciudades",
    "hero.titleHtml": "Tu próximo corte<br>empieza <span class=\"text-gradient\">aquí</span>.",
    "hero.subtitle":
      "Encuentra barberías reales cerca de ti, mira quién ya pasó por la silla y cierra tu hora en menos de un minuto. Sin llamadas, sin cola, sin app que instalar.",
    "hero.stat1Label": "barberías registradas",
    "hero.stat2Label": "reservas realizadas",
    "hero.stat3Label": "nota media de la plataforma",
    "hero.imageAlt": "Barbero terminando un degradado a un cliente en una barbería con luces de neón",
    "hero.scroll": "Desplázate para explorar",
    "hero.trustLabel": "Barberías asociadas en",

    /* ---------- Busca com filtros (hero + página de barbearias) ---------- */
    "search.whereLabel": "Dónde",
    "search.wherePlaceholder": "Ciudad o barrio",
    "search.whereAny": "Cualquier lugar",
    "search.whenLabel": "Cuándo",
    "search.timeLabel": "Horario",
    "search.submit": "Buscar",
    "search.useMyLocation": "Usar mi ubicación",
    "search.popularCities": "Ciudades con más barberías",
    "search.openPanel": "Abrir opciones de {field}",
    "geo.locating": "Localizándote…",
    "geo.matched": "Barberías cerca de {city}",
    "geo.tooFar": "Todavía no tenemos barberías cerca de ti. Elige una ciudad de la lista.",
    "geo.error": "No pudimos acceder a tu ubicación. Elige la ciudad en la lista.",
    "geo.unsupported": "Tu navegador no admite geolocalización. Elige la ciudad en la lista.",

    /* ---------- Dia e período do dia ---------- */
    "day.any": "Cualquier día",
    "day.today": "Hoy",
    "day.tomorrow": "Mañana",
    "day.weekend": "Fin de semana",
    "time.any": "Cualquier horario",
    "time.morning": "Mañana · de 8 a 12 h",
    "time.afternoon": "Tarde · de 12 a 18 h",
    "time.evening": "Noche · de 18 a 22 h",
    "time.morningShort": "Mañana",
    "time.afternoonShort": "Tarde",
    "time.eveningShort": "Noche",

    /* ---------- HOME · Como funciona ---------- */
    "how.eyebrow": "Cómo funciona",
    "how.title": "Del móvil a la silla en cuatro pasos",
    "how.subtitle":
      "InBarber elimina la fricción de reservar. Tú eliges, confirmas y apareces — la barbería ya sabe el resto.",
    "how.stepLabel": "Paso",
    "how.step1.title": "Busca cerca de ti",
    "how.step1.desc":
      "Escribe tu ciudad o usa la ubicación del navegador. Mostramos las barberías abiertas hoy, ordenadas por distancia y valoración.",
    "how.step1.alt": "Pantalla de búsqueda de InBarber con resultados de barberías cercanas",
    "how.step2.title": "Mira el perfil de la barbería",
    "how.step2.desc":
      "Fotos reales del local, portafolio de cortes, precio de cada servicio y valoraciones de quien ya se sentó en la silla.",
    "how.step2.alt": "Perfil de barbería con galería de fotos, servicios y valoraciones",
    "how.step3.title": "Elige servicio y hora",
    "how.step3.desc":
      "Selecciona el corte, el barbero y una hora libre en la agenda en tiempo real. Se acabó el \"luego te digo\".",
    "how.step3.alt": "Selección de servicio y horas disponibles en la agenda de la barbería",
    "how.step4.title": "Confirma y listo",
    "how.step4.desc":
      "Recibes la confirmación al instante y un recordatorio antes de tu hora. ¿Necesitas cambiarla? Dos toques y ya está.",
    "how.step4.alt": "Pantalla de confirmación de reserva con fecha, hora y barbero elegido",
    "how.note": "Todo desde el navegador. Nada que descargar.",
    "how.cta": "Buscar una barbería ahora",

    /* ---------- HOME · Barbearias recomendadas ---------- */
    "shops.eyebrow": "Barberías recomendadas",
    "shops.title": "Las mejor valoradas de esta semana",
    "shops.subtitle":
      "Selección basada en valoraciones verificadas de clientes que reservaron por InBarber en los últimos 30 días.",
    "shops.viewAll": "Ver todas las barberías",
    "shops.viewProfile": "Ver perfil",

    /* ---------- Barberías Destacadas (carrusel patrocinado del hero) ---------- */
    "featured.title": "Barberías Destacadas",
    "featured.sponsored": "Destacado pagado",
    "featured.sponsoredNote": "Espacio publicitario de InBarber. Esta barbería pagó para aparecer aquí.",
    "featured.carousel": "Barberías destacadas",
    "featured.slide": "{current} de {total}",
    "featured.prev": "Barbería anterior",
    "featured.next": "Barbería siguiente",
    "featured.pause": "Pausar la rotación",
    "featured.resume": "Reanudar la rotación",
    "featured.goTo": "Ir a la barbería {n}",
    "featured.counter": "{current} de {total}",
    "featured.emptyTitle": "Tu espacio empieza aquí",
    "featured.emptyText": "No hay barberías destacadas en este momento.",
    "featured.advertise": "Anuncia tu barbería",

    /* ---------- Perfil individual de la barbería ---------- */
    "profile.back": "Volver a las barberías",
    "profile.featuredBadge": "Destacado pagado",
    "profile.services": "Servicios y precios",
    "profile.hours": "Horario",
    "profile.priceNote": "Precio desde, por servicio.",
    "profile.notFoundTitle": "Barbería no encontrada",
    "profile.notFoundText": "Esta dirección no corresponde a ninguna barbería registrada.",
    "profile.seeAll": "Ver todas las barberías",
    "meta.shop.title": "{name} — InBarber",
    "meta.shop.description": "Servicios, precios, horarios y reservas en {name}, en {city}. Reserva desde el navegador, en InBarber.",

    /* ---------- Días de la semana (abreviados) ---------- */
    "day.short0": "Dom",
    "day.short1": "Lun",
    "day.short2": "Mar",
    "day.short3": "Mié",
    "day.short4": "Jue",
    "day.short5": "Vie",
    "day.short6": "Sáb",
    "shops.book": "Reservar",
    "shops.from": "desde",
    "shops.reviewsSuffix": "valoraciones",
    "shops.openNow": "Abierto ahora",
    "shops.closed": "Cerrado",
    "shops.empty": "Ninguna barbería coincide con estos filtros. Prueba a ampliar la búsqueda.",
    "shops.emptyAction": "Borrar filtros",
    "shops.resultsOne": "1 barbería encontrada",
    "shops.resultsMany": "{count} barberías encontradas",
    "shops.photoAlt": "Interior de la barbería {name}, en {city}",

    /* ---------- Filtros da listagem ---------- */
    "filters.title": "Filtrar resultados",
    "filters.city": "Ciudad",
    "filters.anyCity": "Todas las ciudades",
    "filters.service": "Servicio",
    "filters.anyService": "Todos los servicios",
    "filters.rating": "Valoración mínima",
    "filters.anyRating": "Cualquier nota",
    "filters.rating45": "4,5 estrellas o más",
    "filters.rating40": "4,0 estrellas o más",
    "filters.rating35": "3,5 estrellas o más",
    "filters.reset": "Borrar filtros",
    "filters.sort": "Ordenar por",
    "filters.sortRating": "Mejor valoradas",
    "filters.sortReviews": "Más valoradas",
    "filters.sortPrice": "Menor precio",
    "filters.sortName": "Orden alfabético",
    "filters.day": "Día",
    "filters.time": "Franja horaria",
    "filters.activeTitle": "Filtros activos",
    "filters.removeFilter": "Quitar el filtro {label}",

    /* ---------- Serviços ---------- */
    "service.fade": "Degradado",
    "service.beard": "Barba",
    "service.classic": "Corte clásico",
    "service.kids": "Corte infantil",
    "service.coloring": "Coloración",
    "service.hotTowel": "Afeitado con toalla caliente",
    "service.braids": "Trenzas y rastas",
    "service.grooming": "Cuidado masculino",

    /* ---------- HOME · Tendências ---------- */
    "trends.eyebrow": "Tendencias y estilos",
    "trends.title": "Lo que está saliendo de las sillas ahora",
    "trends.subtitle":
      "Un recorte de lo que más cortaron nuestros barberos asociados el último trimestre — con el vocabulario justo para pedirlo en la silla.",
    "trends.readMore": "Leer el reportaje",
    "trends.main.tag": "Corte del trimestre",
    "trends.main.title": "Mid fade texturizado",
    "trends.main.desc":
      "El degradado medio dominó los pedidos en 2026. La parte superior queda más larga y desconectada, trabajada con pomada mate para dar movimiento sin peso. Funciona en pelo liso, ondulado y rizado — solo cambia la técnica de acabado.",
    "trends.main.alt": "Hombre con corte mid fade texturizado visto de perfil",
    "trends.item1.tag": "Barba",
    "trends.item1.title": "Barba completa con línea marcada",
    "trends.item1.desc":
      "Volumen en los laterales y contorno milimétrico en el cuello y los pómulos. Pide retoque cada quince días.",
    "trends.item1.alt": "Barbero perfilando la barba de un cliente con navaja",
    "trends.item2.tag": "Clásico",
    "trends.item2.title": "Vuelve la raya lateral",
    "trends.item2.desc":
      "La sastrería devolvió la raya marcada a la rotación. Combina con degradado bajo y acabado de brillo controlado.",
    "trends.item2.alt": "Corte clásico con raya lateral bien definida",
    "trends.item3.tag": "Color",
    "trends.item3.title": "Platino con raíz sombreada",
    "trends.item3.desc":
      "Decoloración total con la raíz a propósito más oscura: el crecimiento se ve natural y el retoque se estira a seis semanas.",
    "trends.item3.alt": "Cliente con pelo platino y raíz sombreada",
    "trends.item4.tag": "Cuidados",
    "trends.item4.title": "El ritual de la toalla caliente",
    "trends.item4.desc":
      "Vapor, aceite pre-afeitado y navaja. Es el servicio con mejor nota media de la plataforma y el que más hace volver al cliente.",
    "trends.item4.alt": "Cliente recibiendo un tratamiento de toalla caliente en la barbería",

    /* ---------- HOME · Avaliações ---------- */
    "reviews.eyebrow": "Valoraciones de InBarber",
    "reviews.title": "Quien reserva en InBarber vuelve",
    "reviews.subtitle":
      "Valoraciones verificadas: solo puede valorar quien completó una reserva en la plataforma.",
    "reviews.scoreValue": "4,9",
    "reviews.scoreLabel": "de 12.000 valoraciones",
    "reviews.scoreCaption": "Nota media de la plataforma en los últimos 12 meses",
    "reviews.starsAlt": "Valoración de {rating} sobre 5 estrellas",
    "reviews.avatarAlt": "Foto de {name}",
    "reviews.prev": "Valoración anterior",
    "reviews.next": "Siguiente valoración",
    "reviews.item1.name": "Rafael Nogueira",
    "reviews.item1.city": "São Paulo, Brasil",
    "reviews.item1.text":
      "Me mudé de barrio y no conocía a nadie. Encontré una barbería con 4,9 a tres manzanas, reservé un domingo a las 22h y al día siguiente ya estaba en la silla. Es mi barbería fija.",
    "reviews.item2.name": "Diego Almeida",
    "reviews.item2.city": "Belo Horizonte, Brasil",
    "reviews.item2.text":
      "Lo que me convenció fue ver el precio de cada servicio antes de ir. Sin sorpresas al pagar y sin tener que preguntar por WhatsApp.",
    "reviews.item3.name": "Lucas Ferreira",
    "reviews.item3.city": "Porto Alegre, Brasil",
    "reviews.item3.text":
      "Trabajo por turnos y nunca podía llamar en horario comercial. Ahora reservo de madrugada desde el móvil y recibo el recordatorio el mismo día. Resolvió un problema real.",
    "reviews.item4.name": "Bruno Carvalho",
    "reviews.item4.city": "Recife, Brasil",
    "reviews.item4.text":
      "Llevé a mi hijo por primera vez usando el filtro de corte infantil. El perfil mostraba fotos del local y fue tranquilísimo. Un detalle que marca la diferencia.",
    "reviews.item5.name": "Thiago Menezes",
    "reviews.item5.city": "Curitiba, Brasil",
    "reviews.item5.text":
      "Tuve que cambiar la hora dos veces en la misma semana y no tuve que disculparme con nadie por teléfono. Dos clics y listo.",
    "reviews.item6.name": "André Batista",
    "reviews.item6.city": "Salvador, Brasil",
    "reviews.item6.text":
      "Las valoraciones son honestas porque solo valora quien fue de verdad. Descarté dos sitios y acerté de lleno con el tercero.",

    /* ---------- HOME · Preview B2B ---------- */
    "b2bPreview.eyebrow": "Para dueños de barbería",
    "b2bPreview.title": "¿Tienes una barbería?",
    "b2bPreview.desc":
      "Pon tu barbería delante de quien está buscando corte ahora mismo y recibe las reservas en una agenda organizada — sin pagar nada para empezar.",
    "b2bPreview.bullet1": "Perfil público con fotos, servicios y precios",
    "b2bPreview.bullet2": "Agenda en tiempo real, sin choques de horario",
    "b2bPreview.bullet3": "Registro gratuito y sin permanencia",
    "b2bPreview.cta": "Conocer InBarber para barberías",
    "b2bPreview.imageAlt": "Panel de gestión de InBarber abierto en el portátil de una barbería",

    /* ---------- B2B · Hero ---------- */
    "b2b.hero.badge": "Registro gratuito · Sin permanencia",
    "b2b.hero.titleHtml": "Tu barbería<br>en <span class=\"text-gradient\">InBarber</span>.",
    "b2b.hero.subtitle":
      "Más gente descubriendo tu trabajo, una agenda que no deja huecos vacíos y un histórico de clientes que vuelve. Todo desde el navegador, sin instalar nada.",
    "b2b.hero.cta": "Registrar mi barbería",
    "b2b.hero.secondary": "Ver funciones del panel",
    "b2b.hero.imageAlt": "Panel de InBarber mostrando la agenda del día de una barbería",
    "b2b.hero.stat1Label": "aumento medio de reservas en 90 días",
    "b2b.hero.stat2Label": "caída media de ausencias con recordatorio automático",
    "b2b.hero.stat3Label": "de las barberías renuevan tras el primer mes",

    /* ---------- B2B · Benefícios ---------- */
    "b2b.benefits.eyebrow": "Propuesta de valor",
    "b2b.benefits.title": "Tres motivos para estar en InBarber",
    "b2b.benefits.subtitle":
      "No es otro sistema que aprender. Es el canal por el que te encuentra el cliente nuevo y vuelve solo el antiguo.",
    "b2b.benefits.item1.title": "Más visibilidad",
    "b2b.benefits.item1.desc":
      "Tu barbería aparece en las búsquedas por barrio, servicio y valoración. Quien busca corte hoy te encuentra antes que a la competencia.",
    "b2b.benefits.item2.title": "Agenda organizada",
    "b2b.benefits.item2.desc":
      "Horas en tiempo real, bloqueo automático de choques y recordatorio enviado al cliente. Menos mensajes de WhatsApp, menos sillas vacías.",
    "b2b.benefits.item3.title": "Más clientes recurrentes",
    "b2b.benefits.item3.desc":
      "Histórico completo de cada cliente: qué se cortó, con quién, cuándo y cuánto pagó. Recuperar al que desapareció se vuelve fácil.",

    /* ---------- B2B · Funcionalidades ---------- */
    "b2b.features.eyebrow": "Funciones del panel",
    "b2b.features.title": "Todo lo que la barbería necesita, en una sola pantalla",
    "b2b.features.subtitle":
      "El panel se diseñó con barberos, se probó en el mostrador y está pensado para usarse entre un cliente y el siguiente.",
    "b2b.features.item1.title": "Gestión de agenda",
    "b2b.features.item1.desc":
      "Mira el día entero en una línea de tiempo por barbero. Arrastra para cambiar la hora, bloquea descansos y define la duración de cada servicio. Los encajes de última hora entran sin romper el resto del día.",
    "b2b.features.item1.bullet1": "Vista por día, semana y por profesional",
    "b2b.features.item1.bullet2": "Bloqueo de horas y descansos en dos clics",
    "b2b.features.item1.bullet3": "Recordatorio automático 24 h antes de la cita",
    "b2b.features.item1.alt": "Pantalla de gestión de agenda de InBarber con horas por barbero",
    "b2b.features.item2.title": "Perfil público",
    "b2b.features.item2.desc":
      "Tu escaparate en la plataforma: galería de fotos, servicios con precio y duración, equipo, horario y dirección en el mapa. Editas, publicas y lo ves en línea al instante.",
    "b2b.features.item2.bullet1": "Galería de cortes y del local",
    "b2b.features.item2.bullet2": "Lista de servicios con precio y duración",
    "b2b.features.item2.bullet3": "Página optimizada para la búsqueda en Google",
    "b2b.features.item2.alt": "Editor del perfil público con galería y tabla de servicios",
    "b2b.features.item3.title": "Histórico de clientes",
    "b2b.features.item3.desc":
      "Cada cliente tiene su ficha: servicios realizados, barbero preferido, frecuencia y notas. Descubre quién no aparece desde hace 60 días y recupéralo con una acción sencilla.",
    "b2b.features.item3.bullet1": "Ficha con preferencias y notas",
    "b2b.features.item3.bullet2": "Aviso de clientes inactivos",
    "b2b.features.item3.bullet3": "Exportación en CSV — tus datos siguen siendo tuyos",
    "b2b.features.item3.alt": "Ficha de cliente en el panel de InBarber con histórico de citas",
    "b2b.features.item4.title": "Valoraciones recibidas",
    "b2b.features.item4.desc":
      "Sigue tu nota por barbero y por servicio, responde en público y detecta patrones antes de que se conviertan en queja. Solo valora quien fue atendido de verdad.",
    "b2b.features.item4.bullet1": "Nota consolidada y evolución en el tiempo",
    "b2b.features.item4.bullet2": "Respuesta pública a cada valoración",
    "b2b.features.item4.bullet3": "Valoraciones verificadas, sin reseñas falsas",
    "b2b.features.item4.alt": "Pantalla de valoraciones con nota por barbero y comentarios",

    /* ---------- B2B · Depoimentos ---------- */
    "b2b.testimonials.eyebrow": "Testimonios de barberos",
    "b2b.testimonials.title": "Barberías que ya están dentro",
    "b2b.testimonials.subtitle": "Dueños que cambiaron la libreta y el WhatsApp por el panel de InBarber.",
    "b2b.testimonials.item1.metricLabel": "de reservas en 3 meses",
    "b2b.testimonials.item2.metricLabel": "choques de horario desde el cambio",
    "b2b.testimonials.item3.metricLabel": "de ausencias con recordatorio automático",
    "b2b.testimonials.item4.metricLabel": "clientes recuperados en una semana",
    "b2b.testimonials.item1.name": "Marcos Vinícius",
    "b2b.testimonials.item1.role": "Dueño de Navalha & Cia · São Paulo",
    "b2b.testimonials.item1.text":
      "En tres meses pasé de 180 a 290 citas al mes. La mayoría nunca había oído hablar de mi barbería y me encontró con el filtro de barrio.",
    "b2b.testimonials.item2.name": "Jonas Ribeiro",
    "b2b.testimonials.item2.role": "Dueño de Corte Real · Belo Horizonte",
    "b2b.testimonials.item2.text":
      "Mi agenda era una libreta y tres chats de WhatsApp a la vez. Hoy abro el panel por la mañana y sé exactamente cómo va a ir el día. Hace meses que no duplico una hora.",
    "b2b.testimonials.item3.name": "Paulo Sérgio",
    "b2b.testimonials.item3.role": "Socio de Distrito Barber · Curitiba",
    "b2b.testimonials.item3.text":
      "El recordatorio automático redujo las ausencias casi a la mitad. La silla vacía era lo que más dolía a fin de mes.",
    "b2b.testimonials.item4.name": "Fernando Lima",
    "b2b.testimonials.item4.role": "Dueño de Barbearia do Fernando · Recife",
    "b2b.testimonials.item4.text":
      "El histórico me mostró 40 clientes que no volvían desde hacía dos meses. Les escribí y más de la mitad volvió a reservar. Eso pagó el mes.",

    /* ---------- B2B · CTA final e formulário ---------- */
    "b2b.cta.eyebrow": "Empieza ahora",
    "b2b.cta.title": "Registra tu barbería gratis",
    "b2b.cta.subtitle":
      "Lleva menos de dos minutos. Nuestro equipo te contacta para activar tu perfil y configurar la agenda contigo.",
    "b2b.cta.point1": "Sin cuota mensual los primeros 30 días",
    "b2b.cta.point2": "Sin permanencia — cancela cuando quieras",
    "b2b.cta.point3": "Soporte humano en la configuración inicial",
    "b2b.form.legend": "Datos de la barbería",
    "b2b.form.shopName": "Nombre de la barbería",
    "b2b.form.shopNamePlaceholder": "Ej.: Navalha & Cia",
    "b2b.form.ownerName": "Nombre del responsable",
    "b2b.form.ownerNamePlaceholder": "Ej.: Marcos Vinícius",
    "b2b.form.email": "Correo electrónico",
    "b2b.form.emailPlaceholder": "tu@tubarberia.com",
    "b2b.form.city": "Ciudad",
    "b2b.form.cityPlaceholder": "Ej.: São Paulo",
    "b2b.form.submit": "Registrar mi barbería",
    "b2b.form.privacy":
      "Al enviar aceptas nuestra Política de Privacidad. Nunca compartimos tus datos con terceros.",
    "b2b.form.errorRequired": "Rellena este campo para continuar.",
    "b2b.form.errorEmail": "Introduce un correo electrónico válido.",
    "b2b.form.success":
      "¡Registro recibido! Nuestro equipo te escribirá al correo indicado en un día hábil.",
    "b2b.form.successTitle": "¡Todo listo, {name}!",

    /* ---------- Página de barbearias ---------- */
    "search.eyebrow": "Todas las barberías",
    "search.title": "Encuentra la barbería adecuada",
    "search.subtitle":
      "Filtra por ciudad, servicio y nota mínima. Todos los perfiles de abajo tienen agenda activa en InBarber.",
    "search.inputLabel": "Buscar por nombre, barrio o ciudad",
    "search.placeholder": "Buscar por nombre, barrio o ciudad",
    "search.button": "Buscar",
    "search.resultsLabel": "Resultados de la búsqueda",

    /* ---------- Rodapé ---------- */
    "footer.tagline":
      "Encuentra, compara y reserva en la barbería adecuada. Todo desde el navegador, en tres idiomas.",
    "footer.navLabel": "Navegación del pie de página",
    "footer.explore": "Explorar",
    "footer.business": "Para barberías",
    "footer.company": "Institucional",
    "footer.legal": "Legal",
    "footer.link.barbershops": "Barberías",
    "footer.link.trends": "Tendencias",
    "footer.link.howItWorks": "Cómo funciona",
    "footer.link.reviews": "Valoraciones",
    "footer.link.register": "Registrar barbería",
    "footer.link.features": "Funciones del panel",
    "footer.link.pricing": "Planes y precios",
    "footer.link.about": "Sobre nosotros",
    "footer.link.contact": "Contacto",
    "footer.link.careers": "Trabaja con nosotros",
    "footer.link.privacy": "Política de Privacidad",
    "footer.link.terms": "Términos de Uso",
    "footer.link.cookies": "Preferencias de cookies",
    "footer.socialLabel": "Redes sociales",
    "footer.social.instagram": "InBarber en Instagram",
    "footer.social.tiktok": "InBarber en TikTok",
    "footer.social.youtube": "InBarber en YouTube",
    "footer.copyright": "© {year} InBarber. Todos los derechos reservados.",
    "footer.madeIn": "Hecho para barberías y para quien no se conforma con un mal corte."
  }
};