import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { importQuestions } from '../services/api';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const sampleTemplate = [
    {
      discipline: "Direito Constitucional",
      examining_board: "CEBRASPE",
      institute: "Polícia Federal",
      year: 2024,
      difficulty: "Médio",
      statement: "A respeito dos direitos e deveres individuais e coletivos, é inviolável o sigilo da correspondência...",
      options: [
        { key: "C", text: "Certo" },
        { key: "E", text: "Errado" }
      ],
      right_answer: "C",
      explanation: "Art. 5º, XII, CF/88.",
      stats_distribution: { C: 90, E: 10 }
    }
  ];

  const handleFillTemplate = () => {
    setJsonText(JSON.stringify(sampleTemplate, null, 2));
  };

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const parsed = JSON.parse(jsonText);
      const questionsArray = Array.isArray(parsed) ? parsed : [parsed];

      const res = await importQuestions(questionsArray);
      setStatusMessage({ type: 'success', text: `${res.count} questões importadas com sucesso para o QLingo!` });
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Erro no formato JSON: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-black text-slate-900">Importar Questões (JSON)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Cole abaixo um array de questões em JSON para expandir instantaneamente seu banco de dados de estudo do QLingo.
        </p>

        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={handleFillTemplate}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Inserir Exemplo de Modelo
          </button>
        </div>

        <textarea
          rows={10}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Cole seu JSON aqui..."
          className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 mb-4"
        />

        {statusMessage && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!jsonText.trim() || isLoading}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isLoading ? 'Importando...' : 'Processar & Salvar'}
          </button>
        </div>

      </div>
    </div>
  );
}
