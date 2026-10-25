import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon, Info } from 'lucide-react';

// Helper para converter markdown inline (**negrito**, *itálico*) em elementos React
function renderFormattedText(text) {
  if (!text) return null;

  // Quebrar por negrito **...**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);

  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      return (
        <strong key={bIdx} className="font-bold text-inherit">
          {bPart.slice(2, -2)}
        </strong>
      );
    }

    // Quebrar por itálico *...*
    const italicParts = bPart.split(/(\*.*?\*)/g);
    return (
      <span key={bIdx}>
        {italicParts.map((iPart, iIdx) => {
          if (iPart.startsWith('*') && iPart.endsWith('*') && !iPart.startsWith('**')) {
            return (
              <em key={iIdx} className="italic text-inherit">
                {iPart.slice(1, -1)}
              </em>
            );
          }
          return iPart;
        })}
      </span>
    );
  });
}

export default function StatementRenderer({ statement, className = '', isDark = false }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  if (!statement) return null;

  // Normalizar quebras de linha
  const cleanStatement = statement.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanStatement.split('\n');
  const renderedElements = [];
  let currentBlockquote = [];

  const flushBlockquote = (key) => {
    if (currentBlockquote.length === 0) return null;
    const contentLines = [...currentBlockquote];
    currentBlockquote = [];

    const isA11y = contentLines.some(l => l.includes('Descrição da Imagem') || l.includes('👁️'));

    return (
      <div 
        key={`bq-${key}`}
        className={`my-3 p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
          isDark 
            ? isA11y
              ? 'bg-sky-950/40 border-sky-800/50 text-sky-200 shadow-sm' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300 italic'
            : isA11y
              ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-sm' 
              : 'bg-amber-50/70 border-amber-200 text-slate-700 italic'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {isA11y && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
          <div className="space-y-1 flex-1">
            {contentLines.map((cLine, cIdx) => (
              <p key={cIdx} className="leading-relaxed">
                {renderFormattedText(cLine)}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Verificar Blockquotes (> texto)
    if (trimmed.startsWith('>')) {
      const cleanLine = trimmed.replace(/^>\s*/, '');
      currentBlockquote.push(cleanLine);
      continue;
    } else if (currentBlockquote.length > 0) {
      renderedElements.push(flushBlockquote(i));
    }

    // 2. Verificar Imagens Markdown: ![alt](url)
    const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1] || 'Imagem da Questão';
      const url = imgMatch[2].trim();

      renderedElements.push(
        <div key={`img-${i}`} className="my-5 flex flex-col items-center">
          <div className="relative group max-w-full inline-block">
            <img
              src={url}
              alt={alt}
              loading="lazy"
              onClick={() => setZoomedImage(url)}
              className={`max-h-[380px] w-auto max-w-full rounded-2xl border shadow-md object-contain cursor-zoom-in transition-all group-hover:scale-[1.01] ${
                isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            />
            <button
              onClick={() => setZoomedImage(url)}
              className="absolute bottom-3 right-3 bg-slate-900/85 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer shadow-lg"
              title="Clique para ampliar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Ampliar Imagem</span>
            </button>
          </div>
          {alt && alt !== 'Imagem da Questão' && !alt.startsWith('Figura da Questão') && (
            <p className={`text-[11px] mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {alt}
            </p>
          )}
        </div>
      );
      continue;
    }

    // 3. Cabeçalhos de Seção (## TEXTO 1, TEXTO II)
    if (trimmed.startsWith('##')) {
      const title = trimmed.replace(/^##\s*/, '');
      renderedElements.push(
        <div key={`head-${i}`} className="my-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
            isDark 
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
              : 'bg-orange-100 text-orange-700 border border-orange-200'
          }`}>
            {title}
          </span>
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      );
      continue;
    }

    // 4. Placeholders residuais
    if (trimmed.includes('[[placeholder]]') || trimmed.includes('[placeholder]')) {
      renderedElements.push(
        <div key={`ph-${i}`} className={`my-2 p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span>[Ilustração / Gráfico do Enunciado Oficial]</span>
        </div>
      );
      continue;
    }

    // 5. Linhas normais ou vazias
    if (trimmed === '') {
      renderedElements.push(<div key={`sp-${i}`} className="h-2.5" />);
    } else {
      renderedElements.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {renderFormattedText(rawLine)}
        </p>
      );
    }
  }

  // Despejar blockquote final se houver
  if (currentBlockquote.length > 0) {
    renderedElements.push(flushBlockquote('last'));
  }

  return (
    <div className={`statement-content ${className}`}>
      {renderedElements}

      {/* Modal de Zoom em Tela Cheia */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomedImage}
            alt="Figura Ampliada"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl transition-transform"
          />
        </div>
      )}
    </div>
  );
}
