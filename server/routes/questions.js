const express = require('express');
const router = express.Router();
const db = require('../db');

// Check limits endpoint (from REA report) - always unlimited for QLingo!
router.get('/check_limits_app', (req, res) => {
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

function formatQuestionRow(r) {
  const parsedOptions = JSON.parse(r.options || '[]');
  const parsedStats = JSON.parse(r.stats_distribution || '{}');
  const parsedComments = JSON.parse(r.comments || '[]');

  return {
    ...r,
    statement: r.statement,
    alternatives: parsedOptions,
    options: parsedOptions,
    resolution: r.explanation,
    explanation: r.explanation,
    is_correct: r.is_resolved_correct !== null ? r.is_resolved_correct === 1 : null,
    correct_answer: r.right_answer,
    right_answer: r.right_answer,
    examining_board: r.examining_board,
    institute: r.institute,
    commentaries: parsedComments,
    comments: parsedComments,
    statistics: parsedStats,
    stats_distribution: parsedStats
  };
}

// GET /api/questions/daily - Desafio Diário com questões rotativas todo dia
router.get('/daily', (req, res) => {
  try {
    const { career = 'all' } = req.query;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    
    // Seed numérico único da data para rotacionar todo dia
    const daySeed = (now.getFullYear() * 1000) + ((now.getMonth() + 1) * 31) + now.getDate();

    let query = `
      SELECT q.*, 
        (SELECT selected_answer FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as last_user_answer,
        (SELECT is_correct FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as is_resolved_correct
      FROM questions q
      WHERE 1=1
    `;
    const params = [];

    if (career && career !== 'all') {
      const cUpper = career.toUpperCase();
      if (cUpper.includes('ENEM')) {
        query += " AND q.exam_type = 'ENEM'";
      } else if (cUpper.includes('OAB')) {
        query += " AND q.exam_type = 'OAB'";
      } else if (cUpper.includes('POLIC') || cUpper.includes('PF') || cUpper.includes('PRF')) {
        query += " AND (q.career LIKE '%Polícia%' OR q.career LIKE '%Policia%' OR q.career LIKE '%Policial%')";
      } else if (cUpper.includes('TRIBUNAL') || cUpper.includes('TJ') || cUpper.includes('TRF')) {
        query += " AND (q.career LIKE '%Tribunal%' OR q.career LIKE '%Tribunais%')";
      } else if (cUpper.includes('FISCAL') || cUpper.includes('RECEITA')) {
        query += " AND (q.career LIKE '%Fiscal%' OR q.career LIKE '%Receita%')";
      } else if (cUpper.includes('PREVIDENCI') || cUpper.includes('INSS')) {
        query += " AND (q.career LIKE '%Previdenci%' OR q.career LIKE '%INSS%')";
      } else if (cUpper.includes('BANCO') || cUpper.includes('BANC')) {
        query += " AND (q.career LIKE '%Banc%' OR q.career LIKE '%Banco%')";
      } else {
        query += " AND (q.career = ? OR q.career LIKE ?)";
        params.push(career, `%${career}%`);
      }
    }

    const allMatching = db.prepare(query).all(...params);
    const count = allMatching.length;
    
    let selected = [];
    const usedIds = new Set();
    const take = 5;

    if (count > 0) {
      const start = (daySeed * 17) % count;
      for (let step = 0; step < count && selected.length < Math.min(take, count); step++) {
        const idx = (start + (step * 23)) % count;
        const q = allMatching[idx];
        if (!usedIds.has(q.id)) {
          usedIds.add(q.id);
          selected.push(q);
        }
      }
    }

    // Se faltarem questões para completar 5 (ex: filtros muito específicos), preenche com outras do banco
    if (selected.length < take) {
      const needed = take - selected.length;
      const fallbackRows = db.prepare(`
        SELECT q.*, 
          (SELECT selected_answer FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as last_user_answer,
          (SELECT is_correct FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as is_resolved_correct
        FROM questions q
        WHERE q.id NOT IN (${selected.length > 0 ? selected.map(q => q.id).join(',') : '0'})
        ORDER BY RANDOM() LIMIT ?
      `).all(needed);
      selected = selected.concat(fallbackRows);
    }

    res.json({
      date: dateStr,
      career,
      total: selected.length,
      questions: selected.map(formatQuestionRow),
      message: `Desafio Diário (${dateStr}) com 5 questões rotativas para ${career}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List questions with filters
router.get('/', (req, res) => {
  try {
    const { discipline, examining_board, year, difficulty, search, status, career, exam_type, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT q.*, 
        (SELECT selected_answer FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as last_user_answer,
        (SELECT is_correct FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as is_resolved_correct
      FROM questions q
      WHERE 1=1
    `;
    const params = [];

    if (exam_type && exam_type !== 'all') {
      query += ` AND q.exam_type = ?`;
      params.push(exam_type);
    }
    if (career && career !== 'all') {
      query += ` AND q.career = ?`;
      params.push(career);
    }
    if (discipline && discipline !== 'all') {
      query += ` AND q.discipline = ?`;
      params.push(discipline);
    }
    if (examining_board && examining_board !== 'all') {
      query += ` AND q.examining_board = ?`;
      params.push(examining_board);
    }
    if (year && year !== 'all') {
      query += ` AND q.year = ?`;
      params.push(Number(year));
    }
    if (difficulty && difficulty !== 'all') {
      query += ` AND q.difficulty = ?`;
      params.push(difficulty);
    }
    if (search) {
      query += ` AND (q.statement LIKE ? OR q.institute LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status === 'resolved') {
      query += ` AND q.id IN (SELECT DISTINCT question_id FROM answers)`;
    } else if (status === 'unresolved') {
      query += ` AND q.id NOT IN (SELECT DISTINCT question_id FROM answers)`;
    } else if (status === 'wrong') {
      query += ` AND q.id IN (SELECT question_id FROM answers WHERE is_correct = 0)`;
    }

    // Clone for count
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countStmt = db.prepare(countQuery);
    const total = countStmt.get(...params).total;

    query += ` ORDER BY q.id ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    const questions = rows.map(formatQuestionRow);

    // Filter metadata
    const disciplines = db.prepare('SELECT DISTINCT discipline FROM questions ORDER BY discipline ASC').all().map(r => r.discipline);
    const boards = db.prepare('SELECT DISTINCT examining_board FROM questions ORDER BY examining_board ASC').all().map(r => r.examining_board);
    const years = db.prepare('SELECT DISTINCT year FROM questions ORDER BY year DESC').all().map(r => r.year);
    const careers = db.prepare('SELECT DISTINCT career FROM questions WHERE career IS NOT NULL ORDER BY career ASC').all().map(r => r.career);
    const examTypes = db.prepare('SELECT DISTINCT exam_type FROM questions WHERE exam_type IS NOT NULL ORDER BY exam_type ASC').all().map(r => r.exam_type);

    res.json({
      questions,
      current_page: Math.floor(Number(offset) / Number(limit)) + 1,
      total_count: total,
      total,
      filters: {
        disciplines,
        boards,
        years,
        careers,
        examTypes
      }
    });
  } catch (error) {
    console.error('Error in GET /questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// FLUXO 3: Download offline de questões (api/questions_downloads)
router.get('/downloads', (req, res) => {
  try {
    const { page = 1, per_page = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(per_page);
    const rows = db.prepare('SELECT * FROM questions ORDER BY id ASC LIMIT ? OFFSET ?').all(Number(per_page), offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;

    const formatted = rows.map(r => ({
      ...r,
      alternatives: JSON.parse(r.options || '[]'),
      options: JSON.parse(r.options || '[]'),
      resolution: r.explanation,
      correct_answer: r.right_answer,
      statistics: JSON.parse(r.stats_distribution || '{}')
    }));

    res.json({
      questions: formatted,
      current_page: Number(page),
      total_count: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single question
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT q.*,
        (SELECT selected_answer FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as last_user_answer,
        (SELECT is_correct FROM answers WHERE question_id = q.id ORDER BY id DESC LIMIT 1) as is_resolved_correct
      FROM questions q
      WHERE q.id = ?
    `);
    const row = stmt.get(Number(id));

    if (!row) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    const question = {
      ...row,
      options: JSON.parse(row.options || '[]'),
      stats_distribution: JSON.parse(row.stats_distribution || '{}'),
      comments: JSON.parse(row.comments || '[]')
    };

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve question (submit answer)
router.post('/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ error: 'Resposta não informada' });
    }

    const questionStmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    const question = questionStmt.get(Number(id));

    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }

    const is_correct = question.right_answer.trim().toUpperCase() === answer.trim().toUpperCase() ? 1 : 0;
    const userId = req.userId || 1;

    // Record answer for specific user
    const insertAnswer = db.prepare('INSERT INTO answers (user_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)');
    insertAnswer.run(userId, Number(id), answer, is_correct);

    // If incorrect, automatically add to "Caderno de Erros"
    if (!is_correct) {
      db.prepare('INSERT OR IGNORE INTO notebook_questions (notebook_id, question_id) VALUES (?, ?)').run('nb-caderno-erros', Number(id));
    }

    // Award XP and update streak for user
    const xp_earned = is_correct ? 15 : 5;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    let newXp = (user?.xp || 0) + xp_earned;
    let newLevel = user?.level || 'Iniciante';
    if (newXp > 1200) newLevel = 'Mestre dos Concursos 🏆';
    else if (newXp > 600) newLevel = 'Concurseiro Avançado ⚡';
    else if (newXp > 250) newLevel = 'Concurseiro Focado 🔥';

    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXp, newLevel, userId);

    // Today's solved count for this user
    const todayCountStmt = db.prepare(`SELECT COUNT(*) as count FROM answers WHERE user_id = ? AND date(created_at) = date('now')`);
    const todaySolved = todayCountStmt.get(userId).count;

    res.json({
      success: true,
      is_correct: is_correct === 1,
      selected_answer: answer,
      right_answer: question.right_answer,
      explanation: question.explanation,
      stats_distribution: JSON.parse(question.stats_distribution || '{}'),
      xp_earned,
      total_xp: newXp,
      level: newLevel,
      today_solved: todaySolved,
      daily_goal: user?.daily_goal || 10
    });
  } catch (error) {
    console.error('Error resolving question:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment to question
router.post('/:id/commentaries', (req, res) => {
  try {
    const { id } = req.params;
    const { user = 'Estudante QLingo', text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Texto do comentário obrigatório' });
    }

    const questionStmt = db.prepare('SELECT comments FROM questions WHERE id = ?');
    const row = questionStmt.get(Number(id));
    if (!row) return res.status(404).json({ error: 'Questão não encontrada' });

    const comments = JSON.parse(row.comments || '[]');
    const newComment = {
      user,
      text: text.trim(),
      likes: 0,
      date: new Date().toISOString().split('T')[0]
    };
    comments.push(newComment);

    db.prepare('UPDATE questions SET comments = ? WHERE id = ?').run(JSON.stringify(comments), Number(id));

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import questions in batch (Accessible study helper)
router.post('/import', (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Array de questões inválido' });
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO questions (id, discipline, examining_board, institute, year, difficulty, statement, options, right_answer, explanation, stats_distribution, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    for (const q of questions) {
      const nextId = q.id || (db.prepare('SELECT MAX(id) as maxId FROM questions').get().maxId || 100) + 1;
      insertStmt.run(
        nextId,
        q.discipline || 'Geral',
        q.examining_board || 'Diversas',
        q.institute || 'Diversos',
        q.year || new Date().getFullYear(),
        q.difficulty || 'Médio',
        q.statement || '',
        typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []),
        q.right_answer || 'A',
        q.explanation || 'Gabarito oficial.',
        typeof q.stats_distribution === 'string' ? q.stats_distribution : JSON.stringify(q.stats_distribution || {}),
        typeof q.comments === 'string' ? q.comments : JSON.stringify(q.comments || [])
      );
      imported++;
    }

    res.json({ success: true, count: imported });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FLUXO 5: Estatísticas da questão (api/questions/{id}/statistics)
router.get('/:id/statistics', (req, res) => {
  try {
    const { id } = req.params;
    const q = db.prepare('SELECT stats_distribution FROM questions WHERE id = ?').get(Number(id));
    if (!q) return res.status(404).json({ error: 'Questão não encontrada' });

    res.json({
      question_id: Number(id),
      distribution: JSON.parse(q.stats_distribution || '{}'),
      total_votes: 1420
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FLUXO 5: Comentários de professores (api/questions/{id}/professor_commentaries_apps)
router.get('/:id/professor_commentaries_apps', (req, res) => {
  try {
    const { id } = req.params;
    const q = db.prepare('SELECT explanation FROM questions WHERE id = ?').get(Number(id));
    if (!q) return res.status(404).json({ error: 'Questão não encontrada' });

    res.json({
      question_id: Number(id),
      has_video: false,
      text_commentary: q.explanation,
      professor: {
        name: "Equipe Pedagógica QLingo",
        avatar: null,
        title: "Especialista em Concursos Públicos"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FLUXO 5: Reportar erro (api/question_errors)
router.post('/errors/report', (req, res) => {
  res.json({ success: true, message: "Relatório de erro recebido com sucesso!" });
});

// FLUXO 5: Curtir comentário (api/questions/{id}/commentaries/{comment_id}/update_like)
router.post('/:id/commentaries/:comment_id/update_like', (req, res) => {
  res.json({ success: true, liked: true });
});

module.exports = router;
