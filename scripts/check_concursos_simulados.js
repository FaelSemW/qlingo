const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('D:/questions/database/qlingo_master.sqlite');

const rows = db.prepare(`
  SELECT id, title, career, json_array_length(question_ids) as len 
  FROM practice_tests 
  WHERE title NOT LIKE '%ENEM%'
  ORDER BY career, title
`).all();

console.log('Simulados de Concursos no Banco:');
for (const r of rows) {
  console.log(`- [${r.len} q] ${r.title} (${r.id}) [${r.career}]`);
}
