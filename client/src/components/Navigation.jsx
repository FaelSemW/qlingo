import React from 'react';
import { LayoutDashboard, CheckSquare, Clock, BarChart3, BookmarkCheck, Layers, User } from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab, theme = 'dark' }) {
  const isDark = theme === 'dark';
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'questions', label: 'Questões', icon: CheckSquare },
    { id: 'practice', label: 'Simulados', icon: Clock },
    { id: 'analytics', label: 'Desempenho', icon: BarChart3 },
    { id: 'notebooks', label: 'Cadernos', icon: BookmarkCheck },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  return (
    <nav className={`border-t sm:border-t-0 sm:border-b z-20 sticky bottom-0 sm:top-16 transition-colors ${
      isDark 
        ? 'bg-slate-950/95 border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex justify-around sm:justify-start sm:gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 px-3 sm:px-3.5 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                    : isDark 
                      ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900' 
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-orange-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
