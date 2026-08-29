/* =============================================================================
   InBarber — Barbearias em Destaque (dados)
   -----------------------------------------------------------------------------
   Fonte de verdade dos anúncios pagos exibidos no hero.

   COMO VENDER UM SLOT
   1. Duplique um objeto de `destaques`.
   2. Preencha `inicio` e `fim` com a vigência contratada (AAAA-MM-DD, inclusivo).
      Fora dessa janela o anúncio some sozinho do site — nenhum deploy necessário.
   3. `plano: 'cidade'`  → aparece apenas para quem está perto de `cidade`.
      `plano: 'nacional'` → aparece para todo mundo, e completa os slots quando
                            não há anunciante local suficiente.
   4. `chamada` é copy do anunciante (não é UI), por isso mora aqui e não no
      translations.js. Sem tradução para um idioma, cai para pt-BR.

   As coordenadas das cidades alimentam o cálculo de haversine em destaques.js.
============================================================================= */
(function (global) {
  'use strict';

  /* --------------------------------------------------------------------------
     Cidades atendidas — id, rótulo e centro geográfico
     -------------------------------------------------------------------------- */
  var CIDADES = [
    { id: 'sao-paulo',      nome: 'São Paulo',      uf: 'SP', lat: -23.5505, lng: -46.6333 },
    { id: 'rio-de-janeiro', nome: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lng: -43.1729 },
    { id: 'belo-horizonte', nome: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lng: -43.9345 },
    { id: 'brasilia',       nome: 'Brasília',       uf: 'DF', lat: -15.7939, lng: -47.8828 },
    { id: 'curitiba',       nome: 'Curitiba',       uf: 'PR', lat: -25.4284, lng: -49.2733 },
    { id: 'porto-alegre',   nome: 'Porto Alegre',   uf: 'RS', lat: -30.0346, lng: -51.2177 },
    { id: 'florianopolis',  nome: 'Florianópolis',  uf: 'SC', lat: -27.5949, lng: -48.5482 },
    { id: 'salvador',       nome: 'Salvador',       uf: 'BA', lat: -12.9777, lng: -38.5016 },
    { id: 'recife',         nome: 'Recife',         uf: 'PE', lat:  -8.0476, lng: -34.8770 },
    { id: 'fortaleza',      nome: 'Fortaleza',      uf: 'CE', lat:  -3.7319, lng: -38.5267 }
  ];

  /* --------------------------------------------------------------------------
     Destaques patrocinados
     -------------------------------------------------------------------------- */
  var DESTAQUES = [
    {
      id: 'navalha-de-ouro',
      nome: 'Navalha de Ouro',
      cidade: 'sao-paulo',
      bairro: 'Vila Madalena',
      endereco: 'Rua Harmonia, 412 — Vila Madalena, São Paulo/SP',
      telefone: '+55 11 98812-4470',
      foto: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=70',
      nota: 4.9,
      avaliacoes: 1284,
      plano: 'nacional',
      inicio: '2026-08-01',
      fim: '2026-12-31',
      chamada: {
        'pt-BR': 'Corte clássico com toalha quente e barba na navalha.',
        'en-US': 'Classic cuts with a hot towel and straight-razor shave.',
        'es-ES': 'Corte clásico con toalla caliente y afeitado a navaja.'
      },
      servicos: [
        { chave: 'corte',        preco: 70 },
        { chave: 'barba',        preco: 50 },
        { chave: 'combo',        preco: 105 },
        { chave: 'pigmentacao',  preco: 45 }
      ],
      dias: [1, 2, 3, 4, 5, 6],
      periodos: ['manha', 'tarde', 'noite']
    },
    {
      id: 'barbearia-mestre',
      nome: 'Barbearia Mestre',
      cidade: 'sao-paulo',
      bairro: 'Pinheiros',
      endereco: 'Rua dos Pinheiros, 908 — Pinheiros, São Paulo/SP',
      telefone: '+55 11 97431-2205',
      foto: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=70',
      nota: 4.8,
      avaliacoes: 962,
      plano: 'cidade',
      inicio: '2026-08-15',
      fim: '2026-11-30',
      chamada: {
        'pt-BR': 'Degradê preciso, ambiente tranquilo e café por nossa conta.',
        'en-US': 'Precise fades, a calm room and coffee on the house.',
        'es-ES': 'Degradado preciso, ambiente tranquilo y café por nuestra cuenta.'
      },
      servicos: [
        { chave: 'corte',   preco: 65 },
        { chave: 'barba',   preco: 45 },
        { chave: 'combo',   preco: 95 },
        { chave: 'infantil', preco: 50 }
      ],
      dias: [2, 3, 4, 5, 6],
      periodos: ['manha', 'tarde']
    },
    {
      id: 'don-corte',
      nome: 'Don Corte',
      cidade: 'rio-de-janeiro',
      bairro: 'Botafogo',
      endereco: 'Rua Voluntários da Pátria, 233 — Botafogo, Rio de Janeiro/RJ',
      telefone: '+55 21 99120-8834',
      foto: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=70',
      nota: 4.9,
      avaliacoes: 1521,
      plano: 'cidade',
      inicio: '2026-07-01',
      fim: '2026-10-31',
      chamada: {
        'pt-BR': 'Barbearia de bairro com 20 anos de rua e agenda cheia.',
        'en-US': 'A neighbourhood shop with 20 years on the block.',
        'es-ES': 'Barbería de barrio con 20 años de oficio.'
      },
      servicos: [
        { chave: 'corte', preco: 60 },
        { chave: 'barba', preco: 40 },
        { chave: 'combo', preco: 90 }
      ],
      dias: [1, 2, 3, 4, 5, 6],
      periodos: ['tarde', 'noite']
    },
    {
      id: 'lamina-carioca',
      nome: 'Lâmina Carioca',
      cidade: 'rio-de-janeiro',
      bairro: 'Ipanema',
      endereco: 'Rua Farme de Amoedo, 76 — Ipanema, Rio de Janeiro/RJ',
      telefone: '+55 21 98455-1190',
      foto: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1000&q=70',
      nota: 4.7,
      avaliacoes: 738,
      plano: 'cidade',
      inicio: '2026-08-10',
      fim: '2026-12-15',
      chamada: {
        'pt-BR': 'Do trabalho para a praia: atendimento rápido sem perder o capricho.',
        'en-US': 'Office to beach: quick service without cutting corners.',
        'es-ES': 'De la oficina a la playa: rápido y sin descuidar el detalle.'
      },
      servicos: [
        { chave: 'corte',       preco: 75 },
        { chave: 'barba',       preco: 55 },
        { chave: 'combo',       preco: 115 },
        { chave: 'sobrancelha', preco: 25 }
      ],
      dias: [1, 2, 3, 4, 5, 6, 0],
      periodos: ['manha', 'tarde', 'noite']
    },
    {
      id: 'casa-do-barbeiro',
      nome: 'Casa do Barbeiro',
      cidade: 'belo-horizonte',
      bairro: 'Savassi',
      endereco: 'Rua Antônio de Albuquerque, 501 — Savassi, Belo Horizonte/MG',
      telefone: '+55 31 99807-3312',
      foto: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=70',
      nota: 4.8,
      avaliacoes: 1104,
      plano: 'cidade',
      inicio: '2026-06-01',
      fim: '2026-09-30',
      chamada: {
        'pt-BR': 'Três cadeiras, zero espera. Reserve o horário e chegue na hora.',
        'en-US': 'Three chairs, zero waiting. Book a slot and walk right in.',
        'es-ES': 'Tres sillas, cero espera. Reserva y llega a tu hora.'
      },
      servicos: [
        { chave: 'corte', preco: 55 },
        { chave: 'barba', preco: 40 },
        { chave: 'combo', preco: 85 }
      ],
      dias: [1, 2, 3, 4, 5, 6],
      periodos: ['manha', 'tarde']
    },
    {
      id: 'estilo-sul',
      nome: 'Estilo Sul',
      cidade: 'porto-alegre',
      bairro: 'Moinhos de Vento',
      endereco: 'Rua Padre Chagas, 340 — Moinhos de Vento, Porto Alegre/RS',
      telefone: '+55 51 99664-7781',
      foto: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=1000&q=70',
      nota: 4.9,
      avaliacoes: 845,
      plano: 'cidade',
      inicio: '2026-08-01',
      fim: '2027-01-31',
      chamada: {
        'pt-BR': 'Atendimento sob agendamento, com barbeiro fixo para cada cliente.',
        'en-US': 'By appointment only, with a dedicated barber for each client.',
        'es-ES': 'Solo con cita previa y barbero fijo para cada cliente.'
      },
      servicos: [
        { chave: 'corte',       preco: 80 },
        { chave: 'barba',       preco: 60 },
        { chave: 'combo',       preco: 130 },
        { chave: 'pigmentacao', preco: 50 }
      ],
      dias: [2, 3, 4, 5, 6],
      periodos: ['tarde', 'noite']
    },
    {
      id: 'barba-negra',
      nome: 'Barba Negra',
      cidade: 'recife',
      bairro: 'Boa Viagem',
      endereco: 'Av. Conselheiro Aguiar, 1250 — Boa Viagem, Recife/PE',
      telefone: '+55 81 98230-5567',
      foto: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=70',
      nota: 4.7,
      avaliacoes: 613,
      plano: 'cidade',
      inicio: '2026-08-20',
      fim: '2026-12-20',
      chamada: {
        'pt-BR': 'Especialistas em barba cheia e alinhamento de contorno.',
        'en-US': 'Specialists in full beards and clean line-ups.',
        'es-ES': 'Especialistas en barba completa y perfilado.'
      },
      servicos: [
        { chave: 'barba', preco: 45 },
        { chave: 'corte', preco: 55 },
        { chave: 'combo', preco: 90 }
      ],
      dias: [1, 2, 3, 4, 5, 6],
      periodos: ['manha', 'tarde', 'noite']
    },
    {
      id: 'the-barber-club',
      nome: 'The Barber Club',
      cidade: 'curitiba',
      bairro: 'Batel',
      endereco: 'Av. do Batel, 1750 — Batel, Curitiba/PR',
      telefone: '+55 41 99118-4432',
      foto: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1000&q=70',
      nota: 4.8,
      avaliacoes: 977,
      plano: 'nacional',
      inicio: '2026-08-05',
      fim: '2026-11-05',
      chamada: {
        'pt-BR': 'Clube de assinatura: corte toda semana por um valor fixo no mês.',
        'en-US': 'Membership club: a cut every week for one flat monthly fee.',
        'es-ES': 'Club de suscripción: corte semanal por una cuota mensual fija.'
      },
      servicos: [
        { chave: 'corte',    preco: 70 },
        { chave: 'barba',    preco: 50 },
        { chave: 'combo',    preco: 110 },
        { chave: 'infantil', preco: 55 }
      ],
      dias: [1, 2, 3, 4, 5, 6],
      periodos: ['manha', 'tarde', 'noite']
    },
    {
      /* Contrato encerrado em julho — permanece no arquivo como histórico e é
         filtrado automaticamente por `vigente()`. Serve de prova viva de que a
         vigência funciona sem ninguém precisar editar o código. */
      id: 'corte-fino',
      nome: 'Corte Fino',
      cidade: 'salvador',
      bairro: 'Rio Vermelho',
      endereco: 'Rua da Paciência, 210 — Rio Vermelho, Salvador/BA',
      telefone: '+55 71 99345-2018',
      foto: 'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&w=1000&q=70',
      nota: 4.6,
      avaliacoes: 402,
      plano: 'cidade',
      inicio: '2026-05-01',
      fim: '2026-07-31',
      chamada: {
        'pt-BR': 'Tradição do Rio Vermelho, agora com agenda online.',
        'en-US': 'A Rio Vermelho institution, now booking online.',
        'es-ES': 'Tradición de Rio Vermelho, ahora con agenda en línea.'
      },
      servicos: [
        { chave: 'corte', preco: 50 },
        { chave: 'barba', preco: 35 },
        { chave: 'combo', preco: 78 }
      ],
      dias: [2, 3, 4, 5, 6],
      periodos: ['manha', 'tarde']
    }
  ];

  global.INBARBER_DESTAQUES = {
    cidades: CIDADES,
    destaques: DESTAQUES,
    /* Acima deste raio o site considera que não atende a região do visitante e
       cai para o pool nacional em vez de chutar uma cidade distante. */
    raioMaxKm: 250
  };
})(window);