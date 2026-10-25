const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbs = [
  'D:/questions/database/qlingo_master.sqlite',
  path.join(__dirname, '../server/qlingo.sqlite')
];

const newQuestions = [
  // --- CARREIRAS POLICIAIS ---
  {
    discipline: 'Direito Penal',
    subject: 'Crimes Contra a Vida e Legítima Defesa',
    examining_board: 'CEBRASPE',
    institute: 'Polícia Federal',
    year: 2024,
    difficulty: 'Médio',
    career: 'Carreiras Policiais',
    exam_type: 'CONCURSO',
    statement: 'Com relação aos princípios do direito penal, à ilicitude e à culpabilidade, julgue o item a seguir.\n\nConfigura legítima defesa putativa a situação em que o agente, sob o influxo de erro plenamente justificado pelas circunstâncias do fato, supõe a existência de agressão injusta e atual contra si ou outrem, reagindo moderadamente com os meios necessários.',
    options: JSON.stringify([
      { key: 'A', text: 'Certo — Trata-se de descriminante putativa sobre os pressupostos fáticos da excludente (art. 20, § 1º, CP).' },
      { key: 'B', text: 'Errado — A legítima defesa putativa só se aplica quando o perigo decorre de forças da natureza.' },
      { key: 'C', text: 'Errado — O erro de fato exclui a culpabilidade, mas nunca a tipicidade subjetiva.' },
      { key: 'D', text: 'Errado — Apenas a legítima defesa real admite a moderação dos meios.' }
    ]),
    right_answer: 'A',
    explanation: 'Correta a alternativa A. O art. 20, § 1º, do Código Penal regula as descriminantes putativas: é isento de pena quem, por erro plenamente justificado pelas circunstâncias, supõe situação de fato que, se existisse, tornaria a ação legítima.',
    stats_distribution: JSON.stringify({ A: 78, B: 8, C: 9, D: 5 }),
    comments: JSON.stringify([
      { author: 'Prof. Direito Penal', text: 'Descriminante putativa por erro sobre pressuposto fático isenta o autor de pena se inevitável, ou responde por culpa se evitável e houver previsão legal de modalidade culposa.' }
    ])
  },
  {
    discipline: 'Direito Processual Penal',
    subject: 'Inquérito Policial e Notitia Criminis',
    examining_board: 'CEBRASPE',
    institute: 'Polícia Federal',
    year: 2023,
    difficulty: 'Difícil',
    career: 'Carreiras Policiais',
    exam_type: 'CONCURSO',
    statement: 'Em matéria de inquérito policial (IP) e atuação da autoridade policial, assinale a opção correta à luz do Código de Processo Penal e da jurisprudência do Superior Tribunal de Justiça (STJ).',
    options: JSON.stringify([
      { key: 'A', text: 'A autoridade policial poderá mandar arquivar os autos de inquérito policial se constatar atipicidade manifesta da conduta.' },
      { key: 'B', text: 'O inquérito policial é dispensável para a propositura da ação penal pública caso o Ministério Público já possua elementos de convicção suficientes de autoria e materialidade.' },
      { key: 'C', text: 'O ofendido não pode requerer diligências durante o curso do inquérito policial, dado o caráter inquisitivo do procedimento.' },
      { key: 'D', text: 'A incomunicabilidade do indiciado é compatível com a Constituição de 1988 desde que autorizada por juiz competente.' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. O inquérito policial tem natureza de procedimento administrativo informativo preliminar, sendo peça meramente informativa e, portanto, DISPENSÁVEL (arts. 39, § 5º, e 46, § 1º, do CPP). Conforme o art. 17 do CPP, a autoridade policial jamais poderá mandar arquivar autos de inquérito.',
    stats_distribution: JSON.stringify({ A: 12, B: 74, C: 6, D: 8 }),
    comments: JSON.stringify([
      { author: 'Prof. Processo Penal', text: 'Regra de ouro: Delegado NUNCA arquiva IP (art. 17 CPP). E o IP é dispensável se o MP já tiver os elementos.' }
    ])
  },
  {
    discipline: 'Legislação Especial',
    subject: 'Lei de Drogas (Lei nº 11.343/2006)',
    examining_board: 'CEBRASPE',
    institute: 'Polícia Rodoviária Federal',
    year: 2024,
    difficulty: 'Médio',
    career: 'Carreiras Policiais',
    exam_type: 'CONCURSO',
    statement: 'Em fiscalização de rotina na BR-116, agentes da PRF abordam um veículo de transporte de passageiros interestadual e localizam 15 kg de pasta-base de cocaína ocultos sob o assoalho do veículo. Com base na Lei de Drogas (Lei nº 11.343/2006), a majorante de interestadualidade incidirá:',
    options: JSON.stringify([
      { key: 'A', text: 'Apenas se os agentes comprovarem a efetiva transposição da divisa interestadual entre os Estados de origem e destino.' },
      { key: 'B', text: 'Mesmo sem a efetiva transposição da fronteira interestadual, desde que evidenciada a intenção deliberada de transportar a substância entre Estados da Federação (Súmula 587/STJ).' },
      { key: 'C', text: 'Somente se houver concurso de duas ou mais pessoas envolvidas no transporte.' },
      { key: 'D', text: 'Apenas se a apreensão ocorrer dentro de terminais rodoviários oficiais.' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. Súmula 587 do STJ: "Para a incidência da majorante prevista no art. 40, inciso V, da Lei n. 11.343/06, é desnecessária a efetiva transposição de fronteiras entre estados da federação, sendo suficiente a demonstração inequívoca da intenção de realizar o tráfico interestadual."',
    stats_distribution: JSON.stringify({ A: 18, B: 76, C: 4, D: 2 }),
    comments: JSON.stringify([
      { author: 'Prof. Legislação Extravagante', text: 'Atenção com a Súmula 587 do STJ! Vale tanto para o tráfico interestadual quanto internacional (Súmula 607/STJ).' }
    ])
  },
  {
    discipline: 'Direito Constitucional',
    subject: 'Direitos e Garantias Fundamentais — Inviolabilidade de Domicílio',
    examining_board: 'CEBRASPE',
    institute: 'Polícia Civil',
    year: 2023,
    difficulty: 'Difícil',
    career: 'Carreiras Policiais',
    exam_type: 'CONCURSO',
    statement: 'A respeito da garantia constitucional da inviolabilidade do domicílio (art. 5º, XI, CF/88) e do entendimento vinculante do STF (Tema 280 da Repercussão Geral), assinale a afirmativa correta:',
    options: JSON.stringify([
      { key: 'A', text: 'A entrada forçada em domicílio sem mandado judicial só é lícita, mesmo em período noturno, quando amparada em fundadas razões, devidamente justificadas pelas circunstâncias prévias.' },
      { key: 'B', text: 'A denúncia anônima desacompanhada de diligências preliminares é suficiente para justificar a invasão domiciliar imediata em caso de tráfico de drogas.' },
      { key: 'C', text: 'O flagrante delito em crimes permanentes autoriza o ingresso domiciliar a qualquer hora do dia ou da noite, independentemente de justa causa demonstrável a priori.' },
      { key: 'D', text: 'O consentimento do morador para busca domiciliar pode ser presumido pelo silêncio ou ausência de resistência física.' }
    ]),
    right_answer: 'A',
    explanation: 'Gabarito A. STF - RE 603.616 (Tema 280): "A entrada forçada em domicílio sem mandado judicial só é lícita, mesmo em período noturno, quando amparada em fundadas razões, devidamente justificadas a posteriori, que indiquem que dentro da casa ocorre situação de flagrante delito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade dos atos praticados."',
    stats_distribution: JSON.stringify({ A: 73, B: 11, C: 12, D: 4 }),
    comments: JSON.stringify([
      { author: 'Prof. Constitucional', text: 'Tema 280 do STF é questão certa em concursos policiais! Exigem-se fundadas razões (justa causa) prévias.' }
    ])
  },
  {
    discipline: 'Informática Policial',
    subject: 'Segurança da Informação e Criptografia',
    examining_board: 'CEBRASPE',
    institute: 'Polícia Federal',
    year: 2024,
    difficulty: 'Médio',
    career: 'Carreiras Policiais',
    exam_type: 'CONCURSO',
    statement: 'No âmbito da computação forense e segurança da informação, a função Hash criptográfica (como SHA-256) utilizada na cadeia de custódia de evidências digitais tem como finalidade primordial garantir o princípio da:',
    options: JSON.stringify([
      { key: 'A', text: 'Confidencialidade, impedindo o acesso não autorizado ao conteúdo dos arquivos.' },
      { key: 'B', text: 'Integridade, assegurando que o arquivo ou dispositivo apreendido não sofreu qualquer alteração desde a coleta.' },
      { key: 'C', text: 'Disponibilidade, garantindo que os dados possam ser acessados ininterruptamente pelos peritos.' },
      { key: 'D', text: 'Anonimato, ocultando a identidade do investigador que realizou a perícia.' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. O valor Hash funciona como uma "impressão digital digital" do arquivo. Qualquer alteração de um único bit modifica radicalmente o hash gerado, assegurando a integridade da evidência pericial.',
    stats_distribution: JSON.stringify({ A: 14, B: 81, C: 3, D: 2 }),
    comments: JSON.stringify([
      { author: 'Prof. Informática', text: 'Hash = Integridade! Não confunda com Criptografia Assimétrica/Simétrica que garante Confidencialidade.' }
    ])
  },

  // --- TRIBUNAIS & MP ---
  {
    discipline: 'Direito Processual Civil',
    subject: 'Tutela Provisória de Urgência e Evidência',
    examining_board: 'VUNESP',
    institute: 'Tribunal de Justiça de São Paulo (TJSP)',
    year: 2024,
    difficulty: 'Médio',
    career: 'Tribunais & MP',
    exam_type: 'CONCURSO',
    statement: 'Nos termos do Código de Processo Civil de 2015, a tutela da evidência será concedida, independentemente da demonstração de perigo de dano ou de risco ao resultado útil do processo (periculum in mora), quando:',
    options: JSON.stringify([
      { key: 'A', text: 'Houver urgência contemporânea à propositura da ação e o direito for plausível.' },
      { key: 'B', text: 'As alegações de fato puderem ser comprovadas apenas documentalmente e houver tese firmada em julgamento de casos repetitivos ou em súmula vinculante.' },
      { key: 'C', text: 'O autor comprovar documentalmente que não possui condições financeiras de arcar com as custas do processo.' },
      { key: 'D', text: 'O réu comparecer à audiência de conciliação e manifestar expressa desistência de contestar o mérito.' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. Art. 311, II, do CPC/2015: "A tutela da evidência será concedida, independentemente da demonstração de perigo de dano ou de risco ao resultado útil do processo, quando: II - as alegações de fato puderem ser comprovadas apenas documentalmente e houver tese firmada em julgamento de casos repetitivos ou em súmula vinculante."',
    stats_distribution: JSON.stringify({ A: 16, B: 72, C: 7, D: 5 }),
    comments: JSON.stringify([
      { author: 'Prof. Processo Civil', text: 'Tutela da evidência dispensa periculum in mora! Exige apenas alto grau de probabilidade do direito (evidência).' }
    ])
  },
  {
    discipline: 'Direito Administrativo',
    subject: 'Poderes Administrativos e Abuso de Poder',
    examining_board: 'FCC',
    institute: 'Tribunal Regional Federal (TRF)',
    year: 2024,
    difficulty: 'Médio',
    career: 'Tribunais & MP',
    exam_type: 'CONCURSO',
    statement: 'Quando um agente público pratica ato que está dentro de sua competência legal, mas com a finalidade diversa daquela prevista explícita ou implicitamente pela lei ou almejada pelo interesse público, configura-se a espécie de abuso de poder denominada:',
    options: JSON.stringify([
      { key: 'A', text: 'Excesso de poder.' },
      { key: 'B', text: 'Desvio de finalidade (ou desvio de poder).' },
      { key: 'C', text: 'Incompetência relativa superveniente.' },
      { key: 'D', text: 'Vício exclusivo na motivação fática.' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. O abuso de poder divide-se em: 1) Excesso de poder (vício de competência - age além dos limites legais); 2) Desvio de poder ou finalidade (agente é competente, mas age com finalidade diversa da lei ou do interesse público).',
    stats_distribution: JSON.stringify({ A: 19, B: 77, C: 2, D: 2 }),
    comments: JSON.stringify([
      { author: 'Prof. Direito Administrativo', text: 'Competência extrapolada = Excesso de poder. Finalidade desvirtuada = Desvio de finalidade.' }
    ])
  },
  {
    discipline: 'Língua Portuguesa',
    subject: 'Crase e Regência Verbal',
    examining_board: 'VUNESP',
    institute: 'TJSP - Escrevente Técnico Judiciário',
    year: 2023,
    difficulty: 'Médio',
    career: 'Tribunais & MP',
    exam_type: 'CONCURSO',
    statement: 'Assinale a alternativa em que o uso do acento indicativo de crase está em total conformidade com a norma-padrão da língua portuguesa:',
    options: JSON.stringify([
      { key: 'A', text: 'O juiz referiu-se à decisões pretéritas tomadas pelo Tribunal de Justiça.' },
      { key: 'B', text: 'O escrevente entregou os autos diretamente à ele após a audiência de instrução.' },
      { key: 'C', text: 'As partes compareceram perante à autoridade judiciária no horário determinado.' },
      { key: 'D', text: 'O magistrado dedicou grande parte do despacho à análise das preliminares arguidas.' }
    ]),
    right_answer: 'D',
    explanation: 'Gabarito D. Quem dedica, dedica algo (grande parte do despacho) "a" alguém ou a alguma coisa (à análise - preposição a + artigo a = crase correta). Em A, "à" no singular antes de plural "decisões" é incorreto; em B, não há crase antes de pronome pessoal masculino "ele"; em C, a preposição "perante" repele a preposição "a".',
    stats_distribution: JSON.stringify({ A: 12, B: 5, C: 8, D: 75 }),
    comments: JSON.stringify([
      { author: 'Prof. Língua Portuguesa', text: 'Dedicar algo "a" + "a" análise = crase perfeitamente aplicada. Questão clássica da VUNESP!' }
    ])
  },

  // --- CARREIRA FISCAL ---
  {
    discipline: 'Direito Tributário',
    subject: 'Suspensão da Exigibilidade do Crédito Tributário',
    examining_board: 'FGV',
    institute: 'Receita Federal do Brasil (RFB)',
    year: 2024,
    difficulty: 'Médio',
    career: 'Carreira Fiscal',
    exam_type: 'CONCURSO',
    statement: 'Segundo o artigo 151 do Código Tributário Nacional (CTN), suspendem a exigibilidade do crédito tributário, EXCETO:',
    options: JSON.stringify([
      { key: 'A', text: 'A moratória.' },
      { key: 'B', text: 'O depósito do seu montante integral.' },
      { key: 'C', text: 'A compensação tributária regular.' },
      { key: 'D', text: 'A concessão de medida liminar em mandado de segurança.' }
    ]),
    right_answer: 'C',
    explanation: 'Gabarito C. A compensação é modalidade de EXTINÇÃO do crédito tributário (art. 156, II, do CTN), e não de suspensão. O mnemônico clássico para suspensão é MODELOPAJU: Moratória, Depósito integral, Reclamações/Recursos administrativos, Liminar em MS, Liminar em outras ações, Parcelamento.',
    stats_distribution: JSON.stringify({ A: 4, B: 7, C: 84, D: 5 }),
    comments: JSON.stringify([
      { author: 'Prof. Direito Tributário', text: 'Compensação EXTingue o crédito (art. 156 CTN). Não confunda com as causas de suspensão do art. 151!' }
    ])
  },
  {
    discipline: 'Auditoria e Contabilidade',
    subject: 'Procedimentos de Auditoria e Testes Substantivos',
    examining_board: 'FGV',
    institute: 'Receita Federal do Brasil (RFB)',
    year: 2023,
    difficulty: 'Difícil',
    career: 'Carreira Fiscal',
    exam_type: 'CONCURSO',
    statement: 'Na auditoria fiscal contábil, a obtenção de evidências diretamente de uma terceira parte independente da entidade auditada (como a confirmação de saldos bancários ou contas a receber de clientes) denomina-se:',
    options: JSON.stringify([
      { key: 'A', text: 'Circularização (ou confirmação externa).' },
      { key: 'B', text: 'Inspeção física direta.' },
      { key: 'C', text: 'Recálculo aritmético simples.' },
      { key: 'D', text: 'Procedimento analítico preditivo.' }
    ]),
    right_answer: 'A',
    explanation: 'Gabarito A. Conforme a NBC TA 505 (Confirmação Externa), a circularização consiste na obtenção de declaração por escrito diretamente de terceiros (bancos, fornecedores, advogados) confirmando dados patrimoniais.',
    stats_distribution: JSON.stringify({ A: 82, B: 8, C: 5, D: 5 }),
    comments: JSON.stringify([
      { author: 'Prof. Auditoria Fiscal', text: 'Confirmação com terceiros externos = Circularização. Procedimento com alto nível de confiabilidade probatória.' }
    ])
  },

  // --- PREVIDENCIÁRIO & INSS ---
  {
    discipline: 'Direito Previdenciário',
    subject: 'Segurados Obrigatórios e Dependentes da Previdência Social',
    examining_board: 'CEBRASPE',
    institute: 'INSS — Instituto Nacional do Seguro Social',
    year: 2024,
    difficulty: 'Médio',
    career: 'Previdenciário & INSS',
    exam_type: 'CONCURSO',
    statement: 'Acerca dos segurados da Previdência Social e seus dependentes previstos na Lei nº 8.213/1991, julgue o item a seguir:\n\nA existência de dependente de qualquer das classes constantes do art. 16 exclui do direito às prestações os dependentes das classes seguintes, sendo a dependência econômica dos filhos menores de 21 anos presumida por lei.',
    options: JSON.stringify([
      { key: 'A', text: 'Certo — Há preferência legal entre as classes e presunção absoluta de dependência econômica na 1ª classe.' },
      { key: 'B', text: 'Errado — Pais e filhos concorrem igualmente na partilha da pensão por morte.' },
      { key: 'C', text: 'Errado — A dependência dos filhos menores de 21 anos deve ser comprovada judicialmente.' },
      { key: 'D', text: 'Errado — O cônjuge compõe a segunda classe de dependentes junto com os irmãos.' }
    ]),
    right_answer: 'A',
    explanation: 'Gabarito A. Art. 16, § 1º e § 4º da Lei 8.213/91: A existência de dependente de uma classe exclui os das classes subsequentes. Os dependentes de 1ª classe (cônjuge, companheiro e filhos menores de 21 anos ou inválidos) têm dependência econômica PRESUMIDA.',
    stats_distribution: JSON.stringify({ A: 85, B: 6, C: 5, D: 4 }),
    comments: JSON.stringify([
      { author: 'Prof. Previdenciário', text: 'Classe 1 exclui Classe 2 (pais) e Classe 3 (irmãos). Dependência econômica da Classe 1 é sempre presumida!' }
    ])
  },
  {
    discipline: 'Direito Previdenciário',
    subject: 'Princípios da Seguridade Social — CF/88',
    examining_board: 'CEBRASPE',
    institute: 'INSS',
    year: 2023,
    difficulty: 'Médio',
    career: 'Previdenciário & INSS',
    exam_type: 'CONCURSO',
    statement: 'O princípio constitucional segundo o qual nenhum benefício ou serviço da seguridade social poderá ser criado, majorado ou estendido sem a correspondente fonte de custeio total é denominado princípio da:',
    options: JSON.stringify([
      { key: 'A', text: 'Universalidade da cobertura e do atendimento.' },
      { key: 'B', text: 'Preexistência do custeio (ou contrapartida).' },
      { key: 'C', text: 'Equidade na forma de participação no custeio.' },
      { key: 'D', text: 'Irredutibilidade do valor dos benefícios.' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. Art. 195, § 5º da CF/88: "Nenhum benefício ou serviço da seguridade social poderá ser criado, majorado ou estendido sem a correspondente fonte de custeio total" — Trata-se da regra da contrapartida ou preexistência de custeio.',
    stats_distribution: JSON.stringify({ A: 7, B: 83, C: 6, D: 4 }),
    comments: JSON.stringify([
      { author: 'Prof. Previdenciário', text: 'Sem fonte de custeio, nada de benefício novo! É o princípio da contrapartida (art. 195, §5º).' }
    ])
  },

  // --- BANCÁRIOS ---
  {
    discipline: 'Conhecimentos Bancários',
    subject: 'Sistema Financeiro Nacional — Órgãos Normativos',
    examining_board: 'CESGRANRIO',
    institute: 'Banco do Brasil / Caixa Econômica',
    year: 2024,
    difficulty: 'Fácil',
    career: 'Bancários & INSS',
    exam_type: 'CONCURSO',
    statement: 'No âmbito do Sistema Financeiro Nacional (SFN), o órgão colegiado de nível normativo máximo, responsável por formular a política da moeda e do crédito e determinar a meta para a inflação, é o:',
    options: JSON.stringify([
      { key: 'A', text: 'Banco Central do Brasil (Bacen).' },
      { key: 'B', text: 'Conselho Monetário Nacional (CMN).' },
      { key: 'C', text: 'Comitê de Política Monetária (Copom).' },
      { key: 'D', text: 'Comissão de Valores Mobiliários (CVM).' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. O Conselho Monetário Nacional (CMN) é o órgão deliberativo supremo do SFN, responsável por fixar diretrizes da política monetária, creditícia e cambial e estabelecer a meta de inflação. O Bacen é órgão executor.',
    stats_distribution: JSON.stringify({ A: 22, B: 71, C: 5, D: 2 }),
    comments: JSON.stringify([
      { author: 'Prof. Conhecimentos Bancários', text: 'CMN = Manda / Normatiza. BACEN = Executa / Fiscaliza. COPOM = Define a taxa Selic Meta.' }
    ])
  },
  {
    discipline: 'Matemática Financeira',
    subject: 'Juros Simples e Compostos',
    examining_board: 'CESGRANRIO',
    institute: 'Caixa Econômica Federal',
    year: 2024,
    difficulty: 'Médio',
    career: 'Bancários & INSS',
    exam_type: 'CONCURSO',
    statement: 'Um cliente aplicou R$ 10.000,00 pelo prazo de 2 anos em uma instituição financeira à taxa de juros compostos de 10% ao ano com capitalização anual. O valor total do montante resgatado ao final do período será de:',
    options: JSON.stringify([
      { key: 'A', text: 'R$ 12.000,00' },
      { key: 'B', text: 'R$ 12.100,00' },
      { key: 'C', text: 'R$ 12.200,00' },
      { key: 'D', text: 'R$ 11.000,00' }
    ]),
    right_answer: 'B',
    explanation: 'Gabarito B. Fórmula de juros compostos: M = C * (1 + i)^t. M = 10000 * (1 + 0,10)^2 = 10000 * 1,21 = R$ 12.100,00.',
    stats_distribution: JSON.stringify({ A: 12, B: 82, C: 4, D: 2 }),
    comments: JSON.stringify([
      { author: 'Prof. Matemática Financeira', text: '10% de 10.000 no ano 1 = 11.000. 10% de 11.000 no ano 2 = 1.100 -> Montante = 12.100.' }
    ])
  }
];

for (const dbPath of dbs) {
  if (!fs.existsSync(dbPath)) {
    console.log('Ignorando banco não existente:', dbPath);
    continue;
  }
  const db = new DatabaseSync(dbPath);
  console.log('Conectado a:', dbPath);

  const insertStmt = db.prepare(`
    INSERT INTO questions (
      discipline, examining_board, institute, year, difficulty,
      statement, options, right_answer, explanation, stats_distribution,
      comments, career, exam_type, subject
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  let added = 0;
  for (const q of newQuestions) {
    const exists = db.prepare('SELECT id FROM questions WHERE statement = ?').get(q.statement);
    if (!exists) {
      insertStmt.run(
        q.discipline, q.examining_board, q.institute, q.year, q.difficulty,
        q.statement, q.options, q.right_answer, q.explanation, q.stats_distribution,
        q.comments, q.career, q.exam_type, q.subject
      );
      added++;
    }
  }

  const total = db.prepare('SELECT count(*) as c FROM questions').get().c;
  console.log(`✅ Adicionadas ${added} novas questões em ${dbPath}. Total atual: ${total}`);
  db.close();
}
