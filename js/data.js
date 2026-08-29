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

  /* ----------------------------------------------------------------------
     Barbearias
     priceFrom está em reais; a exibição é convertida pelo i18n.
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
      priceFrom: 55,
      openNow: true,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      featured: true,
      serviceKeys: ["fade", "beard", "hotTowel"],
      image: shopPhoto("1585747860715-2ba37e788b70")
    },
    {
      id: "distrito-barber",
      name: "Distrito Barber",
      neighborhood: "Batel",
      city: "Curitiba",
      cityKey: "curitiba",
      rating: 4.9,
      reviews: 942,
      priceFrom: 48,
      openNow: true,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      featured: true,
      serviceKeys: ["fade", "classic", "grooming"],
      image: shopPhoto("1503951914875-452162b0f3f1")
    },
    {
      id: "corte-real",
      name: "Corte Real",
      neighborhood: "Savassi",
      city: "Belo Horizonte",
      cityKey: "belo-horizonte",
      rating: 4.8,
      reviews: 1105,
      priceFrom: 45,
      openNow: true,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["afternoon", "evening"],
      featured: true,
      serviceKeys: ["classic", "beard", "kids"],
      image: shopPhoto("1621605815971-fbc98d665033")
    },
    {
      id: "estudio-lamina",
      name: "Estúdio Lâmina",
      neighborhood: "Leblon",
      city: "Rio de Janeiro",
      cityKey: "rio-de-janeiro",
      rating: 4.9,
      reviews: 1673,
      priceFrom: 70,
      openNow: false,
      days: [2, 3, 4, 5, 6, 0],
      periods: ["morning", "afternoon", "evening"],
      featured: true,
      serviceKeys: ["fade", "coloring", "hotTowel"],
      image: shopPhoto("1599351431202-1e0f0137899a")
    },
    {
      id: "barbearia-do-porto",
      name: "Barbearia do Porto",
      neighborhood: "Cidade Baixa",
      city: "Porto Alegre",
      cityKey: "porto-alegre",
      rating: 4.7,
      reviews: 618,
      priceFrom: 40,
      openNow: true,
      days: [1, 2, 3, 4, 5],
      periods: ["morning", "afternoon"],
      featured: true,
      serviceKeys: ["classic", "beard", "grooming"],
      image: shopPhoto("1605497788044-5a32c7078486")
    },
    {
      id: "cabana-barbearia",
      name: "Cabana Barbearia",
      neighborhood: "Boa Viagem",
      city: "Recife",
      cityKey: "recife",
      rating: 4.8,
      reviews: 803,
      priceFrom: 42,
      openNow: true,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      featured: true,
      serviceKeys: ["fade", "braids", "kids"],
      image: shopPhoto("1647140655214-e4a2d914971f")
    },
    {
      id: "casa-do-barbeiro",
      name: "Casa do Barbeiro",
      neighborhood: "Rio Vermelho",
      city: "Salvador",
      cityKey: "salvador",
      rating: 4.7,
      reviews: 549,
      priceFrom: 38,
      openNow: true,
      days: [2, 3, 4, 5, 6],
      periods: ["afternoon", "evening"],
      featured: false,
      serviceKeys: ["braids", "fade", "beard"],
      image: shopPhoto("1621645582931-d1d3e6564943")
    },
    {
      id: "oficina-do-corte",
      name: "Oficina do Corte",
      neighborhood: "Asa Sul",
      city: "Brasília",
      cityKey: "brasilia",
      rating: 4.6,
      reviews: 431,
      priceFrom: 50,
      openNow: false,
      days: [1, 2, 3, 4, 5],
      periods: ["morning", "afternoon"],
      featured: false,
      serviceKeys: ["classic", "grooming", "hotTowel"],
      image: shopPhoto("1536520002442-39764a41e987")
    },
    {
      id: "norte-barbearia",
      name: "Norte Barbearia",
      neighborhood: "Meireles",
      city: "Fortaleza",
      cityKey: "fortaleza",
      rating: 4.8,
      reviews: 727,
      priceFrom: 35,
      openNow: true,
      days: [0, 1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      featured: false,
      serviceKeys: ["fade", "kids", "beard"],
      image: shopPhoto("1596728325488-58c87691e9af")
    },
    {
      id: "ilha-barber-club",
      name: "Ilha Barber Club",
      neighborhood: "Lagoa da Conceição",
      city: "Florianópolis",
      cityKey: "florianopolis",
      rating: 4.9,
      reviews: 512,
      priceFrom: 60,
      openNow: true,
      days: [2, 3, 4, 5, 6, 0],
      periods: ["afternoon", "evening"],
      featured: false,
      serviceKeys: ["fade", "coloring", "grooming"],
      image: shopPhoto("1517832606299-7ae9b720a186")
    },
    {
      id: "tesoura-de-ouro",
      name: "Tesoura de Ouro",
      neighborhood: "Moema",
      city: "São Paulo",
      cityKey: "sao-paulo",
      rating: 4.6,
      reviews: 866,
      priceFrom: 65,
      openNow: true,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon"],
      featured: false,
      serviceKeys: ["classic", "coloring", "hotTowel"],
      image: shopPhoto("1593702275687-f8b402bf1fb5")
    },
    {
      id: "zona-sul-cortes",
      name: "Zona Sul Cortes",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      cityKey: "rio-de-janeiro",
      rating: 4.5,
      reviews: 394,
      priceFrom: 45,
      openNow: false,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "evening"],
      featured: false,
      serviceKeys: ["fade", "beard", "kids"],
      image: shopPhoto("1657105052497-f996284ffff8")
    },
    {
      id: "barbearia-central",
      name: "Barbearia Central",
      neighborhood: "Centro Histórico",
      city: "Porto Alegre",
      cityKey: "porto-alegre",
      rating: 4.4,
      reviews: 288,
      priceFrom: 32,
      openNow: true,
      days: [1, 2, 3, 4, 5],
      periods: ["morning", "afternoon"],
      featured: false,
      serviceKeys: ["classic", "kids", "beard"],
      image: shopPhoto("1592647420148-bfcc177e2117")
    },
    {
      id: "atelie-do-fade",
      name: "Ateliê do Fade",
      neighborhood: "Pinheiros",
      city: "São Paulo",
      cityKey: "sao-paulo",
      rating: 4.8,
      reviews: 1032,
      priceFrom: 58,
      openNow: true,
      days: [2, 3, 4, 5, 6],
      periods: ["afternoon", "evening"],
      featured: false,
      serviceKeys: ["fade", "coloring", "braids"],
      image: shopPhoto("1678356164573-9a534fe43958")
    },
    {
      id: "mineira-barbearia",
      name: "Mineira Barbearia",
      neighborhood: "Funcionários",
      city: "Belo Horizonte",
      cityKey: "belo-horizonte",
      rating: 4.6,
      reviews: 476,
      priceFrom: 36,
      openNow: true,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon", "evening"],
      featured: false,
      serviceKeys: ["classic", "beard", "grooming"],
      image: shopPhoto("1635273051937-a0ddef9573b6")
    },
    {
      id: "sertao-barber",
      name: "Sertão Barber",
      neighborhood: "Espinheiro",
      city: "Recife",
      cityKey: "recife",
      rating: 4.5,
      reviews: 351,
      priceFrom: 34,
      openNow: false,
      days: [1, 2, 3, 4, 5, 6],
      periods: ["morning", "afternoon"],
      featured: false,
      serviceKeys: ["fade", "kids", "braids"],
      image: shopPhoto("1599351431613-18ef1fdd27e1")
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
