/* ==========================================================================
   InBarber — Base de dados de demonstração
   Enquanto não há backend, os cards de barbearia e os depoimentos vivem aqui.
   Nomes próprios (barbearia, bairro, cidade) não são traduzidos.
   Tudo que é rótulo passa por chave de tradução (serviceKeys, etc.).
   ========================================================================== */

window.INBARBER_DATA = (function () {
  "use strict";

  var UNSPLASH = "https://images.unsplash.com/photo-";
  var SHOP_PARAMS = "?auto=format&fit=crop&w=800&q=70";
  var AVATAR_PARAMS = "?auto=format&fit=crop&w=160&h=160&q=70";
  var EDITORIAL_PARAMS = "?auto=format&fit=crop&w=1200&q=75";

  function shopPhoto(id) {
    return UNSPLASH + id + SHOP_PARAMS;
  }
  function avatar(id) {
    return UNSPLASH + id + AVATAR_PARAMS;
  }
  function editorial(id) {
    return UNSPLASH + id + EDITORIAL_PARAMS;
  }

  /**
   * Todas as fotos de uma barbearia, começando pela capa.
   * É o que alimenta a passagem de imagens do card de destaque do ranking
   * quando o cursor para em cima dele: a capa continua sendo a primeira, e as
   * demais só entram em cena a partir da segunda. Sem galeria cadastrada, o
   * retorno é a capa sozinha — e o card simplesmente não passa nada.
   */
  function shopGallery(shop) {
    var photos = [shop.image];
    (shop.gallery || []).forEach(function (photo) {
      if (photos.indexOf(photo) === -1) photos.push(photo);
    });
    return photos;
  }

  /* ----------------------------------------------------------------------
     Barbearias
     priceFrom está em reais; a exibição é convertida pelo i18n.

     Campos que sustentam a seção "Barbearias recomendadas" da home:
       reviews30d  avaliações recebidas nos últimos 30 dias — é o que dá lastro
                   à frase "as mais bem avaliadas desta semana" e ao motivo
                   exibido em cada card.
       rebookRate  % de clientes que voltaram à mesma barbearia em 90 dias.
       joinedAt    data de entrada na plataforma (ISO). Ordena o trilho
                   "Novas na InBarber" e define o selo "Novo" (até 45 dias).
       closesAt    horário de fechamento do dia ("HH:MM"). É o que a faixa
                   "Abertas agora" mostra — quem está decidindo cortar hoje
                   precisa saber até quando dá tempo de chegar.
       gallery     demais fotos do salão, além da capa. O card de destaque do
                   ranking passa por elas enquanto o cursor está em cima, para
                   mostrar o lugar e não só uma foto escolhida a dedo.

     São dados de demonstração, como o resto do arquivo: quando houver backend,
     eles vêm de lá. Nada disso é estimado no cliente.
     ---------------------------------------------------------------------- */
  var barbershops = [
    {
      id: "navalha-cia",
      name: "Navalha & Cia",
      neighborhood: "Vila Madalena",
      city: "São Paulo",
      cityKey: "sao-paulo",
      rating: 4.9,
      reviews: 1284,
      reviews30d: 96,
      rebookRate: 87,
      joinedAt: "2024-03-12",
      priceFrom: 55,
      openNow: true,
      closesAt: "21:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      serviceKeys: ["fade", "beard", "hotTowel"],
      image: shopPhoto("1585747860715-2ba37e788b70"),
      gallery: [
        shopPhoto("1599351431202-1e0f0137899a"),
        shopPhoto("1593702275687-f8b402bf1fb5"),
        shopPhoto("1622286342621-4bd786c2447c")
      ]
    },
    {
      id: "distrito-barber",
      name: "Distrito Barber",
      neighborhood: "Batel",
      city: "Curitiba",
      cityKey: "curitiba",
      rating: 4.9,
      reviews: 942,
      reviews30d: 74,
      rebookRate: 83,
      joinedAt: "2024-07-02",
      priceFrom: 48,
      openNow: true,
      closesAt: "21:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      serviceKeys: ["fade", "classic", "grooming"],
      image: shopPhoto("1503951914875-452162b0f3f1"),
      gallery: [
        shopPhoto("1596728325488-58c87691e9af"),
        shopPhoto("1599351431613-18ef1fdd27e1"),
        shopPhoto("1629189784191-9afdcbcb0398")
      ]
    },
    {
      id: "corte-real",
      name: "Corte Real",
      neighborhood: "Savassi",
      city: "Belo Horizonte",
      cityKey: "belo-horizonte",
      rating: 4.8,
      reviews: 1105,
      reviews30d: 68,
      rebookRate: 81,
      joinedAt: "2023-11-20",
      priceFrom: 45,
      openNow: true,
      closesAt: "22:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["afternoon", "evening"],
      serviceKeys: ["classic", "beard", "kids"],
      image: shopPhoto("1621605815971-fbc98d665033"),
      gallery: [
        shopPhoto("1678356164573-9a534fe43958"),
        shopPhoto("1493256338651-d82f7acb2b38"),
        shopPhoto("1599351431202-1e0f0137899a")
      ]
    },
    {
      id: "estudio-lamina",
      name: "Estúdio Lâmina",
      neighborhood: "Leblon",
      city: "Rio de Janeiro",
      cityKey: "rio-de-janeiro",
      rating: 4.9,
      reviews: 1673,
      reviews30d: 112,
      rebookRate: 90,
      joinedAt: "2023-05-08",
      priceFrom: 70,
      openNow: false,
      closesAt: "21:30",
      days: [2, 3, 4, 5, 6, 0],
      periods: ["morning", "afternoon", "evening"],
      serviceKeys: ["fade", "coloring", "hotTowel"],
      image: shopPhoto("1599351431202-1e0f0137899a"),
      gallery: [
        shopPhoto("1560066984-138dadb4c035"),
        shopPhoto("1503951914875-452162b0f3f1"),
        shopPhoto("1596728325488-58c87691e9af")
      ]
    },
    {
      id: "barbearia-do-porto",
      name: "Barbearia do Porto",
      neighborhood: "Cidade Baixa",
      city: "Porto Alegre",
      cityKey: "porto-alegre",
      rating: 4.7,
      reviews: 618,
      reviews30d: 51,
      rebookRate: 76,
      joinedAt: "2024-09-15",
      priceFrom: 40,
      openNow: true,
      closesAt: "19:00",
      days: [1, 2, 3, 4, 5],
      periods: ["morning", "afternoon"],
      serviceKeys: ["classic", "beard", "grooming"],
      image: shopPhoto("1605497788044-5a32c7078486"),
      gallery: [
        shopPhoto("1630827020718-3433092696e7"),
        shopPhoto("1621645582931-d1d3e6564943"),
        shopPhoto("1678356164573-9a534fe43958")
      ]
    },
    {
      id: "cabana-barbearia",
      name: "Cabana Barbearia",
      neighborhood: "Boa Viagem",
      city: "Recife",
      cityKey: "recife",
      rating: 4.8,
      reviews: 803,
      reviews30d: 63,
      rebookRate: 79,
      joinedAt: "2025-01-22",
      priceFrom: 42,
      openNow: true,
      closesAt: "20:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      serviceKeys: ["fade", "braids", "kids"],
      image: shopPhoto("1647140655214-e4a2d914971f"),
      gallery: [
        shopPhoto("1605497788044-5a32c7078486"),
        shopPhoto("1657105052497-f996284ffff8"),
        shopPhoto("1560066984-138dadb4c035")
      ]
    },
    {
      id: "casa-do-barbeiro",
      name: "Casa do Barbeiro",
      neighborhood: "Rio Vermelho",
      city: "Salvador",
      cityKey: "salvador",
      rating: 4.7,
      reviews: 549,
      reviews30d: 44,
      rebookRate: 72,
      joinedAt: "2025-04-03",
      priceFrom: 38,
      openNow: true,
      closesAt: "21:00",
      days: [2, 3, 4, 5, 6],
      periods: ["afternoon", "evening"],
      serviceKeys: ["braids", "fade", "beard"],
      image: shopPhoto("1621645582931-d1d3e6564943"),
      gallery: [
        shopPhoto("1517832606299-7ae9b720a186"),
        shopPhoto("1521590832167-7bcbfaa6381f"),
        shopPhoto("1630827020718-3433092696e7")
      ]
    },
    {
      id: "oficina-do-corte",
      name: "Oficina do Corte",
      neighborhood: "Asa Sul",
      city: "Brasília",
      cityKey: "brasilia",
      rating: 4.6,
      reviews: 431,
      reviews30d: 33,
      rebookRate: 69,
      joinedAt: "2025-06-18",
      priceFrom: 50,
      openNow: false,
      closesAt: "18:30",
      days: [1, 2, 3, 4, 5],
      periods: ["morning", "afternoon"],
      serviceKeys: ["classic", "grooming", "hotTowel"],
      image: shopPhoto("1536520002442-39764a41e987"),
      gallery: [
        shopPhoto("1635273051937-a0ddef9573b6"),
        shopPhoto("1522337360788-8b13dee7a37e"),
        shopPhoto("1605497788044-5a32c7078486")
      ]
    },
    {
      id: "norte-barbearia",
      name: "Norte Barbearia",
      neighborhood: "Meireles",
      city: "Fortaleza",
      cityKey: "fortaleza",
      rating: 4.8,
      reviews: 727,
      reviews30d: 58,
      rebookRate: 78,
      joinedAt: "2025-09-09",
      priceFrom: 35,
      openNow: true,
      closesAt: "22:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      serviceKeys: ["fade", "kids", "beard"],
      image: shopPhoto("1596728325488-58c87691e9af"),
      gallery: [
        shopPhoto("1512690459411-b9245aed614b"),
        shopPhoto("1621605815971-fbc98d665033"),
        shopPhoto("1517832606299-7ae9b720a186")
      ]
    },
    {
      id: "ilha-barber-club",
      name: "Ilha Barber Club",
      neighborhood: "Lagoa da Conceição",
      city: "Florianópolis",
      cityKey: "florianopolis",
      rating: 4.9,
      reviews: 512,
      reviews30d: 47,
      rebookRate: 85,
      joinedAt: "2026-05-30",
      priceFrom: 60,
      openNow: true,
      closesAt: "22:00",
      days: [2, 3, 4, 5, 6, 0],
      periods: ["afternoon", "evening"],
      serviceKeys: ["fade", "coloring", "grooming"],
      image: shopPhoto("1517832606299-7ae9b720a186"),
      gallery: [
        shopPhoto("1585747860715-2ba37e788b70"),
        shopPhoto("1536520002442-39764a41e987"),
        shopPhoto("1635273051937-a0ddef9573b6")
      ]
    },
    {
      id: "tesoura-de-ouro",
      name: "Tesoura de Ouro",
      neighborhood: "Moema",
      city: "São Paulo",
      cityKey: "sao-paulo",
      rating: 4.6,
      reviews: 866,
      reviews30d: 39,
      rebookRate: 70,
      joinedAt: "2025-11-27",
      priceFrom: 65,
      openNow: true,
      closesAt: "19:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon"],
      serviceKeys: ["classic", "coloring", "hotTowel"],
      image: shopPhoto("1593702275687-f8b402bf1fb5"),
      gallery: [
        shopPhoto("1647140655214-e4a2d914971f"),
        shopPhoto("1592647420148-bfcc177e2117"),
        shopPhoto("1512690459411-b9245aed614b")
      ]
    },
    {
      id: "zona-sul-cortes",
      name: "Zona Sul Cortes",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      cityKey: "rio-de-janeiro",
      rating: 4.5,
      reviews: 394,
      reviews30d: 28,
      rebookRate: 66,
      joinedAt: "2026-06-24",
      priceFrom: 45,
      openNow: false,
      closesAt: "21:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "evening"],
      serviceKeys: ["fade", "beard", "kids"],
      image: shopPhoto("1657105052497-f996284ffff8"),
      gallery: [
        shopPhoto("1593702275687-f8b402bf1fb5"),
        shopPhoto("1622286342621-4bd786c2447c"),
        shopPhoto("1585747860715-2ba37e788b70")
      ]
    },
    {
      id: "barbearia-central",
      name: "Barbearia Central",
      neighborhood: "Centro Histórico",
      city: "Porto Alegre",
      cityKey: "porto-alegre",
      rating: 4.4,
      reviews: 288,
      reviews30d: 22,
      rebookRate: 61,
      joinedAt: "2026-07-16",
      priceFrom: 32,
      openNow: true,
      closesAt: "18:00",
      days: [1, 2, 3, 4, 5],
      periods: ["morning", "afternoon"],
      serviceKeys: ["classic", "kids", "beard"],
      image: shopPhoto("1592647420148-bfcc177e2117"),
      gallery: [
        shopPhoto("1599351431613-18ef1fdd27e1"),
        shopPhoto("1629189784191-9afdcbcb0398"),
        shopPhoto("1647140655214-e4a2d914971f")
      ]
    },
    {
      id: "atelie-do-fade",
      name: "Ateliê do Fade",
      neighborhood: "Pinheiros",
      city: "São Paulo",
      cityKey: "sao-paulo",
      rating: 4.8,
      reviews: 1032,
      reviews30d: 81,
      rebookRate: 84,
      joinedAt: "2026-07-28",
      priceFrom: 58,
      openNow: true,
      closesAt: "21:00",
      days: [2, 3, 4, 5, 6],
      periods: ["afternoon", "evening"],
      serviceKeys: ["fade", "coloring", "braids"],
      image: shopPhoto("1678356164573-9a534fe43958"),
      gallery: [
        shopPhoto("1493256338651-d82f7acb2b38"),
        shopPhoto("1599351431202-1e0f0137899a"),
        shopPhoto("1593702275687-f8b402bf1fb5")
      ]
    },
    {
      id: "mineira-barbearia",
      name: "Mineira Barbearia",
      neighborhood: "Funcionários",
      city: "Belo Horizonte",
      cityKey: "belo-horizonte",
      rating: 4.6,
      reviews: 476,
      reviews30d: 35,
      rebookRate: 74,
      joinedAt: "2026-08-05",
      priceFrom: 36,
      openNow: true,
      closesAt: "20:00",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      serviceKeys: ["classic", "beard", "grooming"],
      image: shopPhoto("1635273051937-a0ddef9573b6"),
      gallery: [
        shopPhoto("1503951914875-452162b0f3f1"),
        shopPhoto("1596728325488-58c87691e9af"),
        shopPhoto("1599351431613-18ef1fdd27e1")
      ]
    },
    {
      id: "sertao-barber",
      name: "Sertão Barber",
      neighborhood: "Espinheiro",
      city: "Recife",
      cityKey: "recife",
      rating: 4.5,
      reviews: 351,
      reviews30d: 19,
      rebookRate: 63,
      joinedAt: "2026-08-19",
      priceFrom: 34,
      openNow: false,
      closesAt: "18:30",
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon"],
      serviceKeys: ["fade", "kids", "braids"],
      image: shopPhoto("1599351431613-18ef1fdd27e1"),
      gallery: [
        shopPhoto("1621645582931-d1d3e6564943"),
        shopPhoto("1678356164573-9a534fe43958"),
        shopPhoto("1493256338651-d82f7acb2b38")
      ]
    }
  ];

  /* ----------------------------------------------------------------------
     Cidades (derivadas dos dados, com rótulo pronto para exibição)
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     Coordenadas aproximadas do centro de cada cidade atendida.
     Servem para o "usar minha localização": comparamos a posição do
     navegador com esta lista e escolhemos a cidade mais próxima, sem
     depender de nenhuma API de geocodificação.
     ---------------------------------------------------------------------- */
  var cityCoords = {
    "São Paulo": { lat: -23.5505, lng: -46.6333 },
    "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
    "Belo Horizonte": { lat: -19.9167, lng: -43.9345 },
    "Curitiba": { lat: -25.4284, lng: -49.2733 },
    "Porto Alegre": { lat: -30.0346, lng: -51.2177 },
    "Recife": { lat: -8.0476, lng: -34.877 },
    "Salvador": { lat: -12.9777, lng: -38.5016 },
    "Brasília": { lat: -15.7939, lng: -47.8828 },
    "Fortaleza": { lat: -3.7319, lng: -38.5267 },
    "Florianópolis": { lat: -27.5954, lng: -48.548 }
  };

  /** Distância em km entre dois pontos (fórmula de haversine). */
  function distanceKm(aLat, aLng, bLat, bLng) {
    var toRad = Math.PI / 180;
    var dLat = (bLat - aLat) * toRad;
    var dLng = (bLng - aLng) * toRad;
    var h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(aLat * toRad) * Math.cos(bLat * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  /** Cidade atendida mais próxima de uma coordenada, ou null se nenhuma tiver dados. */
  function nearestCity(lat, lng) {
    var best = null;
    var bestDistance = Infinity;
    Object.keys(cityCoords).forEach(function (name) {
      var c = cityCoords[name];
      var d = distanceKm(lat, lng, c.lat, c.lng);
      if (d < bestDistance) {
        bestDistance = d;
        best = name;
      }
    });
    return best ? { city: best, distanceKm: Math.round(bestDistance) } : null;
  }

  /** Distância aproximada, em km, entre o visitante (cidade) e a barbearia. */
  function distanceFromCity(city, shop) {
    var from = cityCoords[city];
    var to = cityCoords[shop.city];
    if (!from || !to) return null;
    return Math.round(distanceKm(from.lat, from.lng, to.lat, to.lng));
  }

  /* ----------------------------------------------------------------------
     Seleção da home: recomendadas, novas e próximos horários

     Nada aqui inventa número: tudo sai dos campos das barbearias acima.
     ---------------------------------------------------------------------- */

  /* Até quantos dias depois da entrada uma barbearia ainda é "nova". */
  var NEW_SHOP_DAYS = 45;

  /* Nota pesa mais que volume; o volume dos últimos 30 dias desempata.
     Duas casas de nota (4.9 → 4900) mantêm o desempate abaixo da nota. */
  function meritScore(shop) {
    return shop.rating * 1000 + shop.reviews30d;
  }

  /**
   * Barbearias recomendadas, por mérito.
   * Com cidade conhecida, as da cidade do visitante vêm primeiro — cada bloco
   * continua ordenado por mérito, então a vizinhança nunca esconde a nota.
   */
  function recommended(city, limit) {
    var ranked = barbershops.slice().sort(function (a, b) {
      return meritScore(b) - meritScore(a);
    });

    if (city && cityCoords[city]) {
      var local = [];
      var rest = [];
      ranked.forEach(function (shop) {
        (shop.city === city ? local : rest).push(shop);
      });
      ranked = local.concat(rest);
    }

    return ranked.slice(0, limit || 6);
  }

  /**
   * Barbearias com as portas abertas neste momento.
   * Mesmo critério de mérito do ranking, aplicado só a quem está aberto —
   * e, com cidade conhecida, as da cidade do visitante encabeçam a lista.
   * A ordem não muda o fato: só entra aqui quem tem openNow verdadeiro.
   */
  function openNowShops(city, limit) {
    var open = barbershops.filter(function (shop) {
      return shop.openNow === true;
    });

    open.sort(function (a, b) {
      return meritScore(b) - meritScore(a);
    });

    if (city && cityCoords[city]) {
      var local = [];
      var rest = [];
      open.forEach(function (shop) {
        (shop.city === city ? local : rest).push(shop);
      });
      open = local.concat(rest);
    }

    return limit ? open.slice(0, limit) : open;
  }

  /** Quantas barbearias estão abertas agora, antes de qualquer corte de lista. */
  function openNowCount() {
    return barbershops.filter(function (shop) {
      return shop.openNow === true;
    }).length;
  }

  /** As últimas barbearias a entrar na plataforma, da mais recente para a mais antiga. */
  function newest(limit) {
    return barbershops
      .slice()
      .sort(function (a, b) {
        if (a.joinedAt === b.joinedAt) return b.rating - a.rating;
        return a.joinedAt < b.joinedAt ? 1 : -1;
      })
      .slice(0, limit || 6);
  }

  /** Dias completos desde a entrada da barbearia na plataforma. */
  function daysSinceJoining(shop, from) {
    var parts = String(shop.joinedAt).split("-");
    var joined = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var now = from || new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((today - joined) / 86400000));
  }

  function isNewShop(shop, from) {
    return daysSinceJoining(shop, from) <= NEW_SHOP_DAYS;
  }

  /* Grade de horários por período. A barbearia abre no período; o horário
     exato varia por barbearia para que a home não repita o mesmo relógio em
     todos os cards. */
  var PERIOD_ORDER = ["morning", "afternoon", "evening"];
  var PERIOD_HOURS = {
    morning: [[9, 0], [10, 30], [11, 15]],
    afternoon: [[14, 0], [15, 30], [16, 45]],
    evening: [[19, 0], [20, 30], [21, 15]]
  };

  /* Hash estável do id: a mesma barbearia mostra sempre os mesmos horários. */
  function hashOf(text) {
    var hash = 0;
    for (var i = 0; i < text.length; i += 1) {
      hash = (hash * 31 + text.charCodeAt(i)) % 100000;
    }
    return hash;
  }

  /**
   * Próximos horários livres da barbearia, derivados de days/periods.
   * Respeita 90 minutos de antecedência e olha até 14 dias à frente.
   * @returns {Array<{date: Date, period: string, daysAhead: number}>}
   */
  function nextSlots(shop, count, from) {
    var now = from || new Date();
    var wanted = count || 3;
    var offset = hashOf(shop.id);
    var out = [];

    for (var ahead = 0; ahead < 14 && out.length < wanted; ahead += 1) {
      var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ahead);
      if (shop.days.indexOf(day.getDay()) === -1) continue;

      for (var p = 0; p < PERIOD_ORDER.length && out.length < wanted; p += 1) {
        var period = PERIOD_ORDER[p];
        if (shop.periods.indexOf(period) === -1) continue;

        var hours = PERIOD_HOURS[period];
        var pick = hours[(offset + p) % hours.length];
        var slot = new Date(day.getFullYear(), day.getMonth(), day.getDate(), pick[0], pick[1]);
        if (slot.getTime() - now.getTime() < 90 * 60000) continue;

        out.push({ date: slot, period: period, daysAhead: ahead });
      }
    }

    return out;
  }

  var cities = barbershops
    .reduce(function (acc, shop) {
      if (acc.indexOf(shop.city) === -1) acc.push(shop.city);
      return acc;
    }, [])
    .sort(function (a, b) {
      return a.localeCompare(b, "pt-BR");
    });

  var serviceKeys = ["fade", "beard", "classic", "kids", "coloring", "hotTowel", "braids", "grooming"];

  /* ----------------------------------------------------------------------
     Depoimentos de clientes (jornada do usuário)
     ---------------------------------------------------------------------- */
  var reviews = [
    { key: "reviews.item1", rating: 5, photo: avatar("1500648767791-00dcc994a43e") },
    { key: "reviews.item2", rating: 5, photo: avatar("1506794778202-cad84cf45f1d") },
    { key: "reviews.item3", rating: 5, photo: avatar("1568602471122-7832951cc4c5") },
    { key: "reviews.item4", rating: 5, photo: avatar("1557862921-37829c790f19") },
    { key: "reviews.item5", rating: 4, photo: avatar("1539571696357-5a69c17a67c6") },
    { key: "reviews.item6", rating: 5, photo: avatar("1570158268183-d296b2892211") }
  ];

  /* ----------------------------------------------------------------------
     Depoimentos de barbeiros (jornada B2B)
     ---------------------------------------------------------------------- */
  var barberTestimonials = [
    { key: "b2b.testimonials.item1", metric: "+61%", photo: avatar("1522556189639-b150ed9c4330") },
    { key: "b2b.testimonials.item2", metric: "0", photo: avatar("1522075469751-3a6694fb2f61") },
    { key: "b2b.testimonials.item3", metric: "-47%", photo: avatar("1519085360753-af0119f7cbe7") },
    { key: "b2b.testimonials.item4", metric: "+22", photo: avatar("1507003211169-0a1dd7228f2d") }
  ];

  /* ----------------------------------------------------------------------
     Editorial de tendências
     ---------------------------------------------------------------------- */
  var trends = {
    main: { key: "trends.main", image: editorial("1503951914875-452162b0f3f1"), accent: "cyan" },
    items: [
      { key: "trends.item1", image: editorial("1621605815971-fbc98d665033"), accent: "violet" },
      { key: "trends.item2", image: editorial("1522337360788-8b13dee7a37e"), accent: "primary" },
      { key: "trends.item3", image: editorial("1629189784191-9afdcbcb0398"), accent: "pink" },
      { key: "trends.item4", image: editorial("1630827020718-3433092696e7"), accent: "gold" }
    ]
  };

  /* ----------------------------------------------------------------------
     Números do hero (formatados pelo i18n na renderização)
     ---------------------------------------------------------------------- */
  var stats = {
    shops: 2847,
    bookings: 194320,
    rating: 4.9
  };

  var heroImage =
    UNSPLASH + "1585747860715-2ba37e788b70?auto=format&fit=crop&w=1400&q=75";

  var b2bHeroStats = [
    { value: "+61%", key: "b2b.hero.stat1Label" },
    { value: "-47%", key: "b2b.hero.stat2Label" },
    { value: "93%", key: "b2b.hero.stat3Label" }
  ];

  return {
    barbershops: barbershops,
    cities: cities,
    cityCoords: cityCoords,
    nearestCity: nearestCity,
    distanceKm: distanceKm,
    distanceFromCity: distanceFromCity,
    shopGallery: shopGallery,
    recommended: recommended,
    openNowShops: openNowShops,
    openNowCount: openNowCount,
    newest: newest,
    nextSlots: nextSlots,
    isNewShop: isNewShop,
    daysSinceJoining: daysSinceJoining,
    newShopDays: NEW_SHOP_DAYS,
    periodKeys: ["morning", "afternoon", "evening"],
    serviceKeys: serviceKeys,
    reviews: reviews,
    barberTestimonials: barberTestimonials,
    trends: trends,
    stats: stats,
    heroImage: heroImage,
    b2bHeroStats: b2bHeroStats
  };
})();
