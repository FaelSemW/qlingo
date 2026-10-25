const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const seedData = require('./seed-data');

const localMasterDb = 'D:/questions/database/qlingo_master.sqlite';
const dbPath = (fs.existsSync('D:/questions') && fs.existsSync(localMasterDb))
  ? localMasterDb
  : path.join(__dirname, 'qlingo.sqlite');
console.log(`[QLingo DB] Conectado ao banco: ${dbPath}`);
const db = new DatabaseSync(dbPath);

// Create schema based on REA discoveries and QLingo enhancements
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    xp INTEGER DEFAULT 150,
    level TEXT DEFAULT 'Concurseiro Focado 🔥',
    streak_current INTEGER DEFAULT 5,
    streak_max INTEGER DEFAULT 12,
    last_activity_date TEXT,
    daily_goal INTEGER DEFAULT 10,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    discipline TEXT NOT NULL,
    subject TEXT,
    examining_board TEXT NOT NULL,
    institute TEXT NOT NULL,
    year INTEGER NOT NULL,
    difficulty TEXT DEFAULT 'Médio',
    statement TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array
    right_answer TEXT NOT NULL,
    explanation TEXT,
    stats_distribution TEXT, -- JSON object
    comments TEXT, -- JSON array
    career TEXT DEFAULT 'Geral',
    exam_type TEXT DEFAULT 'CONCURSO',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 1,
    question_id INTEGER NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (question_id) REFERENCES questions (id)
  );

  CREATE TABLE IF NOT EXISTS notebooks (
    id TEXT PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS notebook_questions (
    notebook_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    PRIMARY KEY (notebook_id, question_id),
    FOREIGN KEY (notebook_id) REFERENCES notebooks (id),
    FOREIGN KEY (question_id) REFERENCES questions (id)
  );

  CREATE TABLE IF NOT EXISTS practice_tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER DEFAULT 60,
    question_ids TEXT NOT NULL, -- JSON array
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS practice_test_attempts (
    id TEXT PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    practice_test_id TEXT NOT NULL,
    score REAL NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    answers_data TEXT, -- JSON
    completed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    discipline TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    review_count INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    last_reviewed TEXT
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT DEFAULT 'Estudante Focado',
    streak_current INTEGER DEFAULT 5,
    streak_max INTEGER DEFAULT 14,
    last_streak_date TEXT,
    daily_goal INTEGER DEFAULT 10,
    xp INTEGER DEFAULT 450,
    level TEXT DEFAULT 'Concurseiro Dedicado',
    is_premium INTEGER DEFAULT 1 -- SEMPRE 1 (Monetização 100% Removida)
  );
`);

// Safe column migrations for existing databases
try { db.exec('ALTER TABLE answers ADD COLUMN user_id INTEGER DEFAULT 1;'); } catch (e) {}
try { db.exec('ALTER TABLE notebooks ADD COLUMN user_id INTEGER DEFAULT 1;'); } catch (e) {}
try { db.exec('ALTER TABLE practice_test_attempts ADD COLUMN user_id INTEGER DEFAULT 1;'); } catch (e) {}
try { db.exec("ALTER TABLE questions ADD COLUMN career TEXT DEFAULT 'Geral';"); } catch (e) {}
try { db.exec("ALTER TABLE questions ADD COLUMN exam_type TEXT DEFAULT 'CONCURSO';"); } catch (e) {}
try { db.exec("ALTER TABLE questions ADD COLUMN subject TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE practice_tests ADD COLUMN career TEXT DEFAULT 'Geral';"); } catch (e) {}
try { db.exec("ALTER TABLE practice_tests ADD COLUMN category TEXT DEFAULT 'Geral';"); } catch (e) {}
try { db.exec("ALTER TABLE practice_tests ADD COLUMN cut_score INTEGER DEFAULT 65;"); } catch (e) {}
try { db.exec("ALTER TABLE practice_tests ADD COLUMN examining_board TEXT;"); } catch (e) {}
try { db.exec("ALTER TABLE practice_tests ADD COLUMN institute TEXT;"); } catch (e) {}

// Ensure default demo user (id: 1) exists FIRST before any foreign key references
const bcrypt = require('bcryptjs');
const demoHash = bcrypt.hashSync('123456', 10);
db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, password_hash, xp, level, streak_current, streak_max, daily_goal)
  VALUES (1, 'Estudante Focado', 'estudante@qlingo.com', ?, 320, 'Concurseiro Dedicado 🔥', 5, 12, 10)
`).run(demoHash);

