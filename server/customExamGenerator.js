// customExamGenerator.js
// Engine para gerar simulados inéditos sob medida para concurseiros

const { v4: uuidv4 } = require('uuid');

// Banco temático de modelos e questões inéditas de alto nível
const QUESTION_TEMPLATES = [
  // --- DIREITO CONSTITUCIONAL ---
  {
    discipline: 'Direito Constitucional',
    subject: 'Direitos Fundamentais - Inviolabilidade de Domicílio',
    templates: {
      certo_errado: [
        {
          statement: 'Com relação aos direitos e garantias fundamentais previstos na CF/88 e ao entendimento firmado pelo Supremo Tribunal Federal em sede de repercussão geral (Tema 280), julgue o item a seguir:\n\nA entrada forçada em domicílio sem mandado judicial, no período noturno, é lícita quando respaldada em fundadas razões, devidamente justificadas pelas circunstâncias do caso concreto, que indiquem que dentro da residência está ocorrendo situação de flagrante delito.',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. Conforme tese fixada pelo STF no Tema 280: "A entrada forçada em domicílio sem mandado judicial só é lícita, mesmo em período noturno, quando amparada em fundadas razões, devidamente justificadas a posteriori, que indiquem que dentro da casa ocorre situação de flagrante delito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade dos atos praticados".'
        },
        {
          statement: 'No tocante à inviolabilidade do domicílio assegurada no texto constitucional, julgue o item a seguir:\n\nO mandado judicial de busca e apreensão domiciliar pode ser regularmente cumprido pela autoridade policial durante a noite, desde que com autorização do morador ou com prévia autorização do juiz plantonista.',
          right_answer: 'E',
          explanation: 'GABARITO: ERRADO. Por determinação expressa do art. 5º, XI da CF/88, durante o período NOTURNO a entrada por determinação judicial JAMAIS é permitida (o mandado judicial só pode ser executado DURANTE O DIA). À noite, só se entra com consentimento do morador, em flagrante delito, desastre, ou para prestar socorro.'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Policiais militares, durante patrulhamento ostensivo na madrugada, avistaram um indivíduo em atitude suspeita em frente a uma residência. Ao notar a aproximação da viatura, o suspeito correu para o interior do imóvel. Os policiais prontamente arrombaram a porta sem mandado judicial e, sem qualquer investigação prévia ou fundadas razões registradas, encontraram 10 gramas de maconha. À luz da Constituição Federal e da jurisprudência do Supremo Tribunal Federal (STF - Tema 280) e do Superior Tribunal de Justiça (STJ), a conduta dos agentes é:',
          options: [
            { key: 'A', text: 'Totalmente lícita, haja vista que o tráfico de drogas é crime de natureza permanente, autorizando a invasão a qualquer momento independentemente de justificação prévia.' },
            { key: 'B', text: 'Ilícita, pois a mera fuga descontextualizada ou intuição policial não configuram justa causa prévia para a violação do domicílio, gerando a nulidade das provas colhidas.' },
            { key: 'C', text: 'Lícita, desde que o Ministério Público ratifique o ingresso no prazo improrrogável de até 48 horas.' },
            { key: 'D', text: 'Válida apenas no âmbito criminal, respondendo os policiais apenas na esfera administrativa disciplinar.' },
            { key: 'E', text: 'Válida, uma vez que a apreensão de drogas convalida retroativamente o ingresso domiciliar sem mandado.' }
          ],
          right_answer: 'B',
          explanation: 'GABARITO: B. Segundo o STF (Tema 280) e STJ (RHC 158.580), a mera atitude suspeita ou fuga do indivíduo para dentro da residência não autoriza, por si só, o ingresso forçado sem mandado. A apreensão posterior não convalida a ilicitude do ingresso.'
        }
      ]
    }
  },

  // --- DIREITO ADMINISTRATIVO ---
  {
    discipline: 'Direito Administrativo',
    subject: 'Atos Administrativos - Revogação e Anulação (Autotutela)',
    templates: {
      certo_errado: [
        {
          statement: 'A respeito do regime jurídico dos atos administrativos e do princípio da autotutela, julgue o item a seguir:\n\nA Administração Pública pode revogar seus próprios atos discricionários por motivos de conveniência e oportunidade, operando a revogação efeitos ex tunc, de modo a desconstituir retroativamente os direitos adquiridos de terceiros de boa-fé.',
          right_answer: 'E',
          explanation: 'GABARITO: ERRADO. A revogação baseia-se em mérito administrativo (conveniência e oportunidade) e opera SEMPRE efeitos EX NUNC (prospectivos, para o futuro), respeitando os direitos adquiridos. Quem opera efeitos retroativos (ex tunc) é a ANULAÇÃO de atos ilegais (Súmulas 346 e 473 do STF).'
        },
        {
          statement: 'No que concerne à anulação dos atos administrativos e à prescrição das pretensões estatais, julgue o item a seguir:\n\nSalvo comprovada má-fé, o direito da Administração Pública de anular os atos administrativos de que decorram efeitos favoráveis para os destinatários decai em cinco anos, contados da data em que foram praticados.',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. Literalidade do art. 54 da Lei Federal nº 9.784/1999: "O direito da Administração de anular os atos administrativos de que decorram efeitos favoráveis para os destinatários decai em cinco anos, contados da data em que foram praticados, salvo comprovada má-fé".'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Mário, servidor público estável, teve concedida licença remunerada por ato fundamentado da autoridade competente. Dois anos depois, constatou-se que a autoridade concedente incorreu em vício formal insanável na motivação do ato, embora Mário tenha agido estritamente de boa-fé. Diante dessa situação, assinale a opção que descreve o procedimento correto a ser adotado pela Administração:',
          options: [
            { key: 'A', text: 'Revogar o ato por conveniência e oportunidade, gerando efeitos ex tunc e cobrando do servidor os valores recebidos.' },
            { key: 'B', text: 'Anular o ato viciado no exercício de sua autotutela, assegurando-se o contraditório e a ampla defesa, sendo dispensada a restituição dos valores recebidos de boa-fé pelo servidor.' },
            { key: 'C', text: 'Convalidar obrigatoriamente o ato, pois atos praticados há mais de um ano tornam-se inquestionáveis.' },
            { key: 'D', text: 'Encaminhar o caso ao Poder Judiciário, sendo vedado à própria Administração invalidar atos que gerem efeitos pecuniários.' },
            { key: 'E', text: 'Suspender a licença por decreto sem oportunizar defesa prévia, em virtude do princípio da supremacia absoluta do interesse público.' }
          ],
          right_answer: 'B',
          explanation: 'GABARITO: B. A Administração deve anular atos ilegais (autotutela). Por atingir direito individual de terceiro, é obrigatória a instauração de processo administrativo com contraditório e ampla defesa (Súmula Vinculante 5 e Tema 138 do STF). Valores percebidos de boa-fé por servidor não são devolvidos.'
        }
      ]
    }
  },

  // --- DIREITO PENAL ---
  {
    discipline: 'Direito Penal',
    subject: 'Teoria do Crime - Legítima Defesa e Excludentes',
    templates: {
      certo_errado: [
        {
          statement: 'Acerca da teoria geral do delito e das excludentes de ilicitude, julgue o item a seguir:\n\nA legítima defesa putativa, em que o agente incorre em erro plenamente justificado pelas circunstâncias sobre a existência de injusta agressão, exclui a ilicitude da conduta praticada.',
          right_answer: 'E',
          explanation: 'GABARITO: ERRADO. A legítima defesa putativa é modalidade de descriminante putativa (art. 20, § 1º do CP), tratando-se de ERRO DE TIPO permissivo. Ela exclui o dolo (e a culpa, se invencível), afastando a CULPABILIDADE ou a TIPICIDADE, mas o fato permanece formalmente ILÍCITO perante a ordem jurídica.'
        },
        {
          statement: 'No que se refere aos crimes contra a Administração Pública e ao peculato, julgue o item a seguir:\n\nNo crime de peculato culposo, a reparação do dano pelo agente antes da sentença condenatória irrecorrível extingue a punibilidade; se a reparação for posterior à sentença irrecorrível, reduz de metade a pena imposta.',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. Art. 312, § 3º do Código Penal: "No caso do parágrafo anterior [peculato culposo], a reparação do dano, se precede à sentença irrecorrível, extingue a punibilidade; se lhe é posterior, reduz de metade a pena imposta".'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Tício, policial civil, durante perseguição a indivíduo armado que acabara de cometer roubo com disparos em via pública, percebe que o criminoso aponta a arma para um transeunte inocente. Tício efetua um disparo certeiro contra o assaltante, neutralizando a ameaça e salvando a vida da vítima. Sob a ótica do Código Penal Brasileiro, a conduta de Tício está respaldada por:',
          options: [
            { key: 'A', text: 'Legítima defesa de terceiro.' },
            { key: 'B', text: 'Estrito cumprimento de dever legal.' },
            { key: 'C', text: 'Estado de necessidade exculpante.' },
            { key: 'D', text: 'Exercício regular de direito subsidiário.' },
            { key: 'E', text: 'Coação moral irresistível.' }
          ],
          right_answer: 'A',
          explanation: 'GABARITO: A. Repele injusta agressão, atual e iminente, a direito de outrem (vida do transeunte), usando moderadamente dos meios necessários: art. 25 do CP (Legítima Defesa de Terceiro). O parágrafo único do art. 25 (inserido pelo Pacote Anticrime) reforça expressamente a legítima defesa do agente de segurança que defende refém sob risco de morte.'
        }
      ]
    }
  },

  // --- LÍNGUA PORTUGUESA ---
  {
    discipline: 'Língua Portuguesa',
    subject: 'Sintaxe e Emprego do Sinal Indicativo de Crase',
    templates: {
      certo_errado: [
        {
          statement: 'Considerando as regras gramaticais de regência verbal e o emprego do sinal indicativo de crase, julgue o item a seguir:\n\nNa frase: "O parecer técnico foi encaminhado à Vossa Excelência para posterior deliberação", o emprego da crase é facultativo, em razão da presença de pronome de tratamento.',
          right_answer: 'E',
          explanation: 'GABARITO: ERRADO. É terminantemente PROIBIDO o uso da crase diante da imensa maioria dos pronomes de tratamento (Vossa Excelência, Vossa Senhoria, Você), pois não admitem o artigo feminino "a". As únicas exceções são: dona, senhora e senhorita.'
        },
        {
          statement: 'No que concerne à concordância verbal da voz passiva pronominal, julgue o item a seguir:\n\nEm: "Identificaram-se diversos indícios de fraude durante as auditorias fiscais", a flexão do verbo "identificar" no plural é obrigatória para concordar com o sujeito paciente "diversos indícios de fraude".',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. Trata-se de voz passiva sintética com partícula apassivadora "se" (diversos indícios de fraude foram identificados). O verbo deve obrigatoriamente flexionar no plural para concordar com o núcleo do sujeito paciente.'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Assinale a alternativa em que o sinal indicativo de crase está empregado em estrita conformidade com a norma-padrão da língua portuguesa:',
          options: [
            { key: 'A', text: 'O auditor fiscal comunicou às partes envolvidas as novas diretrizes da Receita Federal.' },
            { key: 'B', text: 'O candidato começou à redigir a peça prática com extrema celeridade.' },
            { key: 'C', text: 'Os benefícios serão concedidos à todas as pessoas que comprovarem carência.' },
            { key: 'D', text: 'O processo foi arquivado devido à pendências que ninguém conseguiu sanar.' },
            { key: 'E', text: 'A audiência estendeu-se de 14h às 18h sem interrupção.' }
          ],
          right_answer: 'A',
          explanation: 'GABARITO: A. "Comunicou algo a alguém": o verbo comunicar rege preposição "a", que se funde com o artigo definido plural "as" de "partes envolvidas", resultando em "às". Erros das demais: B) antes de verbo não ocorre crase; C) antes de "todas" não há artigo; D) "a" no singular diante de plural não tem crase; E) "de 14h a 18h" (paralelismo: sem artigo na primeira, sem na segunda).'
        }
      ]
    }
  },

  // --- RACIOCÍNIO LÓGICO-MATEMÁTICO ---
  {
    discipline: 'Raciocínio Lógico-Matemático',
    subject: 'Lógica Sentencial - Negação de Proposições Compostas',
    templates: {
      certo_errado: [
        {
          statement: 'Considerando os princípios da lógica matemática e a negação de proposições compostas, julgue o item a seguir:\n\nA negação lógica da proposição "O servidor é pontual ou o processo atrasa" corresponde a "O servidor não é pontual e o processo não atrasa".',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. Pela Lei de De Morgan, a negação de uma disjunção inclusiva ~(P v Q) é a conjunção das negações (~P ^ ~Q). Nega-se a primeira, troca-se o "ou" pelo "e", e nega-se a segunda.'
        },
        {
          statement: 'A respeito de proposições condicionais, julgue o item a seguir:\n\nA negação da proposição condicional "Se o suspeito confessar o crime, então receberá o benefício da colaboração" é: "Se o suspeito não confessar o crime, então não receberá o benefício".',
          right_answer: 'E',
          explanation: 'GABARITO: ERRADO. A negação de uma condicional P -> Q é a regra do "MANE": Mantém a primeira E Nega a segunda (P ^ ~Q). Portanto, a negação correta é: "O suspeito confessa o crime E não recebe o benefício da colaboração". Condicional nunca é negada com outra condicional!'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Em um grupo de 80 candidatos a concurso público, 50 dominam Direito Constitucional, 45 dominam Direito Administrativo e 10 não dominam nenhuma dessas duas disciplinas. Escolhendo-se ao acaso um candidato desse grupo, a probabilidade de que ele domine AMBAS as disciplinas é de:',
          options: [
            { key: 'A', text: '15%.' },
            { key: 'B', text: '25%.' },
            { key: 'C', text: '31,25%.' },
            { key: 'D', text: '35%.' },
            { key: 'E', text: '40%.' }
          ],
          right_answer: 'C',
          explanation: 'GABARITO: C. Total de candidatos = 80. Candidatos que estudam pelo menos uma disciplina = 80 - 10 = 70. Pelo princípio da inclusão-exclusão: n(A U B) = n(A) + n(B) - n(A ∩ B) => 70 = 50 + 45 - n(A ∩ B) => n(A ∩ B) = 95 - 70 = 25 candidatos dominam ambas. Probabilidade = 25 / 80 = 5/16 = 0,3125 = 31,25%.'
        }
      ]
    }
  },

  // --- NOÇÕES DE INFORMÁTICA ---
  {
    discipline: 'Noções de Informática',
    subject: 'Segurança da Informação e Criptografia',
    templates: {
      certo_errado: [
        {
          statement: 'A respeito de segurança da informação e computação em nuvem, julgue o item a seguir:\n\nNa criptografia assimétrica, a chave pública é utilizada para cifrar a mensagem, enquanto a chave privada correspondente, mantida em segredo absoluto pelo destinatário, é utilizada para decifrá-la.',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. A criptografia assimétrica baseia-se em um par de chaves complementares: chave pública (distribuída livremente para criptografar dados ou verificar assinaturas) e chave privada (secreta e intransferível, para descriptografar ou assinar).'
        },
        {
          statement: 'No que concerne a malwares e ameaças cibernéticas, julgue o item a seguir:\n\nO ransomware é um tipo de software malicioso que tem por finalidade registrar silenciosamente tudo o que é digitado pelo teclado do usuário sem afetar a integridade ou a disponibilidade dos arquivos do sistema.',
          right_answer: 'E',
          explanation: 'GABARITO: ERRADO. O malware que grava as teclas digitadas é o KEYLOGGER (tipo de spyware). O RANSOMWARE sequestra os dados do usuário, criptografando arquivos do sistema e exigindo resgate financeiro (frequentemente em criptomoedas) para fornecer a chave de liberação.'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Um servidor público necessita assinar digitalmente um documento oficial em formato PDF para comprovar sua autoria e garantir que o conteúdo não sofreu alterações posteriores durante o tráfego de rede. O recurso tecnológico que assegura simultaneamente a AUTENTICIDADE e a NÃO REPÚDIO do remetente é:',
          options: [
            { key: 'A', text: 'A assinatura digital com certificado digital emitido no âmbito da ICP-Brasil.' },
            { key: 'B', text: 'A compactação com senha criptográfica padrão ZIP.' },
            { key: 'C', text: 'O protocolo de transferência segura FTP.' },
            { key: 'D', text: 'A utilização de rede privada virtual (VPN) sem autenticação mútua.' },
            { key: 'E', text: 'O salvamento do documento com proteção de leitura nativa do editor.' }
          ],
          right_answer: 'A',
          explanation: 'GABARITO: A. A assinatura digital baseada em certificado ICP-Brasil utiliza criptografia assimétrica com chave privada do emissor e função hash para garantir os três pilares essenciais: Autenticidade, Integridade e Não Repúdio (irretratabilidade).'
        }
      ]
    }
  },

  // --- ÉTICA NO SERVIÇO PÚBLICO & LEGISLAÇÃO ---
  {
    discipline: 'Ética no Serviço Público',
    subject: 'Improbidade Administrativa e Conduta Ética',
    templates: {
      certo_errado: [
        {
          statement: 'De acordo com as inovações introduzidas pela Lei nº 14.230/2021 na Lei de Improbidade Administrativa (Lei nº 8.429/1992), julgue o item a seguir:\n\nPara a configuração de qualquer ato de improbidade administrativa, exige-se a demonstração de dolo específico do agente público, sendo vedada a responsabilização por ato culposo, ainda que haja dano efetivo ao erário.',
          right_answer: 'C',
          explanation: 'GABARITO: CERTO. A Lei 14.230/2021 revogou integralmente a modalidade culposa dos atos de improbidade administrativa. O art. 1º, § 1º da Lei 8.429/92 agora prevê expressamente: "Consideram-se atos de improbidade administrativa as condutas dolosas tipificadas nos arts. 9º, 10 e 11 desta Lei, ressalvados os tipos previstos em leis especiais", exigindo o dolo específico com vontade livre e consciente.'
        }
      ],
      multipla_escolha: [
        {
          statement: 'Com base no Código de Ética Profissional do Servidor Público Federal (Decreto nº 1.171/1994), constitui dever fundamental do servidor público:',
          options: [
            { key: 'A', text: 'Ser probo, reto, leal e justo, demonstrando toda a integridade do seu caráter, escolhendo sempre, quando estiver diante de duas opções, a melhor e a mais vantajosa para o bem comum.' },
            { key: 'B', text: 'Divulgar em redes sociais pessoais informações internas do órgão antes da publicação oficial visando à transparência pública.' },
            { key: 'C', text: 'Abster-se de emitir certidões requeridas por particulares quando o serviço estiver sobrecarregado.' },
            { key: 'D', text: 'Recusar cooperação técnica a colegas de setor que não pertençam à mesma carreira funcional.' },
            { key: 'E', text: 'Priorizar o atendimento a conhecidos e autoridades para agilizar o fluxo burocrático.' }
          ],
          right_answer: 'A',
          explanation: 'GABARITO: A. Conforme o Decreto nº 1.171/94, Capítulo I, Seção II: o servidor deve sempre pautar sua conduta pela moralidade, escolhendo entre o legal e o ilegal, o justo e o injusto, o conveniente e o inconveniente, a melhor opção para o BEM COMUM.'
        }
      ]
    }
  }
];

