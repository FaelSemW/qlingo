import React, { useState } from 'react';
import { Flame, Award, Sparkles, BookOpen, UploadCloud, User, LogOut, LogIn, ChevronDown } from 'lucide-react';

export default function Header({ 
  streakData, 
  currentUser, 
  onOpenImport, 
  onOpenAuth, 
  onLogout 
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const currentStreak = streakData?.streak_current || currentUser?.streak_current || 0;
  const currentXp = currentUser?.xp || streakData?.xp || 0;
  const currentLevel = currentUser?.level || streakData?.level || 'Iniciante';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Free Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <span className="font-black text-xl tracking-tighter">Q</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                QLingo
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Grátis & Aberto
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Estudo de Alto Rendimento para Concursos & OAB
            </p>
          </div>
        </div>

        {/* Gamification Bar (Streak, XP, User Account) */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Daily Streak Flame */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer group"
            title="Sua ofensiva diária de estudos! Resolva questões todo dia para manter a chama acesa."
          >
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-sm">{currentStreak}</span>
            <span className="text-xs font-semibold hidden md:inline text-orange-700">dias</span>
          </div>

          {/* XP Level Badge */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700"
            title={`${currentLevel} • ${currentXp} XP acumulados`}
          >
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-sm">{currentXp} <span className="text-xs font-normal">XP</span></span>
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-[11px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-xs text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => { onOpenImport(); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    <span>Importar Questões JSON</span>
                  </button>
                  <button
                    onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
