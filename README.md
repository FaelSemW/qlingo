# 🔥 QLingo — Plataforma Aberta e Gamificada para Estudos & Concursos

**QLingo** é uma aplicação completa de estudo e resolução de questões para concursos públicos brasileiros, vestibulares e OAB. 

Desenvolvida a partir da análise da arquitetura e endpoints do QConcursos (versão 2.15.3, documentada no relatório `RELATORIO-REA-qconcursos.md`), o **QLingo** recria a experiência de estudos em um ambiente moderno, rápido e acessível, **removendo 100% das barreiras de monetização** (sem limites de questões diárias, sem paywalls, sem telas de assinatura) e integrando uma camada de **gamificação estilo Duolingo** (ofensiva diária/streak, XP, medalhas e missões diárias).

---

## ✨ Principais Funcionalidades

### 1. 🎯 Banco de Questões Ilimitado
- Questões com filtros dinâmicos por **Disciplina**, **Banca Examinadora** (Cebraspe, FGV, FCC, Vunesp), **Ano** e **Status** (Resolvidas, Não Resolvidas, Apenas as que Errei).
- Controles de acessibilidade com ajuste de tamanho de fonte (`A-` e `A+` como na aplicação original).
- Resolução interativa com feedback visual imediato e animações de confete (`canvas-confetti`) no acerto.
- **Estatísticas da comunidade**: visualização da porcentagem de concurseiros que escolheram cada alternativa.
- **Gabarito Comentado do Professor**: comentários e explicações detalhadas desbloqueados gratuitamente para todas as questões.
- **Comentários da Comunidade**: dicas, mnemônicos e espaço para anotações colaborativas.

### 2. ⏱️ Simulados Express (Serviço ILS)
- Mapeado diretamente dos endpoints de simulados (`api/ils/practice_tests`).
- Cronômetro regressivo de prova com tempo oficial.
- Grade navegável de questões.
- Relatório final com nota de corte, percentual de aproveitamento e revisão questão a questão.
- Criador de simulados personalizados sob medida por disciplina.

### 3. 🧠 Flashcards com Repetição Espaçada (SRS)
- Mapeado do endpoint `api/mobile/v1/flashcards`.
- Cartões 3D interativos (frente e verso) para fixação rápida de jurisprudências, súmulas e prazos.
- Classificação por dificuldade (*Difícil*, *Bom/Médio*, *Fácil*) que ajusta o fator de repetição espaçada.
- Criação rápida de novos flashcards.

### 4. 📂 Cadernos & Caderno de Erros Automático (Weekly Errors)
- Mapeado de `api/mobile/notebooks` e `api/mobile/notebooks/weekly-errors`.
- Toda questão respondida incorretamente é **enviada automaticamente para o Caderno de Erros**.
- Criação de cadernos personalizados com temas e cores customizáveis.

### 5. 🔥 Gamificação (O toque 'Lingo')
- **Ofensiva Diária (Streak)**: contador de dias seguidos de estudo com histórico semanal de chamas.
- **Sistema de Nível e XP**: ganho de experiência por acerto, resolução de simulados e revisão de flashcards.
- **Missões Diárias**: metas configuráveis (ex: 5, 10, 20 questões por dia).
- **Medalhas e Conquistas**: insígnias desbloqueadas conforme o progresso do estudante.

### 6. 🚫 Zero Monetização (100% Desbloqueado)
- Os endpoints de controle de cota (`/api/check_limits_app`) e ofertas (`/api/offers`) foram substituídos por respostas liberadas: cota infinita (`daily_limit: -1`), sem planos pagos e sem bloqueios de resolução.

---

## 🛠️ Arquitetura Técnica

```
qlingo/
├── server/                       # Backend Node.js / Express
│   ├── db.js                     # SQLite nativo Node 24 (node:sqlite)
│   ├── seed-data.js              # Questões reais de concursos, flashcards e simulados
│   ├── routes/
│   │   ├── questions.js          # /api/questions & /api/questions/:id/resolve
│   │   ├── practiceTests.js      # /api/ils/practice_tests & attempts
│   │   ├── streaks.js            # /api/streaks (ofensiva e metas)
│   │   ├── flashcards.js         # /api/mobile/v1/flashcards (SRS)
│   │   ├── notebooks.js          # /api/notebooks & weekly_errors
│   │   └── user.js               # /api/user_profile & /api/performance
│   └── index.js                  # Servidor Express com suporte a API + SPA Estático
│
└── client/                       # Frontend Web / PWA Moderno
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx        # Topbar com chama de ofensiva, XP e importar
    │   │   ├── Navigation.jsx    # Menu responsivo (Início, Questões, Simulados...)
    │   │   ├── QuestionCard.jsx  # Card interativo de questão com zoom e estatísticas
    │   │   ├── PracticeExam.jsx  # Modo simulado com cronômetro e gabarito
    │   │   ├── FlashcardViewer.jsx # Cartões de repetição espaçada 3D
    │   │   ├── NotebooksView.jsx # Caderno de erros automático e personalizados
    │   │   ├── ProfileStats.jsx  # Gráficos de acerto por matéria e conquistas
    │   │   └── ImportModal.jsx   # Importador JSON de questões
    │   ├── services/api.js       # Cliente HTTP desacoplado
    │   ├── App.jsx               # Aplicação principal
    │   └── index.css             # Tailwind CSS v4
    └── vite.config.js
```

---

## 🚀 Como Executar o QLingo

### Pré-requisitos
- Node.js instalado (v20+ ou v24+).

### 1. Iniciar o projeto completo (Frontend + Backend)
Na pasta raiz do QLingo (`c:\Users\Faelzinhown\Desktop\Projeto Qlingo OC\qlingo`):

```bash
# Modo desenvolvimento (com hot-reload no Vite e no Server):
npm run dev
```

Abra o seu navegador em:
- **Aplicação Web**: `http://localhost:5173`
- **API Backend**: `http://localhost:4000/api`

### 2. Ou rodar a versão de Produção (única porta)
```bash
npm run build
npm start
```
Abra em `http://localhost:4000`.

---

## 📥 Importando Mais Questões

O QLingo conta com um importador JSON nativo. Clique no botão **"Importar"** no canto superior direito para adicionar blocos de questões com alternativas, explicações e gabaritos. O sistema atualiza o banco SQLite local instantaneamente.
