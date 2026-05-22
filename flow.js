/**
 * flow.js — Configuração do Funil de Aplicação
 * Valeur Consultoria — Estruturação Comercial
 *
 * COMO PERSONALIZAR:
 *  - FUNNEL_CONFIG: ajuste webhook, calendly e informações de contato
 *  - Cada step tem: id, title, subtitle, fields[], nextStep
 *  - nextStep pode ser string (id do próximo step) ou função condicional
 *  - disqualifyScreen: tela de saída elegante para leads fora do perfil
 *  - successScreen: tela final com próximos passos
 */

// ─────────────────────────────────────────────
// CONFIGURAÇÃO OPERACIONAL — EDITE AQUI
// ─────────────────────────────────────────────
export const FUNNEL_CONFIG = {
  // Webhook para o Kommo CRM (substitua pela URL real)
  webhookUrl: 'https://SEU_WEBHOOK_AQUI.com/lead',

  // URL do Calendly ou ferramenta de agendamento (substitua pela URL real)
  calendlyUrl: 'https://calendly.com/valeur-consultoria',

  // Tempo máximo de resposta prometido ao lead (aparece na tela final)
  responseTimeHours: 4,

  // WhatsApp para fallback de contato (com DDI, sem espaços ou símbolos)
  whatsappFallback: '5541999999999',

  // Nome da empresa — aparece em microcopy e mensagens
  companyName: 'Valeur Consultoria',
};

// ─────────────────────────────────────────────
// TELA DE DESQUALIFICAÇÃO
// ─────────────────────────────────────────────
export const disqualifyScreen = {
  id: 'disqualify',
  title: 'Ainda não é o momento certo',
  subtitle:
    'Nossa consultoria é desenhada para empresas que já têm time comercial ativo e faturamento a partir de R$75k/mês. Neste momento, seu perfil não se encaixa nesse estágio.',
  message:
    'Isso não significa que você não vai chegar lá — significa que o próximo passo para você é diferente.',
  alternativeLabel: 'Acompanhe nosso conteúdo gratuito sobre estruturação comercial',
  alternativeUrl: 'https://instagram.com/valeurconsultoria', // substitua pelo link real
  alternativeButtonText: 'Acessar conteúdo gratuito',
};

// ─────────────────────────────────────────────
// TELA DE SUCESSO
// ─────────────────────────────────────────────
export const successScreen = {
  id: 'success',
  title: 'Aplicação recebida.',
  subtitle: 'Você deu o primeiro passo para transformar seu comercial em uma máquina previsível.',
  steps: [
    {
      icon: '01',
      title: 'Análise do seu perfil',
      description:
        'Nossa equipe vai revisar suas respostas para entender o estágio do seu processo comercial.',
    },
    {
      icon: '02',
      title: `Contato em até ${FUNNEL_CONFIG.responseTimeHours}h`,
      description:
        'Um especialista da Valeur entrará em contato pelo WhatsApp informado para confirmar sua call.',
    },
    {
      icon: '03',
      title: 'Diagnóstico inicial gratuito',
      description:
        'Na call, você vai entender exatamente onde está o gargalo no seu processo comercial — mesmo que a gente não avance juntos.',
    },
  ],
  calendlyLabel: 'Prefere já garantir seu horário? Agende agora:',
  calendlyButtonText: 'Agendar minha call',
  note: 'Atendemos empresas com faturamento acima de R$75k/mês. Se sua empresa não se encaixa nesse perfil, nossa equipe vai indicar o melhor caminho.',
};

// ─────────────────────────────────────────────
// ETAPAS DO FUNIL
// ─────────────────────────────────────────────
// ORDEM OBRIGATÓRIA: engajamento → qualificação → dados pessoais

