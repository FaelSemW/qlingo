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
  fetchQuestions, fetchStreaks, fetchNotebooks, 
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

  // Filter state for questions
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [filterBoard, setFilterBoard] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    }
  }, [activeTab, filterDiscipline, filterBoard, filterYear, filterStatus]);

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
      if (me) setCurrentUser(me);
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
    try {
      setIsLoadingQuestions(true);
      const res = await fetchQuestions({
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

            {/* Daily Mission Card (Duolingo Style from REA strings) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    🎯
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Próxima Missão Diária</h3>
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
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (((streakData?.today_solved || 0) / (streakData?.daily_goal || 10)) * 100))}%`
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>Ofensiva de <strong className="text-slate-800">{streakData?.streak_current || 0} dias</strong> ativa</span>
                </div>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  Continuar estudando →
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
            
            {/* Search and Filter Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
              
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
