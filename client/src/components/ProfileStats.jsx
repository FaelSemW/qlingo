import React, { useState, useEffect } from 'react';
import { User, Flame, Award, Target, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { fetchUserProfile, fetchPerformance, fetchStreaks, updateDailyGoal } from '../services/api';

export default function ProfileStats({ theme = 'dark' }) {
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [newGoal, setNewGoal] = useState(10);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prof, perf, strk] = await Promise.all([
        fetchUserProfile(),
        fetchPerformance(),
        fetchStreaks()
      ]);
      setProfile(prof);
      setPerformance(perf || []);
      setStreakData(strk);
      if (strk?.daily_goal) setNewGoal(strk.daily_goal);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGoal = async () => {
    try {
      setIsUpdatingGoal(true);
      await updateDailyGoal(newGoal);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const achievements = [
    { id: 1, title: 'Primeiro Acerto', desc: 'Acertou sua primeira questão oficial.', icon: '🎯', unlocked: (profile?.total_correct || 0) >= 1 },
    { id: 2, title: 'Ofensiva de 3 Dias', desc: 'Manteve a chama acesa por 3 dias seguidos.', icon: '🔥', unlocked: (streakData?.streak_current || 0) >= 3 },
    { id: 3, title: 'Concurseiro Focado', desc: 'Acumulou mais de 300 XP.', icon: '⚡', unlocked: (profile?.xp || 0) >= 300 },
    { id: 4, title: 'Gabaritador', desc: 'Alcançou taxa de acerto superior a 75%.', icon: '🏆', unlocked: (profile?.accuracy_rate || 0) >= 75 && (profile?.total_answered || 0) >= 5 },
    { id: 5, title: 'Mestre da Memorização', desc: 'Revisou todos os flashcards da trilha.', icon: '🧠', unlocked: true }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-orange-500/20">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : (profile?.is_guest ? 'V' : 'E')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{profile?.is_guest ? 'Visitante' : (profile?.name || 'Estudante QLingo')}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${profile?.is_guest ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                {profile?.is_guest ? 'Modo Visitante' : 'Acesso Vitalício Livre'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">{profile?.level || 'Concurseiro Dedicado 🔥'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase">XP Acumulado</p>
            <p className="text-xl font-black text-amber-500">{profile?.xp || 0} XP</p>
          </div>
          <div className="text-center px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Aproveitamento</p>
            <p className="text-xl font-black text-emerald-600">{profile?.accuracy_rate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Streak & Daily Goal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Streak Flame Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-base">Ofensiva Semanal</h3>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
              {streakData?.streak_current || 0} dias seguidos
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Mantenha seu hábito diário! Dias com questões resolvidas acendem uma chama.
          </p>

          <div className="grid grid-cols-7 gap-2 text-center">
            {(streakData?.weekly_activity || []).map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 mb-1">{day.dayName}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  day.completed 
                    ? 'bg-orange-500 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Flame className={`w-4 h-4 ${day.completed ? 'fill-white' : ''}`} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold">{day.count} q</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Study Goal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="font-extrabold text-slate-800 text-base">Meta Diária de Questões</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Defina quantas questões você quer resolver por dia para manter o foco.
            </p>

            <div className="flex gap-2 mb-4">
              {[5, 10, 20, 30].map((g) => (
                <button
                  key={g}
                  onClick={() => setNewGoal(g)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    newGoal === g
                      ? 'border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {g} / dia
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveGoal}
            disabled={isUpdatingGoal}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {isUpdatingGoal ? 'Salvando...' : 'Atualizar Meta'}
          </button>
        </div>

      </div>

      {/* Accuracy by Discipline (Performance breakdown) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-800 text-base">Desempenho por Disciplina</h3>
        </div>

        {performance.length > 0 ? (
          <div className="space-y-4">
            {performance.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.discipline}</span>
                  <span className="text-slate-600">
                    {item.correct}/{item.total} acertos ({item.accuracy}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.accuracy >= 70 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">
            Resolva questões para visualizar suas métricas de acerto por disciplina.
          </p>
        )}
      </div>

      {/* Achievements / Conquistas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-slate-800 text-base">Medalhas & Conquistas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                ach.unlocked 
                  ? 'border-amber-200 bg-amber-50/40 text-slate-800' 
                  : 'border-slate-200 bg-slate-50/50 opacity-50 text-slate-400'
              }`}
            >
              <div className="text-2xl">{ach.icon}</div>
              <div>
                <h4 className="font-bold text-xs">{ach.title}</h4>
                <p className="text-[11px] text-slate-500">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
