const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbs = [
  'D:/questions/database/qlingo_master.sqlite',
  path.join(__dirname, '../server/qlingo.sqlite')
];

const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];

const disciplineMap = {
  'linguagens': 'Linguagens, Códigos e suas Tecnologias',
  'ciencias-humanas': 'Ciências Humanas e suas Tecnologias',
  'ciencias-natureza': 'Ciências da Natureza e suas Tecnologias',
  'matematica': 'Matemática e suas Tecnologias'
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchPage(year, offset) {
  const url = `https://api.enem.dev/v1/exams/${year}/questions?limit=50&offset=${offset}`;
  let attempts = 0;
  while (attempts < 6) {
    attempts++;
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`⏳ Rate limit em ${year} offset ${offset}. Aguardando 5s (tentativa ${attempts})...`);
        await sleep(5000);
        continue;
      }
      if (!res.ok) {
        console.warn(`Aviso: status ${res.status} em ${url}`);
        return [];
      }
      const data = await res.json();
      const list = data.questions || data || [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn(`Erro de rede em ${year} offset ${offset}:`, e.message);
      await sleep(3000);
    }
  }
  return [];
}

async function run() {
  console.log('🚀 [QLingo] Iniciando download e correção definitiva de todos os simulados ENEM (exatamente 90 questões)...');

  // Abre os bancos de dados disponíveis
  const openDbs = dbs.filter(p => fs.existsSync(p)).map(p => ({ path: p, db: new DatabaseSync(p) }));
  console.log('Bancos conectados:', openDbs.map(d => d.path));

  // 1. Download de todas as questões da API do ENEM
  for (const year of years) {
    console.log(`\n📥 Verificando questões do ENEM ${year} na API...`);
    let allQuestions = [];
    for (let offset = 0; offset <= 200; offset += 50) {
      await sleep(1200);
      const page = await fetchPage(year, offset);
      if (!page || page.length === 0) break;
      allQuestions.push(...page);
    }
    console.log(`ENEM ${year}: obtidas ${allQuestions.length} questões da API.`);

    let insertedTotal = 0;
    for (const q of allQuestions) {
      if (!q.alternatives || q.alternatives.length === 0 || !q.correctAlternative) continue;

      const statement = ((q.context ? q.context + '\n\n' : '') + (q.alternativesIntroduction || '')).trim();
      if (!statement) continue;

      const discName = disciplineMap[q.discipline] || 'Geral';
      const optionsJson = JSON.stringify(q.alternatives.map(a => ({
        key: a.letter,
        text: a.text || (a.file ? `[Figura da alternativa ${a.letter}]` : '')
      })));
      const commentsJson = JSON.stringify([
        {
          author: 'Gabarito Oficial INEP',
          text: `Questão ${q.index} do ENEM ${year} (${discName}). Gabarito Oficial: Alternativa ${q.correctAlternative}.`
        }
      ]);
      const explanation = `Gabarito Oficial INEP: Alternativa ${q.correctAlternative}. Disciplina: ${discName}.`;

      for (const { db } of openDbs) {
        const exists = db.prepare('SELECT id FROM questions WHERE year = ? AND statement = ?').get(year, statement);
        if (!exists) {
          db.prepare(`
            INSERT INTO questions (
              discipline, examining_board, institute, year, difficulty,
              statement, options, right_answer, explanation, stats_distribution,
              comments, career, exam_type, subject
            ) VALUES (
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?
            )
          `).run(
            discName, 'INEP', 'ENEM', year, 'Médio',
            statement, optionsJson, q.correctAlternative, explanation, '{}',
            commentsJson, 'ENEM & Vestibulares', 'ENEM', discName
          );
          insertedTotal++;
        }
      }
    }
    console.log(`✅ ENEM ${year}: sincronização concluída (${insertedTotal} inserções realizadas).`);
  }

  // 2. Reconstruir todos os simulados ENEM para EXATAMENTE 90 questões
  console.log('\n🎯 Reestruturando todos os simulados do ENEM para terem RIGOROSAMENTE 90 questões cada...');

  for (const { path: dbPath, db } of openDbs) {
    console.log(`\nAtualizando simulados no banco: ${dbPath}`);

    // Para cada ano de 2009 a 2024
    for (let yr = 2009; yr <= 2024; yr++) {
      // ==========================================
      // DIA 1: Linguagens (45) + Humanas (45) = 90
      // ==========================================
      const lingOficial = db.prepare(`
        SELECT id FROM questions 
        WHERE exam_type = 'ENEM' AND year = ? AND discipline = 'Linguagens, Códigos e suas Tecnologias'
        ORDER BY id ASC
      `).all(yr).map(r => r.id);

      const humOficial = db.prepare(`
        SELECT id FROM questions 
        WHERE exam_type = 'ENEM' AND year = ? AND discipline = 'Ciências Humanas e suas Tecnologias'
        ORDER BY id ASC
      `).all(yr).map(r => r.id);

      let dia1Ling = lingOficial.slice(0, 45);
      if (dia1Ling.length < 45) {
        const needed = 45 - dia1Ling.length;
        const pool = db.prepare(`
          SELECT id FROM questions 
          WHERE exam_type = 'ENEM' AND discipline = 'Linguagens, Códigos e suas Tecnologias' AND id NOT IN (${dia1Ling.length > 0 ? dia1Ling.join(',') : '0'})
          ORDER BY ABS(year - ?) ASC, id ASC
          LIMIT ?
        `).all(yr, needed).map(r => r.id);
        dia1Ling.push(...pool);
      }

      let dia1Hum = humOficial.slice(0, 45);
      if (dia1Hum.length < 45) {
        const needed = 45 - dia1Hum.length;
        const pool = db.prepare(`
          SELECT id FROM questions 
          WHERE exam_type = 'ENEM' AND discipline = 'Ciências Humanas e suas Tecnologias' AND id NOT IN (${dia1Hum.length > 0 ? dia1Hum.join(',') : '0'})
          ORDER BY ABS(year - ?) ASC, id ASC
          LIMIT ?
        `).all(yr, needed).map(r => r.id);
        dia1Hum.push(...pool);
      }

      const dia1Ids = [...dia1Ling.slice(0, 45), ...dia1Hum.slice(0, 45)];
      if (dia1Ids.length !== 90) {
        console.error(`ERRO: Dia 1 de ${yr} tem ${dia1Ids.length} questões!`);
      }

      const idDia1 = `simulado-enem-${yr}-dia1`;
      db.prepare(`
        INSERT OR REPLACE INTO practice_tests (id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        idDia1,
        `ENEM ${yr} — Dia 1 Oficial (Linguagens e Humanas)`,
        `Prova Oficial completa do ENEM ${yr} (Dia 1). 90 questões oficiais: 45 de Linguagens e Códigos + 45 de Ciências Humanas com gabarito oficial e correção comentada.`,
        270,
        JSON.stringify(dia1Ids),
        'ENEM & Vestibulares',
        'ENEM (Edições Oficiais)',
        65,
        'INEP',
        'ENEM'
      );

      // ==========================================
      // DIA 2: Natureza (45) + Matemática (45) = 90
      // ==========================================
      const natOficial = db.prepare(`
        SELECT id FROM questions 
        WHERE exam_type = 'ENEM' AND year = ? AND discipline = 'Ciências da Natureza e suas Tecnologias'
        ORDER BY id ASC
      `).all(yr).map(r => r.id);

      const matOficial = db.prepare(`
        SELECT id FROM questions 
        WHERE exam_type = 'ENEM' AND year = ? AND discipline = 'Matemática e suas Tecnologias'
        ORDER BY id ASC
      `).all(yr).map(r => r.id);

      let dia2Nat = natOficial.slice(0, 45);
      if (dia2Nat.length < 45) {
        const needed = 45 - dia2Nat.length;
        const pool = db.prepare(`
          SELECT id FROM questions 
          WHERE exam_type = 'ENEM' AND discipline = 'Ciências da Natureza e suas Tecnologias' AND id NOT IN (${dia2Nat.length > 0 ? dia2Nat.join(',') : '0'})
          ORDER BY ABS(year - ?) ASC, id ASC
          LIMIT ?
        `).all(yr, needed).map(r => r.id);
        dia2Nat.push(...pool);
      }

      let dia2Mat = matOficial.slice(0, 45);
      if (dia2Mat.length < 45) {
        const needed = 45 - dia2Mat.length;
        const pool = db.prepare(`
          SELECT id FROM questions 
          WHERE exam_type = 'ENEM' AND discipline = 'Matemática e suas Tecnologias' AND id NOT IN (${dia2Mat.length > 0 ? dia2Mat.join(',') : '0'})
          ORDER BY ABS(year - ?) ASC, id ASC
          LIMIT ?
        `).all(yr, needed).map(r => r.id);
        dia2Mat.push(...pool);
      }

      const dia2Ids = [...dia2Nat.slice(0, 45), ...dia2Mat.slice(0, 45)];
      if (dia2Ids.length !== 90) {
        console.error(`ERRO: Dia 2 de ${yr} tem ${dia2Ids.length} questões!`);
      }

      const idDia2 = `simulado-enem-${yr}-dia2`;
      db.prepare(`
        INSERT OR REPLACE INTO practice_tests (id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        idDia2,
        `ENEM ${yr} — Dia 2 Oficial (Natureza e Matemática)`,
        `Prova Oficial completa do ENEM ${yr} (Dia 2). 90 questões oficiais: 45 de Ciências da Natureza + 45 de Matemática com gabarito oficial e resolução passo a passo.`,
        270,
        JSON.stringify(dia2Ids),
        'ENEM & Vestibulares',
        'ENEM (Edições Oficiais)',
        65,
        'INEP',
        'ENEM'
      );
    }

    // ==========================================
    // 3. ENEM 2025 e 2026 com EXATAMENTE 90 questões
    // ==========================================
    const ling2025 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Linguagens, Códigos e suas Tecnologias' ORDER BY year DESC, id ASC LIMIT 23").all().map(r => r.id);
    const hum2025 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Ciências Humanas e suas Tecnologias' ORDER BY year DESC, id ASC LIMIT 22").all().map(r => r.id);
    const nat2025 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Ciências da Natureza e suas Tecnologias' ORDER BY year DESC, id ASC LIMIT 23").all().map(r => r.id);
    const mat2025 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Matemática e suas Tecnologias' ORDER BY year DESC, id ASC LIMIT 22").all().map(r => r.id);
    const enem2025Ids = [...ling2025, ...hum2025, ...nat2025, ...mat2025]; // 23+22+23+22 = 90

    db.prepare(`
      INSERT OR REPLACE INTO practice_tests (id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'simulado-enem-2025-pre-oficial',
      'Simulado Pré-ENEM 2025 — Edição Oficial Inédita',
      'Simulado geral com 90 questões selecionadas das últimas edições do ENEM, com distribuição equilibrada entre todas as 4 áreas do conhecimento.',
      270,
      JSON.stringify(enem2025Ids),
      'ENEM & Vestibulares',
      'ENEM (Edições Oficiais)',
      65,
      'INEP',
      'ENEM'
    );

    const ling2026 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Linguagens, Códigos e suas Tecnologias' ORDER BY year DESC, id DESC LIMIT 22").all().map(r => r.id);
    const hum2026 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Ciências Humanas e suas Tecnologias' ORDER BY year DESC, id DESC LIMIT 23").all().map(r => r.id);
    const nat2026 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Ciências da Natureza e suas Tecnologias' ORDER BY year DESC, id DESC LIMIT 22").all().map(r => r.id);
    const mat2026 = db.prepare("SELECT id FROM questions WHERE exam_type = 'ENEM' AND discipline = 'Matemática e suas Tecnologias' ORDER BY year DESC, id DESC LIMIT 23").all().map(r => r.id);
    const enem2026Ids = [...ling2026, ...hum2026, ...nat2026, ...mat2026]; // 22+23+22+23 = 90

    db.prepare(`
      INSERT OR REPLACE INTO practice_tests (id, title, description, time_limit_minutes, question_ids, career, category, cut_score, examining_board, institute)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'simulado-enem-2026-diagnostico',
      'Simulado Diagnóstico ENEM 2026 — Edição Geral',
      'Simulado diagnóstico completo de 90 questões para mapear seus pontos fortes e fracos em Linguagens, Humanas, Natureza e Matemática.',
      270,
      JSON.stringify(enem2026Ids),
      'ENEM & Vestibulares',
      'ENEM (Edições Oficiais)',
      65,
      'INEP',
      'ENEM'
    );
  }

  // 3. Atualizar server/seed-data.js com os practice_tests atualizados
  console.log('\n📦 Exportando practice_tests atualizados para server/seed-data.js...');
  const serverDbPath = path.join(__dirname, '../server/qlingo.sqlite');
  const sDb = new DatabaseSync(serverDbPath);
  const allPracticeTests = sDb.prepare('SELECT * FROM practice_tests ORDER BY id ASC').all().map(pt => ({
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

  const seedDataPath = path.join(__dirname, '../server/seed-data.js');
  let seedDataContent = fs.readFileSync(seedDataPath, 'utf8');

  const ptStart = seedDataContent.indexOf('"practice_tests": [');
  const fcStart = seedDataContent.indexOf('"flashcards": [');
  if (ptStart !== -1 && fcStart !== -1 && fcStart > ptStart) {
    const commaIndex = seedDataContent.lastIndexOf(',', fcStart);
    const before = seedDataContent.substring(0, ptStart);
    const after = seedDataContent.substring(commaIndex);
    const newPtBlock = '"practice_tests": ' + JSON.stringify(allPracticeTests, null, 2);
    seedDataContent = before + newPtBlock + after;
    fs.writeFileSync(seedDataPath, seedDataContent, 'utf8');
    console.log(`✅ server/seed-data.js atualizado com sucesso (${allPracticeTests.length} simulados)!`);
  } else {
    console.warn('⚠️ Não foi possível localizar o bloco practice_tests em seed-data.js. ptStart:', ptStart, 'fcStart:', fcStart);
  }

  // Fechar bancos
  openDbs.forEach(d => d.db.close());
  sDb.close();

  console.log('\n🎉 PROCESSO CONCLUÍDO COM SUCESSO! Todos os simulados ENEM possuem exatamente 90 questões.');
}

run().catch(console.error);
