import React, { useState } from 'react';
import { 
  Flame, Award, Sparkles, BookOpen, UploadCloud, 
  User, LogOut, LogIn, ChevronDown, Sun, Moon, Target, Settings 
} from 'lucide-react';

export default function Header({ 
  streakData, 
  currentUser, 
  onOpenImport, 
  onOpenAuth, 
  onLogout,
  theme = 'dark',
  onToggleTheme,
  onOpenOnboarding
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isDark = theme === 'dark';
  const currentStreak = streakData?.streak_current || currentUser?.streak_current || 0;
  const currentXp = currentUser?.xp || streakData?.xp || 0;
  const currentLevel = currentUser?.level || streakData?.level || 'Iniciante';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
      isDark 
        ? 'bg-slate-950/90 border-slate-800 text-white shadow-lg shadow-slate-950/50' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo and Free Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <span className="font-black text-xl tracking-tighter">Q</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                QLingo
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                100% Grátis & Aberto
              </span>
            </div>
            <p className={`text-xs font-medium hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Estudo de Alto Rendimento para Concursos & ENEM
            </p>
          </div>
        </div>

        {/* Gamification Bar (Streak, XP, Theme Switcher, User) */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Daily Streak Flame */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors cursor-pointer group ${
              isDark 
                ? 'bg-orange-950/40 border-orange-500/30 text-orange-400 hover:bg-orange-900/40' 
                : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
            }`}
            title="Sua ofensiva diária de estudos! Resolva questões todo dia para manter a chama acesa."
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xs sm:text-sm">{currentStreak}</span>
            <span className="text-xs font-semibold hidden md:inline">dias</span>
          </div>

          {/* XP Level Badge */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              isDark 
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' 
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
            title={`${currentLevel} • ${currentXp} XP acumulados`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs sm:text-sm">{currentXp} <span className="text-[10px] font-normal">XP</span></span>
          </div>

          {/* Functional Dark / Light Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 hover:border-slate-600 shadow-sm' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
            title={isDark ? 'Mudar para Modo Claro (Light)' : 'Mudar para Modo Escuro (Dark)'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Modo Escuro</span>
              </>
            )}
          </button>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-[11px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border py-2 z-40 animate-fade-in ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-200' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`px-4 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className="font-bold text-xs truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => { onOpenOnboarding(); setIsUserMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-orange-400" />
                    <span>Meu Perfil & Metas</span>
                  </button>
                  <button
                    onClick={() => { onOpenImport(); setIsUserMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    <span>Importar Questões JSON</span>
                  </button>
                  <button
                    onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold text-rose-500 flex items-center gap-2 cursor-pointer border-t ${
                      isDark ? 'border-slate-800 hover:bg-rose-950/20' : 'border-slate-100 hover:bg-rose-50'
                    }`}
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
