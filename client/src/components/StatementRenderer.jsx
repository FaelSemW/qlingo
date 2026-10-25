import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon, Info } from 'lucide-react';

export default function StatementRenderer({ statement, className = '', isDark = false }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  if (!statement) return null;

  // Split statement into blocks (paragraphs, images, blockquotes, headers)
  const lines = statement.split('\n');
  const renderedElements = [];
  let currentBlockquote = [];

  const flushBlockquote = (key) => {
    if (currentBlockquote.length === 0) return null;
    const content = currentBlockquote.join('\n');
    currentBlockquote = [];

    const isA11y = content.includes('Descrição da Imagem') || content.includes('👁️');

    return (
      <div 
        key={`bq-${key}`}
        className={`my-3 p-3.5 rounded-2xl border text-xs leading-relaxed transition-all ${
          isDark 
            ? isA11y
              ? 'bg-sky-950/30 border-sky-800/40 text-sky-200' 
              : 'bg-slate-950/60 border-slate-800 text-slate-300 italic'
            : isA11y
              ? 'bg-sky-50 border-sky-200 text-sky-900' 
              : 'bg-amber-50/70 border-amber-200 text-slate-700 italic'
        }`}
      >
        <div className="flex items-start gap-2">
          {isA11y && <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
          <div className="whitespace-pre-line flex-1">{content}</div>
        </div>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Check for Blockquotes (> text)
    if (line.trim().startsWith('>')) {
      const cleanLine = line.trim().replace(/^>\s*/, '');
      currentBlockquote.push(cleanLine);
      continue;
    } else if (currentBlockquote.length > 0) {
      renderedElements.push(flushBlockquote(i));
    }

    // 2. Check for Markdown Images: ![alt](url)
    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1] || 'Imagem da Questão';
      const url = imgMatch[2];

      renderedElements.push(
        <div key={`img-${i}`} className="my-4 text-center">
          <div className="inline-block relative group max-w-full">
            <img
              src={url}
              alt={alt}
              loading="lazy"
              onClick={() => setZoomedImage(url)}
              className={`max-h-[380px] w-auto max-w-full rounded-2xl border shadow-md object-contain cursor-zoom-in transition-all group-hover:scale-[1.01] ${
                isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
              }`}
            />
            <button
              onClick={() => setZoomedImage(url)}
              className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl text-xs flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity backdrop-blur-md cursor-pointer shadow-lg"
              title="Clique para ampliar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ampliar</span>
            </button>
          </div>
          {alt && alt !== 'Imagem da Questão' && (
            <p className={`text-[11px] mt-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {alt}
            </p>
          )}
        </div>
      );
      continue;
    }

    // 3. Check for Section Headers (## TEXTO 1, TEXTO II)
    if (line.trim().startsWith('##')) {
      const title = line.trim().replace(/^##\s*/, '');
      renderedElements.push(
        <div key={`head-${i}`} className="my-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
            isDark 
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' 
              : 'bg-orange-100 text-orange-700 border border-orange-200'
          }`}>
            {title}
          </span>
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      );
      continue;
    }

    // 4. Check for leftover stray [placeholder]
    let formattedLine = line;
    if (formattedLine.includes('[[placeholder]]') || formattedLine.includes('[placeholder]')) {
      renderedElements.push(
        <div key={`ph-${i}`} className={`my-2 p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span>[Ilustração / Gráfico do Enunciado Oficial]</span>
        </div>
      );
      continue;
    }

    // 5. Normal text line or empty line
    if (line.trim() === '') {
      renderedElements.push(<div key={`sp-${i}`} className="h-2.5" />);
    } else {
      renderedElements.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {formattedLine}
        </p>
      );
    }
  }

  // Flush any trailing blockquote
  if (currentBlockquote.length > 0) {
    renderedElements.push(flushBlockquote('last'));
  }

  return (
    <div className={`statement-container ${className}`}>
      {renderedElements}

      {/* Fullscreen Zoom Modal */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-5xl max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full cursor-pointer transition-colors"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Imagem ampliada"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain bg-slate-900 border border-slate-700"
            />
            <p className="text-xs text-slate-400 mt-3 font-medium">Clique em qualquer lugar para fechar</p>
          </div>
        </div>
      )}
    </div>
  );
}