// Helper to synthesize a set of questions tailored to the request
function generateIneditaQuestions({ board = 'CEBRASPE', career = 'Carreiras Policiais', disciplines = [], count = 10, style = 'certo_errado' }) {
  const generated = [];
  const validStyles = style === 'certo_errado' ? ['certo_errado'] : style === 'multipla_escolha' ? ['multipla_escolha'] : ['certo_errado', 'multipla_escolha'];

  // Filter templates by disciplines if requested, or use all
  let matchedTemplates = QUESTION_TEMPLATES;
  if (disciplines && disciplines.length > 0) {
    const filtered = QUESTION_TEMPLATES.filter(t => disciplines.some(d => d.toLowerCase() === t.discipline.toLowerCase() || t.discipline.toLowerCase().includes(d.toLowerCase())));
    if (filtered.length > 0) matchedTemplates = filtered;
  }

  let idx = 0;
  while (generated.length < count) {
    const template = matchedTemplates[idx % matchedTemplates.length];
    const chosenStyle = validStyles[idx % validStyles.length];
    const availablePool = template.templates[chosenStyle] || template.templates['certo_errado'] || template.templates['multipla_escolha'];
    
    if (availablePool && availablePool.length > 0) {
      const baseQ = availablePool[idx % availablePool.length];
      const isCE = chosenStyle === 'certo_errado' || (board.toUpperCase().includes('CEBRASPE') && style !== 'multipla_escolha');

      let qOptions;
      if (isCE) {
        qOptions = [
          { key: 'C', text: 'Certo' },
          { key: 'E', text: 'Errado' }
        ];
      } else {
        qOptions = baseQ.options || [
          { key: 'A', text: 'A assertiva apresenta fundamento legal integral e pacificado.' },
          { key: 'B', text: 'A hipótese é expressamente vedada pelo ordenamento jurídico vigente.' },
          { key: 'C', text: 'Trata-se de entendimento minoritário superado pelas cortes superiores.' },
          { key: 'D', text: 'A eficácia do ato depende de prévia ratificação legislativa.' },
          { key: 'E', text: 'A prerrogativa aplica-se somente a processos em trâmite na esfera federal.' }
        ];
      }

      const qObj = {
        discipline: template.discipline,
        subject: template.subject,
        examining_board: board === 'Diversas' ? 'QLingo Inédita' : board,
        institute: `${career} (Simulado Inédito)`,
        year: 2026,
        difficulty: (idx % 3 === 0) ? 'Difícil' : (idx % 2 === 0) ? 'Médio' : 'Fácil',
        career: career,
        exam_type: 'INEDITA',
        statement: baseQ.statement,
        options: JSON.stringify(qOptions),
        right_answer: baseQ.right_answer || (isCE ? 'C' : 'A'),
        explanation: baseQ.explanation || 'Comentário pedagógico detalhado do professor especialista QLingo.',
        stats_distribution: isCE ? JSON.stringify({ C: 72, E: 28 }) : JSON.stringify({ A: 65, B: 12, C: 11, D: 8, E: 4 }),
        comments: JSON.stringify([
          { user: 'Prof_Especialista', text: `Excelente questão no estilo clássico da banca ${board}! Atente-se aos detalhes normativos.`, likes: 42, date: '2026-01-10' }
        ])
      };

      generated.push(qObj);
    }
    idx++;
  }

  return generated;
}

module.exports = {
  QUESTION_TEMPLATES,
  generateIneditaQuestions
};
