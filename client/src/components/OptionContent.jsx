import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon } from 'lucide-react';

export default function OptionContent({ text, isDark = false, className = '' }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  if (!text) return null;

  // Check for Markdown image: ![alt](url)
  const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
  if (imgMatch) {
    const alt = imgMatch[1] || 'Figura da alternativa';
    const src = imgMatch[2];
    const textWithoutImg = text.replace(/!\[(.*?)\]\((.*?)\)/g, '').trim();

    return (
      <div className={`space-y-2 py-1 ${className}`}>
        {textWithoutImg && <p className="leading-snug">{textWithoutImg}</p>}
        <div className="relative inline-block group">
          <img 
            src={src} 
            alt={alt} 
            className="max-h-52 max-w-full rounded-xl object-contain bg-white p-2 border border-slate-200 shadow-xs group-hover:border-indigo-400 transition-all"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setZoomedImage(src); }}
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-slate-900 shadow-md"
            title="Ampliar figura"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal de Zoom */}
        {zoomedImage && (
          <div 
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-3xl max-h-[90vh] bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center">
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute -top-3 -right-3 p-2 bg-slate-900 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              <img src={zoomedImage} alt={alt} className="max-h-[80vh] w-auto object-contain rounded-xl" />
              <p className="text-xs text-slate-500 mt-2 font-medium">{alt}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Check if text is a direct image URL (ends with image extension or starts with enem.dev/questions/)
  if (/^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(text.trim()) || (/^https?:\/\/enem\.dev\/.*\/[a-f0-9-]+\.png/i.test(text.trim()))) {
    const src = text.trim();
    return (
      <div className={`py-1 ${className}`}>
        <img 
          src={src} 
          alt="Figura da alternativa" 
          className="max-h-52 max-w-full rounded-xl object-contain bg-white p-2 border border-slate-200 shadow-xs"
          loading="lazy"
        />
      </div>
    );
  }

  // If text contains [Figura da alternativa...] or (Gráfico / Figura...)
  if (text.includes('[Figura da alternativa') || text.includes('(Gráfico / Figura')) {
    const letterMatch = text.match(/[A-E]/);
    const letter = letterMatch ? letterMatch[0] : '';
    return (
      <div className="inline-flex items-center gap-2 py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
        <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Figura da alternativa {letter || ''}</span>
      </div>
    );
  }

  // Normal text
  return <span className={`leading-relaxed ${className}`}>{text}</span>;
}
