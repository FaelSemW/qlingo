const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const questionsRouter = require('./routes/questions');
const practiceTestsRouter = require('./routes/practiceTests');
const streaksRouter = require('./routes/streaks');
const flashcardsRouter = require('./routes/flashcards');
const notebooksRouter = require('./routes/notebooks');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const catalogRouter = require('./routes/catalog');
const { optionalAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(optionalAuth);

// Auth endpoints
app.use('/api/auth', authRouter);
app.post('/oauth/token', (req, res) => {
  req.url = '/oauth/token';
  authRouter(req, res);
});

// Mount routes matching REA discoveries and standard paths
// Check limits endpoint (from REA report) - always unlimited for QLingo!
app.get('/api/check_limits_app', (req, res) => {
  res.json({
    is_premium: true,
    unlimited: true,
    daily_limit: -1,
    remaining_today: 999999,
    features_unlocked: [
      "unlimited_questions",
      "professor_commentaries",
      "advanced_statistics",
      "unlimited_practice_tests",
      "weekly_error_notebook",
      "flashcards_srs",
      "offline_downloads"
    ],
    message: "QLingo Aberto & Gratuito — Todos os recursos desbloqueados!"
  });
});

app.use('/api/questions', questionsRouter);
app.use('/api/questions_downloads', (req, res) => {
  req.url = '/downloads';
  questionsRouter(req, res);
});
app.use('/api/question_errors', (req, res) => {
  req.url = '/errors/report';
  questionsRouter(req, res);
});
app.use('/api/stored_filters', (req, res) => {
  res.json({ filters: [] });
});
app.use('/api/ils/practice_tests', practiceTestsRouter);
app.use('/api/practice_tests', practiceTestsRouter);
app.use('/api/streaks', streaksRouter);
app.use('/api/mobile/v1/flashcards', flashcardsRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/mobile/notebooks', notebooksRouter);
app.use('/api/notebooks', notebooksRouter);
app.use('/api/user_profile', userRouter);
app.use('/api/user', userRouter);
app.use('/api/performance', (req, res) => {
  req.url = '/performance';
  userRouter(req, res);
});
app.use('/api/concursos/catalogo', catalogRouter);
app.use('/api/catalogo', catalogRouter);

// Root welcome
app.get('/api', (req, res) => {
  res.json({
    app: "QLingo API",
    version: "1.0.0",
    status: "online",
    monetization: "disabled",
    message: "Ambiente de estudo livre, gamificado e 100% gratuito!",
    endpoints: [
      "/api/questions",
      "/api/questions/:id/resolve",
      "/api/check_limits_app",
      "/api/ils/practice_tests",
      "/api/streaks",
      "/api/mobile/v1/flashcards/deck",
      "/api/mobile/notebooks",
      "/api/performance"
    ]
  });
});

// Serve client build if available
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 [QLingo Server] rodando com sucesso em http://localhost:${PORT}`);
});