// Populate initial data if empty or incomplete
const countStmt = db.prepare('SELECT COUNT(*) as count FROM questions');
const questionCount = countStmt.get().count;

if (questionCount < 1000) {
  console.log('[QLingo DB] Sincronizando mega banco de dados com questões reais (ENEM, Concursos, OAB)...');
  
  const insertQuestion = db.prepare(`
    INSERT OR REPLACE INTO questions (id, discipline, subject, examining_board, institute, year, difficulty, statement, options, right_answer, explanation, stats_distribution, comments, career, exam_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of seedData.questions) {
    insertQuestion.run(
      q.id,
      q.discipline,
      q.subject || q.discipline,
      q.examining_board,
      q.institute,
      q.year,
      q.difficulty || 'Médio',
      q.statement,
      typeof q.options === 'string' ? q.options : JSON.stringify(q.options),
      q.right_answer,
      q.explanation,
      typeof q.stats_distribution === 'string' ? q.stats_distribution : JSON.stringify(q.stats_distribution || {}),
      typeof q.comments === 'string' ? q.comments : JSON.stringify(q.comments || []),
      q.career || 'Geral',
      q.exam_type || 'CONCURSO'
    );
  }

  const insertNotebook = db.prepare(`
    INSERT OR IGNORE INTO notebooks (id, user_id, name, color) VALUES (?, 1, ?, ?)
  `);
  const insertNotebookQ = db.prepare(`
    INSERT OR IGNORE INTO notebook_questions (notebook_id, question_id) VALUES (?, ?)
  `);

  for (const nb of seedData.notebooks) {
    insertNotebook.run(nb.id, nb.name, nb.color);
    if (nb.question_ids && nb.question_ids.length > 0) {
      for (const qid of nb.question_ids) {
        insertNotebookQ.run(nb.id, qid);
      }
    }
  }

  const insertPT = db.prepare(`
    INSERT OR REPLACE INTO practice_tests (id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const pt of seedData.practice_tests) {
    insertPT.run(
      pt.id, 
      pt.title, 
      pt.description, 
      pt.time_limit_minutes, 
      typeof pt.question_ids === 'string' ? pt.question_ids : JSON.stringify(pt.question_ids),
      pt.career || 'Geral',
      pt.category || 'Geral',
      pt.cut_score || 65,
      pt.examining_board || 'Diversas',
      pt.institute || 'Nacional'
    );
  }

  const insertFC = db.prepare(`
    INSERT OR IGNORE INTO flashcards (id, discipline, front, back)
    VALUES (?, ?, ?, ?)
  `);

  for (const fc of seedData.flashcards) {
    insertFC.run(fc.id, fc.discipline, fc.front, fc.back);
  }

  // Profile default
  db.exec(`
    INSERT OR IGNORE INTO user_profile (id, name, streak_current, streak_max, last_streak_date, daily_goal, xp, level, is_premium)
    VALUES (1, 'Futuro Aprovado', 5, 14, date('now'), 10, 520, 'Concurseiro Dedicado 🔥', 1)
  `);

  console.log('[QLingo DB] Mega banco sincronizado com sucesso!');
}

// Ensure practice tests are always up to date (all 52 tests, including ENEM 2009-2026 with exactly 90 questions)
try {
  const hasIncompleteEnem = db.prepare(`
    SELECT COUNT(*) as c FROM practice_tests 
    WHERE id LIKE 'simulado-enem-20%' AND id NOT LIKE '%express%' AND json_array_length(question_ids) < 90
  `).get()?.c > 0;
  const ptCount = db.prepare('SELECT COUNT(*) as count FROM practice_tests').get().count;

  if ((ptCount < 50 || hasIncompleteEnem) && seedData.practice_tests && seedData.practice_tests.length > 0) {
    const insertPT = db.prepare(`
      INSERT OR REPLACE INTO practice_tests (id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const pt of seedData.practice_tests) {
      insertPT.run(
        pt.id, 
        pt.title, 
        pt.description, 
        pt.time_limit_minutes, 
        typeof pt.question_ids === 'string' ? pt.question_ids : JSON.stringify(pt.question_ids),
        pt.career || 'Geral',
        pt.category || 'Geral',
        pt.cut_score || 65,
        pt.examining_board || 'Diversas',
        pt.institute || 'Nacional'
      );
    }
    console.log('[QLingo DB] Practice tests verificados e sincronizados com 90 questões cada!');
  }
} catch (e) {
  console.warn('[QLingo DB] Aviso ao verificar practice_tests:', e.message);
}

module.exports = db;
