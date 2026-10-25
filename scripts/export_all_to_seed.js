const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '../server/qlingo.sqlite');
const db = new DatabaseSync(dbPath);
const seedPath = path.join(__dirname, '../server/seed-data.js');

console.log('🔄 Exportando dados completos de qlingo.sqlite para seed-data.js...');

// 1. Questions
const questions = db.prepare(`
  SELECT id, discipline, subject, examining_board, institute, year, difficulty,
         statement, options, right_answer, explanation, stats_distribution,
         comments, career, exam_type
  FROM questions
  ORDER BY id ASC
`).all().map(q => ({
  id: q.id,
  discipline: q.discipline,
  subject: q.subject || q.discipline,
  examining_board: q.examining_board,
  institute: q.institute,
  year: q.year,
  difficulty: q.difficulty || 'Médio',
  statement: q.statement,
  options: q.options,
  right_answer: q.right_answer,
  explanation: q.explanation || '',
  stats_distribution: q.stats_distribution || '{}',
  comments: q.comments || '[]',
  career: q.career || 'Geral',
  exam_type: q.exam_type || 'CONCURSO'
}));

console.log(`Questões recuperadas: ${questions.length}`);

// 2. Practice Tests
const practice_tests = db.prepare(`
  SELECT id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute
  FROM practice_tests
  ORDER BY id ASC
`).all().map(pt => ({
  id: pt.id,
  title: pt.title,
  description: pt.description,
  time_limit_minutes: pt.time_limit_minutes,
  question_ids: JSON.parse(pt.question_ids),
  career: pt.career,
  category: pt.category,
  cut_score: pt.cut_score,
  examining_board: pt.examining_board,
  institute: pt.institute
}));

console.log(`Simulados recuperados: ${practice_tests.length}`);

// Preserva notebooks e flashcards do seed atual se existirem
let currentSeed = {};
try {
  currentSeed = require('../server/seed-data.js');
} catch (e) {
  console.warn('Aviso ao ler seed atual:', e.message);
}

const notebooks = currentSeed.notebooks || [
  { id: 'nb-1', name: 'Erros Recorrentes em Constitucional', color: '#ef4444', question_ids: [101] }
];

const flashcards = currentSeed.flashcards || [];

const outputObj = {
  questions,
  notebooks,
  practice_tests,
  flashcards
};

console.log('✍️ Gravando novo seed-data.js...');
const content = 'module.exports = ' + JSON.stringify(outputObj, null, 2) + ';\n';
fs.writeFileSync(seedPath, content, 'utf8');

console.log(`✅ seed-data.js atualizado com sucesso! (${(content.length / 1024 / 1024).toFixed(2)} MB)`);
