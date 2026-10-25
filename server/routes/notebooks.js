const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get all notebooks
router.get('/', (req, res) => {
  try {
    const userId = req.userId || 1;
    const notebooks = db.prepare(`
      SELECT n.*, COUNT(nq.question_id) as question_count
      FROM notebooks n
      LEFT JOIN notebook_questions nq ON n.id = nq.notebook_id
      WHERE n.user_id = ? OR n.user_id = 1
      GROUP BY n.id
      ORDER BY n.created_at ASC
    `).all(userId);

    res.json(notebooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific notebook with questions
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const notebook = db.prepare('SELECT * FROM notebooks WHERE id = ?').get(id);
    if (!notebook) return res.status(404).json({ error: 'Caderno não encontrado' });

    const questions = db.prepare(`
      SELECT q.*, 
        (SELECT selected_answer FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as last_user_answer,
        (SELECT is_correct FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as is_resolved_correct
      FROM questions q
      INNER JOIN notebook_questions nq ON q.id = nq.question_id
      WHERE nq.notebook_id = ?
      ORDER BY q.id ASC
    `).all(id);

    const formatted = questions.map(r => ({
      ...r,
      options: JSON.parse(r.options || '[]'),
      stats_distribution: JSON.parse(r.stats_distribution || '{}'),
      comments: JSON.parse(r.comments || '[]')
    }));

    res.json({
      ...notebook,
      questions: formatted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notebook
router.post('/', (req, res) => {
  try {
    const { name, color = '#3b82f6' } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do caderno obrigatório' });

    const id = `nb-${uuidv4().substring(0, 8)}`;
    db.prepare('INSERT INTO notebooks (id, name, color) VALUES (?, ?, ?)').run(id, name, color);

    res.json({ success: true, id, name, color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle question in notebook
router.post('/:id/toggle_question', (req, res) => {
  try {
    const { id } = req.params;
    const { question_id } = req.body;

    const exists = db.prepare('SELECT 1 FROM notebook_questions WHERE notebook_id = ? AND question_id = ?').get(id, Number(question_id));

    if (exists) {
      db.prepare('DELETE FROM notebook_questions WHERE notebook_id = ? AND question_id = ?').run(id, Number(question_id));
      res.json({ success: true, included: false });
    } else {
      db.prepare('INSERT INTO notebook_questions (notebook_id, question_id) VALUES (?, ?)').run(id, Number(question_id));
      res.json({ success: true, included: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Weekly errors endpoint (from REA report: api/mobile/notebooks/weekly-errors/detail)
router.get('/weekly_errors', (req, res) => {
  try {
    const userId = req.userId || 1;
    const errors = db.prepare(`
      SELECT DISTINCT q.*, a.created_at as answered_at
      FROM questions q
      INNER JOIN answers a ON q.id = a.question_id
      WHERE a.user_id = ? 
        AND a.is_correct = 0 
        AND a.created_at >= datetime('now', '-7 days')
      ORDER BY a.created_at DESC
    `).all(userId);

    const formatted = errors.map(r => ({
      ...r,
      options: JSON.parse(r.options || '[]'),
      stats_distribution: JSON.parse(r.stats_distribution || '{}'),
      comments: JSON.parse(r.comments || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