export const steps = [

  // ── STEP 1 — ENGAJAMENTO (diagnóstico rápido) ──────────────────────
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Vamos começar pelo diagnóstico',
    subtitle: 'Uma pergunta rápida para entender o momento da sua operação comercial.',
    estimatedTime: '~2 minutos',
    fields: [
      {
        id: 'situacao_atual',
        type: 'radio-cards',
        label: 'Qual frase descreve melhor sua situação hoje?',
        required: true,
        options: [
          {
            value: 'time_nao_fecha',
            label: 'Tenho time, mas só eu fecho',
            description: 'Os vendedores até geram atividade, mas o resultado depende de mim',
          },
          {
            value: 'anuncio_sem_retorno',
            label: 'Invisto em anúncio mas o retorno é fraco',
            description: 'Lead chega, mas o time não converte como deveria',
          },
          {
            value: 'cresci_mas_virou_baguaca',
            label: 'Cresci, mas perdeu o controle',
            description: 'A operação escalou sem processo — cada vendedor faz do seu jeito',
          },
          {
            value: 'quero_processo_para_crescer',
            label: 'Quero estruturar antes de escalar',
            description: 'Ainda não escalei, mas não quero crescer sem processo',
          },
        ],
      },
    ],
    nextStep: 'step-2',
  },

  // ── STEP 2 — ENGAJAMENTO (contexto do time) ───────────────────────
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'Sobre seu time comercial',
    subtitle: 'Preciso entender a estrutura atual para calibrar o diagnóstico.',
    fields: [
      {
        id: 'tamanho_time',
        type: 'radio-cards',
        label: 'Quantas pessoas atuam diretamente em vendas hoje?',
        required: true,
        options: [
          { value: '1', label: 'Só eu', description: 'Sou o único responsável por fechar' },
          { value: '2-3', label: '2 a 3 vendedores', description: 'Time pequeno, ainda em formação' },
          { value: '4-8', label: '4 a 8 vendedores', description: 'Time médio com alguma estrutura' },
          { value: '9+', label: '9 ou mais', description: 'Time maior, operação mais complexa' },
        ],
      },
      {
        id: 'segmento',
        type: 'select',
        label: 'Qual o segmento da sua empresa?',
        required: true,
        placeholder: 'Selecione o segmento',
        options: [
          { value: 'agencia_marketing', label: 'Agência de Marketing / Publicidade' },
          { value: 'telecom', label: 'Telecom / Tecnologia' },
          { value: 'industria', label: 'Indústria / Distribuição' },
          { value: 'solar', label: 'Energia Solar' },
          { value: 'consultoria_servicos', label: 'Consultoria / Serviços Profissionais' },
          { value: 'saude', label: 'Saúde / Clínicas' },
          { value: 'imobiliario', label: 'Imobiliário / Construção' },
          { value: 'educacao', label: 'Educação / Treinamentos' },
          { value: 'outro', label: 'Outro segmento' },
        ],
      },
    ],
    nextStep: (answers) => {
      // Desqualifica quem tem só 1 pessoa (sem time formado)
      if (answers['tamanho_time'] === '1') return 'step-dq-check';
      return 'step-3';
    },
  },

  // ── STEP 2.5 — PRÉ-DESQUALIFICAÇÃO (sem time) ─────────────────────
  // Dá uma chance antes de desqualificar — pergunta faturamento
  {
    id: 'step-dq-check',
    stepNumber: 3,
    title: 'Mais uma pergunta importante',
    subtitle: 'Entender o faturamento atual nos ajuda a indicar o melhor caminho para você.',
    fields: [
      {
        id: 'faturamento_solo',
        type: 'radio-cards',
        label: 'Qual o faturamento mensal da sua empresa hoje?',
        required: true,
        options: [
          { value: 'menos_50k', label: 'Abaixo de R$50k/mês', description: '' },
          { value: '50k_75k', label: 'R$50k a R$75k/mês', description: '' },
          { value: '75k_150k', label: 'R$75k a R$150k/mês', description: '' },
          { value: 'acima_150k', label: 'Acima de R$150k/mês', description: '' },
        ],
      },
    ],
    nextStep: (answers) => {
      const fat = answers['faturamento_solo'];
      if (fat === 'menos_50k' || fat === '50k_75k') return 'disqualify';
      // Fatura bem mas ainda é só, pode avançar
      return 'step-3';
    },
  },

  // ── STEP 3 — QUALIFICAÇÃO (faturamento) ───────────────────────────
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Entendendo o tamanho da operação',
    subtitle: 'Essa informação define qual nível de estrutura faz sentido para o seu momento.',
    fields: [
      {
        id: 'faturamento',
        type: 'radio-cards',
        label: 'Qual o faturamento mensal da sua empresa hoje?',
        required: true,
        options: [
          { value: 'menos_75k', label: 'Abaixo de R$75k/mês', description: 'Ainda em fase de escala inicial' },
          { value: '75k_150k', label: 'R$75k a R$150k/mês', description: 'Operação em crescimento' },
          { value: '150k_300k', label: 'R$150k a R$300k/mês', description: 'Estrutura consolidada' },
          { value: 'acima_300k', label: 'Acima de R$300k/mês', description: 'Operação madura, buscando eficiência' },
        ],
      },
    ],
    nextStep: (answers) => {
      if (answers['faturamento'] === 'menos_75k') return 'disqualify';
      return 'step-4';
    },
  },

  // ── STEP 4 — QUALIFICAÇÃO (problema e tentativas) ─────────────────
  {
    id: 'step-4',
    stepNumber: 4,
    title: 'O que já foi tentado',
    subtitle: 'Entender o histórico evita repetir o que não funcionou.',
    fields: [
      {
        id: 'ja_tentou',
        type: 'checkbox-cards',
        label: 'O que você já tentou para resolver o problema comercial? (pode marcar mais de um)',
        required: false,
        minSelect: 0,
        options: [
          { value: 'vendedor_senior', label: 'Contratar vendedor sênior esperando que ele "trouxesse o processo"' },
          { value: 'crm', label: 'Implantar CRM achando que ia resolver sozinho' },
          { value: 'curso_avulso', label: 'Fazer treinamento / curso de vendas avulso para o time' },
          { value: 'consultoria_anterior', label: 'Contratar outra consultoria que não implementou de verdade' },
          { value: 'contratar_mais', label: 'Simplesmente contratar mais vendedores' },
          { value: 'nenhuma', label: 'Ainda não tentei nada estruturado' },
        ],
      },
      {
        id: 'maior_dor_hoje',
        type: 'radio-cards',
        label: 'Qual é a maior dor que você sente hoje no comercial?',
        required: true,
        options: [
          { value: 'dependencia_dono', label: 'Dependência do dono', description: 'Sem mim, as vendas caem' },
          { value: 'time_inconsistente', label: 'Time inconsistente', description: 'Resultado varia demais de vendedor para vendedor' },
          { value: 'lead_nao_converte', label: 'Lead não converte', description: 'Invisto em tráfego mas o time não fecha' },
          { value: 'sem_visibilidade', label: 'Falta de visibilidade', description: 'Não consigo ver onde trava o processo' },
          { value: 'crescimento_sem_processo', label: 'Crescimento sem controle', description: 'Escalei mas virou bagunça' },
        ],
      },
    ],
    nextStep: 'step-5',
  },

  // ── STEP 5 — QUALIFICAÇÃO (urgência e decisão) ────────────────────
  {
    id: 'step-5',
    stepNumber: 5,
    title: 'Urgência e decisão',
    subtitle: 'Duas perguntas para entender o momento certo de avançar.',
    fields: [
      {
        id: 'urgencia',
        type: 'radio-cards',
        label: 'Qual o prazo ideal para você ter o processo comercial estruturado?',
        required: true,
        options: [
          { value: 'imediato', label: 'O mais rápido possível', description: 'Já estou perdendo oportunidade' },
          { value: '1_3_meses', label: 'Em 1 a 3 meses', description: 'Quero planejar bem a implementação' },
          { value: '3_6_meses', label: 'Em 3 a 6 meses', description: 'Estou mapeando opções' },
          { value: 'sem_prazo', label: 'Ainda estou pesquisando', description: 'Sem urgência definida' },
        ],
      },
      {
        id: 'decisao',
        type: 'radio-cards',
        label: 'Se a solução fizer sentido, quem toma a decisão?',
        required: true,
        options: [
          { value: 'eu_decido', label: 'Eu mesmo decido', description: 'Sou o dono / sócio decisor' },
          { value: 'sociedade', label: 'Decido com sócio(s)', description: 'Precisamos alinhar juntos' },
          { value: 'precisa_aprovacao', label: 'Precisa de aprovação', description: 'Há um processo interno de aprovação' },
        ],
      },
    ],
    nextStep: 'step-6',
  },

  // ── STEP 6 — DADOS PESSOAIS (por último, após qualificação) ───────
  {
    id: 'step-6',
    stepNumber: 6,
    title: 'Quase lá — seus dados de contato',
    subtitle: 'Esses dados são usados exclusivamente para nossa equipe entrar em contato e confirmar sua call. Nada de spam.',
    trustNote: 'Suas informações são tratadas com total confidencialidade. Após o envio, um especialista da Valeur entrará em contato em até 4h pelo WhatsApp.',
    fields: [
      {
        id: 'nome',
        type: 'text',
        label: 'Seu nome completo',
        placeholder: 'Ex: Carlos Mendes',
        required: true,
        autocomplete: 'name',
        validation: {
          minLength: 3,
          message: 'Digite seu nome completo (mínimo 3 caracteres)',
        },
      },
      {
        id: 'empresa',
        type: 'text',
        label: 'Nome da empresa',
        placeholder: 'Ex: Grupo Solar Nordeste',
        required: true,
        autocomplete: 'organization',
        validation: {
          minLength: 2,
          message: 'Digite o nome da empresa',
        },
      },
      {
        id: 'whatsapp',
        type: 'tel',
        label: 'WhatsApp com DDD',
        placeholder: 'Ex: (41) 99999-9999',
        required: true,
        autocomplete: 'tel',
        hint: 'Usamos o WhatsApp para confirmar sua call. Sem grupos ou listas.',
        validation: {
          pattern: /^[\d\s\(\)\-\+]{10,15}$/,
          message: 'Digite um número de WhatsApp válido com DDD',
        },
      },
      {
        id: 'email',
        type: 'email',
        label: 'E-mail corporativo',
        placeholder: 'Ex: carlos@suaempresa.com.br',
        required: true,
        autocomplete: 'email',
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Digite um e-mail válido',
        },
      },
      {
        id: 'privacy',
        type: 'checkbox',
        label: 'Concordo que a Valeur Consultoria entre em contato comigo pelos dados fornecidos acima.',
        required: true,
        errorMessage: 'Você precisa concordar para enviar sua aplicação',
      },
    ],
    nextStep: null, // último step — dispara o submit
  },
];

