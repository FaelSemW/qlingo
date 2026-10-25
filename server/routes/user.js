const express = require('express');
const router = express.Router();
const db = require('../db');

// User profile
router.get('/profile', (req, res) => {
  try {
    const userId = req.userId || 1;
    const user = db.prepare('SELECT id, name, email, xp, level, streak_current, streak_max, daily_goal FROM users WHERE id = ?').get(userId);
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_answered,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct
      FROM answers
      WHERE user_id = ?
    `).get(userId);

    res.json({
      ...(user || {}),
      total_answered: stats.total_answered || 0,
      total_correct: stats.total_correct || 0,
      accuracy_rate: stats.total_answered > 0 ? Math.round((stats.total_correct / stats.total_answered) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Performance analytics by discipline (from REA report: api/performance & api/user_filter_performances2)
router.get('/performance', (req, res) => {
  try {
    const userId = req.userId || 1;
    const disciplines = db.prepare(`
      SELECT 
        q.discipline,
        COUNT(a.id) as total_answers,
        SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
      FROM questions q
      INNER JOIN answers a ON q.id = a.question_id
      WHERE a.user_id = ?
      GROUP BY q.discipline
      ORDER BY total_answers DESC
    `).all(userId);

    const formatted = disciplines.map(d => ({
      discipline: d.discipline,
      total: d.total_answers,
      correct: d.correct_answers,
      accuracy: d.total_answers > 0 ? Math.round((d.correct_answers / d.total_answers) * 100) : 0
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
