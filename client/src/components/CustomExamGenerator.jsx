import React, { useState } from 'react';
import { 
  Sparkles, Award, Clock, CheckSquare, Layers, BookOpen, 
  HelpCircle, ArrowRight, RefreshCw, Zap, ShieldAlert, 
  CheckCircle2, Info, ChevronRight, Filter
} from 'lucide-react';
import { generateCustomPracticeExam } from '../services/api';

const BANCAS_INFO = [
  {
    id: 'CEBRASPE',
    name: 'CEBRASPE (CESPE)',
    badge: 'Certo / Errado • Anulação',
    color: 'from-purple-600 to-indigo-700',
    borderColor: 'border-purple-500/40',
    bgActive: 'bg-purple-950/40 border-purple-500',
    description: 'Padrão clássico: 1 questão errada anula 1 certa. Questões conceituais, pegadinhas doutrinárias e enunciados multidisciplinares.',
    concursos: 'PF, PRF, INSS, TCU, DPU, ABIN, Tribunais de Contas',
    defaultStyle: 'certo_errado'
  },
  {
    id: 'FGV',
    name: 'FGV (Fundação Getulio Vargas)',
    badge: 'Casos Práticos • Textos Longos',
    color: 'from-blue-600 to-cyan-700',
    borderColor: 'border-blue-500/40',
    bgActive: 'bg-blue-950/40 border-blue-500',
    description: 'Enunciados longos com histórias hipotéticas do cotidiano administrativo, interpretação profunda de texto e jurisprudência consolidada.',
    concursos: 'OAB (Exame de Ordem), Receita Federal, Senado, TJ-RJ, SEFAZ-MG',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'FCC',
    name: 'FCC (Fundação Carlos Chagas)',
    badge: 'Letra da Lei • Súmulas',
    color: 'from-emerald-600 to-teal-700',
    borderColor: 'border-emerald-500/40',
    bgActive: 'bg-emerald-950/40 border-emerald-500',
    description: 'Forte apego à literalidade dos dispositivos de lei (lei seca) e súmulas do STF/STJ. Questões técnicas, diretas e com poucas divergências.',
    concursos: 'TRT (Tribunais do Trabalho), TRF, TRE, SEFAZ, Defensorias',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'VUNESP',
    name: 'VUNESP',
    badge: 'Literalidade • Gramática',
    color: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-500/40',
    bgActive: 'bg-amber-950/40 border-amber-500',
    description: 'Literalidade estrita das leis, enunciados objetivos de 5 alternativas e gramática normativa tradicional (crase, regência, concordância).',
    concursos: 'TJ-SP, Polícia Civil de SP (PC-SP), PM-SP, Prefeituras Paulistas',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'Cesgranrio',
    name: 'Cesgranrio',
    badge: 'Bancos • CNU • Raciocínio',
    color: 'from-yellow-600 to-amber-700',
    borderColor: 'border-yellow-500/40',
    bgActive: 'bg-yellow-950/40 border-yellow-500',
    description: 'Organizadora oficial do Concurso Nacional Unificado (CNU). Textos contextualizados, atendimento bancário, finanças e políticas públicas.',
    concursos: 'CNU (Concurso Nacional Unificado), Banco do Brasil, Caixa, Petrobras',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'Instituto AOCP',
    name: 'Instituto AOCP',
    badge: 'Policial • Prazos & Artigos',
    color: 'from-rose-600 to-red-700',
    borderColor: 'border-rose-500/40',
    bgActive: 'bg-rose-950/40 border-rose-500',
    description: 'Foco constante em segurança pública estadual, prazos processuais e dispositivos penais expressos.',
    concursos: 'PM-PR, PC-PA, PM-GO, ITEP-RN, Universidades Federais',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'IBFC',
    name: 'IBFC',
    badge: 'Conceitual • Segurança Pública',
    color: 'from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-500/40',
    bgActive: 'bg-cyan-950/40 border-cyan-500',
    description: 'Questões diretas cobrando definições legais básicas a intermediárias e redação formal de artigos.',
    concursos: 'PM-BA, PC-BA, Tribunais de Justiça estaduais, DETRANs',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'Quadrix',
    name: 'Quadrix',
    badge: 'Conselhos Federais • Ética Pública',
    color: 'from-teal-600 to-emerald-700',
    borderColor: 'border-teal-500/40',
    bgActive: 'bg-teal-950/40 border-teal-500',
    description: 'Especialista em conselhos profissionais e secretarias de educação. Utiliza modelo Certo/Errado com ênfase no Decreto nº 1.171/94 (Código de Ética).',
    concursos: 'Conselhos Federais e Regionais (CFP, CRM, CRA, CRO, CREA)',
    defaultStyle: 'certo_errado'
  },
  {
    id: 'ESAF',
    name: 'ESAF (Histórica)',
    badge: 'Carreira Fiscal • Alta Dificuldade',
    color: 'from-emerald-700 to-green-800',
    borderColor: 'border-emerald-600/40',
    bgActive: 'bg-emerald-950/40 border-emerald-600',
    description: 'Histórica organizadora de elite da Receita Federal. Complexidade máxima em Contabilidade Geral/Avançada e Direito Tributário.',
    concursos: 'Receita Federal do Brasil (Auditor Fiscal e Analista)',
    defaultStyle: 'multipla_escolha'
  },
  {
    id: 'Diversas',
    name: 'Mix de Bancas / Geral',
    badge: 'Multidisciplinar Equilibrado',
    color: 'from-slate-600 to-slate-700',
    borderColor: 'border-slate-500/40',
    bgActive: 'bg-slate-900 border-slate-500',
    description: 'Combina as melhores questões de concurseiros para treinar adaptabilidade e amplitude de conteúdo.',
    concursos: 'Ideal para quem está no ciclo básico e quer versatilidade',
    defaultStyle: 'multipla_escolha'
  }
];

