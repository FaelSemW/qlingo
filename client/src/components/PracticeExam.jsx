import React, { useState, useEffect } from 'react';
import { 
  Award, Clock, CheckCircle2, XCircle, AlertCircle, 
  ChevronRight, ArrowLeft, RefreshCw, Filter, BookOpen, 
  TrendingUp, HelpCircle, Flame, ShieldAlert, Sparkles, Check, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function PracticeExam({ user, onRequireAuth }) {
  const [tests, setTests] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Test in progress state
  const [activeTest, setActiveTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);

  // Result state
  const [result, setResult] = useState(null);
  const [resultFilter, setResultFilter] = useState('all'); // all | errors | correct

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await api.getPracticeTests();
      const list = Array.isArray(data) ? data : (data.practice_tests || []);
      setTests(list);
    } catch (err) {
      console.error('Erro ao carregar simulados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!activeTest || timeLeft <= 0 || result) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleFinishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTest, timeLeft, result]);

  const handleStartTest = async (test) => {
    try {
      setLoading(true);
      // Fetch full questions for this practice test
      const res = await api.getPracticeTestQuestions(test.id);
      setActiveTest(test);
      setTestQuestions(res.questions || []);
      setCurrentIdx(0);
      setSelectedAnswers({});
      setResult(null);
      setTimeLeft((test.time_limit_minutes || test.duration_minutes || 60) * 60);

      // Start attempt on backend
      const attemptRes = await api.startPracticeTestAttempt(test.id);
      setAttemptId(attemptRes.attempt_id || test.id);
    } catch (err) {
      console.error('Erro ao iniciar simulado:', err);
      alert('Não foi possível iniciar o simulado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (optionKey) => {
    if (!activeTest || result) return;
    const currentQ = testQuestions[currentIdx];
    if (!currentQ) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey
    }));

    // Update answer asynchronously on backend
    if (attemptId) {
      try {
        await api.updatePracticeTestAnswer(attemptId, currentQ.id, optionKey);
      } catch (e) {
        console.warn('Erro ao salvar resposta no backend:', e);
      }
    }
  };

  const handleFinishTest = async () => {
    if (submitting || !attemptId) return;
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalCount = testQuestions.length;

    if (timeLeft > 0 && answeredCount < totalCount) {
      const confirm = window.confirm(`Você respondeu ${answeredCount} de ${totalCount} questões. Deseja realmente finalizar o simulado e gerar o diagnóstico pedagógico?`);
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      const res = await api.completePracticeTestAttempt(attemptId, selectedAnswers);
      setResult(res);

      if (res.passed_cut_score || res.is_approved) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Erro ao finalizar simulado:', err);
      alert('Erro ao calcular nota do simulado.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredTests = tests.filter(t => {
    if (activeCategory === 'all') return true;
    const cat = activeCategory.toLowerCase();
    return (t.career || '').toLowerCase().includes(cat) || 
           (t.category || '').toLowerCase().includes(cat) ||
           (t.title || '').toLowerCase().includes(cat) || 
           (t.description || '').toLowerCase().includes(cat);
  });

  // ==========================================
  // VIEW: DIAGNÓSTICO E RESULTADO FINAL
  // ==========================================
  if (result) {
    const isApproved = result.passed_cut_score !== undefined ? result.passed_cut_score : result.is_approved;
    const correctCount = result.correct_answers !== undefined ? result.correct_answers : result.correct_count;
    const totalCount = result.total_questions || testQuestions.length;
    const diagnosisText = result.pedagogical_diagnosis || result.diagnosis;
    const breakdown = result.discipline_breakdown || (result.subject_stats ? Object.entries(result.subject_stats).map(([k, v]) => ({ discipline: k, ...v })) : []);

    const wrongQuestions = testQuestions.filter(q => {
      const ans = selectedAnswers[q.id];
      const right = q.right_answer || q.correct_answer;
      return ans !== right;
    });

    const displayedQuestions = testQuestions.filter(q => {
      const ans = selectedAnswers[q.id];
      const right = q.right_answer || q.correct_answer;
      const isCorrect = ans === right;
      if (resultFilter === 'errors') return !isCorrect;
      if (resultFilter === 'correct') return isCorrect;
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
        {/* Top bar with back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveTest(null); setResult(null); loadTests(); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos Simulados
          </button>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <Sparkles className="w-4 h-4" /> +{result.xp_earned || 50} XP Conquistados!
          </div>
        </div>

        {/* Hero Score Card */}
        <div className={`p-8 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${
          isApproved 
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/30' 
            : 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/30'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isApproved ? '🎉 Classificado / Aprovado no Corte' : '⚠️ Abaixo da Nota de Corte'}
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">{result.test_title || activeTest?.title}</h2>
              <p className="text-slate-300 max-w-xl text-sm leading-relaxed">{diagnosisText}</p>
            </div>

            <div className="flex items-center gap-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{result.score}%</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Sua Pontuação</div>
              </div>
              <div className="h-10 w-[1px] bg-slate-800" />
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-400">{correctCount} <span className="text-slate-500 text-lg font-normal">/ {totalCount}</span></div>
                <div className="text-xs text-slate-400 mt-1 font-medium">Acertos Reais</div>
              </div>
              <div className="h-10 w-[1px] bg-slate-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-400">{result.cut_score || 60}%</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Corte Estimado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desempenho por Matéria */}
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Diagnóstico Pedagógico por Matéria
            </h3>
            <span className="text-xs text-slate-400">Calculado automaticamente com base no gabarito oficial</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakdown.map((item) => {
              const pct = item.percentage || 0;
              const isStrong = pct >= 70;
              const isMedium = pct >= 50 && pct < 70;

              return (
                <div key={item.discipline} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-200 line-clamp-1">{item.discipline}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      isStrong ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      isMedium ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {pct}% • {item.status || (isStrong ? 'Ponto Forte' : isMedium ? 'Regular' : 'Revisão')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isStrong ? 'bg-emerald-500' : isMedium ? 'bg-sky-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 pt-0.5">
                    <span>{item.correct} de {item.total} questões corretas</span>
                    <span>{item.total - item.correct} erro(s)</span>
                  </div>
                </div>
              );
            })}
          </div>

          {wrongQuestions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-200">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                As <b>{wrongQuestions.length} questões</b> que você errou foram automaticamente adicionadas ao seu <b>Caderno de Erros</b> para revisão espaçada.
              </span>
            </div>
          )}
        </div>

        {/* Correção Questão a Questão */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Correção Detalhada com Comentários Oficiais
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setResultFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  resultFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({testQuestions.length})
              </button>
              <button
                onClick={() => setResultFilter('errors')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  resultFilter === 'errors' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Erros ({wrongQuestions.length})
              </button>
              <button
                onClick={() => setResultFilter('correct')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  resultFilter === 'correct' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Acertos ({testQuestions.length - wrongQuestions.length})
              </button>
            </div>
          </div>

          {/* List of answered questions */}
          <div className="space-y-4">
            {displayedQuestions.map((q, idx) => {
              const myAnswer = selectedAnswers[q.id];
              const rightAns = q.right_answer || q.correct_answer;
              const isCorrect = myAnswer === rightAns;
              const qOptions = q.options || q.alternatives || [];
              const explanationText = q.explanation || q.resolution;

              return (
                <div key={q.id} className={`p-6 rounded-2xl border transition-all ${
                  isCorrect 
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/30' 
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-rose-500/30'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Questão {idx + 1}</span>
                      <span className="font-semibold text-slate-300">{q.discipline}</span>
                      <span>•</span>
                      <span>{q.examining_board}</span>
                      <span>•</span>
                      <span>{q.year}</span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isCorrect 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Você Acertou' : `Você errou (Marcou ${myAnswer || 'em branco'})`}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-normal mb-4 whitespace-pre-line">
                    {q.statement}
                  </p>

                  {/* Alternatives */}
                  <div className="space-y-2 mb-4">
                    {qOptions.map((alt) => {
                      const optKey = alt.key || alt.id;
                      const isOptionCorrect = optKey === rightAns;
                      const isOptionSelected = optKey === myAnswer;

                      let itemStyle = 'border-slate-800/80 bg-slate-950/40 text-slate-400';
                      if (isOptionCorrect) {
                        itemStyle = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-semibold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        itemStyle = 'border-rose-500/50 bg-rose-950/20 text-rose-300 font-semibold';
                      }

                      return (
                        <div key={optKey} className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${itemStyle}`}>
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOptionCorrect ? 'bg-emerald-500 text-slate-950' : 
                            isOptionSelected ? 'bg-rose-500 text-white' : 
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {optKey}
                          </span>
                          <span className="flex-1 leading-relaxed">{alt.text}</span>
                          {isOptionCorrect && <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Gabarito Oficial</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Resolution / Commentary */}
                  {explanationText && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Resolução Comentada:
                      </div>
                      <p className="leading-relaxed text-slate-400">{explanationText}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: SIMULADO EM ANDAMENTO (PROVA ATIVA)
  // ==========================================
  if (activeTest && testQuestions.length > 0) {
    const currentQ = testQuestions[currentIdx];
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercent = Math.round((answeredCount / testQuestions.length) * 100);
    const qOptions = currentQ.options || currentQ.alternatives || [];

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-24">
        {/* Floating Topbar */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex items-center justify-between sticky top-20 z-30 shadow-xl shadow-slate-950/40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja pausar/sair do simulado? Seu progresso nesta sessão não será finalizado.')) {
                  setActiveTest(null);
                }
              }}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white line-clamp-1">{activeTest.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Respondidas: <b className="text-indigo-400">{answeredCount}</b> de {testQuestions.length}</span>
                <span>•</span>
                <span>Progresso: {progressPercent}%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown timer */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold ${
              timeLeft < 300 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
                : 'bg-slate-800/80 text-amber-300 border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Finalize Button */}
            <button
              onClick={handleFinishTest}
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Finalizar Simulado
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentIdx / (testQuestions.length - 1)) * 100}%` }}
          />
        </div>

        {/* Question Area */}
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-8 space-y-6 shadow-xl">
          {/* Metadata pill */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                Questão {currentIdx + 1} de {testQuestions.length}
              </span>
              <span className="font-bold text-slate-200">{currentQ.discipline}</span>
              {currentQ.subject && <span>• {currentQ.subject}</span>}
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg">{currentQ.examining_board}</span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg">{currentQ.year}</span>
            </div>
          </div>

          {/* Statement */}
          <div className="text-base text-slate-100 leading-relaxed font-normal whitespace-pre-line py-2">
            {currentQ.statement}
          </div>

          {/* Alternatives */}
          <div className="space-y-3 pt-2">
            {qOptions.map((alt) => {
              const optKey = alt.key || alt.id;
              const isSelected = selectedAnswers[currentQ.id] === optKey;

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-600/15 text-white shadow-lg shadow-indigo-500/10' 
                      : 'border-slate-800/80 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'bg-slate-800 text-slate-400 group-hover:text-white'
                  }`}>
                    {optKey}
                  </span>
                  <span className="text-sm leading-relaxed flex-1">{alt.text}</span>
                  {isSelected && <Check className="w-5 h-5 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold cursor-pointer"
            >
              ← Anterior
            </button>

            {/* Question Quick Jump Map (Collapsible / Mini) */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-md py-1 px-2">
              {testQuestions.map((q, idx) => {
                const isAns = selectedAnswers[q.id] !== undefined;
                const isCurr = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurr 
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' 
                        : isAns 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (currentIdx < testQuestions.length - 1) {
                  setCurrentIdx(i => i + 1);
                } else {
                  handleFinishTest();
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
            >
              {currentIdx === testQuestions.length - 1 ? 'Revisar & Finalizar' : 'Próxima →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LISTAGEM DE SIMULADOS OFICIAIS
  // ==========================================
  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5" /> Simulados com Base em Editais Oficiais
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Simulados Completos com Correção Automática
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Treine em condições reais de prova. Timer regressivo, correção automatizada no final, diagnóstico por matéria e exportação direta dos seus erros para o <b>Caderno de Erros</b>. 100% gratuito e sem limites diários.
          </p>
        </div>
      </div>

      {/* Career Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {[
          { id: 'all', label: '🌟 Todos os Simulados' },
          { id: 'ENEM', label: '🎓 ENEM (Edições Oficiais)' },
          { id: 'Policial', label: '🚓 Carreiras Policiais (PF / PRF)' },
          { id: 'Tribunais', label: '⚖️ Tribunais (TJ / TRF)' },
          { id: 'Fiscal', label: '💰 Carreira Fiscal (Receita Federal)' },
          { id: 'Bancários', label: '🏛️ Bancários & INSS' },
          { id: 'OAB', label: '⚖️ Exame de Ordem (OAB)' },
          { id: 'Express', label: '⚡ Simulados Express por Matéria' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="text-sm">Carregando catálogo de simulados oficiais...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/60 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Nenhum simulado encontrado nesta categoria</h3>
          <p className="text-xs text-slate-500">Tente selecionar outra carreira ou categoria acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {test.career || test.category || 'Geral'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{test.time_limit_minutes || test.duration_minutes || 60} min</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {test.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span><b>{test.total_questions || test.questions_count || 10}</b> questões</span>
                  </div>
                  <div>•</div>
                  <div>
                    Corte: <b className="text-slate-300">{test.cut_score || 60}%</b>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => handleStartTest(test)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Iniciar Simulado</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
