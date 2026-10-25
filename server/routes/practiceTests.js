const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// List practice tests
router.get('/', (req, res) => {
  try {
    const { category, career, exam_type } = req.query;
    let query = 'SELECT * FROM practice_tests WHERE 1=1';
    const params = [];
    if (category && category !== 'all') {
      query += ' AND (category = ? OR career = ?)';
      params.push(category, category);
    }
    if (career && career !== 'all') {
      query += ' AND career = ?';
      params.push(career);
    }
    if (exam_type && exam_type !== 'all') {
      query += ' AND exam_type = ?';
      params.push(exam_type);
    }
    query += ' ORDER BY created_at DESC';
    const tests = db.prepare(query).all(...params);
    const formatted = tests.map(t => ({
      ...t,
      question_ids: JSON.parse(t.question_ids || '[]'),
      total_questions: JSON.parse(t.question_ids || '[]').length
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single practice test with question objects
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const test = db.prepare('SELECT * FROM practice_tests WHERE id = ?').get(id);
    if (!test) return res.status(404).json({ error: 'Simulado não encontrado' });

    const qids = JSON.parse(test.question_ids || '[]');
    let questions = [];

    if (qids.length > 0) {
      const placeholders = qids.map(() => '?').join(',');
      const rows = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...qids);
      questions = rows.map(r => ({
        ...r,
        options: JSON.parse(r.options || '[]'),
        stats_distribution: JSON.parse(r.stats_distribution || '{}'),
        comments: JSON.parse(r.comments || '[]')
      }));
    }

    res.json({
      ...test,
      question_ids: qids,
      questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create custom practice test
router.post('/create', (req, res) => {
  try {
    const { title, description, time_limit_minutes = 60, discipline, count = 5 } = req.body;
    let qQuery = 'SELECT id FROM questions';
    const params = [];

    if (discipline && discipline !== 'all') {
      qQuery += ' WHERE discipline = ?';
      params.push(discipline);
    }
    qQuery += ' ORDER BY RANDOM() LIMIT ?';
    params.push(Number(count));

    const selectedQuestions = db.prepare(qQuery).all(...params).map(r => r.id);

    if (selectedQuestions.length === 0) {
      return res.status(400).json({ error: 'Nenhuma questão disponível para os critérios' });
    }

    const testId = `pt-${uuidv4().substring(0, 8)}`;
    db.prepare(`
      INSERT INTO practice_tests (id, title, description, time_limit_minutes, question_ids)
      VALUES (?, ?, ?, ?, ?)
    `).run(testId, title || 'Simulado Personalizado', description || 'Gerado sob medida no QLingo', Number(time_limit_minutes), JSON.stringify(selectedQuestions));

    res.json({ success: true, id: testId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FLUXO 4: Responder questão individual durante tentativa (api/ils/practice_tests/attempts/{ATTEMPT_ID}/questions/{QUESTION_ID})
router.post('/attempts/:attempt_id/questions/:question_id', (req, res) => {
  try {
    const { attempt_id, question_id } = req.params;
    const { answer } = req.body;

    const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(Number(question_id));
    if (!q) return res.status(404).json({ error: 'Questão não encontrada' });

    const is_correct = answer && answer.trim().toUpperCase() === q.right_answer.trim().toUpperCase();

    res.json({
      success: true,
      attempt_id,
      question_id: Number(question_id),
      selected_answer: answer,
      is_correct,
      right_answer: q.right_answer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit / complete practice test attempt
router.post('/attempts/:id/complete', (req, res) => {
  try {
    const practice_test_id = req.params.id;
    const { answers = {} } = req.body; // { question_id: selected_answer }
    const userId = req.userId || 1;

    const test = db.prepare('SELECT * FROM practice_tests WHERE id = ?').get(practice_test_id);
    if (!test) return res.status(404).json({ error: 'Simulado não encontrado' });

    const qids = JSON.parse(test.question_ids || '[]');
    let correctCount = 0;
    const resultDetails = [];
    const disciplineStats = {};

    for (const qid of qids) {
      const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(qid);
      if (!q) continue;

      const userAns = answers[qid] || null;
      const isCorrect = userAns && userAns.trim().toUpperCase() === q.right_answer.trim().toUpperCase();

      if (isCorrect) {
        correctCount++;
      } else {
        // Add to user's wrong notebook
        db.prepare('INSERT OR IGNORE INTO notebook_questions (notebook_id, question_id) VALUES (?, ?)').run('nb-caderno-erros', qid);
      }

      // Record answer with user_id
      if (userAns) {
        db.prepare('INSERT INTO answers (user_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)')
          .run(userId, qid, userAns, isCorrect ? 1 : 0);
      }

      // Discipline tracking
      const disc = q.discipline || 'Geral';
      if (!disciplineStats[disc]) {
        disciplineStats[disc] = { total: 0, correct: 0 };
      }
      disciplineStats[disc].total++;
      if (isCorrect) disciplineStats[disc].correct++;

      resultDetails.push({
        question_id: qid,
        statement: q.statement,
        discipline: disc,
        user_answer: userAns,
        right_answer: q.right_answer,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    }

    const total = qids.length;
    const score = total > 0 ? (correctCount / total) * 100 : 0;
    const cutScore = test.cut_score || 65;
    const passed = Math.round(score) >= cutScore;
    const attemptId = `att-${uuidv4().substring(0, 8)}`;

    // Discipline breakdown
    const breakdown = Object.entries(disciplineStats).map(([discipline, st]) => {
      const pct = Math.round((st.correct / st.total) * 100);
      return {
        discipline,
        total: st.total,
        correct: st.correct,
        percentage: pct,
        status: pct >= 75 ? 'Ponto Forte 🚀' : pct >= 50 ? 'Regular ⚡' : 'Requer Revisão ⚠️'
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // Pedagogical Diagnosis
    let diagnosis = 'Simulado finalizado com sucesso!';
    if (breakdown.length > 0) {
      const best = breakdown[0];
      const worst = breakdown[breakdown.length - 1];
      if (best.percentage >= 70 && worst.percentage < 60) {
        diagnosis = `Você demonstrou excelente domínio em ${best.discipline} (${best.percentage}% de acertos). Seu maior foco de estudo agora deve ser ${worst.discipline} (${worst.percentage}% de acertos). Suas questões erradas já estão no seu Caderno de Erros!`;
      } else if (passed) {
        diagnosis = `Excelente consistência em todas as matérias! Seu rendimento de ${Math.round(score)}% ultrapassa a nota de corte estimada (${cutScore}%). Continue mantendo o ritmo de resolução!`;
      } else {
        diagnosis = `Você atingiu ${Math.round(score)}% de aproveitamento (nota de corte: ${cutScore}%). Revise as matérias com status 'Requer Revisão' no gabarito abaixo e refaça as questões erradas.`;
      }
    }

    // Save attempt
    db.prepare(`
      INSERT INTO practice_test_attempts (id, user_id, practice_test_id, score, total_questions, correct_answers, answers_data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(attemptId, userId, practice_test_id, score, total, correctCount, JSON.stringify(resultDetails));

    // Award XP to user
    const xpBonus = correctCount * 25 + 50; // Completion bonus
    const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(userId);
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpBonus, userId);

    res.json({
      attempt_id: attemptId,
      score: Math.round(score),
      cut_score: cutScore,
      passed_cut_score: passed,
      total_questions: total,
      correct_answers: correctCount,
      wrong_answers: total - correctCount,
      xp_earned: xpBonus,
      discipline_breakdown: breakdown,
      pedagogical_diagnosis: diagnosis,
      details: resultDetails
    });
  } catch (error) {
    console.error('Error completing attempt:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
