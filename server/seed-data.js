module.exports = {
  questions: [
    {
      id: 101,
      discipline: "Direito Constitucional",
      examining_board: "CEBRASPE (CESPE)",
      institute: "Polícia Federal (PF)",
      year: 2024,
      difficulty: "Médio",
      statement: "A respeito dos direitos e garantias fundamentais previstos na Constituição Federal de 1988, é correto afirmar que a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial.",
      options: JSON.stringify([
        { key: "C", text: "Certo" },
        { key: "E", text: "Errado" }
      ]),
      right_answer: "C",
      explanation: "GABARITO: CERTO. A assertiva reproduz fielmente a redação do art. 5º, inciso XI, da CF/88: 'a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre, ou para prestar socorro, ou, durante o dia, por determinação judicial'. Lembre-se: por determinação judicial, o ingresso SÓ é permitido durante o dia!",
      stats_distribution: JSON.stringify({ C: 88, E: 12 }),
      comments: JSON.stringify([
        { user: "Carlos_Concurseiro", text: "Caiu em quase todas as provas da PF e PRF! Artigo 5º, XI é leitura obrigatória.", likes: 45, date: "2024-03-15" },
        { user: "Prof_Renato_DirConst", is_professor: true, text: "Atenção: à noite, nem com mandado judicial pode entrar! Apenas flagrante, desastre ou socorro.", likes: 92, date: "2024-03-16" }
      ])
    },
    {
      id: 102,
      discipline: "Direito Constitucional",
      examining_board: "FGV",
      institute: "Receita Federal",
      year: 2023,
      difficulty: "Difícil",
      statement: "De acordo com a jurisprudência consolidada do Supremo Tribunal Federal (STF) sobre os remédios constitucionais, assinale a opção correta:",
      options: JSON.stringify([
        { key: "A", text: "O habeas corpus pode ser impetrado por pessoa jurídica em seu próprio benefício caso sofra ameaça à sua liberdade institucional." },
        { key: "B", text: "O mandado de segurança coletivo pode ser impetrado por partido político sem representação no Congresso Nacional, desde que legalmente constituído." },
        { key: "C", text: "O habeas data é o instrumento adequado para assegurar o conhecimento de informações relativas à pessoa do impetrante, constantes de registros de entidades governamentais ou de caráter público." },
        { key: "D", text: "A ação popular pode ser ajuizada por qualquer pessoa física ou jurídica que pretenda anular ato lesivo ao patrimônio público." },
        { key: "E", text: "O mandado de injunção não admite a fixação de efeitos concretos pelo Poder Judiciário, limitando-se à ciência da mora legislativa." }
      ]),
      right_answer: "C",
      explanation: "GABARITO: C. Art. 5º, LXXII, 'a', da CF/88: 'conceder-se-á habeas data: a) para assegurar o conhecimento de informações relativas à pessoa do impetrante, constantes de registros ou bancos de dados de entidades governamentais ou de caráter público'.\n\nErros das demais:\nA) Pessoa jurídica NÃO tem liberdade de locomoção (não cabe HC).\nB) Exige representação no Congresso Nacional (art. 5º, LXX, 'a').\nD) Apenas cidadão (eleitor em dia com a Justiça Eleitoral) tem legitimidade ativa para ação popular; PJ não pode ajuizar.\nE) O STF adota a posição concretista no Mandado de Injunção.",
      stats_distribution: JSON.stringify({ A: 4, B: 7, C: 76, D: 11, E: 2 }),
      comments: JSON.stringify([
        { user: "FiscalDeElite", text: "Cuidado com a D! Pessoa jurídica NÃO ajuíza Ação Popular (Súmula 365 STF).", likes: 64, date: "2023-11-02" }
      ])
    },
    {
      id: 103,
      discipline: "Direito Administrativo",
      examining_board: "CEBRASPE (CESPE)",
      institute: "Polícia Rodoviária Federal (PRF)",
      year: 2024,
      difficulty: "Médio",
      statement: "No que concerne aos princípios expressos e reconhecidos da Administração Pública, o princípio da impessoalidade determina que a atuação estatal deve visar ao interesse público, sendo vedada a promoção pessoal de autoridades ou servidores públicos sobre suas realizações.",
      options: JSON.stringify([
        { key: "C", text: "Certo" },
        { key: "E", text: "Errado" }
      ]),
      right_answer: "C",
      explanation: "GABARITO: CERTO. O princípio da impessoalidade (art. 37, caput e § 1º, da CF/88) possui dupla acepção: vedação ao favorecimento/perseguição de particulares (busca do interesse público) e vedação à promoção pessoal dos agentes públicos em publicidades oficiais.",
      stats_distribution: JSON.stringify({ C: 91, E: 9 }),
      comments: [
        { user: "FuturaPRF", text: "L.I.M.P.E. na veia! Lembrar do art. 37, §1º: publicidade não pode ter nomes, símbolos ou imagens que caracterizem promoção pessoal.", likes: 38, date: "2024-01-20" }
      ]
    },
    {
      id: 104,
      discipline: "Direito Administrativo",
      examining_board: "FCC",
      institute: "Tribunal Regional Federal (TRF)",
      year: 2023,
      difficulty: "Médio",
      statement: "Sobre os atos administrativos e seus atributos, considere o atributo que autoriza a Administração a executar de forma direta suas próprias decisões, empregando meios de coerção física se necessário, sem a prévia autorização judicial:",
      options: JSON.stringify([
        { key: "A", text: "Presunção de legitimidade e veracidade." },
        { key: "B", text: "Autoexecutoriedade." },
        { key: "C", text: "Tipicidade." },
        { key: "D", text: "Imperatividade." },
        { key: "E", text: "Exigibilidade." }
      ]),
      right_answer: "B",
      explanation: "GABARITO: B. A Autoexecutoriedade é o atributo que permite à Administração Pública executar diretamente as suas decisões, sem precisar socorrer-se previamente do Poder Judiciário. Presente nas hipóteses previstas expressamente em lei ou em situações de urgência.",
      stats_distribution: JSON.stringify({ A: 6, B: 79, C: 2, D: 11, E: 2 }),
      comments: [
        { user: "Paula_TRF", text: "Macete clássico: PATI (Presunção, Autoexecutoriedade, Tipicidade, Imperatividade). Quem executa diretamente é a AUTOEXECUTORIEDADE.", likes: 52, date: "2023-09-10" }
      ]
    },
    {
      id: 105,
      discipline: "Língua Portuguesa",
      examining_board: "FGV",
      institute: "Tribunal de Justiça (TJSP)",
      year: 2024,
      difficulty: "Médio",
      statement: "Assinale a frase em que o emprego do acento grave indicativo de crase está estritamente CORRETO:",
      options: JSON.stringify([
        { key: "A", text: "O juiz dirigiu-se à ela com serenidade e respeito." },
        { key: "B", text: "O réu compareceu perante à autoridade policial para depor." },
        { key: "C", text: "Os autos do processo foram encaminhados à promotoria de justiça da comarca." },
        { key: "D", text: "O candidato começou à responder as questões com agilidade." },
        { key: "E", text: "As decisões foram tomadas passo à passo pelo colegiado." }
      ]),
      right_answer: "C",
      explanation: "GABARITO: C. Em 'encaminhados à promotoria': quem encaminha, encaminha algo A algum lugar (preposição 'a') + substantivo feminino 'a promotoria' = crase obrigatória (à).\n\nErros das demais:\nA) Não há crase antes de pronome pessoal ('ela').\nB) A preposição 'perante' já introduz o termo; não se combina com outra preposição para formar crase.\nD) Não há crase antes de verbo no infinitivo ('responder').\nE) Não há crase entre palavras repetidas ('passo a passo').",
      stats_distribution: JSON.stringify({ A: 3, B: 8, C: 75, D: 9, E: 5 }),
      comments: [
        { user: "Lucas_Gabarito", text: "Nunca use crase antes de verbo, pronome pessoal ou entre palavras repetidas. Fica fácil eliminar!", likes: 83, date: "2024-04-12" }
      ]
    },
    {
      id: 106,
      discipline: "Língua Portuguesa",
      examining_board: "CEBRASPE (CESPE)",
      institute: "INSS",
      year: 2024,
      difficulty: "Fácil",
      statement: "Na oração 'Houveram muitos recursos contra o resultado provisório da prova', o verbo 'haver' foi empregado em conformidade com as normas gramaticais de concordância padrão da língua portuguesa.",
      options: JSON.stringify([
        { key: "C", text: "Certo" },
        { key: "E", text: "Errado" }
      ]),
      right_answer: "E",
      explanation: "GABARITO: ERRADO. O verbo 'haver', no sentido de 'existir', 'acontecer' ou 'ocorrer', é IMPESSOAL e não possui sujeito. Portanto, deve permanecer obrigatoriamente na terceira pessoa do SINGULAR: 'Houve muitos recursos'.",
      stats_distribution: JSON.stringify({ C: 14, E: 86 }),
      comments: [
        { user: "Mariana_Estudos", text: "Clássico dos clássicos! Haver com sentido de existir = singular sempre!", likes: 41, date: "2024-02-18" }
      ]
    },
    {
      id: 107,
      discipline: "Raciocínio Lógico",
      examining_board: "VUNESP",
      institute: "Polícia Civil (PCSP)",
      year: 2023,
      difficulty: "Médio",
      statement: "Dada a proposição composta: 'Se o suspeito mente, então o investigador descobre a verdade', assinale a alternativa que apresenta sua negação lógica equivalente:",
      options: JSON.stringify([
        { key: "A", text: "Se o suspeito não mente, então o investigador não descobre a verdade." },
        { key: "B", text: "O suspeito mente e o investigador não descobre a verdade." },
        { key: "C", text: "O suspeito não mente ou o investigador descobre a verdade." },
        { key: "D", text: "Se o investigador descobre a verdade, então o suspeito mente." },
        { key: "E", text: "O suspeito não mente e o investigador descobre a verdade." }
      ]),
      right_answer: "B",
      explanation: "GABARITO: B. Para negar uma condicional (P -> Q), utiliza-se a famosa regra do MANÉ: Mantém a primeira (P) E Nega a segunda (~Q).\nLogo: P ^ ~Q = 'O suspeito mente E o investigador não descobre a verdade'.",
      stats_distribution: JSON.stringify({ A: 12, B: 71, C: 11, D: 3, E: 3 }),
      comments: [
        { user: "Matheus_RLM", text: "Regra do MANÉ: MAntém a primeira E NEga a segunda! Não tem como esquecer.", likes: 110, date: "2023-10-15" }
      ]
    },
    {
      id: 108,
      discipline: "Noções de Informática",
      examining_board: "CEBRASPE (CESPE)",
      institute: "Polícia Federal (PF)",
      year: 2024,
      difficulty: "Médio",
      statement: "Ransomware é um tipo de software malicioso (malware) que, ao infectar um computador, criptografa os arquivos do usuário e exige o pagamento de um resgate (geralmente em criptomoedas) para fornecer a chave de descriptografia.",
      options: JSON.stringify([
        { key: "C", text: "Certo" },
        { key: "E", text: "Errado" }
      ]),
      right_answer: "C",
      explanation: "GABARITO: CERTO. O ransomware é caracterizado justamente pelo 'sequestro' de dados do sistema, aplicando criptografia e cobrando um resgate (ransom) da vítima.",
      stats_distribution: JSON.stringify({ C: 94, E: 6 }),
      comments: [
        { user: "DevSecOps", text: "Caiu em 2018, 2021 e agora em 2024 na PF. Conceito básico de segurança da informação.", likes: 29, date: "2024-05-01" }
      ]
    },
    {
      id: 109,
      discipline: "Direito Administrativo",
      examining_board: "CEBRASPE (CESPE)",
      institute: "TCU",
      year: 2024,
      difficulty: "Difícil",
      statement: "De acordo com a Nova Lei de Licitações e Contratos Administrativos (Lei nº 14.133/2021), a modalidade 'diálogo competitivo' é restrita a contratações que envolvam inovação tecnológica ou técnica, impossibilidade de o órgão definir as especificações com precisão suficiente ou necessidade de definir a melhor solução jurídica ou financeira.",
      options: JSON.stringify([
        { key: "C", text: "Certo" },
        { key: "E", text: "Errado" }
      ]),
      right_answer: "C",
      explanation: "GABARITO: CERTO. Art. 32 da Lei 14.133/2021: O diálogo competitivo é a modalidade para contratação de obras, serviços e compras em que a Administração realiza diálogos com licitantes previamente selecionados mediante critérios objetivos, com o intuito de desenvolver uma ou mais alternativas capazes de atender às suas necessidades, cabendo aos licitantes apresentar proposta final após o encerramento dos diálogos.",
      stats_distribution: JSON.stringify({ C: 82, E: 18 }),
      comments: [
        { user: "AnalistaTCU", text: "Diálogo competitivo é novidade essencial da Lei 14.133/21. Foco nos artigos 32 e 33!", likes: 55, date: "2024-03-29" }
      ]
    },
    {
      id: 110,
      discipline: "Direito Constitucional",
      examining_board: "FCC",
      institute: "TRT",
      year: 2023,
      difficulty: "Fácil",
      statement: "A soberania popular é exercida pelo sufrágio universal e pelo voto direto e secreto, com valor igual para todos, e, nos termos da lei, mediante:",
      options: JSON.stringify([
        { key: "A", text: "Plebiscito, referendo e iniciativa popular." },
        { key: "B", text: "Apenas plebiscito e referendo, sendo vedada a iniciativa popular." },
        { key: "C", text: "Plebiscito, recall e veto popular." },
        { key: "D", text: "Consulta prévia, referendo e ação popular." },
        { key: "E", text: "Iniciativa popular e audiência pública apenas." }
      ]),
      right_answer: "A",
      explanation: "GABARITO: A. Art. 14 da CF/88: 'A soberania popular será exercida pelo sufrágio universal e pelo voto direto e secreto, com valor igual para todos, e, nos termos da lei, mediante: I - plebiscito; II - referendo; III - iniciativa popular'.",
      stats_distribution: JSON.stringify({ A: 93, B: 2, C: 2, D: 2, E: 1 }),
      comments: [
        { user: "Júlia_Estudante", text: "P.R.I. = Plebiscito, Referendo, Iniciativa popular. Lembrar sempre!", likes: 47, date: "2023-08-14" }
      ]
    }
  ],

  flashcards: [
    {
      id: "fc-1",
      discipline: "Direito Constitucional",
      front: "Em que hipóteses é permitido ingressar na casa de alguém sem o consentimento do morador durante a noite?",
      back: "Apenas em 3 hipóteses constitucionais: \n1) Flagrante delito\n2) Desastre\n3) Para prestar socorro.\n\n⚠️ Mandado judicial NÃO permite entrada noturna (apenas durante o dia)! (Art. 5º, XI, CF/88)"
    },
    {
      id: "fc-2",
      discipline: "Direito Constitucional",
      front: "Qual a diferença entre Plebiscito e Referendo?",
      back: "• Plebiscito: Convocado ANTES da criação do ato normativo/lei (consulta prévia aos cidadãos).\n• Referendo: Convocado DEPOIS que o ato já foi aprovado pelo parlamento, para o povo ratificar ou rejeitar."
    },
    {
      id: "fc-3",
      discipline: "Direito Administrativo",
      front: "Quais são os atributos do ato administrativo? (Mnemônico PATI)",
      back: "• P - Presunção de legitimidade e veracidade\n• A - Autoexecutoriedade (agir sem ordem judicial prévia)\n• T - Tipicidade (deve estar previsto em lei)\n• I - Imperatividade (imposição obrigatória a terceiros)"
    },
    {
      id: "fc-4",
      discipline: "Direito Administrativo",
      front: "Quais são os 5 princípios expressos da Administração Pública no caput do art. 37 da CF/88?",
      back: "Mnemônico LIMPE:\n• L - Legalidade\n• I - Impessoalidade\n• M - Moralidade\n• P - Publicidade\n• E - Eficiência (adicionado pela EC 19/98)"
    },
    {
      id: "fc-5",
      discipline: "Língua Portuguesa",
      front: "Quando NUNCA ocorre crase?",
      back: "1. Antes de palavras masculinas (a pé, a cavalo)\n2. Antes de verbos no infinitivo (a caminhar)\n3. Antes de pronomes pessoais (a ela, a mim)\n4. Entre palavras repetidas (dia a dia, face a face)\n5. Antes de artigo indefinido (a uma pessoa)\n6. Com a 'a' no singular diante de plural (a mulheres)"
    },
    {
      id: "fc-6",
      discipline: "Raciocínio Lógico",
      front: "Como negar uma proposição condicional do tipo 'Se P, então Q' (P -> Q)?",
      back: "Regra do MANÉ:\n• MAntém a primeira (P)\n• E (conectivo de conjunção ^)\n• NEga a segunda (~Q)\n\nEquivalência: ~(P -> Q) ≡ P ^ ~Q"
    }
  ],

  practice_tests: [
    {
      id: "pt-1",
      title: "Simulado Express — Polícia Federal (Agente)",
      description: "Simulado focado nas matérias centrais da PF: Direito Constitucional, Administrativo, Português, RLM e Informática.",
      time_limit_minutes: 30,
      question_ids: JSON.stringify([101, 103, 105, 107, 108])
    },
    {
      id: "pt-2",
      title: "Simulado Geral — Tribunais e Carreiras Jurídicas",
      description: "Questões selecionadas da FCC, FGV e Cebraspe para TRFs, TJs e TRTs.",
      time_limit_minutes: 40,
      question_ids: JSON.stringify([102, 104, 106, 109, 110])
    }
  ],

  notebooks: [
    {
      id: "nb-caderno-erros",
      name: "Caderno de Erros Automático 🎯",
      color: "#ef4444",
      question_ids: []
    },
    {
      id: "nb-favoritos",
      name: "Questões Favoritas & Ouro ⭐",
      color: "#f59e0b",
      question_ids: [101, 102]
    }
  ]
};