const CAREER_OPTIONS = [
  { id: 'Carreiras Policiais', label: '🚓 Carreiras Policiais (PF, PRF, PC, PM)', defaultDisciplines: ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Direito Processual Penal', 'Noções de Informática'] },
  { id: 'Tribunais & MP', label: '⚖️ Tribunais & Ministério Público (TJ, TRT, TRF, TRE)', defaultDisciplines: ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Direito Processual Civil', 'Raciocínio Lógico-Matemático'] },
  { id: 'Carreira Fiscal', label: '💰 Carreira Fiscal (Receita Federal, SEFAZ, ISS)', defaultDisciplines: ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Direito Tributário', 'Contabilidade Geral', 'Raciocínio Lógico-Matemático'] },
  { id: 'Bancários & INSS', label: '🏦 Bancários & Previdenciário (BB, Caixa, INSS)', defaultDisciplines: ['Língua Portuguesa', 'Direito Administrativo', 'Direito Previdenciário', 'Raciocínio Lógico-Matemático', 'Noções de Informática', 'Ética no Serviço Público'] },
  { id: 'Exame de Ordem (OAB)', label: '🎓 Exame de Ordem (OAB 1ª Fase)', defaultDisciplines: ['Ética e Estatuto da OAB', 'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Direito Civil'] },
  { id: 'Geral', label: '🏛️ Conhecimentos Gerais de Concursos Públicos', defaultDisciplines: ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Raciocínio Lógico-Matemático', 'Ética no Serviço Público'] }
];

const ALL_DISCIPLINES = [
  'Língua Portuguesa',
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Penal',
  'Direito Processual Penal',
  'Raciocínio Lógico-Matemático',
  'Noções de Informática',
  'Ética no Serviço Público',
  'Legislação Especial',
  'Contabilidade Geral',
  'Direito Tributário',
  'Direito Previdenciário',
  'Ética e Estatuto da OAB'
];

export default function CustomExamGenerator({ onStartGeneratedTest, theme = 'dark' }) {
  const isDark = theme === 'dark';

  // State
  const [selectedBoard, setSelectedBoard] = useState('CEBRASPE');
  const [selectedCareer, setSelectedCareer] = useState('Carreiras Policiais');
  const [selectedDisciplines, setSelectedDisciplines] = useState([
    'Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Direito Processual Penal'
  ]);
  const [questionCount, setQuestionCount] = useState(20);
  const [questionStyle, setQuestionStyle] = useState('certo_errado');
  const [timeMode, setTimeMode] = useState('timed');
  const [customTitle, setCustomTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Handle board change: auto-suggest style
  const handleBoardChange = (boardId) => {
    setSelectedBoard(boardId);
    const boardObj = BANCAS_INFO.find(b => b.id === boardId);
    if (boardObj) {
      setQuestionStyle(boardObj.defaultStyle);
    }
  };

  // Handle career change: auto-select recommended disciplines
  const handleCareerChange = (careerId) => {
    setSelectedCareer(careerId);
    const carObj = CAREER_OPTIONS.find(c => c.id === careerId);
    if (carObj && carObj.defaultDisciplines) {
      setSelectedDisciplines(carObj.defaultDisciplines);
    }
  };

  const toggleDiscipline = (disc) => {
    if (selectedDisciplines.includes(disc)) {
      if (selectedDisciplines.length === 1) {
        alert('Selecione pelo menos uma disciplina para o simulado.');
        return;
      }
      setSelectedDisciplines(selectedDisciplines.filter(d => d !== disc));
    } else {
      setSelectedDisciplines([...selectedDisciplines, disc]);
    }
  };

  const handleSelectAllDisciplines = () => {
    setSelectedDisciplines(ALL_DISCIPLINES);
  };

  const handleSelectBasicDisciplines = () => {
    setSelectedDisciplines(['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Raciocínio Lógico-Matemático']);
  };

  const handleGenerate = async () => {
    if (selectedDisciplines.length === 0) {
      alert('Por favor, selecione pelo menos uma disciplina.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationStep('Analisando perfil pedagógico da banca e selecionando competências...');
      await new Promise(r => setTimeout(r, 600));

      setGenerationStep('Sintetizando assertivas inéditas e justificativas com base na jurisprudência...');
      const res = await generateCustomPracticeExam({
        title: customTitle.trim() || undefined,
        board: selectedBoard,
        career: selectedCareer,
        disciplines: selectedDisciplines,
        count: questionCount,
        style: questionStyle,
        time_mode: timeMode
      });

      setGenerationStep('Finalizando montagem do caderno de prova...');
      await new Promise(r => setTimeout(r, 500));

      if (res.test && res.questions) {
        if (onStartGeneratedTest) {
          onStartGeneratedTest(res.test, res.questions);
        } else {
          alert(`Simulado "${res.test.title}" criado com sucesso! Abrindo simulado...`);
        }
      } else {
        alert('Erro ao gerar o simulado. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao gerar simulado inédito:', err);
      alert('Ocorreu um erro ao gerar o simulado. Verifique os critérios e tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentBoardObj = BANCAS_INFO.find(b => b.id === selectedBoard) || BANCAS_INFO[0];

  return (
    <div className={`space-y-8 animate-fadeIn pb-20 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Banner de Apresentação */}
      <div className={`relative rounded-3xl overflow-hidden p-8 border transition-all ${
        isDark 
          ? 'bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-950 border-orange-500/30 shadow-2xl shadow-orange-950/20' 
          : 'bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-200 shadow-md'
      }`}>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} /> 
            Gerador de Simulados Inéditos para Concurseiros
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Crie Simulados Sob Medida no Estilo da Sua Banca
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Chega de resolver apenas provas antigas que você já decorou o gabarito. Escolha a <b>banca examinadora</b>, sua <b>carreira alvo</b> e as <b>disciplinas que deseja treinar</b>. Nosso motor gera um caderno de questões 100% inéditas com fundamentação oficial, pegadinhas autênticas e cronômetro de prova.
          </p>
        </div>
      </div>

      {/* PAINEL DE CONFIGURAÇÃO */}
      <div className="space-y-8">
        
        {/* PASSO 1: ESCOLHA DA BANCA EXAMINADORA */}
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4 border-slate-700/60">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-500">Passo 1</span>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🏛️ Escolha a Banca Examinadora
              </h2>
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Cada banca possui pegadinhas, estilo de texto e critérios de correção distintos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BANCAS_INFO.map((banca) => {
              const isSelected = selectedBoard === banca.id;
              return (
                <button
                  key={banca.id}
                  type="button"
                  onClick={() => handleBoardChange(banca.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? `${banca.bgActive} ring-2 ring-orange-500 shadow-lg`
                      : isDark
                        ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                        {banca.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                      )}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {banca.badge}
                    </span>
                    <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {banca.description}
                    </p>
                  </div>
                  <div className={`text-[11px] pt-2 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <b>Concursos:</b> {banca.concursos}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Banner explicativo da banca selecionada */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
            isDark ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}>
            <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <b>Você selecionou {currentBoardObj.name}:</b> O gerador priorizará enunciados com as peculiaridades desta banca ({currentBoardObj.badge}).
            </div>
          </div>
        </div>

        {/* PASSO 2: CARREIRA E ÁREA ALVO */}
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4 border-slate-700/60">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-500">Passo 2</span>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🎯 Escolha a Carreira ou Foco do Estudo
              </h2>
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Define o contexto dos enunciados e a grade curricular sugerida
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAREER_OPTIONS.map((career) => {
              const isSelected = selectedCareer === career.id;
              return (
                <button
                  key={career.id}
                  type="button"
                  onClick={() => handleCareerChange(career.id)}
                  className={`text-left p-4 rounded-2xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500 text-orange-400 shadow-md ring-1 ring-orange-500'
                      : isDark
                        ? 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span>{career.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* PASSO 3: DISCIPLINAS DO SIMULADO */}
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-5 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-slate-700/60">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-500">Passo 3</span>
              <h2 className="text-xl font-bold flex items-center gap-2">
                📚 Selecione as Disciplinas ({selectedDisciplines.length} selecionadas)
              </h2>
            </div>
            {/* Quick shortcuts */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectBasicDisciplines}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Básicas (4)
              </button>
              <button
                type="button"
                onClick={handleSelectAllDisciplines}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Selecionar Todas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {ALL_DISCIPLINES.map((disc) => {
              const isChecked = selectedDisciplines.includes(disc);
              return (
                <button
                  key={disc}
                  type="button"
                  onClick={() => toggleDiscipline(disc)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isChecked
                      ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold shadow-xs'
                      : isDark
                        ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span className="line-clamp-1">{disc}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] font-black ${
                    isChecked ? 'bg-orange-500 text-white' : 'border border-slate-600'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASSO 4: QUANTIDADE, FORMATO E TEMPO */}
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="border-b pb-4 border-slate-700/60">
            <span className="text-xs font-black uppercase tracking-wider text-orange-500">Passo 4</span>
            <h2 className="text-xl font-bold flex items-center gap-2">
              ⚙️ Formato, Quantidade e Modo de Prova
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quantidade de Questões */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Quantidade de Questões:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { count: 10, label: '10 Q', time: '~15-25 min' },
                  { count: 20, label: '20 Q', time: '~30-50 min' },
                  { count: 30, label: '30 Q', time: '~1h15' },
                  { count: 60, label: '60 Q', time: '~2h30' },
                  { count: 100, label: '100 Q', time: '~4h' }
                ].map(item => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setQuestionCount(item.count)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      questionCount === item.count
                        ? 'bg-orange-500 text-white font-black border-orange-500 shadow-md'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-black">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo das Questões */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Estilo das Assertivas:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'certo_errado', label: 'Certo ou Errado', desc: 'Estilo CEBRASPE e Quadrix' },
                  { id: 'multipla_escolha', label: 'Múltipla Escolha (A, B, C, D, E)', desc: 'Estilo FGV, FCC, VUNESP e Cesgranrio' }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setQuestionStyle(st.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      questionStyle === st.id
                        ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold ring-1 ring-orange-500'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{st.label}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{st.desc}</div>
                    </div>
                    {questionStyle === st.id && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Modo de Cronômetro */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
                Modo de Tempo:
              </label>
              <div className="space-y-2">
                {[
                  { id: 'timed', label: 'Cronômetro Oficial', desc: 'Simulação real com contagem regressiva' },
                  { id: 'untimed', label: 'Modo Estudo Livre', desc: 'Sem pressão de tempo, estude no seu ritmo' }
                ].map(tm => (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => setTimeMode(tm.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      timeMode === tm.id
                        ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-bold ring-1 ring-orange-500'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{tm.label}</div>
                      <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tm.desc}</div>
                    </div>
                    {timeMode === tm.id && <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Nome personalizado opcional */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Título Personalizado do Simulado (Opcional):
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={`Ex: Simulado Foco ${selectedBoard} — Reta Final`}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDark 
                  ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

        </div>

        {/* BOTÃO PRINCIPAL DE GERAÇÃO */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto min-w-[320px] px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Gerando Simulado Inédito...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>🚀 Gerar e Iniciar Simulado Inédito ({questionCount} Questões)</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-xs text-orange-400 mt-3 animate-pulse">
              {generationStep}
            </p>
          )}

          <p className={`text-xs mt-3 max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            💡 Você poderá <b>pausar o simulado a qualquer momento</b> para continuar depois. Ao finalizar, terá diagnóstico completo por disciplina e exportação de erros.
          </p>
        </div>

      </div>

    </div>
  );
}
