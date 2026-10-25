import React, { useState, useEffect } from 'react';
import { BookmarkCheck, AlertTriangle, Plus, ChevronRight, BookOpen } from 'lucide-react';
import { fetchNotebooks, fetchNotebook, createNotebook, fetchWeeklyErrors } from '../services/api';
import QuestionCard from './QuestionCard';

export default function NotebooksView({ onRefreshUserData }) {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [notebookQuestions, setNotebookQuestions] = useState([]);
  const [weeklyErrors, setWeeklyErrors] = useState([]);
  const [isViewingWeeklyErrors, setIsViewingWeeklyErrors] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [nbs, errs] = await Promise.all([
        fetchNotebooks(),
        fetchWeeklyErrors()
      ]);
      setNotebooks(nbs || []);
      setWeeklyErrors(errs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNotebook = async (nb) => {
    try {
      setIsLoading(true);
      setIsViewingWeeklyErrors(false);
      const data = await fetchNotebook(nb.id);
      setSelectedNotebook(data);
      setNotebookQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWeeklyErrors = () => {
    setSelectedNotebook(null);
    setIsViewingWeeklyErrors(true);
    setNotebookQuestions(weeklyErrors);
  };

  const handleCreateNotebook = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await createNotebook(newName.trim(), newColor);
      setShowCreateModal(false);
      setNewName('');
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // If inspecting a specific notebook or weekly errors
  if (selectedNotebook || isViewingWeeklyErrors) {
    const title = isViewingWeeklyErrors 
      ? 'Caderno de Erros da Semana 🎯' 
      : selectedNotebook?.name;
    const desc = isViewingWeeklyErrors
      ? 'Questões que você errou recentemente. Treine até acertar todas!'
      : `Caderno personalizado com ${notebookQuestions.length} questões salvas.`;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Breadcrumb / Back button */}
        <button
          onClick={() => { setSelectedNotebook(null); setIsViewingWeeklyErrors(false); }}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-4 cursor-pointer"
        >
          ← Voltar para todos os cadernos
        </button>

        {/* Notebook Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">{title}</h1>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
            {notebookQuestions.length} questões
          </span>
        </div>

        {/* Questions list */}
        {notebookQuestions.length > 0 ? (
          <div className="space-y-6">
            {notebookQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                notebooks={notebooks}
                onResolved={() => {
                  if (onRefreshUserData) onRefreshUserData();
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800 mb-1">Nenhuma questão encontrada</h3>
            <p className="text-xs">
              {isViewingWeeklyErrors 
                ? 'Excelente! Você ainda não errou nenhuma questão essa semana.' 
                : 'Você pode adicionar questões a este caderno clicando no botão "Cadernos" no rodapé de qualquer questão.'}
            </p>
          </div>
        )}

      </div>
    );
  }

  // Notebooks Dashboard Overview
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-orange-500" />
            <span>Meus Cadernos de Estudo</span>
          </h1>
          <p className="text-xs text-slate-500">
            Organize questões por matéria, tema de concurso ou foque no seu caderno de erros.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Caderno</span>
        </button>
      </div>

      {/* Featured Card: Caderno de Erros Automático */}
      <div 
        onClick={handleOpenWeeklyErrors}
        className="bg-gradient-to-r from-rose-500 via-rose-600 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-rose-500/20 mb-8 cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-lg sm:text-xl">Caderno de Erros Automático</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25">
                Inteligência REA
              </span>
            </div>
            <p className="text-xs text-white/90 max-w-lg">
              Toda questão que você errar no QLingo é salva aqui automaticamente para você refazer e fixar o conteúdo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold px-3.5 py-1.5 rounded-xl bg-white text-rose-600">
            {weeklyErrors.length} erros
          </span>
          <ChevronRight className="w-5 h-5 text-white/80" />
        </div>
      </div>

      {/* Notebooks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {notebooks.map((nb) => (
          <div
            key={nb.id}
            onClick={() => handleOpenNotebook(nb)}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: nb.color || '#3b82f6' }}
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                {nb.question_count || 0} questões
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-800 text-base mb-1 group-hover:text-orange-600 transition-colors">
                {nb.name}
              </h3>
              <p className="text-[11px] text-slate-400">Clique para abrir e resolver</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Notebook */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">Criar Novo Caderno</h3>
            <p className="text-xs text-slate-500 mb-6">Crie pastas para agrupar questões específicas.</p>

            <form onSubmit={handleCreateNotebook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Caderno</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Direito Constitucional - Art. 5º"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Cor de Destaque</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        newColor === c ? 'scale-110 border-slate-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Criar Caderno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
