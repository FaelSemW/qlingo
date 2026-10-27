import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, MessageSquare, BookMarked, Share2, 
  ChevronDown, ChevronUp, Sparkles, ThumbsUp, HelpCircle 
} from 'lucide-react';
import { resolveQuestion, addComment, toggleNotebookQuestion } from '../services/api';
import StatementRenderer from './StatementRenderer';
import OptionContent from './OptionContent';

export default function QuestionCard({ 
  question, 
  notebooks = [], 
  onAnswerResolved,
  isDark = false 
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [resolvedResult, setResolvedResult] = useState(
    question.last_user_answer ? {
      is_correct: question.is_resolved_correct === 1,
      selected_answer: question.last_user_answer,
      right_answer: question.right_answer,
      explanation: question.explanation,
      stats_distribution: question.stats_distribution || {}
    } : null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState(question.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [isNotebookMenuOpen, setIsNotebookMenuOpen] = useState(false);
  const [notebookSuccessToast, setNotebookSuccessToast] = useState(null);
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1: small, 0: normal, 1: large, 2: xlarge

  const fontSizes = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
  const currentFontSize = fontSizes[fontSizeLevel + 1];

  const handleSelectOption = (key) => {
    if (resolvedResult) return; // Locked once answered
    setSelectedOption(key);
  };

  const handleResolve = async () => {
    if (!selectedOption || resolvedResult || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await resolveQuestion(question.id, selectedOption);
      setResolvedResult(res);
      if (onAnswerResolved) onAnswerResolved(res);
    } catch (err) {
      console.error('Error resolving question:', err);
      // Fallback local verification
      const isCorrect = selectedOption.toUpperCase() === question.right_answer.toUpperCase();
      setResolvedResult({
        is_correct: isCorrect,
        selected_answer: selectedOption,
        right_answer: question.right_answer,
        explanation: question.explanation,
        stats_distribution: question.stats_distribution || {}
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const res = await addComment(question.id, commentInput.trim());
      if (res.comments) {
        setCommentsList(res.comments);
        setCommentInput('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleToggleNotebook = async (notebookId, notebookName) => {
    try {
      const res = await toggleNotebookQuestion(notebookId, question.id);
      setIsNotebookMenuOpen(false);
      setNotebookSuccessToast(
        res.included 
          ? `Adicionada ao caderno "${notebookName}"!` 
          : `Removida do caderno "${notebookName}"!`
      );
      setTimeout(() => setNotebookSuccessToast(null), 3000);
    } catch (err) {
      console.error('Error toggling notebook:', err);
    }
  };

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all mb-6 ${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700 shadow-xl shadow-slate-950/20' 
        : 'bg-white border-slate-200 text-slate-800 hover:shadow-md'
    }`}>
      
      {/* Header Info / Badges */}
      <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/60'
      }`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`font-bold px-2.5 py-1 rounded-md ${
            isDark ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30' : 'bg-blue-100 text-blue-800'
          }`}>
            {question.discipline}
          </span>
          <span className={`font-semibold px-2.5 py-1 rounded-md ${
            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/80 text-slate-700'
          }`}>
            {question.examining_board}
          </span>
          <span className={`px-2.5 py-1 rounded-md ${
            isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-200/80 text-slate-600'
          }`}>
            {question.institute}
          </span>
          <span className={`px-2 py-1 rounded-md font-medium ${
            isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-200/80 text-slate-600'
          }`}>
            {question.year}
          </span>
          <span className={`px-2 py-1 rounded-md font-medium text-[11px] ${
            question.difficulty === 'Fácil' 
              ? isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800' 
              : question.difficulty === 'Difícil' 
              ? isDark ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-800' 
              : isDark ? 'bg-amber-950/50 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-800'
          }`}>
            Dificuldade: {question.difficulty}
          </span>
        </div>

        {/* Font Zoom Controls (A- / A+) */}
        <div className={`flex items-center gap-1 border rounded-lg p-0.5 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={() => setFontSizeLevel(Math.max(-1, fontSizeLevel - 1))}
            disabled={fontSizeLevel <= -1}
            className={`px-2 py-0.5 text-xs font-bold disabled:opacity-30 cursor-pointer ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Diminuir tamanho da fonte"
          >
            A-
          </button>
          <span className={isDark ? 'text-slate-600 text-xs' : 'text-slate-300 text-xs'}>|</span>
          <button
            onClick={() => setFontSizeLevel(Math.min(2, fontSizeLevel + 1))}
            disabled={fontSizeLevel >= 2}
            className={`px-2 py-0.5 text-xs font-bold disabled:opacity-30 cursor-pointer ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Aumentar tamanho da fonte"
          >
            A+
          </button>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-5 sm:p-6">
        
        {/* Statement with rich figures, quotes and formatting */}
        <div className={`leading-relaxed font-normal mb-6 ${isDark ? 'text-slate-100' : 'text-slate-800'} ${currentFontSize}`}>
          <StatementRenderer statement={question.statement} isDark={isDark} />
        </div>

        {/* Alternatives */}
        <div className="space-y-3 mb-6">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isRight = resolvedResult && resolvedResult.right_answer === opt.key;
            const isWrong = resolvedResult && isSelected && !resolvedResult.is_correct;
            const percentage = resolvedResult?.stats_distribution?.[opt.key];

            let buttonStyle = isDark 
              ? "border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/60 text-slate-200 bg-slate-950/60" 
              : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 text-slate-700 bg-white";
            
            let badgeStyle = isDark 
              ? "bg-slate-800 text-slate-300 border-slate-700" 
              : "bg-slate-100 text-slate-700 border-slate-300";

            if (isSelected && !resolvedResult) {
              buttonStyle = isDark 
                ? "border-orange-500 bg-orange-500/15 text-orange-200 font-medium ring-2 ring-orange-500/30" 
                : "border-orange-500 bg-orange-50/60 text-orange-950 font-medium ring-2 ring-orange-500/20";
              badgeStyle = "bg-orange-500 text-white border-orange-500";
            } else if (isRight) {
              buttonStyle = isDark 
                ? "border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-medium ring-2 ring-emerald-500/30" 
                : "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-2 ring-emerald-500/30";
              badgeStyle = "bg-emerald-600 text-white border-emerald-600";
            } else if (isWrong) {
              buttonStyle = isDark 
                ? "border-rose-500/60 bg-rose-950/30 text-rose-200 font-medium ring-2 ring-rose-500/30" 
                : "border-rose-400 bg-rose-50/80 text-rose-950 font-medium ring-2 ring-rose-400/30";
              badgeStyle = "bg-rose-500 text-white border-rose-500";
            }

            return (
              <div key={opt.key} className="relative">
                <button
                  type="button"
                  onClick={() => handleSelectOption(opt.key)}
                  disabled={!!resolvedResult}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${buttonStyle}`}
                >
                  <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs border ${badgeStyle}`}>
                    {opt.key}
                  </span>
                  <span className="flex-1 pt-0.5 text-sm sm:text-base leading-snug">
                    <OptionContent text={opt.text} file={opt.file} isDark={isDark} />
                  </span>

                  {/* Right/Wrong Icon Indicator */}
                  {isRight && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  {isWrong && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </button>

                {/* Percentage distribution from community */}
                {resolvedResult && percentage !== undefined && (
                  <div className={`mt-1 px-3 flex items-center justify-between text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden mr-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full rounded-full ${isRight ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span>{percentage}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resolution Action Button */}
        {!resolvedResult && (
          <div className="flex items-center justify-between pt-2">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedOption ? `Alternativa ${selectedOption} selecionada` : 'Selecione uma alternativa'}
            </span>
            <button
              onClick={handleResolve}
              disabled={!selectedOption || isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Responder'}</span>
            </button>
          </div>
        )}

        {/* Result Feedback Banner */}
        {resolvedResult && (
          <div className={`p-4 rounded-xl border mt-4 flex items-center justify-between ${
            resolvedResult.is_correct 
              ? isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {resolvedResult.is_correct ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                  ✓
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-black">
                  ✕
                </div>
              )}
              <div>
                <p className="font-bold text-sm sm:text-base">
                  {resolvedResult.is_correct ? 'Parabéns! Resposta correta!' : 'Você errou essa questão.'}
                </p>
                <p className="text-xs opacity-80">
                  {resolvedResult.is_correct 
                    ? `+${resolvedResult.xp_earned || 15} XP adicionados à sua conta.`
                    : 'Questão salva automaticamente no seu Caderno de Erros para revisão.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs font-bold underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showExplanation ? 'Ocultar Gabarito' : 'Ver Gabarito'}</span>
              {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Professor Commentary / Gabarito Comentado (Unlocked & Free!) */}
        {showExplanation && (resolvedResult?.explanation || question.explanation) && (
          <div className={`mt-4 p-4 sm:p-5 rounded-xl border ${
            isDark 
              ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' 
              : 'bg-amber-50/70 border-amber-200/80 text-slate-800'
          }`}>
            <div className={`flex items-center gap-2 font-bold text-sm mb-2 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gabarito Comentado do Professor</span>
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ml-auto ${
                isDark 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                Desbloqueado
              </span>
            </div>
            <p className={`text-sm whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {resolvedResult?.explanation || question.explanation}
            </p>
          </div>
        )}

        {/* Toast alert */}
        {notebookSuccessToast && (
          <div className="mt-3 p-3 rounded-lg bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 animate-fade-in border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notebookSuccessToast}</span>
          </div>
        )}

      </div>

      {/* Footer Actions (Comments, Add to Notebook, Share) */}
      <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
        isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
      }`}>
        
        {/* Toggle Comments Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
            isDark ? 'hover:text-white' : 'hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span>Comentários ({commentsList.length})</span>
        </button>

        <div className="flex items-center gap-3 relative">
          
          {/* Add to Notebook */}
          <div className="relative">
            <button
              onClick={() => setIsNotebookMenuOpen(!isNotebookMenuOpen)}
              className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-4 h-4 text-slate-400" />
              <span>Cadernos</span>
            </button>

            {/* Notebook Dropdown */}
            {isNotebookMenuOpen && (
              <div className={`absolute right-0 bottom-full mb-2 w-56 rounded-xl shadow-xl border py-1.5 z-20 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Salvar em caderno:
                </p>
                {notebooks.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => handleToggleNotebook(nb.id, nb.name)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: nb.color || '#3b82f6' }}
                    />
                    <span className="truncate">{nb.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Comments Drawer / Section */}
      {showComments && (
        <div className={`p-4 sm:p-5 border-t space-y-4 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/50 border-slate-200'
        }`}>
          <h4 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Comentários dos Estudantes ({commentsList.length})
          </h4>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Compartilhe uma dica ou macete dessa questão..."
              className={`flex-1 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 border ${
                isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Publicar
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {commentsList.map((comm, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-xs leading-relaxed ${
                isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{comm.author || 'Estudante QLingo'}</span>
                  <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{comm.date || 'Hoje'}</span>
                </div>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>{comm.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
