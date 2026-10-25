import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, Check, Plus, Sparkles, HelpCircle } from 'lucide-react';
import { fetchFlashcards, answerFlashcard, createFlashcard } from '../services/api';

export default function FlashcardViewer() {
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('Direito Constitucional');

  useEffect(() => {
    loadDeck();
  }, [selectedDiscipline]);

  const loadDeck = async () => {
    try {
      setIsLoading(true);
      const data = await fetchFlashcards(selectedDiscipline === 'all' ? null : selectedDiscipline);
      setDeck(data || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = deck[currentIndex];

  const handleRateCard = async (rating) => {
    if (!currentCard) return;

    try {
      await answerFlashcard(currentCard.id, rating);
      setIsFlipped(false);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Deck finished, reload
        loadDeck();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    try {
      await createFlashcard({
        discipline: newDiscipline,
        front: newFront.trim(),
        back: newBack.trim()
      });
      setShowCreateModal(false);
      setNewFront('');
      setNewBack('');
      await loadDeck();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-500" />
            <span>Flashcards com Repetição Espaçada</span>
          </h1>
          <p className="text-xs text-slate-500">
            Memorize prazos, súmulas e mnemônicos com o método científico de revisão ativa.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Flashcard</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {['all', 'Direito Constitucional', 'Direito Administrativo', 'Língua Portuguesa', 'Raciocínio Lógico'].map((disc) => (
          <button
            key={disc}
            onClick={() => setSelectedDiscipline(disc)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedDiscipline === disc
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {disc === 'all' ? 'Todos os Baralhos' : disc}
          </button>
        ))}
      </div>

      {/* Flashcard Area */}
      {currentCard ? (
        <div>
          
          {/* Card Count & Discipline */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-3 px-1">
            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
              {currentCard.discipline}
            </span>
            <span>
              Cartão {currentIndex + 1} de {deck.length}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[300px] sm:min-h-[340px] bg-white rounded-3xl border-2 border-slate-200 shadow-sm hover:border-orange-300 transition-all p-8 flex flex-col justify-between cursor-pointer relative group mb-6"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">
                {isFlipped ? 'Resposta / Verso' : 'Pergunta / Frente'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-orange-500 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Clique para virar
              </span>
            </div>

            <div className="my-auto py-6">
              <p className={`text-center font-medium leading-relaxed whitespace-pre-line ${
                isFlipped ? 'text-slate-800 text-base sm:text-lg' : 'text-slate-900 text-lg sm:text-xl font-bold'
              }`}>
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-center text-xs text-slate-400">
              Revisado {currentCard.review_count || 0} vezes
            </div>
          </div>

          {/* Self-Rating Buttons (only visible when flipped) */}
          {isFlipped ? (
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <button
                onClick={() => handleRateCard('hard')}
                className="py-3 px-2 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Difícil 😕</span>
                <span className="text-[10px] font-normal text-rose-600">Rever em breve</span>
              </button>

              <button
                onClick={() => handleRateCard('good')}
                className="py-3 px-2 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Bom / Médio 🙂</span>
                <span className="text-[10px] font-normal text-amber-600">Intervalo padrão</span>
              </button>

              <button
                onClick={() => handleRateCard('easy')}
                className="py-3 px-2 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Fácil! 🎯</span>
                <span className="text-[10px] font-normal text-emerald-600">Fixado na mente</span>
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 font-medium">
              Toque no cartão para conferir a resposta e avaliar sua memorização.
            </p>
          )}

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-lg mb-1">Baralho Concluído!</h3>
          <p className="text-xs text-slate-500 mb-6">
            Você revisou todos os flashcards disponíveis nesta categoria.
          </p>
          <button
            onClick={loadDeck}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Reiniciar Revisão
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">Novo Flashcard de Estudo</h3>
            <p className="text-xs text-slate-500 mb-6">Adicione uma pergunta ou conceito e a resposta no verso.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina</label>
                <select
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="Direito Constitucional">Direito Constitucional</option>
                  <option value="Direito Administrativo">Direito Administrativo</option>
                  <option value="Língua Portuguesa">Língua Portuguesa</option>
                  <option value="Raciocínio Lógico">Raciocínio Lógico</option>
                  <option value="Noções de Informática">Noções de Informática</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frente (Pergunta ou Conceito)</label>
                <textarea
                  rows={3}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Ex: Qual o prazo para o Mandado de Segurança?"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verso (Resposta Completa)</label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Ex: 120 dias, a contar da ciência pelo interessado do ato a ser impugnado."
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
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
                  Salvar Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