// ─────────────────────────────────────────────
// CONFIGURAÇÃO DE COPY DA LANDING PAGE
// (usado pelo app.js para renderizar a seção hero)
// ─────────────────────────────────────────────
export const heroContent = {
  eyebrow: 'Consultoria em Estruturação Comercial',
  headline: 'Seu time vende.\nMas só você fecha.',
  subheadline:
    'Você tem vendedores, investe em tráfego e gera lead. O problema não é falta de oportunidade — é falta de processo. A Valeur transforma seu comercial em uma máquina previsível, onde cada vendedor sabe o que fazer e os resultados não dependem do seu talento individual.',
  ctaText: 'Ver se minha empresa se qualifica',
  ctaSubtext: 'Diagnóstico gratuito · Sem compromisso · ~2 minutos',
  stats: [
    { value: '200+', label: 'projetos estruturados' },
    { value: '6', label: 'meses de implementação' },
    { value: '3', label: 'fases validadas' },
  ],
  socialProofBadge: 'Empresas de telecom, indústria, agências e consultorias em todo o Brasil',
};

// ─────────────────────────────────────────────
// BLOCO DE AUTORIDADE
// ─────────────────────────────────────────────
export const authorityContent = {
  headline: 'Não é consultoria. É implementação.',
  description:
    'A maioria das consultorias entrega um PowerPoint e vai embora. A Valeur fica do diagnóstico até a execução — auditoria, planejamento tático e implementação real no seu time.',
  methodology: [
    {
      number: '01',
      title: 'Auditoria Comercial',
      description:
        'Mapeamos onde está o gargalo real: processo, time, discurso ou gestão. Sem achismo.',
    },
    {
      number: '02',
      title: 'Planejamento Tático',
      description:
        'Desenhamos o processo comercial do zero, calibrado para o seu segmento e perfil de cliente.',
    },
    {
      number: '03',
      title: 'Implementação',
      description:
        'Colocamos o processo em prática junto com seu time — treinamento, indicadores e acompanhamento.',
    },
  ],
};

