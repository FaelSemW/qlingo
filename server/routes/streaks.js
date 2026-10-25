const express = require('express');
const router = express.Router();
const db = require('../db');

// Get current streak status and weekly calendar activity
router.get('/', (req, res) => {
  try {
    const userId = req.userId || 1;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || {
      streak_current: 1,
      streak_max: 1,
      daily_goal: 10,
      xp: 50,
      level: 'Concurseiro Focado 🔥'
    };

    // Calculate answers today for this user
    const todayAnswers = db.prepare(`
      SELECT COUNT(*) as count, 
             SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM answers 
      WHERE user_id = ? AND date(created_at) = date('now')
    `).get(userId);

    // Get last 7 days activity
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = db.prepare(`SELECT COUNT(*) as count FROM answers WHERE user_id = ? AND date(created_at) = ?`).get(userId, dateStr).count;
      
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      last7Days.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        count,
        completed: count >= (user.daily_goal / 2) // active day
      });
    }

    res.json({
      streak_current: user.streak_current,
      streak_max: user.streak_max,
      daily_goal: user.daily_goal,
      today_solved: todayAnswers.count || 0,
      today_correct: todayAnswers.correct || 0,
      xp: user.xp,
      level: user.level,
      weekly_activity: last7Days
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update daily goal
router.post('/goal', (req, res) => {
  try {
    const userId = req.userId || 1;
    const { daily_goal } = req.body;
    if (!daily_goal || daily_goal < 1) {
      return res.status(400).json({ error: 'Meta inválida' });
    }
    db.prepare('UPDATE users SET daily_goal = ? WHERE id = ?').run(Number(daily_goal), userId);
    res.json({ success: true, daily_goal: Number(daily_goal) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
