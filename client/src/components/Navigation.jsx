import React from 'react';
import { LayoutDashboard, CheckSquare, Clock, Layers, BookmarkCheck, User, FolderDown } from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'questions', label: 'Questões', icon: CheckSquare },
    { id: 'practice', label: 'Simulados', icon: Clock },
    { id: 'catalog', label: 'Provas do HD', icon: FolderDown },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'notebooks', label: 'Cadernos', icon: BookmarkCheck },
    { id: 'profile', label: 'Desempenho', icon: User }
  ];

  return (
    <nav className="bg-white border-t sm:border-t-0 sm:border-b border-slate-200 z-20 sticky bottom-0 sm:top-16">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex justify-around sm:justify-start sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2.5 px-3 sm:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
