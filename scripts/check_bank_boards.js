const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('D:/questions/database/qlingo_master.sqlite');

const prev = db.prepare("SELECT count(1) as c FROM questions WHERE discipline LIKE '%Previdenci%' OR subject LIKE '%Previdenci%' OR statement LIKE '%INSS%' OR statement LIKE '%previdênci%'").get().c;
const vunesp = db.prepare("SELECT count(1) as c FROM questions WHERE examining_board LIKE '%VUNESP%'").get().c;
const fgv = db.prepare("SELECT count(1) as c FROM questions WHERE examining_board LIKE '%FGV%'").get().c;
const cebraspe = db.prepare("SELECT count(1) as c FROM questions WHERE examining_board LIKE '%CEBRASPE%' OR examining_board LIKE '%CESPE%'").get().c;

console.log({
  previdenciario: prev,
  vunesp,
  fgv,
  cebraspe
});

// Ver bancas existentes no banco
const boards = db.prepare('SELECT examining_board, count(1) as c FROM questions GROUP BY examining_board ORDER BY c DESC LIMIT 15').all();
console.table(boards);
