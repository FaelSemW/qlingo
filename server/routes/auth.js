const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, requireAuth, optionalAuth } = require('../middleware/auth');

// Register new user
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const emailClean = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(emailClean);

    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, xp, level, streak_current, streak_max, daily_goal, target_exam, study_goal, theme_preference)
      VALUES (?, ?, ?, 50, 'Concurseiro Iniciante 🎯', 1, 1, 10, ?, ?, ?)
    `).run(name.trim(), emailClean, hash, req.body.target_exam || null, req.body.study_goal || null, req.body.theme_preference || 'dark');

    const user = db.prepare('SELECT id, name, email, avatar, xp, level, streak_current, streak_max, daily_goal, target_exam, study_goal, theme_preference FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const emailClean = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak_current: user.streak_current,
        streak_max: user.streak_max,
        daily_goal: user.daily_goal,
        target_exam: user.target_exam,
        study_goal: user.study_goal,
        theme_preference: user.theme_preference || 'dark'
      }
    });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Current authenticated user (GET /api/auth/me)
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, avatar, xp, level, streak_current, streak_max, daily_goal, target_exam, study_goal, theme_preference FROM users WHERE id = ?').get(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Calculate accuracy
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_answered,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct
      FROM answers
      WHERE user_id = ?
    `).get(req.userId);

    res.json({
      ...user,
      total_answered: stats.total_answered || 0,
      total_correct: stats.total_correct || 0,
      accuracy_rate: stats.total_answered > 0 ? Math.round((stats.total_correct / stats.total_answered) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Firebase / OAuth SSO Login (POST /api/auth/firebase)
router.post('/firebase', (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail do Firebase é obrigatório' });
    }

    const emailClean = email.trim().toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(emailClean);

    if (!user) {
      const randomPassword = bcrypt.hashSync(Math.random().toString(36), 10);
      const displayName = (name || emailClean.split('@')[0]).trim();
      const result = db.prepare(`
        INSERT INTO users (name, email, password_hash, avatar, xp, level, streak_current, streak_max, daily_goal)
        VALUES (?, ?, ?, ?, 50, 'Concurseiro Iniciante 🎯', 1, 1, 10)
      `).run(displayName, emailClean, randomPassword, avatar || null);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streak_current: user.streak_current,
        streak_max: user.streak_max,
        daily_goal: user.daily_goal,
        target_exam: user.target_exam,
        study_goal: user.study_goal,
        theme_preference: user.theme_preference || 'dark'
      }
    });
  } catch (error) {
    console.error('Error in /firebase auth:', error);
    res.status(500).json({ error: error.message });
  }
});

// Odin OAuth compatibility endpoint (POST /oauth/token)
router.post('/oauth/token', (req, res) => {
  const { username, email, password } = req.body;
  const targetEmail = (username || email || '').trim().toLowerCase();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail);
  if (!user || (password && !bcrypt.compareSync(password, user.password_hash))) {
    return res.status(401).json({ error: 'invalid_grant', error_description: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 2592000,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: user.level
    }
  });
});

module.exports = router;
