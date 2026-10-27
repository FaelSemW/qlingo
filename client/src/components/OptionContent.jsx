import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function OptionContent({ text = '', file = null, isDark = false, className = '' }) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const [imageError, setImageError] = useState(false);

  if (!text && !file) return null;

  // 1. Extrair URL de imagem via prop 'file', markdown ![alt](url) ou URL direta
  let imageSrc = file || null;
  let imageAlt = 'Figura da alternativa';
  let cleanText = (text || '').trim();

  const imgMatch = cleanText.match(/!\[(.*?)\]\((.*?)\)/);
  if (imgMatch) {
    imageAlt = imgMatch[1] || 'Figura da alternativa';
    imageSrc = imgMatch[2].trim();
    cleanText = cleanText.replace(/!\[(.*?)\]\((.*?)\)/g, '').trim();
  } else if (/^https?:\/\/.+/i.test(cleanText)) {
    // Texto é uma URL direta
    imageSrc = cleanText;
    cleanText = '';
  }

  // 2. Se temos uma imagem válida encontrada
  if (imageSrc) {
    return (
      <div className={`space-y-2 py-1 ${className}`}>
        {cleanText && <p className="leading-snug">{cleanText}</p>}
        
        {!imageError ? (
          <div className="relative inline-block group">
            <img 
              src={imageSrc} 
              alt={imageAlt} 
              className={`max-h-56 max-w-full rounded-xl object-contain p-2 border shadow-sm transition-all group-hover:scale-[1.01] ${
                isDark 
                  ? 'bg-white border-slate-700 shadow-slate-950/40' 
                  : 'bg-white border-slate-200'
              }`}
              loading="lazy"
              onError={() => setImageError(true)}
              onClick={(e) => { e.stopPropagation(); setZoomedImage(imageSrc); }}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setZoomedImage(imageSrc); }}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md backdrop-blur-xs flex items-center gap-1 text-[10px] font-bold"
              title="Ampliar figura"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Ampliar</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>{imageAlt}</span>
          </div>
        )}

        {/* Modal de Zoom */}
        {zoomedImage && (
          <div 
            onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-3xl max-h-[90vh] p-5 rounded-3xl shadow-2xl flex flex-col items-center border ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="absolute -top-3 -right-3 p-2 bg-slate-900 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer shadow-lg border border-slate-700"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
              <img 
                src={zoomedImage} 
                alt={imageAlt} 
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl bg-white p-2" 
              />
              <p className={`text-xs mt-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{imageAlt}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Fallback se texto ainda for [Figura da alternativa...] sem imagem carregada
  if (cleanText.includes('[Figura da alternativa') || cleanText.includes('(Gráfico / Figura')) {
    const letterMatch = cleanText.match(/[A-E]/);
    const letter = letterMatch ? letterMatch[0] : '';
    return (
      <div className="inline-flex items-center gap-2 py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
        <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Figura da alternativa {letter || ''}</span>
      </div>
    );
  }

  // 4. Texto normal da alternativa
  return <span className={`leading-relaxed ${className}`}>{cleanText}</span>;
}
