const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get flashcards deck
router.get('/deck', (req, res) => {
  try {
    const { discipline } = req.query;
    let query = 'SELECT * FROM flashcards';
    const params = [];

    if (discipline && discipline !== 'all') {
      query += ' WHERE discipline = ?';
      params.push(discipline);
    }
    query += ' ORDER BY last_reviewed ASC, review_count ASC';

    const cards = db.prepare(query).all(...params);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit review answer
router.post('/answers', (req, res) => {
  try {
    const { id, rating } = req.body; // rating: 'easy' | 'good' | 'hard'
    if (!id) return res.status(400).json({ error: 'ID do flashcard obrigatório' });

    const card = db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id);
    if (!card) return res.status(404).json({ error: 'Flashcard não encontrado' });

    let easeFactor = card.ease_factor || 2.5;
    if (rating === 'easy') easeFactor += 0.15;
    if (rating === 'hard') easeFactor = Math.max(1.3, easeFactor - 0.2);

    db.prepare(`
      UPDATE flashcards 
      SET review_count = review_count + 1, ease_factor = ?, last_reviewed = datetime('now')
      WHERE id = ?
    `).run(easeFactor, id);

    // Award XP
    const profile = db.prepare('SELECT xp FROM user_profile WHERE id = 1').get();
    db.prepare('UPDATE user_profile SET xp = xp + 5 WHERE id = 1').run();

    res.json({ success: true, ease_factor: easeFactor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom flashcard
router.post('/create', (req, res) => {
  try {
    const { discipline, front, back } = req.body;
    if (!front || !back) {
      return res.status(400).json({ error: 'Frente e verso são obrigatórios' });
    }

    const id = `fc-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO flashcards (id, discipline, front, back)
      VALUES (?, ?, ?, ?)
    `).run(id, discipline || 'Geral', front, back);

    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
