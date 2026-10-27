const express = require('express');
const router = express.Router();
const db = require('../db');
const { saveUserToRegistry } = require('../usersRegistry');

// User profile
router.get('/profile', (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.json({
        id: null,
        name: 'Visitante',
        email: null,
        xp: 0,
        level: 'Visitante',
        streak_current: 0,
        streak_max: 0,
        daily_goal: 10,
        target_exam: null,
        study_goal: null,
        theme_preference: 'dark',
        total_answered: 0,
        total_correct: 0,
        accuracy_rate: 0,
        is_guest: true
      });
    }

    const user = db.prepare('SELECT id, name, email, avatar, xp, level, streak_current, streak_max, daily_goal, target_exam, study_goal, theme_preference FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_answered,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct
      FROM answers
      WHERE user_id = ?
    `).get(userId);

    res.json({
      ...user,
      total_answered: stats.total_answered || 0,
      total_correct: stats.total_correct || 0,
      accuracy_rate: stats.total_answered > 0 ? Math.round((stats.total_correct / stats.total_answered) * 100) : 0,
      is_guest: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student profile & onboarding preferences (POST /api/user/onboarding & PUT /api/user/profile)
const updateProfileHandler = (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Faça login para salvar as preferências do perfil.' });
    }

    const { target_exam, study_goal, daily_goal, theme_preference, name } = req.body;

    const fields = [];
    const values = [];

    if (target_exam !== undefined) {
      fields.push('target_exam = ?');
      values.push(target_exam);
    }
    if (study_goal !== undefined) {
      fields.push('study_goal = ?');
      values.push(study_goal);
    }
    if (daily_goal !== undefined) {
      fields.push('daily_goal = ?');
      values.push(Number(daily_goal));
    }
    if (theme_preference !== undefined) {
      fields.push('theme_preference = ?');
      values.push(theme_preference);
    }
    if (name !== undefined && name.trim()) {
      fields.push('name = ?');
      values.push(name.trim());
    }

    if (fields.length > 0) {
      values.push(userId);
      db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const updatedUser = db.prepare('SELECT id, name, email, avatar, xp, level, streak_current, streak_max, daily_goal, target_exam, study_goal, theme_preference FROM users WHERE id = ?').get(userId);

    // Save to permanent registry
    saveUserToRegistry(updatedUser);

    res.json({
      success: true,
      message: 'Perfil do estudante configurado com sucesso!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
};

router.post('/onboarding', updateProfileHandler);
router.put('/profile', updateProfileHandler);
router.post('/profile', updateProfileHandler);

// Performance analytics by discipline (compatible with REA report: /api/performance)
router.get('/performance', (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.json([]);
    }

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

// Deep pedagogical analytics for the new Analytics View (GET /api/user/analytics)
router.get('/analytics', (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.json({
        is_guest: true,
        total_answered: 0,
        total_correct: 0,
        accuracy_rate: 0,
        disciplines: [],
        subjects: [],
        weak_spots: [],
        strong_spots: [],
        recommendations: []
      });
    }

    const user = db.prepare('SELECT id, name, xp, level, target_exam, study_goal FROM users WHERE id = ?').get(userId);

    // 1. Overall stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_answered,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct
      FROM answers
      WHERE user_id = ?
    `).get(userId);

    const totalAnswered = stats.total_answered || 0;
    const totalCorrect = stats.total_correct || 0;
    const accuracyRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    // 2. Discipline performance
    const disciplines = db.prepare(`
      SELECT 
        q.discipline,
        COUNT(a.id) as total,
        SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM questions q
      INNER JOIN answers a ON q.id = a.question_id
      WHERE a.user_id = ?
      GROUP BY q.discipline
      ORDER BY total DESC
    `).all(userId).map(d => {
      const acc = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
      let status = 'Regular ⚡';
      if (acc >= 75) status = 'Ponto Forte 🚀';
      else if (acc < 60) status = 'Requer Atenção ⚠️';
      return {
        discipline: d.discipline,
        total: d.total,
        correct: d.correct,
        accuracy: acc,
        status,
        is_weak: acc < 65
      };
    });

    // 3. Subject / Topic performance
    const subjects = db.prepare(`
      SELECT 
        q.subject,
        q.discipline,
        COUNT(a.id) as total,
        SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM questions q
      INNER JOIN answers a ON q.id = a.question_id
      WHERE a.user_id = ? AND q.subject IS NOT NULL AND q.subject != ''
      GROUP BY q.subject
      ORDER BY total DESC
      LIMIT 15
    `).all(userId).map(s => {
      const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      return {
        subject: s.subject,
        discipline: s.discipline,
        total: s.total,
        correct: s.correct,
        accuracy: acc,
        is_weak: acc < 60
      };
    });

    // 4. Identify weak spots & strong spots
    const weakSpots = disciplines.filter(d => d.is_weak).sort((a, b) => a.accuracy - b.accuracy);
    const strongSpots = disciplines.filter(d => d.accuracy >= 75).sort((a, b) => b.accuracy - a.accuracy);

    // 5. Recent 7 days trend
    const recentActivity = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = db.prepare(`
        SELECT COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct 
        FROM answers 
        WHERE user_id = ? AND date(created_at) = ?
      `).get(userId, dateStr);

      const dayTotal = dayData.total || 0;
      const dayCorrect = dayData.correct || 0;

      recentActivity.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        total: dayTotal,
        correct: dayCorrect,
        accuracy: dayTotal > 0 ? Math.round((dayCorrect / dayTotal) * 100) : 0
      });
    }

    res.json({
      is_guest: false,
      user_name: user?.name,
      target_exam: user?.target_exam,
      study_goal: user?.study_goal,
      total_answered: totalAnswered,
      total_correct: totalCorrect,
      accuracy_rate: accuracyRate,
      disciplines,
      subjects,
      weak_spots: weakSpots,
      strong_spots: strongSpots,
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Targeted Questions for Weakness Practice (GET /api/user/weakness_questions)
router.get('/weakness_questions', (req, res) => {
  try {
    const userId = req.userId;
    const { discipline } = req.query;

    let targetDiscipline = discipline;

    // If no discipline specified, automatically pick the student's weakest discipline
    if (!targetDiscipline && userId) {
      const worst = db.prepare(`
        SELECT q.discipline, COUNT(a.id) as total, SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM questions q
        INNER JOIN answers a ON q.id = a.question_id
        WHERE a.user_id = ?
        GROUP BY q.discipline
        ORDER BY (CAST(SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(a.id)) ASC
        LIMIT 1
      `).get(userId);
      if (worst) targetDiscipline = worst.discipline;
    }

    if (!targetDiscipline) targetDiscipline = 'Matemática e suas Tecnologias';

    // Prioritize questions from this discipline that the user has either errored or never resolved
    let questions;
    if (userId) {
      questions = db.prepare(`
        SELECT q.* 
        FROM questions q
        LEFT JOIN answers a ON q.id = a.question_id AND a.user_id = ?
        WHERE q.discipline = ? AND (a.id IS NULL OR a.is_correct = 0)
        ORDER BY RANDOM()
        LIMIT 10
      `).all(userId, targetDiscipline);
    } else {
      questions = db.prepare(`
        SELECT * FROM questions 
        WHERE discipline = ? 
        ORDER BY RANDOM() 
        LIMIT 10
      `).all(targetDiscipline);
    }

    const formatted = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]'),
      stats_distribution: JSON.parse(q.stats_distribution || '{}'),
      comments: JSON.parse(q.comments || '[]')
    }));

    res.json({
      discipline: targetDiscipline,
      count: formatted.length,
      questions: formatted
    });
  } catch (error) {
    console.error('Error fetching weakness questions:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
