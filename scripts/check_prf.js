const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('c:/Users/Faelzinhown/Desktop/Projeto Qlingo OC/qlingo/server/qlingo.sqlite');

const rows = db.prepare(`
  SELECT id, title, time_limit_minutes, json_array_length(question_ids) as len, question_ids
  FROM practice_tests 
  WHERE title LIKE '%PRF%' OR id LIKE '%prf%'
`).all();

console.log('Simulados PRF no banco:');
for (const r of rows) {
  console.log(`- ${r.title} (${r.id}): ${r.len} questões`);
}

// Vamos ver as questões da PRF no banco
const qPrf = db.prepare(`
  SELECT id, discipline, year, SUBSTR(statement, 1, 60) as stmt
  FROM questions
  WHERE institute LIKE '%PRF%' OR institute LIKE '%Rodoviária%' OR statement LIKE '%PRF%' OR examining_board LIKE '%CEBRASPE%' AND career = 'Carreiras Policiais'
  LIMIT 20
`).all();

console.log(`\nTotal de questões encontradas: ${qPrf.length}`);
for (const q of qPrf) {
  console.log(`[#${q.id}] ${q.discipline} (${q.year}): ${q.stmt}`);
}
