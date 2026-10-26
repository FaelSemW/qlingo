import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle2, 
  Target, Sparkles, ArrowRight, BookOpen, Flame, Award, 
  RotateCw, Filter, Zap, Compass 
} from 'lucide-react';
import { fetchAnalytics, fetchWeaknessQuestions } from '../services/api';
import QuestionCard from './QuestionCard';

export default function AnalyticsView({ user, onOpenAuth, onStartPracticeInQuestions, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practiceDiscipline, setPracticeDiscipline] = useState(null);
  const [weaknessQuestions, setWeaknessQuestions] = useState([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Erro ao carregar análise de desempenho:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWeaknessPractice = async (disciplineName) => {
    try {
      setIsLoadingPractice(true);
      setPracticeDiscipline(disciplineName);
      const res = await fetchWeaknessQuestions(disciplineName);
      setWeaknessQuestions(res.questions || []);
      setActiveQuestionIdx(0);
    } catch (err) {
      console.error('Erro ao carregar treino de fraquezas:', err);
    } finally {
      setIsLoadingPractice(false);
    }
  };

  const handleExitPractice = () => {
    setPracticeDiscipline(null);
    setWeaknessQuestions([]);
    loadAnalytics(); // Reload updated stats
  };

  // If student is practicing their weaknesses right now
  if (practiceDiscipline && weaknessQuestions.length > 0) {
    const currentQ = weaknessQuestions[activeQuestionIdx];
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400">Treino Focado em Fraquezas: {practiceDiscipline}</h3>
              <p className="text-xs text-slate-400">Questões selecionadas para superar seus pontos de maior dificuldade</p>
            </div>
          </div>
          <button
            onClick={handleExitPractice}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← Voltar para Análise
          </button>
        </div>

        {/* Question Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>Questão <b>{activeQuestionIdx + 1}</b> de <b>{weaknessQuestions.length}</b></span>
          <div className="flex gap-1.5">
            {weaknessQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`w-6 h-6 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeQuestionIdx === idx
                    ? 'bg-amber-500 text-slate-950 font-black scale-105'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {currentQ && (
          <QuestionCard
            key={currentQ.id}
            question={currentQ}
            isDark={isDark}
            onAnswerResolved={() => {}}
          />
        )}

        {/* Navigation bottom */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setActiveQuestionIdx(i => Math.max(0, i - 1))}
            disabled={activeQuestionIdx === 0}
            className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-30 text-xs font-bold cursor-pointer"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setActiveQuestionIdx(i => Math.min(weaknessQuestions.length - 1, i + 1))}
            disabled={activeQuestionIdx === weaknessQuestions.length - 1}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-slate-950 text-xs font-bold cursor-pointer"
          >
            Próxima Questão →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500/20' 
          : 'bg-gradient-to-br from-indigo-50 via-white to-amber-50 border-indigo-100 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BarChart3 className="w-3.5 h-3.5" />
              Diagnóstico Pedagógico do Aluno
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Análise Inteligente de Desempenho
            </h2>
            <p className="text-slate-300 max-w-xl text-xs sm:text-sm leading-relaxed">
              Descubra seus pontos fortes, mapeie onde você está errando e resolva questões sob medida para superar suas maiores dificuldades.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl font-black text-white">{analytics?.total_answered || 0}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Resolvidas</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{analytics?.total_correct || 0}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Acertos</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{analytics?.accuracy_rate || 0}%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Aproveitamento</div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Notice */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              Você está navegando como <b>visitante</b>. Crie ou acesse sua conta gratuita para salvar seu histórico e gerar diagnósticos completos!
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer whitespace-nowrap shadow-md"
          >
            Acessar Conta
          </button>
        </div>
      )}

      {/* WEAKNESS HIGHLIGHT BOX: Praticar Fraquezas */}
      {analytics?.weak_spots && analytics.weak_spots.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  Prioridade Pedagógica
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  Sua Maior Dificuldade: {analytics.weak_spots[0].discipline}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  Taxa de acerto de <b>{analytics.weak_spots[0].accuracy}%</b> ({analytics.weak_spots[0].correct} acertos em {analytics.weak_spots[0].total} questões). Treinar essa área elevará sua nota rapidamente!
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStartWeaknessPractice(analytics.weak_spots[0].discipline)}
              disabled={isLoadingPractice}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{isLoadingPractice ? 'Carregando...' : 'Praticar Esta Fraqueza Agora'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DISCIPLINE BREAKDOWN TABLE */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Desempenho por Disciplina</h3>
          </div>
          <span className="text-xs text-slate-400">
            {analytics?.disciplines?.length || 0} matérias avaliadas
          </span>
        </div>

        {analytics?.disciplines && analytics.disciplines.length > 0 ? (
          <div className="space-y-3">
            {analytics.disciplines.map((d, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between pr-4">
                    <span className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                      {d.discipline}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      d.accuracy >= 75 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : d.accuracy >= 50 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          d.accuracy >= 75 
                            ? 'bg-emerald-500' 
                            : d.accuracy >= 50 
                              ? 'bg-amber-500' 
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${d.accuracy}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-300 w-12 text-right">
                      {d.accuracy}%
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>{d.correct} acertos de {d.total} resolvidas</span>
                  </div>
                </div>

                {/* Train button */}
                <button
                  onClick={() => handleStartWeaknessPractice(d.discipline)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                  title={`Resolver questões exclusivas de ${d.discipline}`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Treinar Matéria</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Compass className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs">Nenhuma questão resolvida ainda nesta conta.</p>
            <p className="text-[11px] text-slate-500">Resolva simulados ou questões diárias para gerar seu diagnóstico pedagógico!</p>
          </div>
        )}
      </div>

      {/* RECENT 7-DAYS EVOLUTION */}
      {analytics?.recent_activity && analytics.recent_activity.length > 0 && (
        <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Consistência dos Últimos 7 Dias</h3>
            </div>
            <span className="text-xs text-slate-400">Atividade diária</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {analytics.recent_activity.map((day, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1"
              >
                <p className="text-[11px] font-bold text-slate-400">{day.dayName}</p>
                <p className={`text-base font-black ${day.total > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                  {day.total}
                </p>
                <p className="text-[10px] text-slate-500">
                  {day.total > 0 ? `${day.accuracy}%` : '-'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
