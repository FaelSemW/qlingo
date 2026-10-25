const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbs = [
  'D:/questions/database/qlingo_master.sqlite',
  path.join(__dirname, '../server/qlingo.sqlite')
];

for (const dbPath of dbs) {
  if (!fs.existsSync(dbPath)) {
    console.log(`Banco ${dbPath} não encontrado.`);
    continue;
  }
  console.log(`\n========================================`);
  console.log(`Checando banco: ${dbPath}`);
  console.log(`========================================`);
  const db = new DatabaseSync(dbPath);
  
  const totalQ = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
  const enemQ = db.prepare("SELECT COUNT(*) as c FROM questions WHERE exam_type = 'ENEM'").get().c;
  console.log(`Total de questões: ${totalQ} (ENEM: ${enemQ})`);

  console.log('\nQuestões por ano do ENEM:');
  const years = db.prepare("SELECT year, COUNT(*) as c FROM questions WHERE exam_type = 'ENEM' GROUP BY year ORDER BY year DESC").all();
  for (const y of years) {
    console.log(`  Ano ${y.year}: ${y.c} questões`);
  }

  console.log('\nStatus dos Simulados do ENEM:');
  const pts = db.prepare("SELECT id, title, json_array_length(question_ids) as len FROM practice_tests WHERE title LIKE '%ENEM%' ORDER BY id ASC").all();
  let irregularCount = 0;
  for (const pt of pts) {
    const isOk = pt.len === 90;
    if (!isOk) irregularCount++;
    console.log(`  [${pt.len} q] ${pt.title} (${pt.id}) ${isOk ? '✅' : '⚠️ ATENÇÃO: NÃO É 90'}`);
  }
  console.log(`\nTotal de simulados ENEM: ${pts.length}. Irregulares (diferente de 90): ${irregularCount}`);
}
