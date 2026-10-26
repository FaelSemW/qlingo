import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Target, Flame, Moon, Sun, BookOpen, Shield, Award, Landmark, Building2, Scale } from 'lucide-react';
import { saveOnboardingProfile } from '../services/api';

export default function OnboardingModal({ isOpen, onClose, user, onSaveSuccess }) {
  const [step, setStep] = useState(1);
  const [targetExam, setTargetExam] = useState(user?.target_exam || 'ENEM');
  const [studyGoal, setStudyGoal] = useState(user?.study_goal || 'Aprovação no próximo edital');
  const [dailyGoal, setDailyGoal] = useState(user?.daily_goal || 15);
  const [themePreference, setThemePreference] = useState(user?.theme_preference || 'dark');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const exams = [
    {
      id: 'ENEM',
      name: 'ENEM & Vestibulares',
      desc: 'Ciências Humanas, Natureza, Matemática e Linguagens (Edições 2009 a 2026)',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'Policial',
      name: 'Carreiras Policiais',
      desc: 'Polícia Rodoviária Federal (PRF), Polícia Federal (PF) e Polícia Civil',
      icon: Shield,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'Tribunais',
      name: 'Tribunais & Judiciário',
      desc: 'TJ-SP Escrevente, TRFs, TRTs, Ministérios Públicos e VUNESP',
      icon: Scale,
      color: 'from-purple-600 to-indigo-700'
    },
    {
      id: 'Fiscal',
      name: 'Carreira Fiscal',
      desc: 'Receita Federal (Auditor / Analista), SEFAZ e Contabilidade Avançada',
      icon: Landmark,
      color: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'Bancario',
      name: 'Carreiras Bancárias',
      desc: 'Banco do Brasil, Caixa Econômica Federal e Conhecimentos Bancários',
      icon: Building2,
      color: 'from-cyan-600 to-blue-600'
    },
    {
      id: 'OAB',
      name: 'Exame de Ordem (OAB)',
      desc: '1ª Fase Unificada FGV: Ética, Constitucional, Civil, Penal e Processos',
      icon: Award,
      color: 'from-rose-600 to-pink-600'
    },
    {
      id: 'Geral',
      name: 'Conhecimentos Gerais & Outros',
      desc: 'Português, Raciocínio Lógico, Informática e Atualidades para todos os concursos',
      icon: Sparkles,
      color: 'from-amber-600 to-yellow-600'
    }
  ];

  const goals = [
    'Conquistar minha aprovação no próximo concurso / edital',
    'Alcançar +800 pontos e aprovação no ENEM',
    'Construir o hábito diário de resolver 10 a 30 questões todo dia',
    'Identificar e superar minhas maiores dificuldades pedagógicas',
    'Gabaritar as matérias que mais derrubam candidatos'
  ];

  const handleFinish = async () => {
    try {
      setIsSubmitting(true);
      const res = await saveOnboardingProfile({
        target_exam: targetExam,
        study_goal: studyGoal,
        daily_goal: Number(dailyGoal),
        theme_preference: themePreference
      });

      if (onSaveSuccess) {
        onSaveSuccess(res.user || {
          ...user,
          target_exam: targetExam,
          study_goal: studyGoal,
          daily_goal: Number(dailyGoal),
          theme_preference: themePreference
        });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar perfil do estudante:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
              Q
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Configurar Meu Perfil de Estudos</h3>
              <p className="text-xs text-slate-400">Personalize seu foco para desafios diários e simulados recomendados</p>
            </div>
          </div>
          <div className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Passo {step} de 2
          </div>
        </div>

        {/* STEP 1: Escolha do Foco Principal */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-1">Qual prova ou carreira você está estudando?</h4>
              <p className="text-xs text-slate-400">Vamos filtrar suas questões e desafios diários com base na sua escolha:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {exams.map((ex) => {
                const Icon = ex.icon;
                const isSelected = targetExam === ex.id;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => setTargetExam(ex.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${ex.color} flex items-center justify-center shrink-0 shadow-sm text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-orange-400' : 'text-slate-200'}`}>
                        {ex.name}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-0.5">
                        {ex.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Avançar para Metas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Objetivos, Meta Diária e Tema */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Objetivo */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">Qual é o seu objetivo principal?</label>
              <select
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {goals.map((g, idx) => (
                  <option key={idx} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Meta diária de questões */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  Meta diária de questões:
                </span>
                <span className="font-black text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  {dailyGoal} questões / dia
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1">
                <span>5 q (Leve)</span>
                <span>15 q (Recomendado)</span>
                <span>30 q (Intensivo)</span>
                <span>50 q (Ninja)</span>
              </div>
            </div>

            {/* Tema preferido (Dark / Light) */}
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1.5">Visual do aplicativo (Tema):</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThemePreference('dark')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    themePreference === 'dark'
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Modo Escuro (Dark)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemePreference('light')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    themePreference === 'light'
                      ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Modo Claro (Light)</span>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Salvando...' : 'Salvar Perfil e Começar'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
