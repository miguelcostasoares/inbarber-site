/* ==========================================================================
   InBarber — Barbearias em Destaque (contratos comerciais)

   Esta é a camada paga do site: quem aparece no carrossel do hero comprou o
   espaço. Os dados da barbearia (nome, foto, nota, serviços) continuam vindo do
   js/data.js — aqui vive só o que é do contrato, referenciado por `shopId`.
   Nada é duplicado: mudou a nota no data.js, mudou no anúncio.

   COMO VENDER UM SLOT
   1. Duplique um objeto de `contracts`.
   2. `shopId` precisa existir em INBARBER_DATA.barbershops.
   3. `start` e `end` são a vigência contratada (AAAA-MM-DD, inclusiva nas duas
      pontas). Fora da janela o anúncio sai do ar sozinho — sem deploy.
   4. `plan: "city"`     → só aparece para quem está perto da cidade da loja.
      `plan: "national"` → aparece para todo mundo e completa os slots quando
                           não há anunciante local suficiente.
   5. `pitch` é a copy do anunciante, por idioma. É conteúdo comercial, não
      rótulo de interface, por isso mora aqui e não no translations.js.
      Sem tradução para o idioma ativo, cai para pt.
   ========================================================================== */

window.INBARBER_FEATURED = (function () {
  "use strict";

  var contracts = [
    {
      shopId: "navalha-cia",
      plan: "national",
      start: "2026-08-01",
      end: "2026-12-31",
      pitch: {
        pt: "Corte clássico com toalha quente e barba na navalha.",
        en: "Classic cuts with a hot towel and straight-razor shave.",
        es: "Corte clásico con toalla caliente y afeitado a navaja."
      }
    },
    {
      shopId: "distrito-barber",
      plan: "national",
      start: "2026-08-05",
      end: "2026-11-05",
      pitch: {
        pt: "Clube de assinatura: corte toda semana por um valor fixo no mês.",
        en: "Membership club: a cut every week for one flat monthly fee.",
        es: "Club de suscripción: corte semanal por una cuota mensual fija."
      }
    },
    {
      shopId: "estudio-lamina",
      plan: "city",
      start: "2026-07-01",
      end: "2026-10-31",
      pitch: {
        pt: "Barbeiro fixo, agenda própria e nenhuma espera na cadeira.",
        en: "Your own barber, your own schedule, no waiting in the chair.",
        es: "Barbero fijo, agenda propia y cero espera en la silla."
      }
    },
    {
      shopId: "zona-sul-cortes",
      plan: "city",
      start: "2026-08-10",
      end: "2026-12-15",
      pitch: {
        pt: "Do trabalho para a praia: atendimento rápido sem perder o capricho.",
        en: "Office to beach: quick service without cutting corners.",
        es: "De la oficina a la playa: rápido y sin descuidar el detalle."
      }
    },
    {
      shopId: "corte-real",
      plan: "city",
      start: "2026-06-01",
      end: "2026-11-30",
      pitch: {
        pt: "Três cadeiras, zero espera. Reserve o horário e chegue na hora.",
        en: "Three chairs, zero waiting. Book a slot and walk right in.",
        es: "Tres sillas, cero espera. Reserva y llega a tu hora."
      }
    },
    {
      shopId: "atelie-do-fade",
      plan: "city",
      start: "2026-08-15",
      end: "2026-12-31",
      pitch: {
        pt: "Especialistas em degradê e coloração, com hora marcada.",
        en: "Fade and colour specialists, by appointment only.",
        es: "Especialistas en degradado y color, solo con cita previa."
      }
    },
    {
      shopId: "barbearia-do-porto",
      plan: "city",
      start: "2026-08-01",
      end: "2027-01-31",
      pitch: {
        pt: "Tradição da Cidade Baixa, agora com agenda online.",
        en: "A Cidade Baixa institution, now booking online.",
        es: "Tradición de Cidade Baixa, ahora con agenda en línea."
      }
    },
    {
      shopId: "cabana-barbearia",
      plan: "city",
      start: "2026-08-20",
      end: "2026-12-20",
      pitch: {
        pt: "Barba cheia, contorno alinhado e café por nossa conta.",
        en: "Full beards, clean line-ups and coffee on the house.",
        es: "Barba completa, perfilado limpio y café por nuestra cuenta."
      }
    },
    {
      /* Contrato encerrado em julho. Fica no arquivo como histórico e some do
         site sozinho — é a prova viva de que a vigência funciona sem ninguém
         precisar editar código no dia do vencimento. */
      shopId: "casa-do-barbeiro",
      plan: "city",
      start: "2026-05-01",
      end: "2026-07-31",
      pitch: {
        pt: "Tradição do Rio Vermelho, agora com agenda online.",
        en: "A Rio Vermelho institution, now booking online.",
        es: "Tradición de Rio Vermelho, ahora con agenda en línea."
      }
    }
  ];

  return {
    contracts: contracts,

    /* Escassez sustenta o preço e garante exposição real a cada anunciante. */
    maxSlots: 5,

    /* Tempo de cada slide no autoplay. */
    intervalMs: 7000,

    /* Mesmo raio usado pela busca do hero: acima disso o site não considera
       que o visitante está numa cidade atendida. */
    maxDistanceKm: 250,

    /* Sem cidade conhecida, os anúncios de plano "city" completam o hero.
       É exposição de bônus: não prejudica quem pagou e evita um hero vazio.
       Coloque false para servir apenas o pool nacional nesse caso. */
    fillWithLocalWhenCityUnknown: true
  };
})();