// ─────────────────────────────────────────────
// OBJEÇÕES (FAQ)
// ─────────────────────────────────────────────
export const faqContent = [
  {
    question: 'É caro demais para o que minha empresa fatura.',
    answer:
      'Um processo comercial mal estruturado custa mais do que qualquer consultoria. Se seu time converte 15% dos leads e, com processo, passa para 25%, o retorno em 6 meses supera o investimento na maioria dos casos que atendemos. Na call, calculamos isso juntos com os seus números.',
  },
  {
    question: '6 meses é muito tempo. Preciso de resultado agora.',
    answer:
      'Os primeiros resultados aparecem nas primeiras semanas — a implementação é progressiva. Em 30 dias você já tem o processo mapeado e o time treinado na metodologia. O restante do projeto consolida e escala.',
  },
  {
    question: 'Já tentei consultoria antes e não funcionou.',
    answer:
      'A diferença está na implementação. Não entregamos diagnóstico e sumimos. Acompanhamos o processo dentro da sua operação, com indicadores de acompanhamento e suporte ativo durante os 6 meses.',
  },
  {
    question: 'Meu segmento é específico. Vocês entendem?',
    answer:
      'Em 200+ projetos atendemos telecom, indústria, agências, solar, consultorias e outros segmentos de serviços. A metodologia é adaptada ao seu ciclo de venda, perfil de cliente e estrutura de time.',
  },
];
