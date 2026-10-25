import React, { useState, useEffect } from 'react';
import { 
  Flame, Award, Search, Filter, CheckCircle, Clock, 
  Layers, BookmarkCheck, ArrowRight, Sparkles, BookOpen, 
  CheckSquare, AlertCircle, RefreshCw 
} from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import QuestionCard from './components/QuestionCard';
import PracticeExam from './components/PracticeExam';
import FlashcardViewer from './components/FlashcardViewer';
import NotebooksView from './components/NotebooksView';
import ProfileStats from './components/ProfileStats';
import ImportModal from './components/ImportModal';
import AuthModal from './components/AuthModal';
import { 
  fetchQuestions, fetchDailyQuestions, fetchStreaks, fetchNotebooks, 
  fetchUserProfile, getSavedUser, fetchMe, clearAuth 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(getSavedUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [notebooks, setNotebooks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [availableFilters, setAvailableFilters] = useState({ disciplines: [], boards: [], years: [] });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Daily Challenge state
  const [dailyCareer, setDailyCareer] = useState('all');
  const [dailyQuestions, setDailyQuestions] = useState([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState(false);

  // Filter state for questions
  const [filterExamType, setFilterExamType] = useState('all');
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [filterBoard, setFilterBoard] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
    loadDaily('all');
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    }
  }, [activeTab, filterExamType, filterDiscipline, filterBoard, filterYear, filterStatus, isDailyChallengeActive, dailyCareer]);

  const loadDaily = async (career = dailyCareer) => {
    try {
      setIsLoadingDaily(true);
      const res = await fetchDailyQuestions(career);
      setDailyQuestions(res.questions || []);
    } catch (err) {
      console.error('Error loading daily questions:', err);
    } finally {
      setIsLoadingDaily(false);
    }
  };

  const handleCareerChange = (newCareer) => {
    setDailyCareer(newCareer);
    loadDaily(newCareer);
  };

  const handleStartDailyChallenge = (career = dailyCareer) => {
    setIsDailyChallengeActive(true);
    setDailyCareer(career);
    setActiveTab('questions');
  };

  const handleExitDailyChallenge = () => {
    setIsDailyChallengeActive(false);
  };

  const loadInitialData = async () => {
    try {
      const [strk, prof, nbs, me] = await Promise.all([
        fetchStreaks(),
        fetchUserProfile(),
        fetchNotebooks(),
        fetchMe()
      ]);
      setStreakData(strk);
      setUserProfile(prof);
      setNotebooks(nbs || []);
      if (me) {
        setCurrentUser(me);
      } else {
        clearAuth();
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadInitialData();
    if (activeTab === 'questions') loadQuestions();
  };

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    loadInitialData();
  };

  const loadQuestions = async () => {
    if (isDailyChallengeActive) {
      try {
        setIsLoadingQuestions(true);
        const res = await fetchDailyQuestions(dailyCareer);
        setQuestions(res.questions || []);
        setTotalQuestions(res.questions ? res.questions.length : 0);
      } catch (err) {
        console.error('Error loading daily questions:', err);
      } finally {
        setIsLoadingQuestions(false);
      }
      return;
    }

    try {
      setIsLoadingQuestions(true);
      const res = await fetchQuestions({
        exam_type: filterExamType,
        discipline: filterDiscipline,
        examining_board: filterBoard,
        year: filterYear,
        status: filterStatus,
        search: searchQuery
      });
      setQuestions(res.questions || []);
      setTotalQuestions(res.total || 0);
      if (res.filters) setAvailableFilters(res.filters);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQuestions();
  };

  const handleQuestionResolved = (result) => {
    loadInitialData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-16 sm:pb-0">
      
      {/* Top Sticky Header */}
      <Header
        streakData={streakData}
        currentUser={currentUser}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            
            {/* Hero Welcome Banner */}
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-orange-500/15 mb-8">
              <div className="max-w-2xl">
                <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-3">
                  QLingo • O Conhecimento Sem Barreiras
                </span>
                <h1 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight">
                  Sua jornada rumo à aprovação começa aqui!
                </h1>
                <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-6 font-medium">
                  Tudo o que você precisa para ser aprovado em concursos: questões ilimitadas, gabaritos comentados, simulados cronometrados e flashcards — 100% gratuito e livre de mensalidades.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('questions')}
                    className="px-6 py-3 rounded-2xl bg-white text-orange-600 font-extrabold text-sm hover:bg-orange-50 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Começar a Praticar Questões</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('practice')}
                    className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    Fazer um Simulado Express
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Mission Card & Desafio Diário (Duolingo Style) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs mb-8 space-y-6">
              
              {/* Header com Progresso da Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Meta Diária de Estudos</h3>
                    <p className="text-xs text-slate-500">
                      Resolva questões hoje para manter sua ofensiva acesa!
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-lg text-orange-600">
                    {streakData?.today_solved || 0} / {streakData?.daily_goal || 10}
                  </span>
                  <p className="text-[10px] font-bold uppercase text-slate-400">questões</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (((streakData?.today_solved || 0) / (streakData?.daily_goal || 10)) * 100))}%`
                  }}
                />
              </div>

              {/* Seção Desafio Diário Inédito por Carreira */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 border border-orange-200/70 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                      🔥
                    </span>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Desafio do Dia — Questões Inéditas Diárias
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        5 questões rotacionadas todo dia para a sua área de foco
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-full self-start sm:self-auto border border-orange-200">
                    📅 {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Seleção de Carreira */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-2">
                    Escolha sua carreira para o desafio de hoje:
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {[
                      { id: 'all', label: '🌟 Todas as Áreas' },
                      { id: 'ENEM', label: '🎓 ENEM & Vestibulares' },
                      { id: 'Carreiras Policiais', label: '🚓 Policiais (PF / PRF)' },
                      { id: 'Tribunais & MP', label: '🏛️ Tribunais (TJ / TRF)' },
                      { id: 'Carreira Fiscal', label: '💰 Fiscal (Receita Federal)' },
                      { id: 'Exame de Ordem (OAB)', label: '⚖️ OAB' },
                      { id: 'Previdenciário & INSS', label: '📋 INSS' },
                      { id: 'Bancários & INSS', label: '🏦 Bancários' },
                    ].map((car) => (
                      <button
                        key={car.id}
                        onClick={() => handleCareerChange(car.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                          dailyCareer === car.id
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {car.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview das Matérias de Hoje */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Matérias de hoje:</span>
                  {isLoadingDaily ? (
                    <span className="text-xs text-orange-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Carregando seleção...
                    </span>
                  ) : (
                    dailyQuestions.map((q, idx) => (
                      <span
                        key={q.id || idx}
                        className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-orange-200 text-slate-700 shadow-2xs"
                      >
                        #{idx + 1} {q.discipline}
                      </span>
                    ))
                  )}
                </div>

                {/* Botão de Ação */}
                <div className="pt-2">
                  <button
                    onClick={() => handleStartDailyChallenge(dailyCareer)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>🚀 Iniciar Desafio do Dia (5 Questões)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Footer da Ofensiva */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>Ofensiva de <strong className="text-slate-800">{streakData?.streak_current || 0} dias</strong> ativa</span>
                </div>
                <button
                  onClick={() => {
                    setIsDailyChallengeActive(false);
                    setActiveTab('questions');
                  }}
                  className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  Ir para o banco geral de questões →
                </button>
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div
                onClick={() => setActiveTab('questions')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">Banco de Questões</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Filtre por banca, ano ou disciplina e resolva com feedback instantâneo.
                </p>
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                  Acessar Banco →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('practice')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">Simulados Express</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Treine com contagem regressiva e calcule sua pontuação oficial.
                </p>
                <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                  Iniciar Prova →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('flashcards')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">Flashcards SRS</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Revisão espaçada de prazos, conceitos e súmulas recorrentes.
                </p>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  Treinar Memória →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('notebooks')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookmarkCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">Caderno de Erros</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Refaça automaticamente todas as questões que você errou até gabaritar.
                </p>
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  Revisar Erros →
                </span>
              </div>

            </div>

          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            
            {/* Daily Challenge Active Banner */}
            {isDailyChallengeActive && (
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-orange-500/15 mb-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                      🔥
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                          Desafio Diário • {new Date().toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h3 className="font-black text-lg sm:text-xl">
                        {dailyCareer === 'all' ? '5 Questões Inéditas do Dia' : `5 Questões do Dia • ${dailyCareer}`}
                      </h3>
                      <p className="text-xs opacity-90">
                        Resolva as 5 questões selecionadas hoje para sua área e mantenha sua ofensiva!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleExitDailyChallenge}
                    className="px-4 py-2 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs shadow transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                  >
                    Ver Todo o Banco de Questões →
                  </button>
                </div>

                {/* Sub-selector de Carreira no modo Desafio */}
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  <span className="text-[11px] font-bold text-white/80 whitespace-nowrap">Área:</span>
                  {[
                    { id: 'all', label: '🌟 Todas' },
                    { id: 'ENEM', label: '🎓 ENEM' },
                    { id: 'Carreiras Policiais', label: '🚓 Policial' },
                    { id: 'Tribunais & MP', label: '🏛️ Tribunais' },
                    { id: 'Carreira Fiscal', label: '💰 Fiscal' },
                    { id: 'Exame de Ordem (OAB)', label: '⚖️ OAB' },
                    { id: 'Previdenciário & INSS', label: '📋 INSS' },
                    { id: 'Bancários & INSS', label: '🏦 Bancários' },
                  ].map((car) => (
                    <button
                      key={car.id}
                      onClick={() => handleCareerChange(car.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                        dailyCareer === car.id
                          ? 'bg-white text-orange-600 shadow'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {car.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filter Panel (Hidden in pure Daily Challenge mode or available to switch) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100 text-xs">
                {/* Desafio do Dia Quick Toggle Button */}
                <button
                  onClick={() => {
                    setIsDailyChallengeActive(!isDailyChallengeActive);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDailyChallengeActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400'
                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                  }`}
                >
                  <span>🔥 Desafio do Dia</span>
                </button>

                {[
                  { id: 'all', label: '🌟 Todas as Questões' },
                  { id: 'ENEM', label: '🎓 ENEM & Vestibulares' },
                  { id: 'CONCURSO', label: '🚓 Concursos Públicos' },
                  { id: 'OAB', label: '⚖️ Exame de Ordem (OAB)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setIsDailyChallengeActive(false);
                      setFilterExamType(cat.id);
                      setFilterDiscipline('all');
                      setFilterBoard('all');
                    }}
                    className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      !isDailyChallengeActive && filterExamType === cat.id
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar questão por termo, órgão (ex: PF, TJSP) ou conteúdo..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Buscar
                </button>
              </form>

              {/* Filter Selects */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                
                {/* Disciplina */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Disciplina</label>
                  <select
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">Todas as Disciplinas</option>
                    {(availableFilters.disciplines || []).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Banca */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Banca</label>
                  <select
                    value={filterBoard}
                    onChange={(e) => setFilterBoard(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">Todas as Bancas</option>
                    {(availableFilters.boards || []).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Ano */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Ano</label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">Todos os Anos</option>
                    {(availableFilters.years || []).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">Todas as Questões</option>
                    <option value="unresolved">Não Resolvidas</option>
                    <option value="resolved">Já Resolvidas</option>
                    <option value="wrong">Apenas as que Errei</option>
                  </select>
                </div>

              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>{totalQuestions} questões encontradas</span>
                {(filterDiscipline !== 'all' || filterBoard !== 'all' || filterYear !== 'all' || filterStatus !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterDiscipline('all');
                      setFilterBoard('all');
                      setFilterYear('all');
                      setFilterStatus('all');
                      setSearchQuery('');
                    }}
                    className="text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

            </div>

            {/* Questions Stream */}
            {isLoadingQuestions ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
                <p className="text-xs">Carregando questões...</p>
              </div>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  notebooks={notebooks}
                  onResolved={handleQuestionResolved}
                  onRefreshQuestion={loadQuestions}
                />
              ))
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-base text-slate-800 mb-1">Nenhuma questão encontrada</h3>
                <p className="text-xs mb-4">
                  Tente alterar os filtros de busca ou importar novas questões pelo botão "Importar".
                </p>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Importar Questões
                </button>
              </div>
            )}

          </div>
        )}

        {/* PRACTICE EXAMS TAB */}
        {activeTab === 'practice' && (
          <PracticeExam onBackToDashboard={() => setActiveTab('dashboard')} />
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'flashcards' && (
          <FlashcardViewer />
        )}

        {/* NOTEBOOKS TAB */}
        {activeTab === 'notebooks' && (
          <NotebooksView onRefreshUserData={loadInitialData} />
        )}

        {/* PROFILE / PERFORMANCE TAB */}
        {activeTab === 'profile' && (
          <ProfileStats />
        )}

      </main>

      {/* Import Questions Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          loadQuestions();
          loadInitialData();
        }}
      />

      {/* Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
