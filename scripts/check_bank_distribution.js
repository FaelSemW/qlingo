const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('D:/questions/database/qlingo_master.sqlite');

console.log('--- DISTRIBUIÇÃO DO BANCO POR CARREIRA E EXAM_TYPE ---');
const careers = db.prepare('SELECT career, exam_type, COUNT(*) as c FROM questions GROUP BY career, exam_type').all();
console.table(careers);

console.log('\n--- QUESTÕES DO ENEM POR DISCIPLINA ---');
const enemDisc = db.prepare("SELECT discipline, COUNT(*) as c FROM questions WHERE exam_type = 'ENEM' GROUP BY discipline").all();
console.table(enemDisc);

console.log('\n--- QUESTÕES POR DISCIPLINA EM CONCURSOS ---');
const concDisc = db.prepare("SELECT discipline, COUNT(*) as c FROM questions WHERE exam_type != 'ENEM' GROUP BY discipline ORDER BY c DESC LIMIT 20").all();
console.table(concDisc);
